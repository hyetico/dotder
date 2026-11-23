import { getProjectStatusColorScale } from "@/features/projects/constants/projectStatusColors";

import type { Goal, GoalStatus } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";

export type GoalVisualStatus = GoalStatus | "DELAYED";

export function getGoalStatusLabel(status: GoalVisualStatus) {
  switch (status) {
    case "NOT_STARTED":
      return "미시작";

    case "IN_PROGRESS":
      return "진행 중";

    case "COMPLETED":
      return "완료";

    case "DELAYED":
      return "지연";

    default:
      return status;
  }
}

export function isGoalDelayed(goal: Pick<Goal, "status">, projectDelayed = false) {
  if (goal.status === "COMPLETED") {
    return false;
  }

  return projectDelayed;
}

export function getGoalVisualStatus(status: GoalStatus, delayed = false): GoalVisualStatus {
  if (delayed && status !== "COMPLETED") {
    return "DELAYED";
  }

  return status;
}

export function getGoalStatusColorKey(status: GoalStatus): Project["status"] {
  switch (status) {
    case "NOT_STARTED":
      return "PLANNED";

    case "IN_PROGRESS":
      return "IN_PROGRESS";

    case "COMPLETED":
      return "DONE";

    default:
      return "PLANNED";
  }
}

export function getGoalStatusMetricColors(
  status: GoalStatus,
  options?: {
    delayed?: boolean;
  },
) {
  return getProjectStatusColorScale(getGoalStatusColorKey(status), options);
}

export function getGoalStatusMarkColor(status: GoalStatus, delayed = false) {
  return getGoalStatusMetricColors(status, { delayed }).progress;
}

export type GoalScheduleTone = "delayed" | "done" | "remaining";

export type GoalScheduleMark = {
  tone: GoalScheduleTone;
  label: string;
  description: string;
};

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseGoalDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function getGoalScheduleMark(
  goal: Pick<Goal, "endDate" | "status">,
  today: Date = new Date(),
): GoalScheduleMark {
  const end = parseGoalDay(goal.endDate);
  const current = startOfLocalDay(today);
  const daysAfterEnd = Math.round((current.getTime() - end.getTime()) / 86_400_000);

  if (goal.status === "COMPLETED") {
    const days = Math.abs(daysAfterEnd);

    if (daysAfterEnd > 0) {
      return {
        tone: "done",
        label: `+${days}일`,
        description: `마감 후 ${days}일`,
      };
    }

    if (daysAfterEnd < 0) {
      return {
        tone: "done",
        label: `+${days}일`,
        description: `여유 ${days}일`,
      };
    }

    return {
      tone: "done",
      label: "+0일",
      description: "마감 당일 완료",
    };
  }

  if (daysAfterEnd > 0) {
    return {
      tone: "delayed",
      label: `+${daysAfterEnd}일`,
      description: `${daysAfterEnd}일 지연`,
    };
  }

  if (daysAfterEnd < 0) {
    const days = Math.abs(daysAfterEnd);

    return {
      tone: "remaining",
      label: `-${days}일`,
      description: `마감까지 ${days}일`,
    };
  }

  return {
    tone: "remaining",
    label: "D-Day",
    description: "마감 당일",
  };
}

export function getGoalStatusStyles(status: GoalVisualStatus) {
  switch (status) {
    case "NOT_STARTED":
      return {
        badge: "bg-slate-100 text-[var(--color-text-muted)]",
        dot: "bg-slate-400",
        bar: "bg-slate-400",
      };

    case "IN_PROGRESS":
      return {
        badge: "bg-blue-50 text-blue-600",
        dot: "bg-blue-600",
        bar: "bg-blue-600",
      };

    case "COMPLETED":
      return {
        badge: "bg-green-50 text-green-600",
        dot: "bg-green-600",
        bar: "bg-green-600",
      };

    case "DELAYED":
      return {
        badge: "bg-red-50 text-red-600",
        dot: "bg-red-500",
        bar: "bg-red-500",
      };

    default:
      return {
        badge: "bg-gray-100 text-[var(--color-text-secondary)]",
        dot: "bg-gray-400",
        bar: "bg-gray-300",
      };
  }
}

/**
 * getGoalDayOffset
 *
 * 기준 날짜가 목표 날짜보다 며칠 뒤인지 계산합니다.
 * 음수면 아직 그 날짜 전입니다.
 *
 * @param value - 비교할 목표 날짜
 * @param today - 기준 날짜
 * @returns 지난 일수
 */
export function getGoalDayOffset(value: string, today: Date = new Date()) {
  return Math.round(
    (startOfLocalDay(today).getTime() - parseGoalDay(value).getTime()) / 86_400_000,
  );
}

/**
 * getGoalSpanDays
 *
 * 시작일과 마감일을 모두 포함한 목표 기간입니다.
 *
 * @param startDate - 시작일
 * @param endDate - 마감일
 * @returns 1일 이상의 기간
 */
export function getGoalSpanDays(startDate: string, endDate: string) {
  const days = getGoalDayOffset(startDate, parseGoalDay(endDate)) + 1;

  return Math.max(days, 1);
}

/**
 * getGoalElapsedDays
 *
 * 시작일부터 오늘, 또는 마감일 중 더 이른 날까지 지난 일수입니다.
 *
 * @param startDate - 시작일
 * @param endDate - 마감일
 * @param today - 기준 날짜
 * @returns 0 이상의 경과 일수
 */
export function getGoalElapsedDays(startDate: string, endDate: string, today: Date = new Date()) {
  const afterStart = getGoalDayOffset(startDate, today);

  if (afterStart < 0) {
    return 0;
  }

  return Math.min(getGoalSpanDays(startDate, endDate), afterStart + 1);
}

export function computeProjectGoalStats(projectId: number, goals: Goal[]) {
  const projectGoals = goals.filter((goal) => goal.projectId === projectId);

  const totalGoals = projectGoals.length;

  const completedGoals = projectGoals.filter((goal) => goal.status === "COMPLETED").length;

  return {
    completedGoals,
    totalGoals,
  };
}
