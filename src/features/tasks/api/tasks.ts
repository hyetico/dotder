import { recordProjectHistory } from "@/lib/mock/projectHistory";
import { mockProjects } from "@/lib/mock/projects";
import { mockTasks } from "@/lib/mock/tasks";
import { ensureDataLoaded, replaceItems, saveData } from "@/lib/storage/dotderData";

import type { Task } from "@/features/tasks/types/task";
import type { ProjectScope } from "@/lib/projectRoutes";

export async function getTasks(scope: ProjectScope): Promise<Task[]> {
  await ensureDataLoaded();
  const result =
    scope === "all" ? [...mockTasks] : mockTasks.filter((task) => task.projectId === scope);

  return result;
}

export async function createTask(newTask: Task): Promise<Task> {
  await ensureDataLoaded();
  const project = mockProjects.find((item) => item.id === newTask.projectId);

  if (project?.status === "ON_HOLD") {
    throw new Error("보류 중인 프로젝트에는 태스크를 추가할 수 없습니다.");
  }

  replaceItems(mockTasks, [...mockTasks, newTask]);
  if (newTask.projectId) {
    recordProjectHistory({
      projectId: newTask.projectId,
      kind: "add",
      target: "task",
      name: newTask.title,
    });
  }

  await saveData();

  return newTask;
}

export async function updateTask(updatedTask: Task): Promise<Task> {
  await ensureDataLoaded();
  const previous = mockTasks.find((task) => task.id === updatedTask.id);
  replaceItems(
    mockTasks,
    mockTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
  );

  // 상태가 바뀌면 기록 (완료는 따로 · 보드 08)
  if (previous && previous.status !== updatedTask.status && updatedTask.projectId) {
    recordProjectHistory({
      projectId: updatedTask.projectId,
      kind: updatedTask.status === "DONE" ? "done" : "status",
      target: "task",
      name: updatedTask.title,
      from: previous.status,
      to: updatedTask.status,
    });
  }

  await saveData();

  return updatedTask;
}

export async function deleteTask(taskId: number): Promise<number> {
  await ensureDataLoaded();
  const removed = mockTasks.find((task) => task.id === taskId);
  replaceItems(
    mockTasks,
    mockTasks.filter((task) => task.id !== taskId),
  );
  if (removed?.projectId) {
    recordProjectHistory({
      projectId: removed.projectId,
      kind: "delete",
      target: "task",
      name: removed.title,
    });
  }

  await saveData();

  return taskId;
}

/**
 * 목표를 지울 때 그 목표에 묶인 태스크의 연결만 푼다 (태스크는 남는다).
 *
 * @param goalId - 지운 목표 id
 */
export function unlinkTasksFromGoal(goalId: number) {
  replaceItems(
    mockTasks,
    mockTasks.map((task) => (task.goalId === goalId ? { ...task, goalId: undefined } : task)),
  );
}

/**
 * 프로젝트를 지울 때 그 프로젝트의 태스크를 함께 지운다 (REBUILD 6 버그 2).
 *
 * @returns 지운 태스크 (되돌리기에 쓴다)
 */
export function removeTasksOfProject(projectId: number): Task[] {
  const removed = mockTasks.filter((task) => task.projectId === projectId);
  replaceItems(
    mockTasks,
    mockTasks.filter((task) => task.projectId !== projectId),
  );
  return removed;
}

/** 프로젝트 삭제 되돌리기 때 태스크를 다시 넣는다 */
export function restoreTasks(tasks: Task[]) {
  const ids = new Set(mockTasks.map((task) => task.id));
  replaceItems(mockTasks, [...mockTasks, ...tasks.filter((task) => !ids.has(task.id))]);
}
