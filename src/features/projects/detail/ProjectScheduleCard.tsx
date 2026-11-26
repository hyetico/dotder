"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import Badge, { badgeDotClassName } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { ChevronDown, ChevronRight, Flag } from "@/components/ui/icon";
import Segmented from "@/components/ui/Segmented";

import GoalDetailDrawer from "@/features/goals/drawers/GoalDetailDrawer";
import { getGoalStats } from "@/features/goals/list/goalListModel";
import {
  GOAL_STATUS_BADGE,
  formatMonthDot,
  getTaskLateDays,
} from "@/features/projects/detail/projectOverviewModel";
import TaskDetailDrawer from "@/features/tasks/drawers/TaskDetailDrawer";

import { cn } from "@/lib/cn";
import { getDayDelta, parseDateKey, toDateKey } from "@/lib/date";
import { projectColorVar } from "@/lib/projectPalette";

import type { Goal } from "@/features/goals/types/goal";
import type { ProjectDeadlineChange, ProjectListItem } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

type View = "all" | "week" | "month" | "today";
type Range = { from: string; to: string };

const VIEW_ITEMS: { value: View; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "week", label: "주" },
  { value: "month", label: "월" },
  { value: "today", label: "오늘" },
];

const addDays = (key: string, days: number) => {
  const date = parseDateKey(key) ?? new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};
const addMonths = (key: string, months: number) => {
  const date = parseDateKey(key) ?? new Date();
  return toDateKey(new Date(date.getFullYear(), date.getMonth() + months, date.getDate()));
};

/** 보기별 기간 (DOC2 06: 오늘 앞뒤 2주 · 주 앞 4주 뒤 8주 · 월 앞 2개월 뒤 4개월 · 전체 시작 ~ 마감과 오늘 중 늦은 날) */
function rangeOf(view: View, project: ProjectListItem, today: string): Range {
  if (view === "today") {
    return { from: addDays(today, -14), to: addDays(today, 14) };
  }
  if (view === "week") {
    return { from: addDays(today, -28), to: addDays(today, 56) };
  }
  if (view === "month") {
    return { from: addMonths(today, -2), to: addMonths(today, 4) };
  }
  const from = project.startDate && project.startDate < today ? project.startDate : today;
  const end = [project.endDate, today].filter(Boolean).sort().at(-1) ?? today;
  return { from, to: end > from ? end : addDays(from, 1) };
}

const VIEW_TEXT: Record<View, (today: string) => string> = {
  today: (today) => `오늘 ${formatMonthDot(today)} 기준 앞뒤 2주 · 하루 단위`,
  week: (today) => `오늘 ${formatMonthDot(today)} 기준 앞 4주 · 뒤 8주 · 주 단위`,
  month: (today) => `오늘 ${formatMonthDot(today)} 기준 앞 2개월 · 뒤 4개월 · 월 단위`,
  all: () => "프로젝트 시작부터 마감 · 오늘 중 늦은 날까지",
};

/** 날짜축 눈금: 오늘 보기는 하루마다(달 첫날은 「12.1」), 주 · 전체(짧을 때)는 월요일, 월 · 긴 전체는 달 첫날 */
function ticksOf(view: View, range: Range) {
  const ticks: { key: string; label: string }[] = [];
  const total = getDayDelta(range.from, range.to);
  const useMonths = view === "month" || (view === "all" && total > 120);
  for (let key = range.from; key <= range.to; key = addDays(key, 1)) {
    const date = parseDateKey(key);
    if (!date) {
      continue;
    }
    const isMonthStart = date.getDate() === 1;
    if (view === "today") {
      ticks.push({
        key,
        label: isMonthStart ? `${date.getMonth() + 1}.1` : String(date.getDate()),
      });
    } else if (useMonths ? isMonthStart : date.getDay() === 1) {
      ticks.push({
        key,
        label: useMonths ? `${date.getMonth() + 1}월` : `${date.getMonth() + 1}.${date.getDate()}`,
      });
    }
  }
  return ticks;
}

const STATUS_FILL = {
  NOT_STARTED: "bg-[var(--badge-n-dot)]",
  IN_PROGRESS: "bg-[var(--badge-info-dot)]",
  COMPLETED: "bg-[var(--badge-ok-dot)]",
} as const;

type ScheduleProps = {
  project: ProjectListItem;
  goals: Goal[];
  tasks: Task[];
  deadlineChanges: ProjectDeadlineChange[];
  /** 프로젝트 지연 일수. 지연이 아니면 null */
  lateDays: number | null;
  today: string;
  /** 「마감 변경 N」 → 기록 탭 (태블릿 · 모바일) */
  historyHref: string;
};

/**
 * 디테일 「일정」 v5 (REBUILD 6 · DOC2 06 · 보드 03 · T · M 03).
 * 웹: 「일정」 + 보기 설명 · 오른쪽 전체 · 주 · 월 · 오늘(기본) → 범례 → 이름 220 | 날짜축 | 값 120.
 * 줄: 전체 진행률 → 목표(마감 지남 → 진행 중 → 계획 → 기간 없음) · 오늘 보기에서만 목표 아래 태스크 → 「완료 N」 묶음.
 * 막대: 기간 회색 + 상태 색 진행률 · 마감 지나 오늘까지 빨간 선 2 · 범위 밖은 「‹ 마감 MM.DD」 · 「MM.DD 시작 ›」.
 * 마감 변경은 전체 진행률 줄의 깃발(올리거나 누르면 툴팁). 목표 · 태스크 줄을 누르면 상세 드로어.
 * 태블릿 · 모바일: 날짜축 없는 목록형 + 「마감 변경 N」 → 기록.
 */
export default function ProjectScheduleCard({
  project,
  goals,
  tasks,
  deadlineChanges,
  lateDays,
  today,
  historyHref,
}: ScheduleProps) {
  const [view, setView] = useState<View>("today");
  const [folded, setFolded] = useState<Record<string, boolean>>({});
  const [openGoalId, setOpenGoalId] = useState<number | null>(null);
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  const range = rangeOf(view, project, today);
  const total = Math.max(getDayDelta(range.from, range.to), 1);
  const pct = (key: string) => (getDayDelta(range.from, key) / total) * 100;
  const clamp = (value: number) => Math.min(100, Math.max(0, value));
  const inRange = (key: string) => key >= range.from && key <= range.to;

  const statsOf = (goal: Goal) => getGoalStats(goal, tasks, today);
  const order = (goal: Goal) => {
    if (!goal.startDate && !goal.endDate) return 3;
    if (statsOf(goal).lateDays != null) return 0;
    return goal.status === "IN_PROGRESS" ? 1 : 2;
  };
  const openGoals = goals
    .filter((goal) => goal.status !== "COMPLETED")
    .sort((a, b) => order(a) - order(b) || (a.endDate || "9").localeCompare(b.endDate || "9"));
  const doneGoals = goals.filter((goal) => goal.status === "COMPLETED");
  // 오늘 보기에서만: 지났거나 오늘 범위 안에 마감이 있는 미완료 태스크 · 지난 것 먼저
  const tasksOf = (goal: Goal) =>
    view === "today"
      ? tasks
          .filter((task) => task.goalId === goal.id && task.status !== "DONE" && task.dueDate)
          .filter((task) => task.dueDate <= range.to)
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      : [];
  const remainDays =
    project.endDate && project.endDate >= today ? getDayDelta(today, project.endDate) : null;

  const bar = ({
    start,
    end,
    progress,
    fillClassName,
    fillStyle,
    late,
    tall,
  }: {
    start: string;
    end: string;
    progress: number;
    fillClassName?: string;
    fillStyle?: CSSProperties;
    late: boolean;
    tall: boolean;
  }) => {
    const parts: ReactNode[] = [];
    if (start && end && end >= range.from && start <= range.to) {
      const left = clamp(pct(start));
      const width = Math.max(clamp(pct(end)) - left, 0.6);
      parts.push(
        <span
          key="bar"
          className={cn(
            "absolute h-2 overflow-hidden rounded-full bg-[var(--track)]",
            tall ? "top-4.5" : "top-3.5",
          )}
          style={{ left: `${left}%`, width: `${width}%` }}
        >
          <i
            className={cn("absolute inset-y-0 left-0 rounded-full", fillClassName)}
            style={{ ...fillStyle, width: `${clamp(progress)}%` }}
          />
        </span>,
      );
    } else if (start && start > range.to) {
      parts.push(
        <span
          key="start"
          className={cn("absolute right-0 text-xs text-[var(--t3)]", tall ? "top-3.5" : "top-2.5")}
        >
          {formatMonthDot(start)} 시작 ›
        </span>,
      );
    }
    if (late && end) {
      const from = clamp(pct(end));
      const to = clamp(pct(today));
      parts.push(
        <span
          key="late"
          className={cn("absolute h-0.5 bg-[var(--late-line)]", tall ? "top-5.25" : "top-4.25")}
          style={{ left: `${from}%`, width: `${Math.max(to - from, 0)}%` }}
        />,
      );
      if (end < range.from) {
        parts.push(
          <span
            key="chip"
            className={cn(
              "absolute left-0 z-10 rounded-[var(--radius-kbd)] bg-[var(--late-chip-bg)] px-1 text-xs whitespace-nowrap text-[var(--late)] shadow-[0_0_0_2px_var(--surface)]",
              tall ? "top-3.5" : "top-2.5",
            )}
          >
            ‹ 마감 {formatMonthDot(end)}
          </span>,
        );
      }
    }
    return parts;
  };

  const heightClass = { lg: "h-11", md: "h-9", sm: "h-8" } as const;

  const row = ({
    key,
    height,
    label,
    track,
    value,
    onOpen,
  }: {
    key: string;
    height: keyof typeof heightClass;
    label: ReactNode;
    track?: ReactNode;
    value?: ReactNode;
    onOpen?: () => void;
  }) => (
    <div
      key={key}
      className={cn(
        "relative grid grid-cols-[--spacing(55)_minmax(0,1fr)_--spacing(30)] items-center gap-x-4 rounded-[var(--radius-xs)]",
        heightClass[height],
        onOpen && "transition-colors duration-120 hover:bg-[var(--s2)]",
      )}
    >
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          aria-label="상세 열기"
          className="kit-focus absolute inset-0 cursor-pointer rounded-[inherit]"
        />
      ) : null}
      <span className="flex min-w-0 items-center gap-2">{label}</span>
      <div className={cn("relative", heightClass[height])}>{track}</div>
      <span className="flex items-center justify-end gap-2 text-sm whitespace-nowrap">{value}</span>
    </div>
  );

  const toggle = (key: string) => setFolded((current) => ({ ...current, [key]: !current[key] }));
  const ticks = ticksOf(view, range);
  const gridLines = ticks.filter(
    (tick) => view !== "today" || parseDateKey(tick.key)?.getDay() === 1,
  );
  const taskDot = (task: Task) =>
    task.status === "IN_PROGRESS" ? "bg-[var(--badge-info-dot)]" : "bg-[var(--badge-n-dot)]";

  return (
    <section
      aria-labelledby="project-schedule-title"
      className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-4 lg:rounded-[var(--radius-lg)] lg:p-5"
    >
      {/* 웹 (보드 03) */}
      <div className="max-lg:hidden">
        <div className="mb-3 flex min-h-9 flex-wrap items-center gap-2">
          <h3 id="project-schedule-title" className="text-base font-bold">
            일정
          </h3>
          <span className="text-xs text-[var(--t3)]">{VIEW_TEXT[view](today)}</span>
          <span className="flex-1" />
          <Segmented label="일정 보기" value={view} onChange={setView} items={VIEW_ITEMS} />
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-3.5 text-xs text-[var(--t3)]">
          <span className="inline-flex items-center gap-1.5">
            <i className="h-2 w-5 rounded-full bg-[linear-gradient(90deg,var(--badge-info-dot)_55%,var(--track)_55%)]" />
            진행률 (상태 색)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="size-2 rounded-full border-2 border-[var(--badge-info-dot)]" />
            태스크 마감
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="h-0.5 w-4.5 bg-[var(--late-line)]" />
            마감 지나서 오늘까지
          </span>
          <span className="inline-flex items-center gap-1.5">
            <i className="inline-flex size-3.5 items-center justify-center rounded-full bg-[var(--text)] text-[var(--surface)]">
              <Flag size={8} aria-hidden />
            </i>
            마감 변경 (눌러서 보기)
          </span>
        </div>

        <div className="relative">
          <div className="grid h-6 grid-cols-[--spacing(55)_minmax(0,1fr)_--spacing(30)] gap-x-4">
            <span />
            <div className="relative">
              {ticks.map((tick) =>
                view === "today" && Math.abs(getDayDelta(today, tick.key)) <= 1 ? null : (
                  <span
                    key={tick.key}
                    className="absolute top-1 -translate-x-1/2 text-xs whitespace-nowrap text-[var(--tl-axis)]"
                    style={{ left: `${pct(tick.key)}%` }}
                  >
                    {tick.label}
                  </span>
                ),
              )}
              {inRange(today) ? (
                <span
                  className="absolute top-0.5 z-10 -translate-x-1/2 rounded-[var(--radius-kbd)] bg-[var(--text)] px-1.5 text-xs leading-4.5 whitespace-nowrap text-[var(--surface)]"
                  style={{ left: `${pct(today)}%` }}
                >
                  오늘
                </span>
              ) : null}
            </div>
            <span />
          </div>
          <div aria-hidden className="pointer-events-none absolute top-6 right-34 bottom-0 left-59">
            {gridLines.map((tick) => (
              <span
                key={tick.key}
                className="absolute inset-y-0 w-px bg-[var(--tl-grid)]"
                style={{ left: `${pct(tick.key)}%` }}
              />
            ))}
            {inRange(today) ? (
              <>
                {view === "today" ? (
                  <span
                    className="absolute inset-y-0 w-7 -translate-x-1/2 bg-[var(--tl-today-band)]"
                    style={{ left: `${pct(today)}%` }}
                  />
                ) : null}
                <span
                  className="absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 bg-[var(--text)]"
                  style={{ left: `${pct(today)}%` }}
                />
              </>
            ) : null}
          </div>

          <div className="relative z-[1]">
            {row({
              key: "project",
              height: "lg",
              label: <span className="truncate text-sm font-semibold">전체 진행률</span>,
              track: (
                <>
                  {bar({
                    start: project.startDate,
                    end: project.endDate,
                    progress: project.progress,
                    fillStyle: { background: projectColorVar(project.color) },
                    late: lateDays != null,
                    tall: true,
                  })}
                  {deadlineChanges
                    .filter((change) => inRange(change.changedAt.slice(0, 10)))
                    .map((change) => (
                      <DeadlineFlag
                        key={change.id}
                        change={change}
                        left={pct(change.changedAt.slice(0, 10))}
                      />
                    ))}
                </>
              ),
              value: (
                <>
                  <b className="text-sm">{project.progress}%</b>
                  {lateDays != null ? (
                    <Badge tone="bad" small>
                      {lateDays}일 지연
                    </Badge>
                  ) : remainDays != null ? (
                    <Badge small>{remainDays}일 남음</Badge>
                  ) : null}
                </>
              ),
            })}
            <div className="mt-0.5 mb-1 h-px bg-[var(--divider)]" />
            {openGoals.map((goal) => {
              const stats = statsOf(goal);
              const status = GOAL_STATUS_BADGE[goal.status];
              const children = tasksOf(goal);
              const isFolded = folded[`g${goal.id}`];
              return (
                <div key={goal.id}>
                  {row({
                    key: `g${goal.id}`,
                    height: "md",
                    onOpen: () => setOpenGoalId(goal.id),
                    label: (
                      <>
                        {children.length ? (
                          <button
                            type="button"
                            aria-expanded={!isFolded}
                            aria-label={isFolded ? "태스크 펼치기" : "태스크 접기"}
                            onClick={() => toggle(`g${goal.id}`)}
                            className="kit-focus relative z-10 inline-flex size-3.5 shrink-0 cursor-pointer items-center justify-center text-[var(--t3)]"
                          >
                            {isFolded ? (
                              <ChevronRight size={14} aria-hidden />
                            ) : (
                              <ChevronDown size={14} aria-hidden />
                            )}
                          </button>
                        ) : (
                          <span className="w-3.5 shrink-0" />
                        )}
                        <i
                          aria-hidden
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            badgeDotClassName[status.tone],
                          )}
                        />
                        <span className="truncate text-sm">{goal.title}</span>
                      </>
                    ),
                    track: bar({
                      start: goal.startDate,
                      end: goal.endDate,
                      progress: stats.percent,
                      fillClassName: STATUS_FILL[goal.status],
                      late: stats.lateDays != null,
                      tall: false,
                    }),
                    value:
                      goal.startDate || goal.endDate ? (
                        <>
                          <b className="font-semibold">{stats.percent}%</b>
                          {stats.lateDays != null ? (
                            <span className="font-semibold text-[var(--late)]">
                              {stats.lateDays}일 지남
                            </span>
                          ) : null}
                        </>
                      ) : null,
                  })}
                  {isFolded
                    ? null
                    : children.map((task) => {
                        const late = getTaskLateDays(task, today);
                        return row({
                          key: `t${task.id}`,
                          height: "sm",
                          onOpen: () => setOpenTaskId(task.id),
                          label: (
                            <>
                              <span className="w-9 shrink-0" />
                              <i
                                aria-hidden
                                className={cn("size-1.5 shrink-0 rounded-full", taskDot(task))}
                              />
                              <span className="truncate text-sm text-[var(--t2)]">
                                {task.title}
                              </span>
                            </>
                          ),
                          track:
                            late != null ? (
                              bar({
                                start: "",
                                end: task.dueDate,
                                progress: 0,
                                late: true,
                                tall: false,
                              })
                            ) : inRange(task.dueDate) ? (
                              <i
                                className="absolute top-3 size-2 -translate-x-1/2 rounded-full border-2 border-[var(--badge-info-dot)] bg-[var(--surface)]"
                                style={{ left: `${pct(task.dueDate)}%` }}
                              />
                            ) : null,
                          value:
                            late != null ? (
                              <span className="font-medium text-[var(--late)]">{late}일 지남</span>
                            ) : null,
                        });
                      })}
                </div>
              );
            })}
            {doneGoals.length ? (
              <>
                <button
                  type="button"
                  aria-expanded={!folded.done}
                  onClick={() => toggle("done")}
                  className="kit-focus mt-2 flex h-9 w-full cursor-pointer items-center gap-2 border-t border-[var(--divider)] text-sm"
                >
                  {folded.done ? (
                    <ChevronRight size={14} aria-hidden />
                  ) : (
                    <ChevronDown size={14} aria-hidden />
                  )}
                  <i aria-hidden className="size-2 rounded-full bg-[var(--badge-ok-dot)]" />
                  완료 <span className="text-[var(--t3)]">{doneGoals.length}</span>
                </button>
                {folded.done
                  ? null
                  : doneGoals.map((goal) =>
                      row({
                        key: `d${goal.id}`,
                        height: "md",
                        onOpen: () => setOpenGoalId(goal.id),
                        label: (
                          <>
                            <span className="w-7.5 shrink-0" />
                            <span className="truncate text-sm text-[var(--t3)]">{goal.title}</span>
                          </>
                        ),
                        track: bar({
                          start: goal.startDate,
                          end: goal.endDate,
                          progress: 100,
                          fillClassName: "bg-[var(--badge-n-dot)]",
                          late: false,
                          tall: false,
                        }),
                        value: goal.endDate ? (
                          <span className="font-medium text-[var(--t3)]">
                            {formatMonthDot(goal.endDate)} 완료
                          </span>
                        ) : null,
                      }),
                    )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* 태블릿 · 모바일 목록형 (보드 T · M 03) */}
      <div className="flex flex-col gap-3 lg:hidden">
        <div className="flex items-center">
          <strong className="flex-1 text-base">일정</strong>
          <span className="text-xs text-[var(--t3)]">오늘 {formatMonthDot(today)}</span>
        </div>
        <Segmented label="일정 보기" value={view} onChange={setView} items={VIEW_ITEMS} fill />
        <CompactItem
          title={<strong className="text-sm">전체 진행률</strong>}
          percent={project.progress}
          fillStyle={{ background: projectColorVar(project.color) }}
          meta={
            <>
              {formatMonthDot(project.startDate)} ~ {formatMonthDot(project.endDate)}
              {lateDays != null ? (
                <b className="font-semibold text-[var(--late)]"> · {lateDays}일 지연</b>
              ) : null}
            </>
          }
          aside={
            deadlineChanges.length ? (
              <Button variant="ghost" size="xs" href={historyHref}>
                <Flag size={12} aria-hidden />
                마감 변경 {deadlineChanges.length}
              </Button>
            ) : null
          }
        />
        {openGoals.map((goal) => {
          const stats = statsOf(goal);
          const status = GOAL_STATUS_BADGE[goal.status];
          return (
            <div
              key={goal.id}
              className="flex flex-col gap-1.5 border-t border-[var(--divider)] pt-3"
            >
              <CompactItem
                onOpen={() => setOpenGoalId(goal.id)}
                title={
                  <span className="flex min-w-0 items-center gap-2 text-sm">
                    <i
                      aria-hidden
                      className={cn("size-2 shrink-0 rounded-full", badgeDotClassName[status.tone])}
                    />
                    <span className="truncate">{goal.title}</span>
                  </span>
                }
                percent={stats.percent}
                fillClassName={STATUS_FILL[goal.status]}
                meta={
                  goal.endDate ? (
                    <>
                      ~ {formatMonthDot(goal.endDate)}
                      {stats.lateDays != null ? (
                        <b className="font-semibold text-[var(--late)]">
                          {" "}
                          · {stats.lateDays}일 지남
                        </b>
                      ) : null}
                    </>
                  ) : null
                }
              />
              {tasksOf(goal).map((task) => {
                const late = getTaskLateDays(task, today);
                return (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => setOpenTaskId(task.id)}
                    className="kit-focus flex h-7 cursor-pointer items-center gap-2 pl-4 text-left text-sm"
                  >
                    <i
                      aria-hidden
                      className={cn("size-1.5 shrink-0 rounded-full", taskDot(task))}
                    />
                    <span className="min-w-0 flex-1 truncate">{task.title}</span>
                    {late != null ? (
                      <span className="text-xs text-[var(--late)]">{late}일 지남</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          );
        })}
        {doneGoals.length ? (
          <div className="flex flex-col gap-1 border-t border-[var(--divider)] pt-3">
            <span className="flex items-center gap-2 text-sm">
              <i aria-hidden className="size-2 rounded-full bg-[var(--badge-ok-dot)]" />
              완료 <span className="text-[var(--t3)]">{doneGoals.length}</span>
            </span>
            {doneGoals.map((goal) => (
              <button
                key={goal.id}
                type="button"
                onClick={() => setOpenGoalId(goal.id)}
                className="kit-focus flex h-8 cursor-pointer items-center pl-4 text-left text-sm text-[var(--t3)]"
              >
                <span className="min-w-0 flex-1 truncate">{goal.title}</span>
                {goal.endDate ? (
                  <span className="text-xs">{formatMonthDot(goal.endDate)} 완료</span>
                ) : null}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <GoalDetailDrawer
        goal={goals.find((goal) => goal.id === openGoalId) ?? null}
        tasks={tasks}
        onClose={() => setOpenGoalId(null)}
      />
      <TaskDetailDrawer
        task={tasks.find((task) => task.id === openTaskId) ?? null}
        projectName={project.name}
        goals={goals}
        onClose={() => setOpenTaskId(null)}
        onToggleDone={() => setOpenTaskId(null)}
        onDelete={() => setOpenTaskId(null)}
      />
    </section>
  );
}

/** 마감 변경 깃발 (DOC2 06): 막대보다 6 큰 원 · 올리거나 초점 · 누르면 아래 툴팁 */
function DeadlineFlag({ change, left }: { change: ProjectDeadlineChange; left: number }) {
  const [isOpen, setIsOpen] = useState(false);
  const days = getDayDelta(change.previousEndDate, change.nextEndDate);
  return (
    <span className="group absolute top-3.5 z-20 -translate-x-1/2" style={{ left: `${left}%` }}>
      <button
        type="button"
        aria-label={`마감 변경 ${formatMonthDot(change.changedAt.slice(0, 10))}`}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        onBlur={() => setIsOpen(false)}
        className="kit-focus inline-flex size-3.5 cursor-pointer items-center justify-center rounded-full bg-[var(--text)] text-[var(--surface)]"
      >
        <Flag size={8} aria-hidden />
      </button>
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-[calc(100%+6px)] left-1/2 flex -translate-x-1/2 flex-col rounded-[var(--radius-xs)] bg-[var(--tip-bg)] px-2 py-1 text-xs whitespace-nowrap text-[var(--tip-fg)] opacity-0 transition-opacity duration-120 group-focus-within:opacity-100 group-hover:opacity-100",
          isOpen && "opacity-100",
        )}
      >
        <span>마감 변경 · {formatMonthDot(change.changedAt.slice(0, 10))}</span>
        <span>
          {formatMonthDot(change.previousEndDate)} → {formatMonthDot(change.nextEndDate)} (
          {days >= 0 ? "+" : ""}
          {days}일)
        </span>
        {change.reason ? <span>{change.reason}</span> : null}
      </span>
    </span>
  );
}

function CompactItem({
  title,
  percent,
  fillClassName,
  fillStyle,
  meta,
  aside,
  onOpen,
}: {
  title: ReactNode;
  percent: number;
  fillClassName?: string;
  fillStyle?: CSSProperties;
  meta?: ReactNode;
  aside?: ReactNode;
  onOpen?: () => void;
}) {
  const body = (
    <>
      <span className="flex items-center gap-2">
        <span className="min-w-0 flex-1">{title}</span>
        <b className="text-sm">{percent}%</b>
        {onOpen ? <ChevronRight size={14} aria-hidden className="text-[var(--t3)]" /> : null}
      </span>
      <span className="block h-2 overflow-hidden rounded-full bg-[var(--track)]">
        <i
          className={cn("block h-full rounded-full", fillClassName)}
          style={{ ...fillStyle, width: `${percent}%` }}
        />
      </span>
    </>
  );
  return (
    <div className="flex flex-col gap-1.5">
      {onOpen ? (
        <button
          type="button"
          onClick={onOpen}
          className="kit-focus flex cursor-pointer flex-col gap-1.5 text-left"
        >
          {body}
        </button>
      ) : (
        body
      )}
      {meta || aside ? (
        <span className="flex items-center text-xs text-[var(--t3)]">
          <span className="flex-1">{meta}</span>
          {aside}
        </span>
      ) : null}
    </div>
  );
}
