import type { ProjectColorKey } from "@/lib/projectPalette";

export type ProjectStatus = "PLANNED" | "IN_PROGRESS" | "ON_HOLD" | "DONE";

export const PROJECT_STATUSES: ProjectStatus[] = ["PLANNED", "IN_PROGRESS", "ON_HOLD", "DONE"];

export type Project = {
  id: number;

  name: string;
  description: string;

  teamId: number | null;
  isPersonal: boolean;

  icon: string;
  /** 색 키 (lib/projectPalette.ts). hex를 저장하지 않는다. */
  color: ProjectColorKey;

  startDate: string;
  endDate: string;
  completedAt: string | null;

  status: ProjectStatus;
  /** 상태를 사용자가 직접 골랐는지. false면 읽을 때 시작일로 계산한다 (PRD 7-2 · P-2). */
  isStatusManual: boolean;

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
