"use client";

import { useMemo, useState } from "react";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import FieldNotice from "@/components/ui/FieldNotice";
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
  sameIdSet,
  sortProjectsByName,
} from "@/features/projects/utils/projectPicker";

import { MAX_FAVORITES } from "@/lib/projectSwitcherPreferences";

import type { ProjectFilterTab } from "@/features/projects/constants/projectFilters";
import type { Project } from "@/features/projects/types/project";

const excludedNote = "메인·보류·완료 프로젝트는 설정 목록에서 제외됩니다.";
const selectionBarClassName = `flex shrink-0 items-center justify-between gap-3 ${modalSidePaddingClassName} py-3`;
const selectionCountClassName = "font-semibold text-[var(--color-text)]";
const selectionLimitClassName = "font-normal text-[var(--color-text-secondary)]";
const clearSelectionClassName = "text-body shrink-0 font-medium text-[var(--color-text)] disabled:cursor-not-allowed disabled:text-[var(--color-text-disabled)]";
const limitNoticeClassName = `shrink-0 ${modalSidePaddingClassName} pt-1 pb-3`;

type FavoriteProjectsModalProps = {
  isOpen: boolean;
  projects: Project[];
  favoriteIds: number[];
  onApply: (projectIds: number[]) => void;
  onClose: () => void;
};

/**
 * FavoriteProjectsModal
 *
 * 즐겨찾기 프로젝트를 여러 개 고르거나 해제합니다. 적용 전까지는 저장하지 않습니다.
 *
 * @param props - FavoriteProjectsModal 컴포넌트 Props
 * @param props.isOpen - 모달을 열지 여부
 * @param props.projects - 고를 수 있는 프로젝트
 * @param props.favoriteIds - 현재 저장된 즐겨찾기 프로젝트 아이디
 * @param props.onApply - 고른 프로젝트 목록을 저장할 때 실행되는 함수
 * @param props.onClose - 모달을 닫을 때 실행되는 함수
 */
export default function FavoriteProjectsModal({
  isOpen,
  projects,
  favoriteIds,
  onApply,
  onClose,
}: FavoriteProjectsModalProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ProjectFilterTab>("all");
  const [draftIds, setDraftIds] = useState<number[]>(favoriteIds);
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setQuery("");
    setStatus("all");
    setDraftIds(
      favoriteIds.filter((id) => {
        const project = projects.find((item) => item.id === id);

        return !project?.isMain;
      }),
    );
  }

  const pinnedIds = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const mainProjectId = useMemo(
    () => projects.find((project) => project.isMain)?.id ?? null,
    [projects],
  );

  const searchedProjects = useMemo(
    () =>
      sortProjectsByName(
        projects.filter(
          (project) =>
            !project.isMain &&
            canShowInProjectSettings(project, pinnedIds) &&
            matchesProjectPicker(project, "all", query),
        ),
      ),
    [projects, pinnedIds, query],
  );

  const visibleProjects = useMemo(
    () => searchedProjects.filter((project) => matchesProjectPicker(project, status, query)),
    [searchedProjects, status, query],
  );

  const statusItems = useMemo(() => getPickerStatusItems(searchedProjects), [searchedProjects]);

  const atFavoriteLimit = draftIds.length >= MAX_FAVORITES;

  const lockedIds = atFavoriteLimit
    ? visibleProjects
        .filter((project) => !draftIds.includes(project.id))
        .map((project) => project.id)
    : [];

  const unchanged = sameIdSet(draftIds, favoriteIds);

  const emptyLabel =
    status === "ON_HOLD" || status === "DONE"
      ? excludedNote
      : query.trim()
        ? "검색 결과가 없습니다."
        : "선택할 프로젝트가 없습니다.";

  const toggleProject = (project: Project) => {
    if (project.isMain || project.id === mainProjectId) {
      return;
    }

    setDraftIds((current) => {
      if (current.includes(project.id)) {
        return current.filter((id) => id !== project.id);
      }

      if (current.length >= MAX_FAVORITES) {
        return current;
      }

      return [...current, project.id];
    });
  };

  const clearDraft = () => {
    setDraftIds([]);
  };

  const apply = () => {
    if (unchanged) {
      return;
    }

    onApply(draftIds);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      padded={false}
      labelledBy="favorite-projects-modal-title"
      zIndexClassName="z-[170]"
      maxWidthClassName="max-w-[520px]"
      panelClassName={stableListModalPanelClassName}
    >
      <Modal.Header
        id="favorite-projects-modal-title"
        title="즐겨찾기 관리"
        description={`최대 ${MAX_FAVORITES}개까지 추가할 수 있고, 메인 프로젝트는 선택할 수 없습니다.`}
        onClose={onClose}
        closeLabel="즐겨찾기 관리 닫기"
      />

      <div className={`shrink-0 ${modalSidePaddingClassName} pt-4`}>
        <ProjectPickerFields
          query={query}
          onQueryChange={setQuery}
          placeholder="프로젝트명으로 검색"
          ariaLabel="즐겨찾기 프로젝트 검색"
          statusItems={statusItems}
          status={status}
          onStatusChange={setStatus}
          statusLabel="프로젝트 상태"
          note={excludedNote}
        />
      </div>

      <div className={selectionBarClassName}>
        <p className="text-body min-w-0">
          <span className={selectionCountClassName}>{draftIds.length}개 선택</span>
          <span className={selectionLimitClassName}> / 최대 {MAX_FAVORITES}개</span>
        </p>
        <button
          type="button"
          onClick={clearDraft}
          disabled={draftIds.length === 0}
          className={clearSelectionClassName}
        >
          모두 해제
        </button>
      </div>

      <ListScroll>
        <ProjectList
          projects={visibleProjects}
          mark="check"
          selectedIds={draftIds}
          disabledIds={lockedIds}
          onSelect={toggleProject}
          emptyLabel={emptyLabel}
          label="즐겨찾기 프로젝트"
        />
      </ListScroll>

      {atFavoriteLimit ? (
        <div className={limitNoticeClassName}>
          <FieldNotice className="mt-0!">
            다른 프로젝트를 선택하려면 선택한 항목을 먼저 해제해 주세요.
          </FieldNotice>
        </div>
      ) : null}

      <Modal.Footer>
        <SecondaryButton size="modal" onClick={onClose}>
          취소
        </SecondaryButton>
        <PrimaryButton size="modal" onClick={apply} disabled={unchanged}>
          적용
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}
