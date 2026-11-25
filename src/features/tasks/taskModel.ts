import { getDayDelta } from "@/lib/date";

import type { BadgeTone } from "@/components/kit/Badge";
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/types/task";

export const TASK_STATUS_ORDER: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

/** 태스크 상태 이름 (보드 05 칸 · 05-a 상태) */
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  TODO: "할 일",
  IN_PROGRESS: "진행 중",
  DONE: "완료",
};

/** 상태 점 색 (보드 T 05: 할 일 회색 · 진행 중 파랑 · 완료 초록) */
export const TASK_STATUS_TONE: Record<TaskStatus, BadgeTone> = {
  TODO: "n",
  IN_PROGRESS: "info",
  DONE: "ok",
};

export const TASK_PRIORITY_ORDER: TaskPriority[] = ["HIGH", "MEDIUM", "LOW"];

export const TASK_PRIORITY_LABEL: Record<TaskPriority, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

/** 우선순위 점 색 (보드 05: 높음 #dc2626 · 보통 #f97316 · 낮음 #9ca3af) */
export const TASK_PRIORITY_DOT: Record<TaskPriority, string> = {
  HIGH: "bg-[var(--bad)]",
  MEDIUM: "bg-[var(--badge-warn-dot)]",
  LOW: "bg-[var(--badge-n-dot)]",
};

export type TaskBucket = "late" | "today" | "week" | "later" | "done";

/** 목록 보기 묶음 (프로토타입 taskList) */
export const TASK_BUCKETS: { key: TaskBucket; label: string; tone?: BadgeTone }[] = [
  { key: "late", label: "마감 지남", tone: "bad" },
  { key: "today", label: "오늘" },
  { key: "week", label: "이번 주" },
  { key: "later", label: "나중" },
  { key: "done", label: "완료" },
];

/**
 * 태스크가 목록 보기의 어느 묶음인지 정한다 (프로토타입 bucket).
 *
 * @param today - `YYYY-MM-DD`
 */
export function getTaskBucket(task: Pick<Task, "status" | "dueDate">, today: string): TaskBucket {
  if (task.status === "DONE") {
    return "done";
  }

  if (!task.dueDate) {
    return "later";
  }

  const days = getDayDelta(today, task.dueDate);

  if (days < 0) {
    return "late";
  }

  return days === 0 ? "today" : days <= 7 ? "week" : "later";
}
