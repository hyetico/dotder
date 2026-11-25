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

import type { Goal } from "@/features/goals/types/goal";
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

function TaskRow({
  task,
  goals,
  today,
  ...handlers
}: { task: Task; goals: Goal[]; today: string } & TaskViewHandlers) {
  const late = getTaskLateDays(task, today);
  const goal = goalName(goals, task);
  const isDone = task.status === "DONE";

  return (
    <li className="relative flex min-h-12 items-center gap-3 border-t border-[var(--divider)] px-3 transition-colors duration-120 hover:bg-[var(--s2)] max-md:min-h-14">
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
      <span
        className={cn("min-w-0 flex-1 truncate text-sm", isDone && "text-[var(--t3)] line-through")}
      >
        {task.title}
      </span>
      <span className="w-32.5 truncate text-xs text-[var(--t3)] max-md:hidden">{goal ?? "—"}</span>
      <span className="flex w-21 justify-end">
        {late != null ? (
          <Badge tone="bad">{late}일 지연</Badge>
        ) : (
          <span className="text-xs text-[var(--t2)]">
            {task.dueDate
              ? task.dueDate === today
                ? "오늘"
                : formatMonthDot(task.dueDate)
              : "마감 없음"}
          </span>
        )}
      </span>
      <span className="flex w-14 items-center gap-1 text-xs max-md:hidden">
        <span aria-hidden className={cn("size-2 rounded-full", TASK_PRIORITY_DOT[task.priority])} />
        {TASK_PRIORITY_LABEL[task.priority]}
      </span>
      <span className="relative z-10">
        <TaskMenu task={task} {...handlers} />
      </span>
    </li>
  );
}

/**
 * 목록 보기 (프로토타입 taskList). 지연 · 오늘 · 이번 주 · 나중 · 완료 묶음 카드, 완료는 접혀 있다.
 * 줄: 체크 · 이름 · 목표 130 · 마감 84 · 우선순위 56 · ⋯ (줄 48).
 */
export function TaskListView({ tasks, goals, today, ...handlers }: TaskViewProps) {
  const [isDoneOpen, setIsDoneOpen] = useState(false);

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<ListChecks size={24} />}
        title="태스크가 없어요"
        text="조건을 바꾸거나 새 태스크를 추가해 보세요."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {TASK_BUCKETS.map((bucket) => {
        const items = tasks.filter((task) => getTaskBucket(task, today) === bucket.key);

        if (items.length === 0) {
          return null;
        }

        const isFolded = bucket.key === "done" && !isDoneOpen;

        return (
          <section
            key={bucket.key}
            className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]"
          >
            <button
              type="button"
              aria-expanded={!isFolded}
              onClick={() => bucket.key === "done" && setIsDoneOpen((open) => !open)}
              className={cn(
                "kit-focus flex h-9 w-full items-center gap-2 px-3 text-left text-sm font-semibold",
                bucket.key === "done" ? "cursor-pointer" : "cursor-default",
                bucket.tone === "bad" && "text-[var(--bad)]",
              )}
            >
              {isFolded ? (
                <ChevronRight size={16} aria-hidden />
              ) : (
                <ChevronDown size={16} aria-hidden />
              )}
              {bucket.label}
              <span className="text-xs font-normal text-[var(--t3)]">{items.length}</span>
            </button>
            {isFolded ? null : (
              <ul>
                {items.map((task) => (
                  <TaskRow key={task.id} task={task} goals={goals} today={today} {...handlers} />
                ))}
              </ul>
            )}
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
                <TaskRow key={task.id} task={task} goals={goals} today={today} {...handlers} />
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
