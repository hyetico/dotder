"use client";

import { Suspense, useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import GoalCategoryBoard from "@/features/goals/components/GoalCategoryBoard";
import GoalCreateDrawer, { type GoalCreateDraft } from "@/features/goals/modals/GoalCreateDrawer";
import GoalDetailDrawer from "@/features/goals/modals/GoalDetailDrawer";
import StatCountCard from "@/components/ui/stats/StatCountCard";
import StatCountGrid, { statCountWideCardClassName } from "@/components/ui/stats/StatCountGrid";
import GoalsScopeTabs, { type GoalsScopeTab } from "@/features/goals/components/GoalsScopeTabs";
import { HeaderActionButton, HeaderActions } from "@/components/layout/Header/HeaderActions";
import PageHeading from "@/components/layout/pages/Page/PageHeading";
import PageInset from "@/components/layout/pages/Page/PageInset";
import FavoriteProjectFolderIcon from "@/features/projects/components/FavoriteProjectFolderIcon";
import ProjectBoardCard from "@/features/projects/components/ProjectBoardCard";
import ProjectCompactCard from "@/features/projects/components/ProjectCompactCard";
import ProjectSummaryBox from "@/features/projects/components/ProjectSummaryBox";
import HoldAddNotice from "@/features/projects/components/HoldAddNotice";
import { CheckCircle2, Circle, Clock, Plus, Target } from "@/components/ui/icon";

import { getGoals } from "@/features/goals/api/goals";
import type { Goal } from "@/features/goals/types/goal";
import { getProjectListItems, getProjects } from "@/features/projects/api/projects";
import { isGoalShownDelayed } from "@/features/goals/utils/goalProjectDelay";
import { canAddProjectItems, holdAddNoticeMessage } from "@/features/projects/utils/projectUtils";
import { mockTeamMembers } from "@/lib/mock/teamMembers";
import { currentUser } from "@/lib/mock/users";
import { goalQueryKeys, projectQueryKeys } from "@/lib/queryKeys";
import {
  ALL_PROJECTS_SCOPE,
  buildScopeChangeHref,
  getFavoriteGoalsPath,
  getGoalsListPath,
  getProjectGoalsPath,
  isFavoriteGoalsPath,
  isProjectGoalsPath,
} from "@/lib/projectRoutes";
import {
  getFavoriteProjectIdsServerSnapshot,
  getFavoriteProjectIdsSnapshot,
  subscribeFavoriteProjectIds,
} from "@/lib/projectSwitcherPreferences";

const previewAssigneeId =
  mockTeamMembers.find((member) => member.email === currentUser.email)?.id ?? null;

const goalsPageFrameClassName = "w-full @container";
const goalsBodyClassName = "space-y-5";
const mainGoalsColumnsClassName =
  "grid grid-cols-1 items-start gap-4 @[900px]:grid-cols-[minmax(0,1fr)_296px]";
const mainGoalsSummaryClassName = "flex min-w-0 flex-col @[900px]:col-start-1";
const mainGoalCardClassName =
  "w-full @[900px]:col-start-2 @[900px]:row-start-1 @[900px]:row-span-2 @[900px]:w-[296px] @[900px]:justify-self-end";
const goalsAfterTitleClassName = "flex min-w-0 flex-col gap-4";
const favoriteFolderIconsClassName = "flex min-w-0 flex-wrap items-start gap-3";
const compactHeadingClassName = "flex min-w-0 flex-wrap items-start justify-between gap-3";
const compactHeadingCopyClassName = "min-w-[12rem] flex-1";
const goalsLoadingClassName = "text-body-sm py-12 text-center text-[var(--color-text-secondary)]";

/**
 * GoalsPageLayout
 *
 * 목표 목록을 요약과 카드 그리드로 표시합니다.
 *
 * @returns 목표 목록 화면
 */
function GoalsPageLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<number | null>(null);
  const [createSession, setCreateSession] = useState(0);
  const [createDraft, setCreateDraft] = useState<GoalCreateDraft | null>(null);
  const goalParam = searchParams.get("goal");
  const selectedGoalId = goalParam != null && /^\d+$/.test(goalParam) ? Number(goalParam) : null;
  const isGoalDrawerOpen = isCreateOpen || selectedGoalId != null;
  const storedFavoriteIds = useSyncExternalStore(
    subscribeFavoriteProjectIds,
    getFavoriteProjectIdsSnapshot,
    getFavoriteProjectIdsServerSnapshot,
  );
  const isFavoriteGoals = isFavoriteGoalsPath(pathname);
  const projectGoalsId = isProjectGoalsPath(pathname) ? Number(pathname.split("/")[2]) : null;
  const goalScope = projectGoalsId ?? ALL_PROJECTS_SCOPE;
  const isAllGoals = projectGoalsId == null && !isFavoriteGoals;

  const { data: projects = [], isSuccess: isProjectsReady } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const mainProject = projects.find((project) => project.isMain) ?? null;
  const favoriteProjectIds = useMemo(() => {
    if (storedFavoriteIds == null) {
      return [];
    }

    const mainId = mainProject?.id ?? null;

    return storedFavoriteIds.filter(
      (id) => id !== mainId && projects.some((project) => project.id === id),
    );
  }, [mainProject, projects, storedFavoriteIds]);
  const activeFavoriteId =
    selectedFavoriteId != null && favoriteProjectIds.includes(selectedFavoriteId)
      ? selectedFavoriteId
      : null;
  const scopedProject =
    projectGoalsId == null
      ? mainProject
      : (projects.find((project) => project.id === projectGoalsId) ?? null);
  const goalAddDisabled = !canAddProjectItems(scopedProject?.status);
  const addableProjects = projects.filter((project) => canAddProjectItems(project.status));
  const createBlockedByHold = projectGoalsId != null && !canAddProjectItems(scopedProject?.status);
  const createDisabled = !isProjectsReady || createBlockedByHold || addableProjects.length === 0;
  const createDisabledTitle = !isProjectsReady
    ? "새 목표"
    : createBlockedByHold
      ? holdAddNoticeMessage
      : addableProjects.length === 0
        ? "추가할 수 있는 프로젝트가 없습니다."
        : "새 목표";
  const defaultProjectId = (() => {
    if (projectGoalsId != null && scopedProject && canAddProjectItems(scopedProject.status)) {
      return scopedProject.id;
    }

    if (isFavoriteGoals) {
      const selectedFavorite = addableProjects.find((project) => project.id === activeFavoriteId);

      if (selectedFavorite) {
        return selectedFavorite.id;
      }

      const favorite = addableProjects.find((project) => favoriteProjectIds.includes(project.id));

      if (favorite) {
        return favorite.id;
      }
    }

    if (mainProject && canAddProjectItems(mainProject.status)) {
      return mainProject.id;
    }

    return addableProjects[0]?.id ?? null;
  })();
  const replaceGoalQuery = (goalId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (goalId == null) {
      params.delete("goal");
    } else {
      params.set("goal", String(goalId));
    }

    const query = params.toString();

    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };
  const openGoalDrawer = (goal: Goal) => {
    setIsCreateOpen(false);

    if (selectedGoalId === goal.id) {
      return;
    }

    replaceGoalQuery(goal.id);
  };
  const closeGoalDrawer = () => {
    if (selectedGoalId == null) {
      return;
    }

    replaceGoalQuery(null);
  };
  const openCreateDrawer = () => {
    if (isCreateOpen) {
      return;
    }

    setCreateSession((session) => session + 1);
    setIsCreateOpen(true);

    if (selectedGoalId != null) {
      replaceGoalQuery(null);
    }
  };
  const handleGoalCreated = (projectId: number | null) => {
    if (
      isFavoriteGoals &&
      activeFavoriteId != null &&
      projectId != null &&
      favoriteProjectIds.includes(projectId)
    ) {
      setSelectedFavoriteId(projectId);
      return;
    }

    const visibleOnPage =
      isAllGoals ||
      (projectId != null &&
        (projectId === projectGoalsId ||
          (isFavoriteGoals && favoriteProjectIds.includes(projectId))));

    if (!visibleOnPage) {
      router.push(projectId == null ? getGoalsListPath() : getProjectGoalsPath(projectId));
    }
  };

  const { data: goals = [], isPending: isGoalsPending } = useQuery({
    queryKey: goalQueryKeys.list(goalScope),
    queryFn: () => getGoals(goalScope),
    enabled: isProjectsReady && (!isFavoriteGoals || storedFavoriteIds != null),
  });
  const visibleGoals = isFavoriteGoals
    ? goals.filter(
        (goal) =>
          goal.projectId != null &&
          favoriteProjectIds.includes(goal.projectId) &&
          (activeFavoriteId == null || goal.projectId === activeFavoriteId),
      )
    : goals;
  const handleDraftChange = useCallback((draft: GoalCreateDraft) => {
    setCreateDraft(draft);
  }, []);
  const previewGoal = useMemo(() => {
    if (!isCreateOpen || !createDraft) {
      return null;
    }

    const project = projects.find((item) => item.id === createDraft.projectId) ?? null;

    return {
      id: -1,
      projectId: createDraft.projectId,
      title: createDraft.title,
      description: "",
      status: "NOT_STARTED" as const,
      color: project?.color ?? null,
      icon: "layout" as const,
      tags: createDraft.tags,
      startDate: "",
      endDate: "",
      completedTasks: 0,
      totalTasks: 0,
      progress: 0,
      assigneeIds: previewAssigneeId == null ? [] : [previewAssigneeId],
      updatedAt: "",
    };
  }, [createDraft, isCreateOpen, projects]);

  const scopeTab: GoalsScopeTab = isFavoriteGoals
    ? "favorites"
    : isAllGoals
      ? "all"
      : scopedProject?.isMain
        ? "main"
        : "project";
  const projectSummary =
    scopeTab === "project" && scopedProject ? (
      <ProjectSummaryBox project={scopedProject} defaultOpen={false} showDetailLink />
    ) : null;

  const changeScope = (next: Exclude<GoalsScopeTab, "project">) => {
    if (next === "favorites") {
      const params = new URLSearchParams(searchParams.toString());

      params.delete("project");

      const query = params.toString();

      router.push(query ? `${getFavoriteGoalsPath()}?${query}` : getFavoriteGoalsPath());
      return;
    }

    if (next === "main" && !mainProject) {
      return;
    }

    const href = buildScopeChangeHref(
      pathname,
      searchParams,
      next === "all" || !mainProject ? ALL_PROJECTS_SCOPE : mainProject.id,
    );

    if (href) {
      router.push(href);
    }
  };

  const showMainProjectCard = scopeTab === "main";
  const { data: projectListItems = [], isPending: isProjectListPending } = useQuery({
    queryKey: [...projectQueryKeys.all, "list"],
    queryFn: getProjectListItems,
    enabled: isProjectsReady && (showMainProjectCard || isFavoriteGoals),
  });
  const mainProjectListItem = showMainProjectCard
    ? (projectListItems.find((project) => project.isMain) ?? null)
    : null;
  const favoriteFolderProjects = isFavoriteGoals
    ? favoriteProjectIds.flatMap((id) => {
        const project = projectListItems.find((item) => item.id === id);

        return project ? [project] : [];
      })
    : [];
  const scopeTabs = (
    <GoalsScopeTabs value={scopeTab} mainDisabled={mainProject == null} onChange={changeScope} />
  );
  const scopeTitle = isFavoriteGoals
    ? "즐겨찾기 프로젝트 목표"
    : isAllGoals
      ? "전체 목표"
      : "메인 프로젝트 목표";
  const goalsHeading =
    scopeTab !== "project" ? (
      <PageHeading
        title={scopeTitle}
        description={
          isFavoriteGoals
            ? "즐겨찾기한 프로젝트의 목표를 확인하고 관리하세요."
            : isAllGoals
              ? "프로젝트별 목표를 한곳에서 확인하고 관리하세요."
              : "메인 프로젝트의 목표를 확인하고 관리하세요."
        }
        count={isGoalsPending ? null : visibleGoals.length}
        countTitle={`${scopeTitle} ${visibleGoals.length}개`}
      />
    ) : null;
  const goalCountCards =
    scopeTab !== "project" ? (
      <StatCountGrid>
        <div className={statCountWideCardClassName}>
          <StatCountCard
            label="전체 목표"
            count={visibleGoals.length}
            icon={Target}
            iconClassName="text-[var(--color-text)]"
          />
        </div>
        <StatCountCard
          label="미시작"
          count={visibleGoals.filter((goal) => goal.status === "NOT_STARTED").length}
          icon={Circle}
          iconClassName="text-[var(--color-text-muted)]"
          pair={{
            label: "마감 초과",
            count: visibleGoals.filter(
              (goal) => goal.status === "NOT_STARTED" && isGoalShownDelayed(goal, projects),
            ).length,
            className: "text-red-600",
          }}
        />
        <StatCountCard
          label="진행 중"
          count={visibleGoals.filter((goal) => goal.status === "IN_PROGRESS").length}
          icon={Clock}
          iconClassName="text-blue-600"
          pair={{
            label: "마감 초과",
            count: visibleGoals.filter(
              (goal) => goal.status === "IN_PROGRESS" && isGoalShownDelayed(goal, projects),
            ).length,
            className: "text-red-600",
          }}
        />
        <StatCountCard
          label="완료"
          count={visibleGoals.filter((goal) => goal.status === "COMPLETED").length}
          icon={CheckCircle2}
          iconClassName="text-green-600"
        />
      </StatCountGrid>
    ) : null;
  const isMainProjectCardPending =
    showMainProjectCard && isProjectListPending && mainProjectListItem == null;
  const isFavoriteFoldersPending =
    isFavoriteGoals &&
    favoriteProjectIds.length > 0 &&
    isProjectListPending &&
    favoriteFolderProjects.length === 0;
  const favoriteFolderIcons =
    favoriteFolderProjects.length > 0 ? (
      <div className={favoriteFolderIconsClassName}>
        {favoriteFolderProjects.map((project) => (
          <FavoriteProjectFolderIcon
            key={project.id}
            project={project}
            pressed={activeFavoriteId === project.id}
            onSelect={() =>
              setSelectedFavoriteId((current) => (current === project.id ? null : project.id))
            }
          />
        ))}
      </div>
    ) : null;
  const goalsLoading = <p className={goalsLoadingClassName}>목표를 불러오는 중...</p>;
  const mainProjectFolder = mainProjectListItem ? (
    <div className={mainGoalCardClassName}>
      <ProjectBoardCard project={mainProjectListItem} />
    </div>
  ) : null;
  const holdNotice = goalAddDisabled && visibleGoals.length > 0 ? <HoldAddNotice /> : null;
  const goalBoard = (
    <GoalCategoryBoard
      goals={visibleGoals}
      projects={projects}
      showProject={isAllGoals || isFavoriteGoals}
      showPopularTags
      onSelectGoal={openGoalDrawer}
      selectedGoalId={selectedGoalId}
      draftGoal={previewGoal}
      holdNotice={goalAddDisabled}
      banner={holdNotice}
      emptyLabel={
        isFavoriteGoals && favoriteProjectIds.length === 0
          ? "즐겨찾기한 프로젝트가 없습니다."
          : undefined
      }
    />
  );

  const isGoalsPageLoading =
    !isProjectsReady ||
    isGoalsPending ||
    isMainProjectCardPending ||
    isFavoriteFoldersPending ||
    (isFavoriteGoals && storedFavoriteIds == null);

  return (
    <>
      <HeaderActions>
        <HeaderActionButton
          label="새 목표"
          icon={Plus}
          tone="primary"
          disabled={createDisabled}
          title={createDisabledTitle}
          onClick={openCreateDrawer}
        />
      </HeaderActions>
      {scopeTabs}
      <PageInset>
        <div className={goalsPageFrameClassName}>
          {isGoalsPageLoading ? (
            showMainProjectCard ? (
              <div className={mainGoalsColumnsClassName}>
                <div className={mainGoalsSummaryClassName}>
                  {goalsHeading}
                  {goalsLoading}
                </div>
              </div>
            ) : (
              <>
                {goalsHeading}
                <div className={goalsBodyClassName}>
                  {projectSummary}
                  {goalsLoading}
                </div>
              </>
            )
          ) : showMainProjectCard ? (
            <div
              className={isGoalDrawerOpen ? goalsAfterTitleClassName : mainGoalsColumnsClassName}
            >
              <div className={mainGoalsSummaryClassName}>
                {isGoalDrawerOpen && mainProjectListItem ? (
                  <div className={compactHeadingClassName}>
                    <div className={compactHeadingCopyClassName}>{goalsHeading}</div>
                    <ProjectCompactCard project={mainProjectListItem} />
                  </div>
                ) : (
                  goalsHeading
                )}
                {goalCountCards}
              </div>
              {isGoalDrawerOpen ? null : mainProjectFolder}
              {goalBoard}
            </div>
          ) : (
            <>
              {goalsHeading}
              <div className={goalsBodyClassName}>
                {favoriteFolderIcons}
                {projectSummary}
                {goalCountCards}
                {goalBoard}
              </div>
            </>
          )}
        </div>
      </PageInset>
      <GoalCreateDrawer
        key={createSession}
        isOpen={isCreateOpen}
        projects={projects}
        defaultProjectId={defaultProjectId}
        onClose={() => {
          setIsCreateOpen(false);
          setCreateDraft(null);
        }}
        onCreated={handleGoalCreated}
        onDraftChange={handleDraftChange}
      />
      <GoalDetailDrawer goalId={selectedGoalId} projects={projects} onClose={closeGoalDrawer} />
    </>
  );
}

/**
 * GoalsPageContent
 *
 * 목표 목록 화면입니다.
 * 주소의 프로젝트 범위를 읽기 위해 로딩 경계를 둡니다.
 */
export default function GoalsPageContent() {
  return (
    <Suspense
      fallback={
        <PageInset
          top="none"
          bottom={false}
          className="text-body-sm py-12 text-center text-[var(--color-text-secondary)]"
        >
          목표를 불러오는 중...
        </PageInset>
      }
    >
      <GoalsPageLayout />
    </Suspense>
  );
}
