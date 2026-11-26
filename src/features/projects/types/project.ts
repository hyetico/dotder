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

  /** 예전 팀 협업 때 만든 사람. 새로 채우지 않고, 이미 저장된 값은 그대로 둔다 */
  creatorId?: number;

  tags: string[];

  /** 보관한 날 (`YYYY-MM-DD`). 없으면 보관 안 함. 보관하면 목록 · 전환 · 고르기에서 빠지고 보관함(01-h)에만 보인다 */
  archivedAt?: string | null;

  /** 마지막으로 바꾼 시각 (ISO). 「최근 수정순」 정렬에 쓴다. 없으면 id가 큰 것이 최근 */
  updatedAt?: string;
};

export type ProjectListItem = Project & {
  completedTasks: number;
  totalTasks: number;
  completedGoals: number;
  totalGoals: number;
  progress: number;
  isDelayed: boolean;
  teamName: string;
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
