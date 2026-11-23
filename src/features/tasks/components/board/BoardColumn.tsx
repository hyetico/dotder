"use client";

import { useState } from "react";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import DropdownMenu from "@/components/ui/DropdownMenu";
import { useAlert } from "@/components/ui/modal/AlertModal";

import { canAddProjectItems } from "@/features/projects/utils/projectUtils";
import CreateTaskButton from "@/features/tasks/components/board/CreateTaskButton";
import TaskCard from "@/features/tasks/components/board/TaskCard";

import type { Project } from "@/features/projects/types/project";
import type { Task, TaskStatus } from "@/features/tasks/types/task";
import type { ProjectScope } from "@/lib/projectRoutes";

const statusDotColors: Record<TaskStatus, string> = {
  TODO: "bg-slate-400",
  IN_PROGRESS: "bg-blue-600",
  DONE: "bg-green-600",
};

type BoardColumnProps = {
  projectScope: ProjectScope;
  projects: Project[];
  showProjectName?: boolean;
  projectNames?: Record<number, string>;
  title: string;
  status: TaskStatus;

  tasks: Task[];

  onCreate: (task: Task) => void;

  onDelete: (taskId: number) => void;

  onUpdate: (task: Task) => void;
};

export default function BoardColumn({
  projectScope,
  projects,
  showProjectName = false,
  projectNames = {},
  title,
  status,
  tasks,
  onCreate,
  onUpdate,
  onDelete,
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const scopedProject =
    typeof projectScope === "number"
      ? projects.find((project) => project.id === projectScope)
      : undefined;
  const addDisabled = !canAddProjectItems(scopedProject?.status);

  const { confirm } = useAlert();

  const handleDeleteAll = async () => {
    if (tasks.length === 0) {
      return;
    }

    const confirmed = await confirm({
      title: "Task 전체 삭제",
      description: `${title} 컬럼의 Task ${tasks.length}개를 모두 삭제할까요?`,
      confirmLabel: "삭제",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    tasks.forEach((task) => {
      onDelete(task.id);
    });
  };

  return (
    <section
      ref={setNodeRef}
      className={`rounded-[var(--radius-sm)] border p-3 transition-colors ${
        isOver
          ? `border-[var(--color-primary)] bg-[var(--color-primary-soft)]`
          : `border-[var(--color-border)] bg-[var(--color-hover-soft)]/80`
      } `}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${statusDotColors[status]} `}
            aria-hidden="true"
          />

          <h3 className="text-body-sm truncate font-semibold text-[var(--color-text)]">{title}</h3>

          <span className="shrink-0 rounded-full bg-white px-2 py-1 text-xs text-[var(--color-text-secondary)]">
            {tasks.length}
          </span>
        </div>

        <DropdownMenu label={`${title} 컬럼 메뉴`}>
          {(close) => (
            <>
              <button
                type="button"
                disabled={addDisabled}
                title={addDisabled ? "보류 중인 프로젝트에는 태스크를 추가할 수 없습니다." : "추가"}
                onClick={() => {
                  close();

                  setIsCreateModalOpen(true);
                }}
                className="text-body-sm flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                추가
              </button>

              <button
                type="button"
                onClick={() => {
                  close();

                  handleDeleteAll();
                }}
                disabled={tasks.length === 0}
                className="text-body-sm flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                전체 삭제
              </button>
            </>
          )}
        </DropdownMenu>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className={tasks.length > 0 ? "min-h-32 space-y-2.5" : undefined}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              projectName={showProjectName ? projectNames[task.projectId] : undefined}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>

      <CreateTaskButton
        projectScope={projectScope}
        projects={projects}
        status={status}
        hasTasks={tasks.length > 0}
        onCreate={onCreate}
        isModalOpen={isCreateModalOpen}
        onModalOpenChange={setIsCreateModalOpen}
      />
    </section>
  );
}
