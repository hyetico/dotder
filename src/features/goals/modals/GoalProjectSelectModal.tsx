"use client";

import { useMemo, useState } from "react";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import Modal, {
  modalSidePaddingClassName,
  stableListModalPanelClassName,
} from "@/components/ui/modal/Modal";

import ProjectList, { ListScroll } from "@/features/projects/components/ProjectPicker/ProjectList";
import ProjectPickerFields from "@/features/projects/components/ProjectPicker/ProjectPickerFields";
import {
  getPickerStatusItems,
  matchesProjectPicker,
  sortProjectsByName,
} from "@/features/projects/utils/projectPicker";
import { canAddProjectItems } from "@/features/projects/utils/projectUtils";

import type { ProjectFilterTab } from "@/features/projects/constants/projectFilters";
import type { Project } from "@/features/projects/types/project";

type GoalProjectSelectModalProps = {
  isOpen: boolean;
  projects: Project[];
  selectedId: number | null;
  onApply: (projectId: number | null) => void;
  onClose: () => void;
};

/**
 * GoalProjectSelectModal
 *
 * 새 목표에 연결할 프로젝트를 하나 고르거나 해제합니다.
 * 보류 중인 프로젝트는 목록에서 빼고, 적용을 눌러야 고른 값을 돌려줍니다.
 *
 * @param props - GoalProjectSelectModal 컴포넌트 Props
 * @param props.isOpen - 모달을 열지 여부
 * @param props.projects - 고를 수 있는 프로젝트
 * @param props.selectedId - 지금 연결된 프로젝트 아이디
 * @param props.onApply - 고른 프로젝트를 연결할 때 실행되는 함수. 해제면 null
 * @param props.onClose - 모달을 닫을 때 실행되는 함수
 */
export default function GoalProjectSelectModal({
  isOpen,
  projects,
  selectedId,
  onApply,
  onClose,
}: GoalProjectSelectModalProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProjectFilterTab>("all");
  const [draftId, setDraftId] = useState<number | null>(selectedId);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setQuery("");
      setStatus("all");
      setDraftId(selectedId);
    }
  }

  const addableProjects = useMemo(
    () => projects.filter((project) => canAddProjectItems(project.status)),
    [projects],
  );
  const searchedProjects = useMemo(
    () =>
      sortProjectsByName(
        addableProjects.filter((project) => matchesProjectPicker(project, "all", query)),
      ).sort((left, right) => Number(right.id === selectedId) - Number(left.id === selectedId)),
    [addableProjects, query, selectedId],
  );
  const visibleProjects = useMemo(
    () => searchedProjects.filter((project) => matchesProjectPicker(project, status, query)),
    [searchedProjects, status, query],
  );
  const statusItems = useMemo(
    () =>
      getPickerStatusItems(searchedProjects).filter((item) => item.count > 0 || item.id === status),
    [searchedProjects, status],
  );
  const selectedCount = draftId == null ? 0 : 1;
  const emptyLabel = query.trim() ? "검색 결과가 없습니다." : "선택할 프로젝트가 없습니다.";

  const apply = () => {
    if (draftId === selectedId) {
      return;
    }

    onApply(draftId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      padded={false}
      labelledBy="goal-project-select-title"
      zIndexClassName="z-[170]"
      maxWidthClassName="max-w-[520px]"
      panelClassName={stableListModalPanelClassName}
    >
      <Modal.Header
        id="goal-project-select-title"
        title="프로젝트 변경"
        description="목표를 연결할 프로젝트를 고르세요. 보류 중인 프로젝트는 목록에서 제외돼요."
        onClose={onClose}
        closeLabel="프로젝트 변경 닫기"
      />

      <div className={`shrink-0 ${modalSidePaddingClassName} pt-2`}>
        <ProjectPickerFields
          query={query}
          onQueryChange={setQuery}
          placeholder="프로젝트명으로 검색"
          ariaLabel="연결 프로젝트 검색"
          statusItems={statusItems}
          status={status}
          onStatusChange={setStatus}
          statusLabel="프로젝트 상태"
        />
      </div>

      <div className={`flex shrink-0 items-center justify-end ${modalSidePaddingClassName} py-3`}>
        <span className="text-caption text-[var(--color-text-secondary)] tabular-nums">
          {selectedCount}/1개 선택
        </span>
      </div>

      <ListScroll>
        <ProjectList
          projects={visibleProjects}
          mark="radio"
          selectedIds={draftId == null ? [] : [draftId]}
          onSelect={(project) => setDraftId(project.id)}
          emptyLabel={emptyLabel}
          label="연결 프로젝트"
        />
      </ListScroll>

      <Modal.Footer>
        <SecondaryButton
          size="modal"
          onClick={() => setDraftId(null)}
          disabled={draftId == null}
          className="mr-auto"
        >
          해제하기
        </SecondaryButton>
        <SecondaryButton size="modal" onClick={onClose}>
          취소
        </SecondaryButton>
        <PrimaryButton size="modal" onClick={apply} disabled={draftId === selectedId}>
          적용
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}
