import { getDayDelta } from "@/lib/date";

import type { Goal, GoalStatus } from "@/features/goals/types/goal";
import type { Task } from "@/features/tasks/types/task";

export type GoalStatusFilter = "all" | GoalStatus;
export type GoalSort = "due" | "name" | "updated";

export const GOAL_SORT_LABEL: Record<GoalSort, string> = {
  due: "마감일순",
  name: "이름순",
  updated: "최근 수정순",
};

export type GoalStats = {
  /** 묶인 태스크 수 */
  total: number;
  done: number;
  /** 0–100. 완료한 목표는 100 */
  percent: number;
  /** 지연 일수. 지연이 아니면 null */
  lateDays: number | null;
};

/**
 * 목표의 태스크 진행률 · 지연을 계산한다 (프로토타입 gstat).
 *
 * @param today - `YYYY-MM-DD`
 */
export function getGoalStats(goal: Goal, tasks: Task[], today: string): GoalStats {
  const own = tasks.filter((task) => task.goalId === goal.id);
  const done = own.filter((task) => task.status === "DONE").length;
  const isDone = goal.status === "COMPLETED";

  return {
    total: own.length,
    done,
    percent: isDone ? 100 : own.length ? Math.round((done / own.length) * 100) : 0,
    lateDays:
      !isDone && goal.endDate && goal.endDate < today ? getDayDelta(goal.endDate, today) : null,
  };
}

/**
 * 상태 · 태그로 거르고 정렬한다 (프로토타입 goalsBlock). 마감 없는 목표는 마감일순에서 뒤.
 *
 * @param tags - 하나라도 겹치면 남긴다. 비면 거르지 않는다
 */
export function selectGoals(
  goals: Goal[],
  { status, tags, sort }: { status: GoalStatusFilter; tags: string[]; sort: GoalSort },
) {
  return goals
    .filter((goal) => status === "all" || goal.status === status)
    .filter((goal) => tags.length === 0 || goal.tags.some((tag) => tags.includes(tag)))
    .sort((a, b) => {
      if (sort === "name") {
        return a.title.localeCompare(b.title, "ko");
      }

      if (sort === "updated") {
        return b.updatedAt.localeCompare(a.updatedAt);
      }

      return (a.endDate || "9").localeCompare(b.endDate || "9");
    });
}
