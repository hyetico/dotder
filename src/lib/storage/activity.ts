import { parseDateKey, toDateKey } from "@/lib/date";
import { readMode } from "@/lib/storage/dotderMode";

import type { ActivityDay } from "@/features/projects/utils/activityMosaic";

/**
 * 활동 표시 하나. 그날 그 프로젝트에서 한 항목에 한 동작을 했다는 뜻이다.
 * `key`는 `대상:id:동작` (예: `task:12:done`). 같은 프로젝트 · 날짜 · key는 하나로 본다.
 */
export type ActivityMark = { projectId: number; date: string; key: string };

export type ActivityTarget = "project" | "goal" | "task" | "memo";
export type ActivityAction = "create" | "edit" | "done" | "delete";

/** 저장할 때 남기는 기간. 오늘에서 이 일수보다 오래된 표시는 지운다 (26주) */
export const ACTIVITY_KEEP_DAYS = 182;

/** 지금 메모리에 있는 내 기록 활동 표시. dotderData가 불러오고 저장한다 */
export const activityMarks: ActivityMark[] = [];

type RecordActivityInput = {
  /** 활동이 쌓일 프로젝트. null이면(프로젝트 없는 메모 등) 남기지 않는다 */
  projectId: number | null | undefined;
  target: ActivityTarget;
  id: number;
  action: ActivityAction;
  /** 기준 시각. 테스트할 때만 넘긴다 */
  at?: Date;
};

/**
 * 저장 동작 한 번을 활동 표시로 남긴다. 저장은 부른 api 함수의 `saveData()`가 한다.
 *
 * 내 기록 모드에서만 남긴다 (예시 모드 활동은 내 기록에 들어오지 않는다).
 * 같은 프로젝트 · 같은 날 · 같은 항목 · 같은 동작은 하루 1회만 센다.
 *
 * @example
 * recordActivity({ projectId: 3, target: "task", id: 12, action: "done" });
 */
export function recordActivity({ projectId, target, id, action, at }: RecordActivityInput) {
  if (projectId == null || readMode() !== "mine") {
    return;
  }

  const mark: ActivityMark = {
    projectId,
    date: toDateKey(at ?? new Date()),
    key: `${target}:${id}:${action}`,
  };

  if (!activityMarks.some((item) => isSameMark(item, mark))) {
    activityMarks.push(mark);
  }
}

/**
 * 오늘 남긴 활동 표시 하나를 지운다 (삭제 되돌리기). 되돌린 삭제는 활동으로 세지 않는다.
 *
 * 내 기록 모드에서만 지운다. 표시가 없으면 아무것도 하지 않는다.
 *
 * @example
 * forgetActivity({ projectId: 3, target: "task", id: 12, action: "delete" });
 */
export function forgetActivity({ projectId, target, id, action, at }: RecordActivityInput) {
  if (projectId == null || readMode() !== "mine") {
    return;
  }

  const mark: ActivityMark = {
    projectId,
    date: toDateKey(at ?? new Date()),
    key: `${target}:${id}:${action}`,
  };
  const index = activityMarks.findIndex((item) => isSameMark(item, mark));

  if (index >= 0) {
    activityMarks.splice(index, 1);
  }
}

/**
 * 활동 표시를 프로젝트별 날짜별 수로 센다 (활동 모자이크).
 *
 * @returns 프로젝트 id → 표시가 있는 날 목록. 표시가 없는 프로젝트는 빠진다
 *
 * @example
 * countActivity([{ projectId: 1, date: "2026-11-27", key: "project:1:create" }])
 * // { 1: [{ date: "2026-11-27", count: 1 }] }
 */
export function countActivity(marks: readonly ActivityMark[]): Record<number, ActivityDay[]> {
  const byProject = new Map<number, Map<string, number>>();

  for (const mark of marks) {
    const days = byProject.get(mark.projectId) ?? new Map<string, number>();
    days.set(mark.date, (days.get(mark.date) ?? 0) + 1);
    byProject.set(mark.projectId, days);
  }

  return Object.fromEntries(
    [...byProject].map(([projectId, days]) => [
      projectId,
      [...days].map(([date, count]) => ({ date, count })),
    ]),
  );
}

/**
 * 오늘에서 `ACTIVITY_KEEP_DAYS`일보다 오래된 표시를 뺀 목록 (저장할 때).
 *
 * @param today - 기준 날짜. 테스트할 때만 넘긴다
 */
export function keepRecentActivity(marks: readonly ActivityMark[], today = new Date()) {
  const from = toDateKey(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - ACTIVITY_KEEP_DAYS),
  );

  return marks.filter((mark) => parseDateKey(mark.date) != null && mark.date >= from);
}

/**
 * 프로젝트의 활동 표시를 모두 지운다 (프로젝트 삭제).
 *
 * @returns 지운 표시. 되돌리기 때 `restoreActivity`에 넘긴다
 */
export function removeProjectActivity(projectId: number): ActivityMark[] {
  const removed = activityMarks.filter((mark) => mark.projectId === projectId);
  const kept = activityMarks.filter((mark) => mark.projectId !== projectId);

  activityMarks.splice(0, activityMarks.length, ...kept);

  return removed;
}

/** 지운 활동 표시를 되돌린다 (프로젝트 삭제 되돌리기). 이미 있는 것은 겹치지 않게 넣는다. */
export function restoreActivity(marks: readonly ActivityMark[]) {
  for (const mark of marks) {
    if (!activityMarks.some((item) => isSameMark(item, mark))) {
      activityMarks.push(mark);
    }
  }
}

function isSameMark(a: ActivityMark, b: ActivityMark) {
  return a.projectId === b.projectId && a.date === b.date && a.key === b.key;
}
