"use client";

import { useMemo } from "react";

import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";

import { getProjects } from "@/features/projects/api/projects";
import { getTasks } from "@/features/tasks/api/tasks";
import BoardColumn from "@/features/tasks/components/board/BoardColumn";
import CreateTaskButton from "@/features/tasks/components/board/CreateTaskButton";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";
import {
  filterTasksBySearchQuery,
  matchesTaskStatusFilter,
  taskTodayStamp,
  type TaskFilterTab,
} from "@/features/tasks/utils/taskUtils";

import { projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

import type { TaskStatus } from "@/features/tasks/types/task";
import type { ProjectScope } from "@/lib/projectRoutes";

const columns: {
  title: string;
  status: TaskStatus;
}[] = [
  {
    title: "TODO",
    status: "TODO",
  },

  {
    title: "IN PROGRESS",
    status: "IN_PROGRESS",
  },

  {
    title: "DONE",
    status: "DONE",
  },
];

type TaskBoardProps = {
  projectScope: ProjectScope;
  searchQuery?: string;
  statusFilter?: TaskFilterTab;
};

export default function TaskBoard({
  projectScope,
  searchQuery = "",
  statusFilter = "all",
}: TaskBoardProps) {
  /*
   * =====================================================
   * Task 읽기 (useQuery) + Task 쓰기 (useTaskMutations)
   * =====================================================
   *
   * [읽기] useQuery + getTasks
   *   → 화면에 보여줄 Task 목록을 서버(또는 mock)에서 가져옴
   *
   * [쓰기] useTaskMutations
   *   → 생성 / 수정 / 삭제는 hook 한 곳에서 처리
   *   → BoardColumn에는 handleCreateTask 등만 넘김
   *
   * taskQueryKeys.list()는 hook과 useQuery가 같은 값을 써야
   * mutation 후 목록이 자동으로 갱신됩니다.
   */
  const { updateTaskMutation, handleCreateTask, handleUpdateTask, handleDeleteTask } =
    useTaskMutations(projectScope);

  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: taskQueryKeys.list(projectScope),
    queryFn: () => getTasks(projectScope),
  });

  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const showProjectName = projectScope === "all";

  const projectNames = Object.fromEntries(projects.map((project) => [project.id, project.name]));

  const searchFilteredTasks = useMemo(
    () => filterTasksBySearchQuery(tasks, searchQuery, showProjectName ? projectNames : undefined),
    [tasks, searchQuery, showProjectName, projectNames],
  );

  const today = taskTodayStamp();
  const filteredTasks = useMemo(
    () => searchFilteredTasks.filter((task) => matchesTaskStatusFilter(task, statusFilter, today)),
    [searchFilteredTasks, statusFilter, today],
  );

  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasStatusFilter = statusFilter !== "all";

  const isSearchEmpty =
    (hasSearchQuery || hasStatusFilter) && tasks.length > 0 && filteredTasks.length === 0;

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12">
        <p className="text-caption text-center text-[var(--color-text-secondary)]">
          Task를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-12">
        <p className="text-caption text-center text-[var(--color-danger-text)]">
          Task를 불러오지 못했습니다.
        </p>
      </div>
    );
  }

  /*
   * =====================================================
   * 드래그 앤 드롭 — status / order 변경
   * =====================================================
   *
   * DnD는 Board만의 UI 로직이라 hook 밖에 둡니다.
   * 실제 서버 반영은 updateTaskMutation.mutate()로 hook에 위임.
   *
   * (Optimistic Update는 hook 안의 updateTaskMutation이 처리)
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      return;
    }

    const activeTaskId = Number(active.id);

    const activeTask = tasks.find((task) => task.id === activeTaskId);

    if (!activeTask) {
      return;
    }

    /*
     * over.id는 Task id 또는 컬럼 status(TODO 등)일 수 있음
     */
    const overTask = tasks.find((task) => task.id === Number(over.id));

    /*
     * Case 1: 다른 Task 위에 Drop
     */
    if (overTask) {
      /*
       * Case 1-1: 같은 컬럼 → 순서(order)만 변경
       */
      if (activeTask.status === overTask.status) {
        const sameStatusTasks = tasks
          .filter((task) => task.status === activeTask.status)
          .sort((a, b) => a.order - b.order);

        const oldIndex = sameStatusTasks.findIndex((task) => task.id === activeTask.id);

        const newIndex = sameStatusTasks.findIndex((task) => task.id === overTask.id);

        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
          return;
        }

        const reorderedTasks = arrayMove(sameStatusTasks, oldIndex, newIndex);

        /*
         * 바뀐 순서마다 update 호출
         * (hook의 optimistic update로 즉시 반영)
         */
        reorderedTasks.forEach((task, index) => {
          updateTaskMutation.mutate({
            ...task,
            order: index,
          });
        });

        return;
      }

      /*
       * Case 1-2: 다른 컬럼 Task 위에 Drop → status 변경
       */
      const newStatus = overTask.status;

      const targetTasks = tasks.filter((task) => task.status === newStatus);

      updateTaskMutation.mutate({
        ...activeTask,
        status: newStatus,
        order: targetTasks.length,
      });

      return;
    }

    /*
     * Case 2: 컬럼 빈 공간에 Drop → status 변경
     */
    const isColumn = columns.some((column) => column.status === over.id);

    if (!isColumn) {
      return;
    }

    const newStatus = over.id as TaskStatus;

    if (activeTask.status === newStatus) {
      return;
    }

    const targetTasks = tasks.filter((task) => task.status === newStatus);

    updateTaskMutation.mutate({
      ...activeTask,
      status: newStatus,
      order: targetTasks.length,
    });
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-3 py-2.5 md:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="text-card-title shrink-0 font-semibold text-[var(--color-text)]">
            Task 보드
          </h2>

          <span className="shrink-0 rounded-full bg-[var(--color-hover)] px-2 py-1 text-xs text-[var(--color-text-secondary)]">
            {filteredTasks.length}
          </span>
        </div>

        <CreateTaskButton
          projectScope={projectScope}
          projects={projects}
          status="TODO"
          variant="header"
          showStatusField
          onCreate={handleCreateTask}
        />
      </div>

      {isSearchEmpty ? (
        <div className="flex min-h-[240px] flex-col items-center justify-center px-6 py-10 text-center">
          <p className="text-caption text-[var(--color-text-secondary)]">
            {hasSearchQuery && !hasStatusFilter
              ? "검색 결과가 없습니다."
              : "조건에 맞는 태스크가 없습니다."}
          </p>
        </div>
      ) : (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="grid gap-4 p-3 md:p-4 lg:grid-cols-3">
            {columns.map((column) => {
              const columnTasks = filteredTasks
                .filter((task) => task.status === column.status)
                .sort((a, b) => a.order - b.order);

              return (
                <BoardColumn
                  key={column.status}
                  projectScope={projectScope}
                  projects={projects}
                  showProjectName={showProjectName}
                  projectNames={projectNames}
                  title={column.title}
                  status={column.status}
                  tasks={columnTasks}
                  onCreate={handleCreateTask}
                  onDelete={handleDeleteTask}
                  onUpdate={handleUpdateTask}
                />
              );
            })}
          </div>
        </DndContext>
      )}
    </div>
  );
}
