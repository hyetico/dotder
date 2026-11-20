import { mockGoals } from "@/lib/mock/goals";

import { mockProjects } from "@/lib/mock/projects";

import { mockTeamMembers } from "@/lib/mock/teamMembers";

import type { ProjectScope } from "@/lib/projectRoutes";

import type { Goal } from "@/features/goals/types/goal";

export type CreateGoalInput = Omit<
  Goal,
  "id" | "completedTasks" | "totalTasks" | "progress" | "assigneeIds" | "updatedAt"
> & {
  teamId: number | null;
};

export type UpdateGoalInput = CreateGoalInput & {
  id: number;
};

/**
 * stampGoalUpdatedAt
 *
 * 목표를 만들거나 고친 시각을 최종 수정 값으로 만듭니다.
 *
 * @returns `2026-08-24T14:10:00` 형태의 로컬 시각
 */
function stampGoalUpdatedAt() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
}

export function readGoalTitle(goalId: number): string | undefined {
  return mockGoals.find((goal) => goal.id === goalId)?.title;
}

export async function getGoals(scope: ProjectScope): Promise<Goal[]> {
  if (scope === "all") {
    return [...mockGoals];
  }

  return mockGoals.filter((goal) => goal.projectId === scope);
}

/**
 * getGoal
 *
 * 목표 번호로 목표 하나를 찾습니다.
 *
 * @param goalId - 찾을 목표 번호
 * @returns 목표. 없으면 null
 */
export async function getGoal(goalId: number): Promise<Goal | null> {
  return mockGoals.find((goal) => goal.id === goalId) ?? null;
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  const project = mockProjects.find((item) => item.id === input.projectId);

  if (project?.status === "ON_HOLD") {
    throw new Error("보류 중인 프로젝트에는 목표를 추가할 수 없습니다.");
  }

  const nextId = mockGoals.reduce((maxId, goal) => Math.max(maxId, goal.id), 0) + 1;

  const assigneeIds =
    input.teamId == null
      ? []
      : mockTeamMembers
          .filter((member) => member.teamId === input.teamId)
          .map((member) => member.id);

  const { teamId, ...goalFields } = input;

  void teamId;

  const newGoal: Goal = {
    ...goalFields,
    id: nextId,
    completedTasks: 0,
    totalTasks: 0,
    progress: 0,
    assigneeIds,
    updatedAt: stampGoalUpdatedAt(),
  };

  mockGoals.push(newGoal);

  return newGoal;
}

export async function updateGoal(input: UpdateGoalInput): Promise<Goal> {
  const goalIndex = mockGoals.findIndex((goal) => goal.id === input.id);

  if (goalIndex === -1) {
    throw new Error("목표를 찾을 수 없습니다.");
  }

  const currentGoal = mockGoals[goalIndex];

  const project = mockProjects.find((item) => item.id === input.projectId);

  if (project?.status === "ON_HOLD" && currentGoal.projectId !== input.projectId) {
    throw new Error("보류 중인 프로젝트에는 목표를 연결할 수 없습니다.");
  }

  const projectChanged = currentGoal.projectId !== input.projectId;

  const assigneeIds = projectChanged
    ? input.teamId == null
      ? []
      : mockTeamMembers
          .filter((member) => member.teamId === input.teamId)
          .map((member) => member.id)
    : currentGoal.assigneeIds;

  const { teamId, ...goalFields } = input;

  void teamId;

  const updatedGoal: Goal = {
    ...currentGoal,
    ...goalFields,
    assigneeIds,
    completedTasks: currentGoal.completedTasks,
    totalTasks: currentGoal.totalTasks,
    progress: currentGoal.progress,
    updatedAt: stampGoalUpdatedAt(),
  };

  mockGoals[goalIndex] = updatedGoal;

  return updatedGoal;
}
