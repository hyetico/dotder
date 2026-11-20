import {
  CheckCircle2,
  Circle,
  CircleAlert,
  LoaderCircle,
  iconStroke,
  type LucideIcon,
} from "@/components/ui/icon";

import type { GoalVisualStatus } from "@/features/goals/utils/goalUtils";

const GOAL_STATUS_ICONS: Record<GoalVisualStatus, LucideIcon> = {
  NOT_STARTED: Circle,
  IN_PROGRESS: LoaderCircle,
  COMPLETED: CheckCircle2,
  DELAYED: CircleAlert,
};

type GoalStatusIconProps = {
  status: GoalVisualStatus;
  size?: number;
  className?: string;
};

export default function GoalStatusIcon({ status, size = 12, className = "" }: GoalStatusIconProps) {
  const Icon = GOAL_STATUS_ICONS[status];

  return <Icon size={size} strokeWidth={iconStroke} aria-hidden className={className} />;
}
