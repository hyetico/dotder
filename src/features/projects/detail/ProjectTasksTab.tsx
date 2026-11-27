"use client";

import { useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import Badge, { badgeDotClassName } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Funnel,
  LayoutGrid,
  List,
  Plus,
} from "@/components/ui/icon";
import { MenuHeader, MenuSeparator, PickRow } from "@/components/ui/Menu";
import PillGroup from "@/components/ui/PillGroup";
import Popover from "@/components/ui/Popover";
import Segmented from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";

import { TOAST_TEXT } from "@/content/ui";
import { getTaskLateDays } from "@/features/projects/detail/projectOverviewModel";
import TaskAddDrawer from "@/features/tasks/drawers/TaskAddDrawer";
import TaskDetailDrawer from "@/features/tasks/drawers/TaskDetailDrawer";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
  TASK_STATUS_TONE,
} from "@/features/tasks/taskModel";
import {
  TaskBoardView,
  TaskCalendarView,
  TaskListView,
  type TaskViewHandlers,
} from "@/features/tasks/views/TaskViews";

import { cn } from "@/lib/cn";
import { projectColorVar } from "@/lib/projectPalette";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Goal } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/types/task";

type TaskView = "board" | "list" | "calendar";

type ProjectTasksTabProps = {
  project: Project;
  goals: Goal[];
  tasks: Task[];
  today: string;
};

const shiftMonth = (month: string, step: number) => {
  const [year, index] = month.split("-").map(Number);
  const date = new Date(year, index - 1 + step, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * 상세 태스크 탭 (보드 05 · 05-a ~ 05-d · 06 · 프로토타입 tasksTab).
 * 도구 줄: 보드 · 목록 · 캘린더 + (보드 · 목록) 「목표: 전체」 180 · ─ · 필터(우선순위) · [+ 추가]
 * / (캘린더) 「2026년 8월」 ‹ › [오늘] · ─ · [+ 추가].
 */
export default function ProjectTasksTab({ project, goals, tasks, today }: ProjectTasksTabProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const goalRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const [view, setView] = useState<TaskView>("board");
  const [compactStatus, setCompactStatus] = useState<TaskStatus>("IN_PROGRESS");
  const [goalFilter, setGoalFilter] = useState<number | "all">("all");
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [panel, setPanel] = useState<"goal" | "filter" | null>(null);
  const [month, setMonth] = useState((project.startDate || today).slice(0, 7));
  const [addPreset, setAddPreset] = useState<{ status?: TaskStatus; dueDate?: string } | null>(
    null,
  );
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const { updateTaskMutation, deleteTaskMutation, createTaskMutation } = useTaskMutations(
    project.id,
  );

  const visible = tasks
    .filter((task) => goalFilter === "all" || task.goalId === goalFilter)
    .filter((task) => priorities.length === 0 || priorities.includes(task.priority));
  const goalLabel =
    goalFilter === "all" ? "전체" : (goals.find((goal) => goal.id === goalFilter)?.title ?? "전체");
  const openTask = tasks.find((task) => task.id === openTaskId) ?? null;
  // 이 프로젝트에 태스크가 0개면 거를 것이 없다: 도구 줄을 못 누르게 하고 조건 · 보기는 기본값으로 ([+ 추가]는 살아 있음)
  const isEmpty = tasks.length === 0;
  if (
    isEmpty &&
    (view !== "board" ||
      goalFilter !== "all" ||
      priorities.length > 0 ||
      compactStatus !== "IN_PROGRESS" ||
      panel != null)
  ) {
    setView("board");
    setGoalFilter("all");
    setPriorities([]);
    setCompactStatus("IN_PROGRESS");
    setPanel(null);
  }
  const refresh = () => queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });

  const handlers: TaskViewHandlers = {
    onOpen: (task) => setOpenTaskId(task.id),
    onToggleDone: (task) => {
      const isCompleting = task.status !== "DONE";
      void updateTaskMutation
        .mutateAsync({ ...task, status: isCompleting ? "DONE" : "TODO" })
        .then(() => {
          void refresh();
          // 완료하면 되돌리기 토스트 (보드 S5 · 프로토타입 tcheck)
          if (isCompleting) {
            toast(TOAST_TEXT.taskCompleted, {
              undo: () => void updateTaskMutation.mutateAsync(task).then(refresh),
            });
          }
        });
    },
    onMove: (task, status) =>
      void updateTaskMutation.mutateAsync({ ...task, status }).then(refresh),
    onDelete: (task) =>
      void deleteTaskMutation.mutateAsync(task.id).then(() => {
        void refresh();
        setOpenTaskId(null);
        toast(TOAST_TEXT.deleted, {
          undo: () => void createTaskMutation.mutateAsync(task).then(refresh),
        });
      }),
    onAdd: (preset) => setAddPreset(preset),
  };

  return (
    <>
      {/* 웹 (보드 05 · 06) */}
      <div className="flex flex-col gap-6 max-lg:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            label="보기"
            value={view}
            onChange={setView}
            disabled={isEmpty}
            items={[
              {
                value: "board",
                label: (
                  <>
                    <LayoutGrid size={16} aria-hidden />
                    보드
                  </>
                ),
              },
              {
                value: "list",
                label: (
                  <>
                    <List size={16} aria-hidden />
                    목록
                  </>
                ),
              },
              {
                value: "calendar",
                label: (
                  <>
                    <Calendar size={16} aria-hidden />
                    캘린더
                  </>
                ),
              },
            ]}
          />
          {view === "calendar" ? (
            <div className="flex items-center gap-2 md:ml-4">
              <strong className="text-base">
                {Number(month.slice(0, 4))}년 {Number(month.slice(5))}월
              </strong>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label="이전 달"
                onClick={() => setMonth(shiftMonth(month, -1))}
              >
                <ChevronLeft size={16} aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label="다음 달"
                onClick={() => setMonth(shiftMonth(month, 1))}
              >
                <ChevronRight size={16} aria-hidden />
              </Button>
              <Button size="xs" onClick={() => setMonth(today.slice(0, 7))}>
                오늘
              </Button>
            </div>
          ) : (
            <button
              ref={goalRef}
              type="button"
              aria-haspopup="listbox"
              aria-expanded={panel === "goal"}
              aria-disabled={isEmpty || undefined}
              tabIndex={isEmpty ? -1 : undefined}
              onClick={isEmpty ? undefined : () => setPanel(panel === "goal" ? null : "goal")}
              className="kit-focus flex h-9 w-45 min-w-0 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--input-line)] bg-[var(--surface)] px-3 text-left text-sm hover:border-[var(--input-line-h)] aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
              <span className="min-w-0 flex-1 truncate">목표: {goalLabel}</span>
              <ChevronDown size={16} aria-hidden className="shrink-0 text-[var(--t3)]" />
            </button>
          )}
          <span className="flex-1" />
          {view === "calendar" ? null : (
            <Button
              ref={filterRef}
              size="sm"
              aria-haspopup="dialog"
              aria-expanded={panel === "filter"}
              aria-disabled={isEmpty || undefined}
              onClick={() => setPanel(panel === "filter" ? null : "filter")}
              className={cn(priorities.length > 0 && "border-[var(--primary)]")}
            >
              <Funnel size={16} aria-hidden />
              필터{priorities.length ? ` ${priorities.length}` : ""}
            </Button>
          )}
          <Button size="sm" onClick={() => setAddPreset({})}>
            <Plus size={16} aria-hidden />
            추가
          </Button>
        </div>

        {view === "board" ? (
          <TaskBoardView tasks={visible} goals={goals} today={today} {...handlers} />
        ) : view === "list" ? (
          <TaskListView tasks={visible} goals={goals} today={today} {...handlers} />
        ) : (
          <TaskCalendarView tasks={tasks} goals={goals} today={today} month={month} {...handlers} />
        )}
      </div>

      {/* 태블릿 · 모바일 (보드 T · M 05): 상태 알약 → 태스크 줄 */}
      <div className="flex flex-col gap-3 lg:hidden">
        <PillGroup
          label="태스크 상태"
          value={compactStatus}
          onChange={setCompactStatus}
          disabled={isEmpty}
          items={TASK_STATUS_ORDER.map((status) => ({
            value: status,
            label: TASK_STATUS_LABEL[status],
            dotClassName: badgeDotClassName[TASK_STATUS_TONE[status]],
            count: tasks.filter((task) => task.status === status).length,
          }))}
        />
        <ul>
          {tasks
            .filter((task) => task.status === compactStatus)
            .map((task) => {
              const late = getTaskLateDays(task, today);
              const goal = goals.find((item) => item.id === task.goalId);
              return (
                <li key={task.id}>
                  <button
                    type="button"
                    onClick={() => setOpenTaskId(task.id)}
                    className="kit-focus flex min-h-14 w-full cursor-pointer items-center gap-3 border-t border-[var(--divider)] text-left transition-colors duration-120 hover:bg-[var(--s2)]"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm">{task.title}</span>
                      {goal ? (
                        <span className="flex items-center gap-1.5 text-xs text-[var(--t3)]">
                          <span
                            aria-hidden
                            className="size-2 rounded-full"
                            style={{ background: projectColorVar(project.color) }}
                          />
                          <span className="truncate">{goal.title}</span>
                        </span>
                      ) : null}
                    </span>
                    {late != null ? <Badge tone="bad">{late}일 지남</Badge> : null}
                  </button>
                </li>
              );
            })}
        </ul>
      </div>

      <Popover
        isOpen={panel === "goal"}
        onClose={() => setPanel(null)}
        anchorRef={goalRef}
        title="목표"
        width={220}
        role="listbox"
      >
        <PickRow
          selected={goalFilter === "all"}
          onSelect={() => {
            setGoalFilter("all");
            setPanel(null);
          }}
        >
          전체
        </PickRow>
        {goals.length ? <MenuSeparator /> : null}
        {goals.map((goal) => (
          <PickRow
            key={goal.id}
            selected={goalFilter === goal.id}
            onSelect={() => {
              setGoalFilter(goal.id);
              setPanel(null);
            }}
          >
            {goal.title}
          </PickRow>
        ))}
      </Popover>

      <Popover
        isOpen={panel === "filter"}
        onClose={() => setPanel(null)}
        anchorRef={filterRef}
        title="필터"
        width={280}
        align="end"
      >
        <MenuHeader>우선순위</MenuHeader>
        {TASK_PRIORITY_ORDER.map((priority) => {
          const isOn = priorities.includes(priority);
          const toggle = () =>
            setPriorities(
              isOn ? priorities.filter((item) => item !== priority) : [...priorities, priority],
            );
          return (
            <label
              key={priority}
              className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 text-sm hover:bg-[var(--s3)] max-md:min-h-13"
            >
              <Checkbox checked={isOn} onChange={toggle} label={TASK_PRIORITY_LABEL[priority]} />
              <span className="flex-1">{TASK_PRIORITY_LABEL[priority]}</span>
              <span className="text-xs text-[var(--t3)] tabular-nums">
                {tasks.filter((task) => task.priority === priority).length}
              </span>
            </label>
          );
        })}
        <MenuSeparator />
        <div className="flex items-center gap-2 px-1.5 py-1">
          <span className="flex-1 text-xs text-[var(--t3)]">결과 {visible.length}개</span>
          <Button variant="ghost" size="xs" onClick={() => setPriorities([])}>
            초기화
          </Button>
        </div>
      </Popover>

      <TaskAddDrawer
        projectId={project.id}
        goals={goals}
        preset={addPreset}
        onClose={() => setAddPreset(null)}
        count={tasks.length}
      />
      <TaskDetailDrawer
        task={openTask}
        projectName={project.name}
        goals={goals}
        onClose={() => setOpenTaskId(null)}
        onToggleDone={handlers.onToggleDone}
        onDelete={handlers.onDelete}
      />
    </>
  );
}
