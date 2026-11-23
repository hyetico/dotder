import { computeProjectGoalStats } from "@/features/goals/utils/goalUtils";
import { getProjectTeamLabel } from "@/features/projects/utils/projectTeam";

import { getUserName } from "@/lib/mock/users";

import type { Goal } from "@/features/goals/types/goal";
import type { ProjectStatusColorKey } from "@/features/projects/constants/projectStatusColors";
import type {
  Project,
  ProjectDeadlineChange,
  ProjectListItem,
  ProjectStatus,
} from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

export function getProjectVisualStatus(
  status: ProjectStatus,
  delayed = false,
): ProjectStatusColorKey {
  if (delayed && status === "IN_PROGRESS") {
    return "DELAYED";
  }

  return status;
}

export const holdAddNoticeMessage =
  "목표, 태스크를 추가할 수 없습니다. 프로젝트 상태를 변경해주세요.";

/**
 * canAddProjectItems
 *
 * 보류 중인 프로젝트에는 목표와 태스크를 추가할 수 없는지 확인합니다.
 *
 * @param status - 프로젝트 상태. 프로젝트가 없으면 추가할 수 있습니다.
 * @returns 추가할 수 있으면 true
 */
export function canAddProjectItems(status?: ProjectStatus | null) {
  return status !== "ON_HOLD";
}

export function getProjectStatusLabel(status: ProjectStatusColorKey) {
  switch (status) {
    case "PLANNED":
      return "계획";

    case "IN_PROGRESS":
      return "진행 중";

    case "ON_HOLD":
      return "보류";

    case "DONE":
      return "완료";

    case "DELAYED":
      return "지연";

    default:
      return status;
  }
}

export function getProjectStatusStyles(status: ProjectStatusColorKey) {
  switch (status) {
    case "PLANNED":
      return {
        badge:
          "bg-[linear-gradient(135deg,#f7f7f5_0%,#e2e8f0_52%,#cbd5e1_100%)] text-[var(--color-text-secondary)]",
        text: "text-[var(--color-text-muted)]",
        dot: "bg-slate-400",
        bar: "bg-slate-400",
      };

    case "IN_PROGRESS":
      return {
        badge: "bg-[linear-gradient(135deg,#eff6ff_0%,#bfdbfe_52%,#93c5fd_100%)] text-blue-700",
        text: "text-blue-600",
        dot: "bg-blue-600",
        bar: "bg-blue-600",
      };

    case "ON_HOLD":
      return {
        badge: "bg-[linear-gradient(135deg,#fffbeb_0%,#fde68a_52%,#fcd34d_100%)] text-amber-800",
        text: "text-amber-600",
        dot: "bg-amber-600",
        bar: "bg-amber-600",
      };

    case "DONE":
      return {
        badge: "bg-[linear-gradient(135deg,#ecfdf5_0%,#a7f3d0_52%,#6ee7b7_100%)] text-emerald-800",
        text: "text-green-600",
        dot: "bg-green-600",
        bar: "bg-green-600",
      };

    case "DELAYED":
      return {
        badge: "bg-[linear-gradient(135deg,#fef2f2_0%,#fecaca_52%,#fca5a5_100%)] text-red-700",
        text: "text-red-600",
        dot: "bg-red-500",
        bar: "bg-red-500",
      };

    default:
      return {
        badge:
          "bg-[linear-gradient(135deg,#f7f7f5_0%,#e5e7eb_52%,#d1d5db_100%)] text-[var(--color-text)]",
        text: "text-[var(--color-text-secondary)]",
        dot: "bg-gray-400",
        bar: "bg-gray-400",
      };
  }
}

export function isProjectDelayed(
  project: Pick<Project, "endDate" | "status">,
  today: Date = new Date(),
) {
  if (project.status !== "IN_PROGRESS") {
    return false;
  }

  return getProjectScheduleMark(project, today)?.tone === "delayed";
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseProjectDay(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

export function getProjectDaysAfterEnd(endDate: string, today: Date = new Date()) {
  const end = parseProjectDay(endDate);
  const current = startOfLocalDay(today);

  return Math.round((current.getTime() - end.getTime()) / 86_400_000);
}

export type ProjectScheduleMark = {
  tone: "delayed" | "done" | "remaining";
  days: number;
  label: string;
  description: string;
};

export function getProjectScheduleMark(
  project: Pick<Project, "endDate" | "status">,
  today: Date = new Date(),
): ProjectScheduleMark | null {
  const daysAfterEnd = getProjectDaysAfterEnd(project.endDate, today);

  if (project.status === "DONE") {
    const days = Math.abs(daysAfterEnd);

    if (daysAfterEnd > 0) {
      return {
        tone: "done",
        days,
        label: `+${days}일`,
        description: `마감 후 ${days}일`,
      };
    }

    if (daysAfterEnd < 0) {
      return {
        tone: "done",
        days,
        label: `+${days}일`,
        description: `여유 ${days}일`,
      };
    }

    return {
      tone: "done",
      days: 0,
      label: "+0일",
      description: "마감 당일 완료",
    };
  }

  if (daysAfterEnd > 0) {
    return {
      tone: "delayed",
      days: daysAfterEnd,
      label: `+${daysAfterEnd}일`,
      description: `${daysAfterEnd}일 지연`,
    };
  }

  if (project.status === "IN_PROGRESS" && daysAfterEnd < 0) {
    const days = Math.abs(daysAfterEnd);

    return {
      tone: "remaining",
      days,
      label: `-${days}일`,
      description: `마감까지 ${days}일`,
    };
  }

  if (project.status === "IN_PROGRESS" && daysAfterEnd === 0) {
    return {
      tone: "remaining",
      days: 0,
      label: "D-Day",
      description: "마감 당일",
    };
  }

  return null;
}

export function resolveProjectProgress(status: ProjectStatus, calculatedProgress: number) {
  switch (status) {
    case "PLANNED":
      return 0;

    case "DONE":
      return 100;

    case "IN_PROGRESS":
    case "ON_HOLD":
    default:
      return calculatedProgress;
  }
}

export function formatProjectDate(value: string) {
  return value.replace(/-/g, ".");
}

export function formatProjectDateRange(startDate: string, endDate: string) {
  return `${formatProjectDate(startDate)} ~ ${formatProjectDate(endDate)}`;
}

export function getProjectDayDelta(fromDate: string, toDate: string) {
  const from = parseProjectDay(fromDate);
  const to = parseProjectDay(toDate);

  return Math.round((to.getTime() - from.getTime()) / 86_400_000);
}

export function formatSignedProjectDays(days: number) {
  if (days > 0) {
    return `+${days}일`;
  }

  return `${days}일`;
}

export function formatProjectRelativeTime(value: string, today: Date = new Date()) {
  const changedAt = new Date(value);

  const elapsed = today.getTime() - changedAt.getTime();

  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (Number.isNaN(changedAt.getTime()) || elapsed < minute) {
    return "방금 전";
  }

  if (elapsed < hour) {
    return `${Math.floor(elapsed / minute)}분 전`;
  }

  if (elapsed < day) {
    return `${Math.floor(elapsed / hour)}시간 전`;
  }

  const days = Math.floor(elapsed / day);

  if (days < 30) {
    return `${days}일 전`;
  }

  return formatProjectDate(value.slice(0, 10));
}

export type ProjectDeadlineHistorySummary = {
  changeCount: number;
  totalExtendedDays: number;
  slipFromOriginalDays: number;
  originalEndDate: string;
};

export function summarizeProjectDeadlineChanges(
  changes: ProjectDeadlineChange[],
  currentEndDate: string,
): ProjectDeadlineHistorySummary {
  const ordered = [...changes].sort((left, right) => {
    if (left.changedAt < right.changedAt) {
      return -1;
    }

    if (left.changedAt > right.changedAt) {
      return 1;
    }

    return left.id - right.id;
  });

  const originalEndDate = ordered[0]?.previousEndDate ?? currentEndDate;

  const totalExtendedDays = ordered.reduce((sum, change) => {
    const delta = getProjectDayDelta(change.previousEndDate, change.nextEndDate);

    return delta > 0 ? sum + delta : sum;
  }, 0);

  return {
    changeCount: ordered.length,
    totalExtendedDays,
    slipFromOriginalDays: getProjectDayDelta(originalEndDate, currentEndDate),
    originalEndDate,
  };
}

export function getProjectSpanDays(startDate: string, endDate: string) {
  const start = parseProjectDay(startDate);
  const end = parseProjectDay(endDate);

  const days = Math.round((end.getTime() - start.getTime()) / 86_400_000);

  return Math.max(days + 1, 1);
}

export type ProjectDeadlineTone = "remaining" | "today" | "overdue" | "done";

export type ProjectScheduleSnapshot = {
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
  overdueDays: number;
  progress: number;
  tone: ProjectDeadlineTone;
  value: string;
  caption: string;
  started: boolean;
};

export function getProjectScheduleSnapshot(
  project: Pick<Project, "startDate" | "endDate" | "status">,
  today: Date = new Date(),
): ProjectScheduleSnapshot {
  const totalDays = getProjectSpanDays(project.startDate, project.endDate);

  const daysAfterStart = getProjectDaysAfterEnd(project.startDate, today);

  const daysAfterEnd = getProjectDaysAfterEnd(project.endDate, today);

  const elapsedDays = daysAfterStart < 0 ? 0 : Math.min(totalDays, daysAfterStart + 1);

  const remainingDays = daysAfterEnd < 0 ? Math.abs(daysAfterEnd) : 0;

  const overdueDays = daysAfterEnd > 0 ? daysAfterEnd : 0;

  const start = parseProjectDay(project.startDate);
  const end = parseProjectDay(project.endDate);
  const current = startOfLocalDay(today);
  const span = end.getTime() - start.getTime();

  const progress =
    span <= 0
      ? current.getTime() >= end.getTime()
        ? 100
        : 0
      : Math.min(
          100,
          Math.max(0, Math.round(((current.getTime() - start.getTime()) / span) * 100)),
        );

  if (project.status === "DONE") {
    return {
      totalDays,
      elapsedDays,
      remainingDays,
      overdueDays,
      progress,
      tone: "done",
      value: "완료",
      caption:
        overdueDays > 0
          ? `마감 후 ${overdueDays}일`
          : remainingDays > 0
            ? `여유 ${remainingDays}일`
            : "마감 당일 완료",
      started: daysAfterStart >= 0,
    };
  }

  if (overdueDays > 0) {
    return {
      totalDays,
      elapsedDays,
      remainingDays,
      overdueDays,
      progress,
      tone: "overdue",
      value: `${overdueDays}일`,
      caption: "마감일을 지났습니다",
      started: true,
    };
  }

  if (daysAfterEnd === 0) {
    return {
      totalDays,
      elapsedDays,
      remainingDays,
      overdueDays,
      progress,
      tone: "today",
      value: "D-Day",
      caption: "오늘이 마감일입니다",
      started: true,
    };
  }

  return {
    totalDays,
    elapsedDays,
    remainingDays,
    overdueDays,
    progress,
    tone: "remaining",
    value: `${remainingDays}일`,
    caption: "마감까지 남음",
    started: daysAfterStart >= 0,
  };
}

export function computeProjectTaskStats(projectId: number, tasks: Task[]) {
  const projectTasks = tasks.filter((task) => task.projectId === projectId);

  const totalTasks = projectTasks.length;

  const completedTasks = projectTasks.filter((task) => task.status === "DONE").length;

  const calculatedProgress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return {
    completedTasks,
    totalTasks,
    calculatedProgress,
  };
}

export type ProjectStats = {
  total: number;
  planned: number;
  inProgress: number;
  onHold: number;
  done: number;
  delayed: number;
};

export function computeProjectStats(
  projects: (Pick<Project, "status"> & {
    isDelayed?: boolean;
  })[],
): ProjectStats {
  const total = projects.length;

  if (total === 0) {
    return {
      total: 0,
      planned: 0,
      inProgress: 0,
      onHold: 0,
      done: 0,
      delayed: 0,
    };
  }

  const planned = projects.filter((project) => project.status === "PLANNED").length;

  const inProgress = projects.filter((project) => project.status === "IN_PROGRESS").length;

  const onHold = projects.filter((project) => project.status === "ON_HOLD").length;

  const done = projects.filter((project) => project.status === "DONE").length;

  const delayed = projects.filter(
    (project) => project.status === "IN_PROGRESS" && project.isDelayed,
  ).length;

  return {
    total,
    planned,
    inProgress,
    onHold,
    done,
    delayed,
  };
}

export function enrichProject(
  project: Project,
  tasks: Task[],
  goals: Goal[] = [],
): ProjectListItem {
  const stats = computeProjectTaskStats(project.id, tasks);

  const goalStats = computeProjectGoalStats(project.id, goals);

  const progress = resolveProjectProgress(project.status, stats.calculatedProgress);

  return {
    ...project,
    completedTasks: stats.completedTasks,
    totalTasks: stats.totalTasks,
    completedGoals: goalStats.completedGoals,
    totalGoals: goalStats.totalGoals,
    progress,
    isDelayed: isProjectDelayed(project),
    teamName: getProjectTeamLabel(project),
    creatorName: getUserName(project.creatorId),
  };
}
