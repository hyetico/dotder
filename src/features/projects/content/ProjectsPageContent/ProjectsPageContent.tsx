"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState, useSyncExternalStore } from "react";

import { useQuery } from "@tanstack/react-query";

import { HeaderActionLink, HeaderActions } from "@/components/layout/Header/HeaderActions";
import PageHeading from "@/components/layout/pages/Page/PageHeading";
import PageInset from "@/components/layout/pages/Page/PageInset";
import { CheckCircle2, Circle, Folder, PauseCircle, Plus, Star } from "@/components/ui/icon";
import SearchInput from "@/components/ui/input/SearchInput";
import StatCountCard from "@/components/ui/stats/StatCountCard";
import StatCountGrid, { statCountWideCardClassName } from "@/components/ui/stats/StatCountGrid";

import { getProjectListItems } from "@/features/projects/api/projects";
import FavoriteAddCard from "@/features/projects/components/FavoriteAddCard";
import FavoriteRemovedToast from "@/features/projects/components/FavoriteRemovedToast";
import ProjectsScopeTabs, {
  type ProjectsScopeTab,
} from "@/features/projects/components/ProjectsScopeTabs";
import { ProjectInProgressIcon } from "@/features/projects/components/ProjectStatusIcon";
import ProjectListSection from "@/features/projects/content/ProjectsPageContent/ProjectListSection";
import FavoriteProjectsModal from "@/features/projects/modals/FavoriteProjectsModal";
import { computeProjectStats } from "@/features/projects/utils/projectUtils";

import {
  getFavoriteProjectsPath,
  getMainProjectsPath,
  isFavoriteProjectsPath,
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
const favoriteEditButtonClassName =
  "inline-flex h-[32px] shrink-0 cursor-pointer items-center rounded-[8px] px-[12px] text-[13px]! leading-none! font-medium! text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)]";

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
  const scopeTitle = isFavorites ? "즐겨찾기 프로젝트" : "전체 프로젝트";
  const scopeDescription = isFavorites
    ? "즐겨찾기한 프로젝트를 확인하고 관리하세요."
    : "프로젝트를 한곳에서 확인하고 관리하세요.";
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
      <HeaderActionLink href="/projects/new" label="새 프로젝트" icon={Plus} tone="primary" />
    </HeaderActions>
  );
  const scopeTabs = (
    <ProjectsScopeTabs
      value={scopeTab}
      mainDisabled={!isLoading && mainProject == null}
      onChange={changeScope}
    />
  );
  const stats = computeProjectStats(visibleProjects);
  const showCounts = !isLoading && !waitingForFavorites;
  const pageHeading = (
    <PageHeading
      title={scopeTitle}
      description={scopeDescription}
      count={showCounts ? stats.total : null}
      countTitle={`${scopeTitle} ${stats.total}개`}
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
  const totalCardLabel = isFavorites ? "즐겨찾기 프로젝트" : "전체 프로젝트";
  const totalCardIcon = isFavorites ? Star : Folder;

  const projectCountCards = (
    <StatCountGrid>
      <div className={statCountWideCardClassName}>
        <StatCountCard
          label={totalCardLabel}
          count={stats.total}
          icon={totalCardIcon}
          iconClassName="text-[var(--color-text)]"
        />
      </div>
      <StatCountCard
        label="계획"
        count={stats.planned}
        icon={Circle}
        iconClassName="text-[var(--color-text-muted)]"
      />
      <StatCountCard
        label="진행 중"
        count={stats.inProgress}
        icon={ProjectInProgressIcon}
        iconClassName="text-blue-600"
        pair={{ label: "지연", count: stats.delayed, className: "text-red-600" }}
      />
      <StatCountCard
        label="보류"
        count={stats.onHold}
        icon={PauseCircle}
        iconClassName="text-amber-600"
      />
      <StatCountCard
        label="완료"
        count={stats.done}
        icon={CheckCircle2}
        iconClassName="text-green-600"
      />
    </StatCountGrid>
  );

  if (isLoading || waitingForFavorites) {
    return (
      <>
        {headerActions}
        <div className={projectsPageShellClassName}>
          {scopeTabs}
          <PageInset>
            <div className={projectsPageFrameClassName}>
              {pageHeading}
              <p className="text-body-sm py-12 text-center text-[var(--color-text-secondary)]">
                프로젝트를 불러오는 중...
              </p>
            </div>
          </PageInset>
        </div>
      </>
    );
  }

  return (
    <>
      {headerActions}
      <div className={projectsPageShellClassName}>
        {scopeTabs}
        <PageInset>
          <div className={projectsPageFrameClassName}>
            {pageHeading}
            <div className={projectsPageBodyClassName}>
              {projectCountCards}
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
        <FavoriteRemovedToast onUndo={undoFavoriteRemoval} />
      ) : null}
    </>
  );
}
