import type { ProjectColorKey } from "@/lib/projectPalette";

export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export const GOAL_STATUSES: GoalStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

export type GoalIcon = "shield" | "layout" | "smartphone" | "users" | "gauge";

export type Goal = {
  id: number;
  projectId: number | null;
  title: string;
  description: string;
  status: GoalStatus;
  /** 색 키 (lib/projectPalette.ts). `null`은 「색 없음」 */
  color: ProjectColorKey | null;
  icon: GoalIcon;
  tags: string[];
  startDate: string;
  endDate: string;
  completedTasks: number;
  totalTasks: number;
  progress: number;
  assigneeIds: number[];
  updatedAt: string;
};
