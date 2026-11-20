export type GoalStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export const GOAL_STATUSES: GoalStatus[] = ["NOT_STARTED", "IN_PROGRESS", "COMPLETED"];

export type GoalIcon = "shield" | "layout" | "smartphone" | "users" | "gauge";

export type Goal = {
  id: number;
  projectId: number | null;
  title: string;
  description: string;
  status: GoalStatus;
  color: string | null;
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
