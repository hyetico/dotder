import { Target } from "@/components/ui/icon";

import GoalStatusIcon from "@/features/goals/components/GoalStatusIcon";
import StatusMark, { getStatusMarkIconSize } from "@/components/ui/StatusMark";

import {
  getGoalStatusLabel,
  getGoalStatusMarkColor,
  getGoalVisualStatus,
} from "@/features/goals/utils/goalUtils";

import {
  getProjectTintColor,
  getProjectTintInkColor,
  getProjectTintLineColor,
} from "@/features/projects/utils/projectColors";

import type { GoalStatus } from "@/features/goals/types/goal";

const badgeSizes = {
  xs: {
    box: "h-[22px] w-[22px]",
    icon: 12,
    emoji: "text-xs",
  },
  sm: {
    box: "h-9 w-9",
    icon: 16,
    emoji: "text-lg",
  },
  md: {
    box: "h-12 w-12",
    icon: 20,
    emoji: "text-xl",
  },
  lg: {
    box: "h-[60px] w-[60px] md:h-16 md:w-16",
    icon: 26,
    emoji: "text-2xl",
  },
  xl: {
    box: "h-[84px] w-[84px]",
    icon: 34,
    emoji: "text-3xl",
  },
} as const;

type GoalBadgeProps = {
  color: string | null;
  size?: keyof typeof badgeSizes;
  className?: string;
  emoji?: string;
  status?: GoalStatus;
  delayed?: boolean;
  markRingClassName?: string;
};

export default function GoalBadge({
  color,
  size = "sm",
  className = "",
  emoji,
  status,
  delayed = false,
  markRingClassName = "ring-[var(--color-surface)]",
}: GoalBadgeProps) {
  const config = badgeSizes[size];

  const hasColor = Boolean(color?.trim());

  const badge = (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${
        hasColor
          ? "border"
          : "border border-dashed border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-text-muted)]"
      } ${config.box} ${className} `}
      style={
        hasColor
          ? {
              backgroundColor: getProjectTintColor(color),
              borderColor: getProjectTintLineColor(color),
              color: getProjectTintInkColor(color ?? ""),
            }
          : undefined
      }
    >
      {emoji ? (
        <span className={`leading-none ${config.emoji} `}>{emoji}</span>
      ) : (
        <Target size={config.icon} />
      )}
    </span>
  );

  if (!status) {
    return badge;
  }

  const markSize = size === "xl" || size === "lg" || size === "md" ? "md" : "sm";

  const appearance = getGoalVisualStatus(status, delayed);

  return (
    <span className="relative inline-flex shrink-0">
      {badge}

      <StatusMark
        color={getGoalStatusMarkColor(status, delayed)}
        label={getGoalStatusLabel(appearance)}
        size={markSize}
        className={`absolute -right-1 -bottom-1 ring-2 ${markRingClassName} `}
      >
        <GoalStatusIcon status={appearance} size={getStatusMarkIconSize(markSize)} />
      </StatusMark>
    </span>
  );
}
