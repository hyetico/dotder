export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: number;

  projectId: number;

  goalId?: number;

  title: string;

  description: string;

  status: TaskStatus;

  priority: TaskPriority;

  dueDate: string;

  createdBy: number;

  order: number;
};
