import GoalStatusIcon from "@/features/goals/components/GoalStatusIcon";

import {
  getGoalStatusLabel,
  getGoalStatusMetricColors,
  getGoalVisualStatus,
} from "@/features/goals/utils/goalUtils";

import type { ReactNode } from "react";

import type { GoalStatus } from "@/features/goals/types/goal";

const badgeFill = "bg-[linear-gradient(180deg,#ffffff_0%,#f3f4f6_100%)]";

const statusOutlineClass: Record<ReturnType<typeof getGoalVisualStatus>, string> = {
  NOT_STARTED: "border-slate-400 text-[var(--color-text-secondary)]",
  IN_PROGRESS: "border-blue-500 text-blue-600",
  COMPLETED: "border-green-500 text-green-600",
  DELAYED: "border-red-500 text-red-600",
};

type GoalStatusBadgeProps = {
  status: GoalStatus;
  delayed?: boolean;
  compact?: boolean;
  label?: ReactNode;
  showIcon?: boolean;
  plain?: boolean;
  shape?: "pill" | "rounded";
  size?: "sm" | "md";
};

export default function GoalStatusBadge({
  status,
  delayed = false,
  compact = false,
  label,
  showIcon = true,
  plain = false,
  shape = "pill",
  size = "md",
}: GoalStatusBadgeProps) {
  const appearance = getGoalVisualStatus(status, delayed);
  const statusLabel = getGoalStatusLabel(appearance);
  const text = label ?? statusLabel;
  const showStatusIcon = showIcon && text !== "지연";
  const spokenLabel = typeof label === "string" ? label : undefined;
  const color = getGoalStatusMetricColors(status, { delayed }).progress;

  return (
    <span
      title={spokenLabel ? `${statusLabel} ${spokenLabel}` : undefined}
      aria-label={spokenLabel ? `${statusLabel} ${spokenLabel}` : undefined}
      className={`inline-flex shrink-0 items-center justify-center ${
        shape === "rounded" ? "rounded-[6px]" : "rounded-full"
      } border-0 ${plain ? "" : `${badgeFill} ${statusOutlineClass[appearance]}`} ${
        size === "sm"
          ? "text-badge-sm h-4 gap-0.5 px-1.5 leading-none"
          : compact
            ? "text-badge h-6 gap-1 px-2 py-0 leading-none"
            : "text-badge h-6 gap-1 px-2.5 py-0 leading-none"
      } `}
      style={
        plain
          ? {
              color,
              backgroundColor: `color-mix(in srgb, ${color} 12%, white)`,
            }
          : undefined
      }
    >
      {showStatusIcon ? (
        <GoalStatusIcon
          status={appearance}
          size={size === "sm" ? 10 : 12}
          className="max-md:hidden"
        />
      ) : null}
      {text}
    </span>
  );
}
