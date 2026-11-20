import TaskStatusIcon, {
  getTaskStatusAppearance,
} from "@/features/tasks/components/TaskStatusIcon";

import type { TaskStatus } from "@/features/tasks/types/task";

type TaskStatusBadgeProps = {
  status: TaskStatus;
  size?: "sm" | "md";
};

/**
 * TaskStatusBadge
 *
 * 태스크 진행 상태를 배경 없이 아이콘과 글자로 표시합니다.
 *
 * @param props - TaskStatusBadge 컴포넌트 Props
 * @param props.status - 표시할 태스크 상태
 * @param props.size - 뱃지 크기. sm은 프로젝트 상태 뱃지와 같은 10px
 */
export default function TaskStatusBadge({ status, size = "md" }: TaskStatusBadgeProps) {
  const appearance = getTaskStatusAppearance(status);

  return (
    <span
      className={`inline-flex shrink-0 items-center leading-none ${
        size === "sm" ? "text-badge-sm h-4 gap-0.5" : "text-badge gap-1"
      } ${appearance.className} `}
    >
      <TaskStatusIcon status={status} size={size === "sm" ? 10 : 12} />
      {appearance.label}
    </span>
  );
}
