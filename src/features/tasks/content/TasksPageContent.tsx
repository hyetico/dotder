"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { HeaderActionButton, HeaderActions } from "@/components/layout/Header/HeaderActions";
import PageHeading from "@/components/layout/pages/Page/PageHeading";
import PageInset from "@/components/layout/pages/Page/PageInset";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import { AppIcon, CheckCircle2, Circle, ListTodo, LoaderCircle, Plus } from "@/components/ui/icon";

import { getProjects } from "@/features/projects/api/projects";
import HoldAddNotice from "@/features/projects/components/HoldAddNotice";
import { useCurrentProjectScope } from "@/features/projects/hooks/useCurrentProjectScope";
import { canAddProjectItems, holdAddNoticeMessage } from "@/features/projects/utils/projectUtils";
import { getTasks } from "@/features/tasks/api/tasks";
import CreateTaskButton from "@/features/tasks/components/board/CreateTaskButton";
import TaskBoardClient from "@/features/tasks/components/board/TaskBoardClient";
import TaskCalendarView from "@/features/tasks/components/TaskCalendarView";
import TasksToolbar from "@/features/tasks/components/TasksToolbar";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";
import {
  filterTasksBySearchQuery,
  matchesTaskStatusFilter,
  taskTodayStamp,
  type TaskFilterTab,
} from "@/features/tasks/utils/taskUtils";

import { parseTaskViewMode } from "@/lib/projectRoutes";
import { projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

import type { StatusFilterChipItem } from "@/components/ui/StatusFilterChips";

const tasksPageClassName = "space-y-4 pt-3 md:space-y-6 md:pt-6";
// 전체 태스크(/tasks)는 목록 페이지 순서: 제목 + 요약 → 툴바 (design 10)
const tasksListPageClassName = "space-y-4 md:space-y-6";

type TasksPageContentProps = {
  /** 전체 태스크 페이지(`/tasks`)일 때 켠다. 제목 · 요약을 그리고 「추가」를 헤더에 둔다. 프로젝트 디테일 탭에서는 끈다. */
  showHeading?: boolean;
};

/**
 * TasksPageLayout
 *
 * 태스크를 보드, 캘린더로 표시합니다.
 *
 * @returns 태스크 화면
 */
function TasksPageLayout({ showHeading = false }: TasksPageContentProps) {
  const searchParams = useSearchParams();
  const projectScope = useCurrentProjectScope();
  const viewMode = parseTaskViewMode(searchParams.get("view"));
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<TaskFilterTab>("all");
  const [sortValue, setSortValue] = useState("latest");
  const [createOpen, setCreateOpen] = useState(false);
  const { handleCreateTask } = useTaskMutations(projectScope);

  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: taskQueryKeys.list(projectScope),
    queryFn: () => getTasks(projectScope),
  });
  // 요약은 프로젝트 고르기와 상관없이 전체 태스크 기준이다 (프로토타입과 같음).
  const { data: allTasks = [] } = useQuery({
    queryKey: taskQueryKeys.list("all"),
    queryFn: () => getTasks("all"),
    enabled: showHeading,
  });

  const scopedProject =
    typeof projectScope === "number"
      ? (projects.find((project) => project.id === projectScope) ?? null)
      : null;
  const taskAddDisabled = !canAddProjectItems(scopedProject?.status);
  const today = taskTodayStamp();
  const showProjectName = projectScope === "all";
  const projectNames = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.name])),
    [projects],
  );
  const searchedTasks = useMemo(
    () => filterTasksBySearchQuery(tasks, searchQuery, showProjectName ? projectNames : undefined),
    [projectNames, searchQuery, showProjectName, tasks],
  );
  const filterItems: StatusFilterChipItem<TaskFilterTab>[] = [
    {
      id: "all",
      label: "전체",
      count: searchedTasks.length,
      iconColor: "var(--color-text-muted)",
      icon: <AppIcon icon={ListTodo} size="sm" />,
    },
    {
      id: "TODO",
      label: "할 일",
      count: searchedTasks.filter((task) => matchesTaskStatusFilter(task, "TODO", today)).length,
      iconColor: "var(--color-neutral-text)",
      icon: <AppIcon icon={Circle} size="sm" />,
    },
    {
      id: "IN_PROGRESS",
      label: "진행 중",
      count: searchedTasks.filter((task) => matchesTaskStatusFilter(task, "IN_PROGRESS", today))
        .length,
      iconColor: "var(--color-info-text)",
      icon: <AppIcon icon={LoaderCircle} size="sm" />,
    },
    {
      id: "DONE",
      label: "완료",
      count: searchedTasks.filter((task) => matchesTaskStatusFilter(task, "DONE", today)).length,
      iconColor: "var(--color-success-text)",
      icon: <AppIcon icon={CheckCircle2} size="sm" />,
    },
    {
      id: "DELAYED",
      label: "지연",
      count: searchedTasks.filter((task) => matchesTaskStatusFilter(task, "DELAYED", today)).length,
      iconColor: "var(--color-danger-text)",
      icon: null,
    },
  ];

  const hideTaskAdd = taskAddDisabled && tasks.length === 0;
  const todayTaskCount = allTasks.filter(
    (task) => task.dueDate === today && task.status !== "DONE",
  ).length;
  const delayedTaskCount = allTasks.filter((task) =>
    matchesTaskStatusFilter(task, "DELAYED", today),
  ).length;

  return (
    <PageInset
      top={showHeading ? "page" : "none"}
      className={showHeading ? tasksListPageClassName : tasksPageClassName}
    >
      {showHeading ? (
        <>
          {hideTaskAdd ? null : (
            <HeaderActions>
              <HeaderActionButton
                label="추가"
                icon={Plus}
                tone="primary"
                disabled={taskAddDisabled}
                title={taskAddDisabled ? holdAddNoticeMessage : "추가"}
                onClick={() => setCreateOpen(true)}
              />
            </HeaderActions>
          )}
          <PageHeading
            title="태스크"
            description={
              <>
                오늘 할 일 {todayTaskCount}개
                {delayedTaskCount > 0 ? (
                  <>
                    {" · "}
                    <span className="text-[var(--color-danger-text)]">
                      지연 {delayedTaskCount}개
                    </span>
                  </>
                ) : null}
              </>
            }
          />
        </>
      ) : null}
      {taskAddDisabled && tasks.length > 0 ? <HoldAddNotice /> : null}
      <TasksToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        sortValue={sortValue}
        onSortChange={setSortValue}
        filterItems={filterItems}
        action={
          showHeading || hideTaskAdd ? null : (
            <PrimaryButton
              icon={<AppIcon icon={Plus} size="md" className="text-[var(--color-text-inverse)]" />}
              aria-label="새 태스크"
              title={taskAddDisabled ? holdAddNoticeMessage : "새 태스크"}
              disabled={taskAddDisabled}
              onClick={() => setCreateOpen(true)}
              className="!h-[var(--button-icon)] !w-[var(--button-icon)] justify-center !px-0 lg:!h-[var(--button-height)] lg:!w-auto lg:!px-[var(--button-px)]"
            >
              <span className="hidden lg:inline">새 태스크</span>
            </PrimaryButton>
          )
        }
      />

      <div className="pt-2 md:pt-4">
        {viewMode === "board" ? (
          <TaskBoardClient
            projectScope={projectScope}
            searchQuery={searchQuery}
            statusFilter={activeFilter}
          />
        ) : null}

        {viewMode === "calendar" ? (
          <TaskCalendarView
            projectScope={projectScope}
            searchQuery={searchQuery}
            statusFilter={activeFilter}
          />
        ) : null}
      </div>

      <CreateTaskButton
        projectScope={projectScope}
        projects={projects}
        status="TODO"
        showStatusField
        hideTrigger
        isModalOpen={createOpen}
        onModalOpenChange={setCreateOpen}
        onCreate={handleCreateTask}
      />
    </PageInset>
  );
}

/**
 * TasksPageContent
 *
 * 태스크 목록 화면입니다.
 * 주소의 보기와 프로젝트 범위를 읽기 위해 로딩 경계를 둡니다.
 */
export default function TasksPageContent({ showHeading = false }: TasksPageContentProps) {
  return (
    <Suspense
      fallback={
        <PageInset top="none" className={tasksPageClassName}>
          <div className="text-body text-[var(--color-text-secondary)]">
            태스크를 불러오는 중...
          </div>
        </PageInset>
      }
    >
      <TasksPageLayout showHeading={showHeading} />
    </Suspense>
  );
}
