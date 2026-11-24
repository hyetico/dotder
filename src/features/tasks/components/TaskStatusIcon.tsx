import {
  CheckCircle2,
  Circle,
  LoaderCircle,
  iconStroke,
  type LucideIcon,
} from "@/components/ui/icon";

import type { TaskStatus } from "@/features/tasks/types/task";

const taskStatusAppearance: Record<
  TaskStatus,
  {
    label: string;
    icon: LucideIcon;
    className: string;
  }
> = {
  TODO: {
    label: "할 일",
    icon: Circle,
    className: "text-[var(--color-text-muted)]",
  },
  IN_PROGRESS: {
    label: "진행 중",
    icon: LoaderCircle,
    className: "text-[var(--color-info-text)]",
  },
  DONE: {
    label: "완료",
    icon: CheckCircle2,
    className: "text-[var(--color-success-text)]",
  },
};

type TaskStatusIconProps = {
  status: TaskStatus;
  size?: number;
};

export function getTaskStatusAppearance(status: TaskStatus) {
  return taskStatusAppearance[status];
}

export default function TaskStatusIcon({ status, size = 14 }: TaskStatusIconProps) {
  const appearance = taskStatusAppearance[status];
  const Icon = appearance.icon;

  return (
    <Icon
      size={size}
      strokeWidth={iconStroke}
      aria-hidden
      className={`shrink-0 ${appearance.className} `}
    />
  );
}
