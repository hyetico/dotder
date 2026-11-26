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
  /** 예전 팀 협업 때 담당자. 새로 채우지 않고, 이미 저장된 값은 그대로 둔다 */
  assigneeIds?: number[];
  updatedAt: string;
};
