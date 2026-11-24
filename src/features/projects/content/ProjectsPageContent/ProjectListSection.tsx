"use client";

import { useMemo, useState, type ReactNode } from "react";

import Badge from "@/components/ui/badge/Badge";
import StatusFilterBar from "@/components/ui/StatusFilterBar";

import FavoriteEditToolbar from "@/features/projects/components/FavoriteEditToolbar";
import FavoriteRemoveButton, {
  favoriteRemoveButtonFloatingClassName,
} from "@/features/projects/components/FavoriteRemoveButton";
import ProjectBoardCard from "@/features/projects/components/ProjectBoardCard";
import {
  compareProjects,
  getProjectStatusFilters,
  matchesProjectFilter,
  type ProjectFilterTab,
} from "@/features/projects/constants/projectFilters";
import ProjectListRow, {
  ProjectListTable,
} from "@/features/projects/content/ProjectsPageContent/ProjectListRow";
import ProjectViewToggle, {
  type ProjectCardViewMode,
} from "@/features/projects/content/ProjectsPageContent/ProjectViewToggle";
import { computeProjectStats } from "@/features/projects/utils/projectUtils";

import type { ProjectListItem } from "@/features/projects/types/project";

const projectBoardGridClassName = "grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3";
const projectToolbarClassName = "flex min-w-0 flex-col gap-4";
const projectListSectionClassName = "min-w-0 space-y-4 border-t border-[var(--color-border)] pt-5";

type ProjectListSectionProps = {
  projects: ProjectListItem[];
  searchQuery: string;
  search: ReactNode;
  emptyLabel?: string;
  sectionTitle?: string;
  countLabel?: string;
  countTitle?: string;
  headerAction?: ReactNode;
  boardAppend?: ReactNode;
  onRemoveProject?: (project: ProjectListItem) => void;
};

/**
 * ProjectFavoriteRemoveAction
 *
 * 편집 중일 때 프로젝트 카드나 목록 행에 올릴 즐겨찾기 해제 버튼입니다.
 *
 * @param props - ProjectFavoriteRemoveAction 컴포넌트 Props
 * @param props.project - 해제할 프로젝트
 * @param props.onRemove - 해제를 실행하는 함수
 * @param props.floating - 좁은 목록 카드 오른쪽 위에 겹쳐 둘지 여부
 */
function ProjectFavoriteRemoveAction({
  project,
  onRemove,
  floating = false,
}: {
  project: ProjectListItem;
  onRemove: (project: ProjectListItem) => void;
  floating?: boolean;
}) {
  const button = (
    <FavoriteRemoveButton
      label={`${project.name} 즐겨찾기 해제`}
      onClick={() => onRemove(project)}
    />
  );

  if (!floating) {
    return button;
  }

  return <span className={favoriteRemoveButtonFloatingClassName}>{button}</span>;
}

/**
 * ProjectListSection
 *
 * 검색어 아래에서 상태 필터, 보기 전환, 프로젝트 목록을 표시합니다.
 * 넓은 화면은 상태 칩과 필터 아이콘을 한 알약에 두고, 좁은 화면은 필터 아이콘과 현재 상태를 한 알약에 둡니다.
 *
 * @param props - ProjectListSection 컴포넌트 Props
 * @param props.projects - 검색 전 프로젝트 목록
 * @param props.searchQuery - 이름과 설명에 찾을 검색어
 * @param props.search - 목록 위에 둘 검색 입력
 * @param props.emptyLabel - 목록이 비었을 때 보여줄 문구
 * @param props.sectionTitle - 목록 제목. 없으면 프로젝트 목록
 * @param props.countLabel - 제목 옆 뱃지 문구. 없으면 보이는 개수
 * @param props.countTitle - 목록 뱃지의 툴팁 문구
 */
export default function ProjectListSection({
  projects,
  searchQuery,
  search,
  emptyLabel = "조건에 맞는 프로젝트가 없습니다.",
  sectionTitle = "프로젝트 목록",
  countLabel,
  countTitle,
  headerAction,
  boardAppend,
  onRemoveProject,
}: ProjectListSectionProps) {
  const [viewMode, setViewMode] = useState<ProjectCardViewMode>("board");
  const [activeFilter, setActiveFilter] = useState<ProjectFilterTab>("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const editing = onRemoveProject != null;

  if (!editing && selectedIds.length > 0) {
    setSelectedIds([]);
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const searchedProjects = useMemo(
    () => projects.filter((project) => matchesProjectFilter(project, "all", normalizedQuery)),
    [projects, normalizedQuery],
  );

  const filterItems = useMemo(
    () => getProjectStatusFilters(computeProjectStats(searchedProjects)),
    [searchedProjects],
  );

  const visibleProjects = useMemo(
    () =>
      searchedProjects
        .filter((project) => matchesProjectFilter(project, activeFilter, normalizedQuery))
        .sort(compareProjects),
    [searchedProjects, activeFilter, normalizedQuery],
  );
  const showBoardAppend =
    boardAppend != null &&
    (visibleProjects.length > 0 || (activeFilter === "all" && normalizedQuery.length === 0));
  const visibleSelected = visibleProjects.filter((project) => selectedIds.includes(project.id));
  const allVisibleSelected =
    visibleProjects.length > 0 && visibleSelected.length === visibleProjects.length;
  const partiallySelected = visibleSelected.length > 0 && !allVisibleSelected;

  /**
   * toggleSelected
   *
   * 보이는 즐겨찾기 프로젝트 하나를 고르거나 해제합니다.
   *
   * @param projectId - 선택을 바꿀 프로젝트 아이디
   */
  const toggleSelected = (projectId: number) => {
    setSelectedIds((ids) =>
      ids.includes(projectId) ? ids.filter((id) => id !== projectId) : [...ids, projectId],
    );
  };

  /**
   * toggleAllSelected
   *
   * 지금 보이는 즐겨찾기를 모두 고르거나, 이미 모두 골랐으면 선택을 풉니다.
   */
  const toggleAllSelected = () => {
    const visibleIds = visibleProjects.map((project) => project.id);

    setSelectedIds((ids) => {
      if (allVisibleSelected) {
        return ids.filter((id) => !visibleIds.includes(id));
      }

      return [...new Set([...ids, ...visibleIds])];
    });
  };

  /**
   * removeSelected
   *
   * 지금 고른 프로젝트를 즐겨찾기에서 뺍니다.
   */
  const removeSelected = () => {
    if (!onRemoveProject || visibleSelected.length === 0) {
      return;
    }

    const removingIds = visibleSelected.map((project) => project.id);

    visibleSelected.forEach((project) => onRemoveProject(project));
    setSelectedIds((ids) => ids.filter((id) => !removingIds.includes(id)));
  };

  return (
    <>
      <div className={projectToolbarClassName}>
        {search}
        <div className="flex items-center justify-between gap-3">
          <StatusFilterBar
            items={filterItems}
            value={activeFilter}
            onChange={setActiveFilter}
            label="프로젝트 필터"
            title="프로젝트 필터"
            sectionLabel="프로젝트 상태"
            resetValue="all"
          />
          <ProjectViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      </div>

      <div className={projectListSectionClassName}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="text-section-title text-[var(--color-text)]">{sectionTitle}</h2>
            <Badge
              className="h-6! bg-[var(--color-hover)] px-2.5! text-sm! text-[var(--color-text-secondary)]"
              title={countTitle ?? `${sectionTitle} ${visibleProjects.length}개`}
            >
              {countLabel ?? visibleProjects.length}
            </Badge>
          </div>
          {headerAction}
        </div>
        {editing && projects.length > 0 ? (
          <FavoriteEditToolbar
            selectedCount={visibleSelected.length}
            allSelected={allVisibleSelected}
            partiallySelected={partiallySelected}
            onToggleAll={toggleAllSelected}
            onRemoveSelected={removeSelected}
          />
        ) : null}
        {viewMode === "board" && (visibleProjects.length > 0 || showBoardAppend) ? (
          <section className={projectBoardGridClassName}>
            {visibleProjects.map((project) => (
              <ProjectBoardCard
                key={project.id}
                project={project}
                selected={selectedIds.includes(project.id)}
                onToggleSelected={editing ? () => toggleSelected(project.id) : undefined}
                cornerAction={
                  onRemoveProject ? (
                    <ProjectFavoriteRemoveAction project={project} onRemove={onRemoveProject} />
                  ) : undefined
                }
              />
            ))}
            {showBoardAppend ? boardAppend : null}
          </section>
        ) : visibleProjects.length > 0 ? (
          <>
            <section className="flex min-w-0 flex-col gap-4 lg:hidden">
              {visibleProjects.map((project) => (
                <ProjectListRow
                  key={project.id}
                  project={project}
                  selected={selectedIds.includes(project.id)}
                  onToggleSelected={editing ? () => toggleSelected(project.id) : undefined}
                  cornerAction={
                    onRemoveProject ? (
                      <ProjectFavoriteRemoveAction
                        project={project}
                        onRemove={onRemoveProject}
                        floating
                      />
                    ) : undefined
                  }
                />
              ))}
            </section>
            <div className="hidden lg:block">
              <ProjectListTable
                projects={visibleProjects}
                selectedIds={editing ? selectedIds : undefined}
                onToggleSelected={editing ? toggleSelected : undefined}
                removeAction={
                  onRemoveProject
                    ? (project) => (
                        <ProjectFavoriteRemoveAction project={project} onRemove={onRemoveProject} />
                      )
                    : undefined
                }
              />
            </div>
          </>
        ) : (
          <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <p className="text-caption text-[var(--color-text-secondary)]">{emptyLabel}</p>
          </div>
        )}
      </div>
    </>
  );
}
