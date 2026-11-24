import StatusBadge from "@/components/ui/badge/StatusBadge";

import { getTaskStatusLabel } from "@/features/tasks/utils/taskUtils";

import { getStatusTone } from "@/lib/statusColors";

import type { TaskStatus } from "@/features/tasks/types/task";

const TASK_STATUS_COLOR_KEY = {
  TODO: "PLANNED",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
} as const satisfies Record<TaskStatus, string>;

type TaskStatusBadgeProps = {
  status: TaskStatus;
  className?: string;
};

/**
 * 태스크 상태 뱃지. `StatusBadge` 위에 상태 이름과 색만 정한다.
 *
 * @example
 * <TaskStatusBadge status="IN_PROGRESS" />
 */
export default function TaskStatusBadge({ status, className = "" }: TaskStatusBadgeProps) {
  return (
    <StatusBadge
      label={getTaskStatusLabel(status)}
      tone={getStatusTone(TASK_STATUS_COLOR_KEY[status])}
      className={className}
    />
  );
}
