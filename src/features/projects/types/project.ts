export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "ON_HOLD" | "DONE";

export const PROJECT_STATUSES: ProjectStatus[] = ["PLANNED", "IN_PROGRESS", "ON_HOLD", "DONE"];

export type Project = {
  id: number;

  name: string;
  description: string;

  teamId: number | null;
  isPersonal: boolean;

  icon: string;
  color: string | null;

  startDate: string;
  endDate: string;
  completedAt: string | null;

  status: ProjectStatus;

  isMain: boolean;

  creatorId: number;

  tags: string[];
};

export type ProjectListItem = Project & {
  completedTasks: number;
  totalTasks: number;
  completedGoals: number;
  totalGoals: number;
  progress: number;
  isDelayed: boolean;
  teamName: string;
  creatorName: string;
};

export type ProjectDeadlineChange = {
  id: number;
  projectId: number;
  previousEndDate: string;
  nextEndDate: string;
  changedAt: string;
  overdueDaysAtChange: number;
  reason?: string;
};
