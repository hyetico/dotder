import { unlinkTasksFromGoal } from "@/features/tasks/api/tasks";

import { mockGoals } from "@/lib/mock/goals";
import { recordProjectHistory } from "@/lib/mock/projectHistory";
import { mockProjects } from "@/lib/mock/projects";
import { ensureDataLoaded, saveData } from "@/lib/storage/dotderData";

import type { Goal } from "@/features/goals/types/goal";
import type { ProjectScope } from "@/lib/projectRoutes";

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
  await ensureDataLoaded();
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
  await ensureDataLoaded();
  return mockGoals.find((goal) => goal.id === goalId) ?? null;
}

export async function createGoal(input: CreateGoalInput): Promise<Goal> {
  await ensureDataLoaded();
  const project = mockProjects.find((item) => item.id === input.projectId);

  if (project?.status === "ON_HOLD") {
    throw new Error("보류 중인 프로젝트에는 목표를 추가할 수 없습니다.");
  }

  const nextId = mockGoals.reduce((maxId, goal) => Math.max(maxId, goal.id), 0) + 1;

  const { teamId, ...goalFields } = input;

  void teamId;

  const newGoal: Goal = {
    ...goalFields,
    id: nextId,
    completedTasks: 0,
    totalTasks: 0,
    progress: 0,
    updatedAt: stampGoalUpdatedAt(),
  };

  mockGoals.push(newGoal);
  if (newGoal.projectId) {
    recordProjectHistory({
      projectId: newGoal.projectId,
      kind: "add",
      target: "goal",
      name: newGoal.title,
    });
  }

  await saveData();

  return newGoal;
}

/**
 * 목표를 지운다. 목표 안 태스크는 남고 연결만 풀린다 (프로토타입 gmenu 삭제).
 *
 * @returns 지운 목표 (되돌리기에 쓴다)
 * @throws 목표가 없으면
 */
export async function deleteGoal(goalId: number): Promise<Goal> {
  await ensureDataLoaded();
  const index = mockGoals.findIndex((goal) => goal.id === goalId);

  if (index === -1) {
    throw new Error("목표를 찾을 수 없습니다.");
  }

  const [removed] = mockGoals.splice(index, 1);
  unlinkTasksFromGoal(goalId);
  if (removed.projectId) {
    recordProjectHistory({
      projectId: removed.projectId,
      kind: "delete",
      target: "goal",
      name: removed.title,
    });
  }

  await saveData();

  return removed;
}

/** 지운 목표를 같은 id로 다시 넣는다 (삭제 토스트 「되돌리기」). 풀린 태스크 연결은 돌아오지 않는다. */
export async function restoreGoal(goal: Goal): Promise<Goal> {
  await ensureDataLoaded();
  if (!mockGoals.some((item) => item.id === goal.id)) {
    mockGoals.push({ ...goal, tags: [...goal.tags] });
  }

  await saveData();

  return goal;
}

export async function updateGoal(input: UpdateGoalInput): Promise<Goal> {
  await ensureDataLoaded();
  const goalIndex = mockGoals.findIndex((goal) => goal.id === input.id);

  if (goalIndex === -1) {
    throw new Error("목표를 찾을 수 없습니다.");
  }

  const currentGoal = mockGoals[goalIndex];

  const project = mockProjects.find((item) => item.id === input.projectId);

  if (project?.status === "ON_HOLD" && currentGoal.projectId !== input.projectId) {
    throw new Error("보류 중인 프로젝트에는 목표를 연결할 수 없습니다.");
  }

  const { teamId, ...goalFields } = input;

  void teamId;

  const updatedGoal: Goal = {
    ...currentGoal,
    ...goalFields,
    completedTasks: currentGoal.completedTasks,
    totalTasks: currentGoal.totalTasks,
    progress: currentGoal.progress,
    updatedAt: stampGoalUpdatedAt(),
  };

  mockGoals[goalIndex] = updatedGoal;

  // 상태가 바뀌면 기록 (완료는 따로 · 보드 08)
  if (currentGoal.status !== updatedGoal.status && updatedGoal.projectId) {
    recordProjectHistory({
      projectId: updatedGoal.projectId,
      kind: updatedGoal.status === "COMPLETED" ? "done" : "status",
      target: "goal",
      name: updatedGoal.title,
      from: currentGoal.status,
      to: updatedGoal.status,
    });
  }

  await saveData();

  return updatedGoal;
}

/**
 * 프로젝트를 지울 때 그 프로젝트의 목표를 함께 지운다 (REBUILD 6 버그 2).
 *
 * @returns 지운 목표 (되돌리기에 쓴다)
 */
export function removeGoalsOfProject(projectId: number): Goal[] {
  const removed = mockGoals.filter((goal) => goal.projectId === projectId);
  for (let index = mockGoals.length - 1; index >= 0; index -= 1) {
    if (mockGoals[index].projectId === projectId) {
      mockGoals.splice(index, 1);
    }
  }
  return removed;
}

/** 프로젝트 삭제 되돌리기 때 목표를 다시 넣는다 */
export function restoreGoals(goals: Goal[]) {
  goals.forEach((goal) => {
    if (!mockGoals.some((item) => item.id === goal.id)) {
      mockGoals.push(goal);
    }
  });
}
