"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

import { useQuery } from "@tanstack/react-query";

import { HeaderActionLink, HeaderActions } from "@/components/layout/Header/HeaderActions";
import PageHeading from "@/components/layout/pages/Page/PageHeading";
import PageInset from "@/components/layout/pages/Page/PageInset";
import { Plus } from "@/components/ui/icon";
import SearchInput from "@/components/ui/input/SearchInput";
import Skeleton from "@/components/ui/state/Skeleton";
import Toast from "@/components/ui/Toast";

import { getProjectListItems } from "@/features/projects/api/projects";
import FavoriteAddCard from "@/features/projects/components/FavoriteAddCard";
import ProjectsScopeTabs, {
  type ProjectsScopeTab,
} from "@/features/projects/components/ProjectsScopeTabs";
import ProjectListSection from "@/features/projects/content/ProjectsPageContent/ProjectListSection";
import FavoriteProjectsModal from "@/features/projects/modals/FavoriteProjectsModal";
import ProjectCreateDrawerRoute from "@/features/projects/modals/ProjectCreateDrawerRoute";
import { computeProjectStats } from "@/features/projects/utils/projectUtils";

import {
  getFavoriteProjectsPath,
  getMainProjectsPath,
  isFavoriteProjectsPath,
  getNewProjectPath,
} from "@/lib/projectRoutes";
import {
  MAX_FAVORITES,
  getFavoriteProjectIds,
  getFavoriteProjectIdsServerSnapshot,
  getFavoriteProjectIdsSnapshot,
  setFavoriteProjectIds,
  subscribeFavoriteProjectIds,
} from "@/lib/projectSwitcherPreferences";
import { projectQueryKeys } from "@/lib/queryKeys";

const projectsPageShellClassName = "min-w-0";
const projectsPageFrameClassName = "project-board-width @container";
const projectsPageBodyClassName = "space-y-5";
// 폴더 카드 그리드와 같은 칸 (ProjectListSection)
const projectsSkeletonClassName = "grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3";
const favoriteEditButtonClassName =
  "inline-flex h-[32px] shrink-0 cursor-pointer items-center rounded-[var(--radius-sm)] px-[12px] text-xs! leading-none! font-medium! text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)]";

/**
 * ProjectsPageContent
 *
 * 프로젝트 목록의 범위 탭, 제목, 상태 카드, 검색과 그 아래 상태 필터, 카드·리스트 보기를 표시합니다.
 *
 * @returns 프로젝트 목록 화면
 */
export default function ProjectsPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditingFavorites, setIsEditingFavorites] = useState(false);
  const [removedFavoriteIds, setRemovedFavoriteIds] = useState<number[]>([]);
  const [isFavoriteModalOpen, setIsFavoriteModalOpen] = useState(false);
  const storedFavoriteIds = useSyncExternalStore(
    subscribeFavoriteProjectIds,
    getFavoriteProjectIdsSnapshot,
    getFavoriteProjectIdsServerSnapshot,
  );
  const isFavorites = isFavoriteProjectsPath(pathname);
  const [favoriteScope, setFavoriteScope] = useState(isFavorites);

  if (favoriteScope !== isFavorites) {
    setFavoriteScope(isFavorites);
    setIsEditingFavorites(false);
    setRemovedFavoriteIds([]);
    setIsFavoriteModalOpen(false);
  }

  const { data: projects = [], isLoading } = useQuery({
    queryKey: [...projectQueryKeys.all, "list"],
    queryFn: getProjectListItems,
  });

  const mainProject = useMemo(() => projects.find((project) => project.isMain) ?? null, [projects]);
  const favoriteProjectIds = useMemo(() => {
    if (storedFavoriteIds == null) {
      return [];
    }

    const mainId = mainProject?.id ?? null;

    return storedFavoriteIds.filter(
      (id) => id !== mainId && projects.some((project) => project.id === id),
    );
  }, [mainProject, projects, storedFavoriteIds]);

  /**
   * removeFavorite
   *
   * 프로젝트를 즐겨찾기에서만 뺍니다. 프로젝트 자체는 지우지 않습니다.
   *
   * @param projectId - 즐겨찾기에서 뺄 프로젝트 아이디
   */
  const removeFavorite = (projectId: number) => {
    const current = getFavoriteProjectIds();

    if (!current.includes(projectId)) {
      return;
    }

    setFavoriteProjectIds(current.filter((id) => id !== projectId));
    setRemovedFavoriteIds((ids) => [...ids, projectId]);
  };

  /**
   * undoFavoriteRemoval
   *
   * 마지막으로 해제한 프로젝트를 즐겨찾기에 다시 넣습니다.
   */
  const undoFavoriteRemoval = () => {
    const projectId = removedFavoriteIds[removedFavoriteIds.length - 1];

    if (projectId == null) {
      return;
    }

    const current = getFavoriteProjectIds();

    if (!current.includes(projectId) && current.length < MAX_FAVORITES) {
      setFavoriteProjectIds([...current, projectId]);
    }

    setRemovedFavoriteIds((ids) => ids.slice(0, -1));
  };

  /**
   * applyFavorites
   *
   * 고른 프로젝트만 즐겨찾기로 저장합니다. 메인 프로젝트는 넣지 않습니다.
   *
   * @param projectIds - 즐겨찾기로 남길 프로젝트 아이디
   */
  const applyFavorites = (projectIds: number[]) => {
    const mainId = mainProject?.id ?? null;

    setFavoriteProjectIds(mainId == null ? projectIds : projectIds.filter((id) => id !== mainId));
    setRemovedFavoriteIds([]);
  };

  const visibleProjects = isFavorites
    ? projects.filter((project) => favoriteProjectIds.includes(project.id))
    : projects;
  const waitingForFavorites = isFavorites && storedFavoriteIds == null;
  const scopeTab: ProjectsScopeTab = isFavorites ? "favorites" : "all";
  const changeScope = (next: ProjectsScopeTab) => {
    if (next === "favorites") {
      router.push(getFavoriteProjectsPath());
      return;
    }

    if (next === "main") {
      if (mainProject) {
        router.push(getMainProjectsPath());
      }

      return;
    }

    router.push("/projects");
  };

  const headerActions = (
    <HeaderActions>
      <HeaderActionLink href={getNewProjectPath()} label="추가" icon={Plus} tone="primary" />
    </HeaderActions>
  );
  const scopeTabs = (
    <ProjectsScopeTabs
      placement="page"
      value={scopeTab}
      mainDisabled={!isLoading && mainProject == null}
      onChange={changeScope}
    />
  );
  // 요약은 탭과 상관없이 전체 프로젝트 기준이다 (원본 프로토타입과 같음).
  const stats = computeProjectStats(projects);

  const pageHeading = (
    <PageHeading
      title="프로젝트"
      description={
        isLoading ? null : (
          <>
            {stats.total}개 중 {stats.inProgress}개 진행 중
            {stats.delayed > 0 ? (
              <>
                {" · "}
                <span className="text-[var(--color-danger-text)]">{stats.delayed}개 마감 지남</span>
              </>
            ) : null}
          </>
        )
      }
    />
  );

  const showFavoriteEdit = isFavorites && (favoriteProjectIds.length > 0 || isEditingFavorites);
  const atFavoriteLimit = favoriteProjectIds.length >= MAX_FAVORITES;
  const showFavoriteAddCard = isFavorites && !atFavoriteLimit;
  const showFavoriteReplaceCard = isFavorites && atFavoriteLimit;
  const favoriteHeaderAction = showFavoriteEdit ? (
    <button
      type="button"
      onClick={() => {
        if (isEditingFavorites) {
          setIsEditingFavorites(false);
          setRemovedFavoriteIds([]);
          return;
        }

        setIsEditingFavorites(true);
      }}
      className={favoriteEditButtonClassName}
    >
      {isEditingFavorites ? "완료" : "편집"}
    </button>
  ) : null;
  if (isLoading || waitingForFavorites) {
    return (
      <>
        {headerActions}
        <div className={projectsPageShellClassName}>
          <PageInset>
            <div className={projectsPageFrameClassName}>
              {pageHeading}
              {scopeTabs}
              <div
                aria-busy="true"
                aria-label="프로젝트를 불러오는 중"
                className={projectsSkeletonClassName}
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} className="h-48" />
                ))}
              </div>
            </div>
          </PageInset>
        </div>
      </>
    );
  }

  return (
    <>
      <ProjectCreateDrawerRoute />
      {headerActions}
      <div className={projectsPageShellClassName}>
        <PageInset>
          <div className={projectsPageFrameClassName}>
            {pageHeading}
            {scopeTabs}
            <div className={projectsPageBodyClassName}>
              <ProjectListSection
                projects={visibleProjects}
                searchQuery={searchQuery}
                search={
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={isFavorites ? "즐겨찾기 프로젝트 검색..." : "프로젝트 검색..."}
                    ariaLabel={isFavorites ? "즐겨찾기 프로젝트 검색" : "프로젝트 검색"}
                  />
                }
                emptyLabel={
                  isFavorites && favoriteProjectIds.length === 0
                    ? "즐겨찾기한 프로젝트가 없습니다."
                    : undefined
                }
                sectionTitle={isFavorites ? "즐겨찾기 프로젝트" : undefined}
                countLabel={
                  isFavorites ? `${favoriteProjectIds.length} / ${MAX_FAVORITES}개` : undefined
                }
                countTitle={
                  isFavorites
                    ? `즐겨찾기 ${favoriteProjectIds.length}개, 최대 ${MAX_FAVORITES}개`
                    : undefined
                }
                headerAction={favoriteHeaderAction}
                boardAppend={
                  showFavoriteAddCard || showFavoriteReplaceCard ? (
                    <>
                      {showFavoriteAddCard ? (
                        <FavoriteAddCard
                          remaining={MAX_FAVORITES - favoriteProjectIds.length}
                          onClick={() => setIsFavoriteModalOpen(true)}
                        />
                      ) : null}
                      {showFavoriteReplaceCard ? (
                        <FavoriteAddCard
                          remaining={0}
                          replace
                          onClick={() => setIsFavoriteModalOpen(true)}
                        />
                      ) : null}
                    </>
                  ) : null
                }
                onRemoveProject={
                  isEditingFavorites ? (project) => removeFavorite(project.id) : undefined
                }
              />
            </div>
          </div>
        </PageInset>
      </div>
      <FavoriteProjectsModal
        isOpen={isFavoriteModalOpen}
        projects={projects}
        favoriteIds={favoriteProjectIds}
        onApply={applyFavorites}
        onClose={() => setIsFavoriteModalOpen(false)}
      />
      {isEditingFavorites && removedFavoriteIds.length > 0 ? (
        <Toast
          key={removedFavoriteIds.length}
          message="즐겨찾기에서 해제했어요."
          action={{ label: "실행 취소", onClick: undoFavoriteRemoval }}
          onClose={() => setRemovedFavoriteIds([])}
        />
      ) : null}
    </>
  );
}
