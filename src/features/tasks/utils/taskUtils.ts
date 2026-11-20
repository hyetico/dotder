import type { Task, TaskStatus } from "@/features/tasks/types/task";

export type TaskFilterTab = "all" | TaskStatus | "DELAYED";

/**
 * taskTodayStamp
 *
 * 오늘 날짜를 태스크 마감일과 같은 형식으로 만듭니다.
 *
 * @returns YYYY-MM-DD
 */
export function taskTodayStamp() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

/**
 * matchesTaskStatusFilter
 *
 * 태스크가 고른 상태 필터에 들어가는지 확인합니다.
 *
 * @param task - 확인할 태스크
 * @param filter - 고른 상태. 전체면 상태로 거르지 않습니다
 * @param today - 오늘 날짜. YYYY-MM-DD
 * @returns 목록에 남기면 true
 */
export function matchesTaskStatusFilter(
  task: Pick<Task, "status" | "dueDate">,
  filter: TaskFilterTab,
  today: string,
) {
  if (filter === "all") {
    return true;
  }

  if (filter === "DELAYED") {
    return task.status !== "DONE" && task.dueDate < today;
  }

  return task.status === filter;
}

export function getTaskStatusLabel(status: TaskStatus) {
  switch (status) {
    case "TODO":
      return "할 일";

    case "IN_PROGRESS":
      return "진행 중";

    case "DONE":
      return "완료";

    default:
      return status;
  }
}

export function filterTasksBySearchQuery(
  tasks: Task[],
  searchQuery: string,
  projectNames?: Record<number, string>,
) {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  if (!normalizedQuery) {
    return tasks;
  }

  return tasks.filter((task) => {
    if (task.title.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    if (task.description.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    const projectName = projectNames?.[task.projectId];

    if (projectName?.toLowerCase().includes(normalizedQuery)) {
      return true;
    }

    return false;
  });
}
