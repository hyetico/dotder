// export type TaskStatus =
//   | "TODO"
//   | "IN_PROGRESS"
//   | "DONE";

//   export type TaskPriority =
//   | "LOW"
//   | "MEDIUM"
//   | "HIGH";

// export type Task = {
//   id: number;
//   projectId: number;
//   title: string;
//   description: string;
//   status: TaskStatus;  // 어느 컬럼인지
//   priority: "LOW" | "MEDIUM" | "HIGH";
//   dueDate: string;

//   order: number; // 같은 컬럼 안에서 몇 번째인지
// };

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
