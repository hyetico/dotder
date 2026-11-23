"use client";

import { useMemo, useState } from "react";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import { useAlert } from "@/components/ui/modal/AlertModal";
import Modal, {
  modalSidePaddingClassName,
  stableListModalPanelClassName,
} from "@/components/ui/modal/Modal";

import ProjectList, { ListScroll } from "@/features/projects/components/ProjectPicker/ProjectList";
import ProjectPickerFields from "@/features/projects/components/ProjectPicker/ProjectPickerFields";
import {
  canShowInProjectSettings,
  getPickerStatusItems,
  matchesProjectPicker,
  sortProjectsByName,
} from "@/features/projects/utils/projectPicker";

import type { ProjectFilterTab } from "@/features/projects/constants/projectFilters";
import type { Project } from "@/features/projects/types/project";

const excludedNote = "보류·완료 프로젝트는 목록에서 제외돼요.";

type MainProjectModalProps = {
  isOpen: boolean;
  projects: Project[];
  mainProjectId: number | null;
  onApply: (projectId: number | null) => Promise<void>;
  onClose: () => void;
};

/**
 * MainProjectModal
 *
 * 메인 프로젝트를 하나 고르거나 해제합니다. 적용 전까지는 저장하지 않습니다.
 *
 * @param props - MainProjectModal 컴포넌트 Props
 * @param props.isOpen - 모달을 열지 여부
 * @param props.projects - 고를 수 있는 프로젝트
 * @param props.mainProjectId - 현재 저장된 메인 프로젝트 아이디
 * @param props.onApply - 고른 프로젝트를 저장할 때 실행되는 함수. 해제면 null
 * @param props.onClose - 모달을 닫을 때 실행되는 함수
 */
export default function MainProjectModal({
  isOpen,
  projects,
  mainProjectId,
  onApply,
  onClose,
}: MainProjectModalProps) {
  const { alert } = useAlert();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProjectFilterTab>("all");
  const [draftId, setDraftId] = useState<number | null>(mainProjectId);
  const [isSaving, setIsSaving] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setQuery("");
    setStatus("all");
    setDraftId(mainProjectId);
    setIsSaving(false);
  }

  const pinnedIds = useMemo(
    () => new Set(mainProjectId == null ? [] : [mainProjectId]),
    [mainProjectId],
  );

  const searchedProjects = useMemo(
    () =>
      sortProjectsByName(
        projects.filter(
          (project) =>
            canShowInProjectSettings(project, pinnedIds) &&
            matchesProjectPicker(project, "all", query),
        ),
      ).sort(
        (left, right) => Number(right.id === mainProjectId) - Number(left.id === mainProjectId),
      ),
    [projects, pinnedIds, query, mainProjectId],
  );

  const visibleProjects = useMemo(
    () => searchedProjects.filter((project) => matchesProjectPicker(project, status, query)),
    [searchedProjects, status, query],
  );

  const statusItems = useMemo(
    () =>
      getPickerStatusItems(searchedProjects).filter(
        (item) =>
          item.count > 0 || item.id === status || (item.id !== "ON_HOLD" && item.id !== "DONE"),
      ),
    [searchedProjects, status],
  );

  const unchanged = draftId === mainProjectId;

  const emptyLabel =
    status === "ON_HOLD" || status === "DONE"
      ? excludedNote
      : query.trim()
        ? "검색 결과가 없습니다."
        : "선택할 프로젝트가 없습니다.";

  const apply = async () => {
    if (unchanged || isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      await onApply(draftId);
      onClose();
    } catch (error) {
      setIsSaving(false);
      await alert({
        title: "저장 실패",
        description:
          error instanceof Error ? error.message : "메인 프로젝트를 저장하지 못했습니다.",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      padded={false}
      labelledBy="main-project-modal-title"
      zIndexClassName="z-[170]"
      maxWidthClassName="max-w-[520px]"
      panelClassName={stableListModalPanelClassName}
    >
      <Modal.Header
        id="main-project-modal-title"
        title="메인 프로젝트 설정"
        description={`메인 프로젝트는 1개만 설정할 수 있어요. ${excludedNote}`}
        onClose={onClose}
        closeLabel="메인 프로젝트 설정 닫기"
      />

      <div className={`shrink-0 ${modalSidePaddingClassName} pt-2 pb-3`}>
        <ProjectPickerFields
          query={query}
          onQueryChange={setQuery}
          placeholder="프로젝트명으로 검색"
          ariaLabel="메인 프로젝트 검색"
          statusItems={statusItems}
          status={status}
          onStatusChange={setStatus}
          statusLabel="프로젝트 상태"
        />
      </div>

      <ListScroll>
        <ProjectList
          projects={visibleProjects}
          mark="radio"
          selectedIds={draftId == null ? [] : [draftId]}
          onSelect={(project) => setDraftId(project.id)}
          emptyLabel={emptyLabel}
          label="메인 프로젝트"
        />
      </ListScroll>

      <Modal.Footer>
        <SecondaryButton
          size="modal"
          onClick={() => setDraftId(null)}
          disabled={draftId == null || isSaving}
          className="mr-auto"
        >
          메인 프로젝트 해제
        </SecondaryButton>
        <SecondaryButton size="modal" onClick={onClose} disabled={isSaving}>
          취소
        </SecondaryButton>
        <PrimaryButton size="modal" onClick={apply} disabled={unchanged || isSaving}>
          적용
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}
