"use client";

import { useState, type DragEvent } from "react";

import Badge from "@/components/kit/Badge";
import Button from "@/components/kit/Button";
import Card from "@/components/kit/Card";
import Checkbox from "@/components/kit/Checkbox";
import EmptyState from "@/components/kit/EmptyState";
import { MenuItem, MenuSeparator, MoreMenu } from "@/components/kit/Menu";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  ListChecks,
  Plus,
  Trash2,
} from "@/components/ui/icon";

import { formatMonthDot, getTaskLateDays } from "@/features/projects/detail/projectOverviewModel";
import {
  TASK_BUCKETS,
  TASK_PRIORITY_DOT,
  TASK_PRIORITY_LABEL,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
  getTaskBucket,
} from "@/features/tasks/taskModel";

import { cn } from "@/lib/cn";
import { parseDateKey, toDateKey } from "@/lib/date";
import { projectColorVar } from "@/lib/projectPalette";

import type { Goal } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";
import type { Task, TaskStatus } from "@/features/tasks/types/task";

export type TaskViewHandlers = {
  onOpen: (task: Task) => void;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
  onMove: (task: Task, status: TaskStatus) => void;
  onAdd: (preset: { status?: TaskStatus; dueDate?: string }) => void;
};

type TaskViewProps = TaskViewHandlers & {
  tasks: Task[];
  goals: Goal[];
  today: string;
};

/** 태스크 ⋯ 메뉴 (보드 05-d · 프로토타입 tmenu). 상세 보기 · 완료(완료 취소) · ─ · 삭제 */
export function TaskMenu({
  task,
  onOpen,
  onToggleDone,
  onDelete,
}: { task: Task } & Pick<TaskViewHandlers, "onOpen" | "onToggleDone" | "onDelete">) {
  return (
    <MoreMenu label={`‘${task.title}’ 메뉴`} title="태스크" size="xs">
      {(close) => (
        <>
          <MenuItem
            icon={<ChevronRight />}
            onSelect={() => {
              close();
              onOpen(task);
            }}
          >
            상세 보기
          </MenuItem>
          <MenuItem
            icon={<Check />}
            onSelect={() => {
              close();
              onToggleDone(task);
            }}
          >
            {task.status === "DONE" ? "완료 취소" : "완료"}
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            danger
            icon={<Trash2 />}
            onSelect={() => {
              close();
              onDelete(task);
            }}
          >
            삭제
          </MenuItem>
        </>
      )}
    </MoreMenu>
  );
}

const goalName = (goals: Goal[], task: Task) =>
  goals.find((goal) => goal.id === task.goalId)?.title;

/**
 * 칸반 보기 (보드 05 · 프로토타입 board). 할 일 · 진행 중 · 완료 3칸(사이 16), 칸은 --s2 · 12 · 안쪽 12 · 사이 8.
 * 카드는 끌어서 다른 칸으로 옮긴다. 완료 칸은 2개만 보이고 「완료 N개 더 보기」.
 */
export function TaskBoardView({ tasks, goals, today, ...handlers }: TaskViewProps) {
  const [showAllDone, setShowAllDone] = useState(false);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);

  const drop = (event: DragEvent, status: TaskStatus) => {
    event.preventDefault();
    setDragOver(null);
    const task = tasks.find((item) => String(item.id) === event.dataTransfer.getData("text/plain"));

    if (task && task.status !== status) {
      handlers.onMove(task, status);
    }
  };

  return (
    <div className="grid items-start gap-4 md:grid-cols-3">
      {TASK_STATUS_ORDER.map((status) => {
        const all = tasks.filter((task) => task.status === status);
        const shown = status === "DONE" && !showAllDone ? all.slice(0, 2) : all;

        return (
          <section
            key={status}
            aria-label={TASK_STATUS_LABEL[status]}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(status);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(event) => drop(event, status)}
            className={cn(
              "flex min-h-30 flex-col gap-2 rounded-[var(--radius-md)] bg-[var(--s2)] p-3",
              dragOver === status && "shadow-[inset_0_0_0_2px_var(--primary)]",
            )}
          >
            <div className="flex h-8 items-center gap-1.5">
              <strong className="text-sm">{TASK_STATUS_LABEL[status]}</strong>
              <span className="text-xs text-[var(--t3)] tabular-nums">{all.length}</span>
              <span className="flex-1" />
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                aria-label={`${TASK_STATUS_LABEL[status]}에 태스크 추가`}
                onClick={() => handlers.onAdd({ status })}
              >
                <Plus size={16} aria-hidden />
              </Button>
            </div>
            {shown.map((task) => {
              const late = getTaskLateDays(task, today);
              const goal = goalName(goals, task);
              const isDone = task.status === "DONE";

              return (
                <Card
                  as="article"
                  interactive
                  key={task.id}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData("text/plain", String(task.id))}
                  className="flex cursor-grab flex-col gap-2 p-3"
                >
                  <button
                    type="button"
                    onClick={() => handlers.onOpen(task)}
                    aria-label={`‘${task.title}’ 열기`}
                    className="kit-focus absolute inset-0 cursor-pointer rounded-[inherit]"
                  />
                  <div className="flex items-start gap-2">
                    <span
                      className={cn(
                        "min-w-0 flex-1 text-sm [overflow-wrap:anywhere]",
                        isDone && "text-[var(--t3)] line-through",
                      )}
                    >
                      {task.title}
                    </span>
                    <span className="relative z-10">
                      <TaskMenu task={task} {...handlers} />
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--t3)]">
                    {goal ? (
                      <span className="inline-flex h-5 max-w-30 items-center truncate rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 text-[var(--t2)]">
                        {goal}
                      </span>
                    ) : null}
                    {late != null ? (
                      <Badge tone="bad">{late}일 지연</Badge>
                    ) : task.dueDate && !isDone ? (
                      <span>{formatMonthDot(task.dueDate)}</span>
                    ) : null}
                    <span className="flex-1" />
                    {!isDone ? (
                      <span className="inline-flex items-center gap-1">
                        <span
                          aria-hidden
                          className={cn("size-2 rounded-full", TASK_PRIORITY_DOT[task.priority])}
                        />
                        {TASK_PRIORITY_LABEL[task.priority]}
                      </span>
                    ) : null}
                  </div>
                </Card>
              );
            })}
            {status === "DONE" && all.length > 2 ? (
              <Button variant="ghost" size="sm" onClick={() => setShowAllDone((open) => !open)}>
                {showAllDone ? "접기" : `완료 ${all.length - 2}개 더 보기`}
              </Button>
            ) : null}
            <Button
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => handlers.onAdd({ status })}
            >
              <Plus size={16} aria-hidden />
              태스크 추가
            </Button>
          </section>
        );
      })}
    </div>
  );
}

/** 마감 글 (보드 10): 오늘 · 이번 주는 「11.25 (수)」 · 그 뒤는 「12.20」 · 없으면 「마감 없음」 */
function dueText(task: Task, today: string) {
  if (!task.dueDate) {
    return "마감 없음";
  }
  if (task.dueDate === today) {
    return "오늘";
  }
  const bucket = getTaskBucket(task, today);
  const date = parseDateKey(task.dueDate);
  return bucket === "week" && date
    ? `${formatMonthDot(task.dueDate)} (${WEEKDAYS[date.getDay()]})`
    : formatMonthDot(task.dueDate);
}

type ListProject = { id: number; name: string; color: Project["color"] };

function TaskRow({
  task,
  goals,
  today,
  project,
  showProject,
  ...handlers
}: {
  task: Task;
  goals: Goal[];
  today: string;
  project?: ListProject;
  showProject: boolean;
} & TaskViewHandlers) {
  const late = getTaskLateDays(task, today);
  const goal = goalName(goals, task);
  const isDone = task.status === "DONE";
  const projectDot = project ? (
    <span
      aria-hidden
      className="size-2 shrink-0 rounded-full"
      style={{ background: projectColorVar(project.color) }}
    />
  ) : null;

  return (
    <li className="relative isolate flex min-h-12 items-center gap-3 border-t border-[var(--divider)] transition-colors duration-120 hover:bg-[var(--s2)] max-lg:min-h-14 lg:px-3">
      <button
        type="button"
        onClick={() => handlers.onOpen(task)}
        aria-label={`‘${task.title}’ 열기`}
        className="kit-focus absolute inset-0 cursor-pointer"
      />
      <span className="relative z-10 inline-flex">
        <Checkbox
          checked={isDone}
          onChange={() => handlers.onToggleDone(task)}
          label={`‘${task.title}’ 완료`}
        />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className={cn("truncate text-sm", isDone && "text-[var(--t3)] line-through")}>
          {task.title}
        </span>
        {/* 태블릿 · 모바일은 이름 아래 프로젝트 (보드 T · M 10) */}
        {showProject && project ? (
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-[var(--t3)] lg:hidden">
            {projectDot}
            <span className="truncate">{project.name}</span>
          </span>
        ) : null}
      </span>
      {showProject ? (
        <span className="flex w-55 min-w-0 items-center gap-1.5 text-xs text-[var(--t2)] max-lg:hidden">
          {project ? (
            <>
              {projectDot}
              <span className="truncate">{project.name}</span>
            </>
          ) : (
            "—"
          )}
        </span>
      ) : null}
      <span className="w-37.5 truncate text-xs text-[var(--t3)] max-lg:hidden">{goal ?? "—"}</span>
      <span className="flex lg:w-25">
        {late != null ? (
          <Badge tone="bad">{late}일 지연</Badge>
        ) : (
          <>
            <span className="text-xs text-[var(--t2)] max-lg:hidden">{dueText(task, today)}</span>
            {/* 태블릿 · 모바일은 요일 없이 (보드 T · M 10) */}
            {task.dueDate && !isDone ? (
              <span className="text-xs text-[var(--t2)] lg:hidden">
                {task.dueDate === today ? "오늘" : formatMonthDot(task.dueDate)}
              </span>
            ) : null}
          </>
        )}
      </span>
      <span className="flex w-15 items-center gap-1 text-xs max-lg:hidden">
        {isDone ? null : (
          <>
            <span
              aria-hidden
              className={cn("size-2 rounded-full", TASK_PRIORITY_DOT[task.priority])}
            />
            {TASK_PRIORITY_LABEL[task.priority]}
          </>
        )}
      </span>
      <span className="relative z-10">
        <TaskMenu task={task} {...handlers} />
      </span>
    </li>
  );
}

export type TaskGroupBy = "due" | "project";

/**
 * 목록 보기 (보드 10 · T · M 10 · 프로토타입 taskList).
 * 웹: 묶음 카드 — 머리 44 · --s2 바탕(펼침 화살표 · 이름 · 수 · +), 줄 48 = 체크 · 이름 · (프로젝트 220) · 목표 150 · 마감 100 · 우선 60 · ⋯.
 * 태블릿 · 모바일: 묶음 머리 36(이름 · 수) → 줄 56 = 체크 · 이름 + 프로젝트 · 지연 배지 · ⋯.
 * 마감일로 묶으면 지연 · 오늘 · 이번 주 · 나중 · 완료(접힘), 프로젝트로 묶을 수도 있다.
 */
export function TaskListView({
  tasks,
  goals,
  today,
  projects = [],
  showProject = false,
  groupBy = "due",
  ...handlers
}: TaskViewProps & {
  /** 프로젝트 이름 · 색 (전체 태스크) */
  projects?: ListProject[];
  /** 프로젝트 칸을 보인다 (전체 태스크 보드 10) */
  showProject?: boolean;
  groupBy?: TaskGroupBy;
}) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ done: false });

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ListChecks size={24} />}
        title="태스크가 없어요"
        text="조건을 바꾸거나 새 태스크를 추가해 보세요."
      />
    );
  }

  const projectOf = (task: Task) => projects.find((project) => project.id === task.projectId);
  const groups: { key: string; label: string; bad?: boolean; items: Task[]; canAdd: boolean }[] =
    groupBy === "project"
      ? [...new Set(tasks.map((task) => task.projectId))].map((projectId) => ({
          key: `p${projectId}`,
          label: projects.find((project) => project.id === projectId)?.name ?? "프로젝트 없음",
          items: tasks.filter((task) => task.projectId === projectId),
          canAdd: false,
        }))
      : TASK_BUCKETS.map((bucket) => ({
          key: bucket.key,
          label: bucket.label,
          bad: bucket.tone === "bad",
          items: tasks.filter((task) => getTaskBucket(task, today) === bucket.key),
          canAdd: bucket.key !== "done",
        }));

  return (
    <div className="flex flex-col gap-3 lg:gap-6">
      {showProject ? (
        <div className="flex items-center gap-3 px-3 text-xs text-[var(--t3)] max-lg:hidden">
          <span className="w-4.5" />
          <span className="flex-1">태스크</span>
          <span className="w-55">프로젝트</span>
          <span className="w-37.5">목표</span>
          <span className="w-25">마감</span>
          <span className="w-15">우선</span>
          <span className="w-7" />
        </div>
      ) : null}
      {groups
        .filter((group) => group.items.length > 0)
        .map((group) => {
          const isOpen = openGroups[group.key] ?? true;
          const dueOf = (key: string) => (key === "today" ? today : undefined);

          return (
            <section
              key={group.key}
              className="lg:overflow-hidden lg:rounded-[var(--radius-md)] lg:border lg:border-[var(--border)] lg:bg-[var(--surface)]"
            >
              <div className="flex h-9 items-center gap-1.5 lg:h-11 lg:gap-2 lg:bg-[var(--s2)] lg:px-3">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenGroups((current) => ({ ...current, [group.key]: !isOpen }))}
                  className="kit-focus flex min-w-0 cursor-pointer items-center gap-1.5 rounded-[var(--radius-xs)] lg:gap-2"
                >
                  <span className="text-[var(--t3)] max-lg:hidden">
                    {isOpen ? (
                      <ChevronDown size={16} aria-hidden />
                    ) : (
                      <ChevronRight size={16} aria-hidden />
                    )}
                  </span>
                  <strong className={cn("truncate text-sm", group.bad && "text-[var(--bad)]")}>
                    {group.label}
                  </strong>
                  <span className="text-xs text-[var(--t3)] tabular-nums">
                    {group.items.length}
                  </span>
                </button>
                <span className="flex-1" />
                {group.canAdd ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    iconOnly
                    aria-label="태스크 추가"
                    className="max-lg:hidden"
                    onClick={() => handlers.onAdd({ dueDate: dueOf(group.key) })}
                  >
                    <Plus size={16} aria-hidden />
                  </Button>
                ) : null}
              </div>
              {isOpen ? (
                <ul>
                  {group.items.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      goals={goals}
                      today={today}
                      project={projectOf(task)}
                      showProject={showProject}
                      {...handlers}
                    />
                  ))}
                </ul>
              ) : null}
            </section>
          );
        })}
    </div>
  );
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 캘린더 보기 (보드 06 · 프로토타입 calendar). 7칸 · 칸 104(모바일 48), 마감인 태스크가 칸에 2개까지
 * (완료 초록 · 지연 빨강), 넘치면 「+N」. 날을 누르면 아래에 그날 목록 + 「이 날 추가」.
 *
 * @param month - 보여 줄 달 `YYYY-MM`
 */
export function TaskCalendarView({
  tasks,
  goals,
  today,
  month,
  ...handlers
}: TaskViewProps & { month: string }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [year, monthIndex] = month.split("-").map(Number);
  const first = new Date(year, monthIndex - 1, 1);
  const days = new Date(year, monthIndex, 0).getDate();
  const offset = first.getDay();
  const cells: (string | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: days }, (_, index) =>
      toDateKey(new Date(year, monthIndex - 1, index + 1)),
    ),
  ];
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  const dayTasks = (key: string) => tasks.filter((task) => task.dueDate === key);
  const hasMonth = tasks.some((task) => task.dueDate.startsWith(month));
  const selectedTasks = selected ? dayTasks(selected) : [];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-7 overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)]">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="flex h-8 items-center px-2 text-xs text-[var(--t3)] max-md:justify-center"
          >
            {day}
          </div>
        ))}
        {cells.map((key, index) => {
          if (!key) {
            return (
              <div
                key={`blank-${index}`}
                className="min-h-26 border-t border-l border-[var(--border)] bg-[var(--s2)] max-md:min-h-12 [&:nth-child(7n+1)]:border-l-0"
              />
            );
          }

          const items = dayTasks(key);
          const date = parseDateKey(key);

          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected === key}
              aria-label={`${date ? date.getMonth() + 1 : ""}월 ${date?.getDate()}일 · 태스크 ${items.length}개`}
              onClick={() => setSelected(selected === key ? null : key)}
              className={cn(
                "kit-focus flex min-h-26 min-w-0 cursor-pointer flex-col gap-1 border-t border-l border-[var(--border)] bg-[var(--surface)] p-1.5 text-left max-md:min-h-12 max-md:items-center [&:nth-child(7n+1)]:border-l-0",
                selected === key && "bg-[var(--s3)]",
              )}
            >
              <span className={cn("px-0.5 text-xs", key === today && "font-bold")}>
                {date?.getDate()}
              </span>
              {items.slice(0, 2).map((task) => {
                const isDone = task.status === "DONE";
                const isLate = getTaskLateDays(task, today) != null;
                return (
                  <span
                    key={task.id}
                    className={cn(
                      "truncate rounded-[var(--radius-kbd)] px-1.5 text-xs max-md:hidden",
                      isDone
                        ? "bg-[var(--badge-ok-bg)] text-[var(--badge-ok-fg)] line-through"
                        : isLate
                          ? "bg-[var(--badge-bad-bg)] text-[var(--badge-bad-fg)]"
                          : "bg-[var(--badge-n-bg)] text-[var(--badge-n-fg)]",
                    )}
                  >
                    {task.title}
                  </span>
                );
              })}
              {items.length > 2 ? (
                <span className="px-0.5 text-xs text-[var(--t3)] max-md:hidden">
                  +{items.length - 2}
                </span>
              ) : null}
              {items.length > 0 ? (
                <span aria-hidden className="flex gap-0.5 md:hidden">
                  {items.slice(0, 3).map((task) => (
                    <i key={task.id} className="size-1 rounded-full bg-[var(--t3)]" />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {selected ? (
        <section className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]">
          <div className="flex h-9 items-center gap-2 px-3 text-sm font-semibold">
            {formatMonthDot(selected).replace(".", "월 ")}일
            <span className="text-xs font-normal text-[var(--t3)]">{selectedTasks.length}개</span>
            <span className="flex-1" />
            <Button variant="ghost" size="xs" onClick={() => handlers.onAdd({ dueDate: selected })}>
              <Plus size={14} aria-hidden />이 날 추가
            </Button>
          </div>
          {selectedTasks.length ? (
            <ul>
              {selectedTasks.map((task) => (
                <TaskRow
                  showProject={false}
                  key={task.id}
                  task={task}
                  goals={goals}
                  today={today}
                  {...handlers}
                />
              ))}
            </ul>
          ) : (
            <p className="flex min-h-12 items-center border-t border-[var(--divider)] px-3 text-xs text-[var(--t3)]">
              이 날은 태스크가 없어요
            </p>
          )}
        </section>
      ) : hasMonth ? null : (
        <EmptyState
          icon={<Calendar size={24} />}
          title="이 달에는 마감인 태스크가 없어요"
          text="다른 달로 옮기거나 날짜를 눌러 추가해 보세요."
        />
      )}
    </div>
  );
}
