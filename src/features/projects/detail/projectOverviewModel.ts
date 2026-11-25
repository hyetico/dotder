import { getDayDelta, parseDateKey, toDateKey } from "@/lib/date";

import type { BadgeTone } from "@/components/kit/Badge";
import type { Goal, GoalStatus } from "@/features/goals/types/goal";
import type { ActivityDay } from "@/features/projects/utils/activityMosaic";
import type { Task } from "@/features/tasks/types/task";

/** 일정 카드 보기 단위 (보드 03 「주 · 월 · 전체」) */
export type TimelineScale = "week" | "month" | "all";

export type TimelineRange = { from: string; to: string };

/** 목표 상태 배지 (보드 03 일정 줄 · 04 목표 목록) */
export const GOAL_STATUS_BADGE: Record<GoalStatus, { label: string; tone: BadgeTone }> = {
  NOT_STARTED: { label: "계획", tone: "n" },
  IN_PROGRESS: { label: "진행 중", tone: "info" },
  COMPLETED: { label: "완료", tone: "ok" },
};

const addDays = (key: string, days: number) => {
  const date = parseDateKey(key) ?? new Date();
  date.setDate(date.getDate() + days);
  return toDateKey(date);
};

const monthStart = (key: string, offset = 0) => {
  const date = parseDateKey(key) ?? new Date();
  return toDateKey(new Date(date.getFullYear(), date.getMonth() + offset, 1));
};

const monthEnd = (key: string) => {
  const date = parseDateKey(key) ?? new Date();
  return toDateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0));
};

/** 그 주 일요일 (월요일 시작 주) */
const weekEnd = (key: string) => {
  const date = parseDateKey(key) ?? new Date();
  const day = (date.getDay() + 6) % 7;
  return addDays(key, 6 - day);
};

/**
 * 일정 카드가 보여 줄 기간을 정한다 (프로토타입 ovTab).
 *
 * - 전체: 시작일이 있는 달 1일 ~ 마감일과 오늘 중 늦은 날이 있는 달 끝
 * - 월: 기준일이 있는 달과 그 앞 달 (두 달)
 * - 주: 기준일이 있는 주까지 3주 (월요일 시작)
 *
 * @param focus - 주 · 월의 기준일 `YYYY-MM-DD`. 처음은 마감일, 「오늘로」는 오늘
 */
export function getTimelineRange(
  scale: TimelineScale,
  project: { startDate: string; endDate: string },
  today: string,
  focus: string,
): TimelineRange {
  if (scale === "week") {
    const to = weekEnd(focus);
    return { from: addDays(to, -20), to };
  }

  if (scale === "month") {
    return { from: monthStart(focus, -1), to: monthEnd(focus) };
  }

  const first = project.startDate || project.endDate || today;
  const last = [project.endDate, today].filter(Boolean).sort().at(-1) ?? today;

  return { from: monthStart(first < today ? first : today), to: monthEnd(last) };
}

/**
 * 날짜가 기간 안 어디쯤인지 0–100(%)으로 바꾼다. 기간 밖은 끝에 붙인다.
 *
 * @example
 * getTimelinePercent("2026-09-01", { from: "2026-08-01", to: "2026-11-30" }) // 25.6…
 */
export function getTimelinePercent(date: string, range: TimelineRange) {
  const total = getDayDelta(range.from, range.to);

  if (total <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (getDayDelta(range.from, date) / total) * 100));
}

/** 기간 안 달마다 첫날 (보드 03 「8월 · 9월 …」 · 달 선) */
export function getTimelineMonths(range: TimelineRange) {
  const months: { key: string; label: string }[] = [];
  let cursor = range.from;

  while (cursor <= range.to) {
    const date = parseDateKey(cursor) ?? new Date();
    months.push({ key: cursor, label: `${date.getMonth() + 1}월` });
    cursor = monthStart(cursor, 1);
  }

  return months;
}

/** 기간 첫날부터 7일마다 (보드 03 주 선) */
export function getTimelineWeeks(range: TimelineRange) {
  const weeks: string[] = [];

  for (let cursor = range.from; cursor <= range.to; cursor = addDays(cursor, 7)) {
    weeks.push(cursor);
  }

  return weeks;
}

/**
 * 하루 한 일 수를 막대 높이로 바꾼다 (보드 03 활동 줄 · 4 ~ 21px).
 *
 * @param count - 그날 기록 수 (9는 「9개 이상」)
 */
export function getActivityBarHeight(count: number) {
  return Math.min(count, 9) * 2 + 3;
}

/** 기간 안에서 기록이 있는 날 */
export function getActivityInRange(activity: ActivityDay[], range: TimelineRange) {
  return activity.filter((day) => day.count > 0 && day.date >= range.from && day.date <= range.to);
}

/**
 * 태스크 지연 일수. 끝나지 않았고 마감이 지났을 때만.
 *
 * @param today - `YYYY-MM-DD`
 * @returns 지난 일수. 지연이 아니면 null
 */
export function getTaskLateDays(task: Pick<Task, "status" | "dueDate">, today: string) {
  if (task.status === "DONE" || !task.dueDate || task.dueDate >= today) {
    return null;
  }

  return getDayDelta(task.dueDate, today);
}

/**
 * 목표 지연 일수. 끝나지 않았고 마감이 지났을 때만.
 *
 * @param today - `YYYY-MM-DD`
 * @returns 지난 일수. 지연이 아니면 null
 */
export function getGoalLateDays(goal: Pick<Goal, "status" | "endDate">, today: string) {
  if (goal.status === "COMPLETED" || !goal.endDate || goal.endDate >= today) {
    return null;
  }

  return getDayDelta(goal.endDate, today);
}

/**
 * 「다음에 할 일」 (보드 03). 끝나지 않은 태스크를 마감이 빠른(지난) 순으로, 마감 없는 것은 뒤.
 *
 * @param limit - 보여 줄 개수. 웹 3 · 태블릿 · 모바일 2
 */
export function getNextTasks(tasks: Task[], limit: number) {
  return tasks
    .filter((task) => task.status !== "DONE")
    .sort((a, b) => (a.dueDate || "9").localeCompare(b.dueDate || "9") || a.order - b.order)
    .slice(0, limit);
}

/** `MM.DD` (보드 03 「08.01 시작」) */
export function formatMonthDot(value: string) {
  return value ? value.slice(5).replace("-", ".") : "";
}
