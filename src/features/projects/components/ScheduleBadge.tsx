import { AppIcon, Calendar } from "@/components/ui/icon";

import { getProjectStatusStyles } from "@/features/projects/utils/projectUtils";

import type { ReactNode } from "react";

export type ScheduleTone = "delayed" | "done" | "remaining";

const scheduleToneClassName = {
  done: "bg-[var(--color-success-soft)] text-[var(--color-success-text)]",
  remaining: "bg-[var(--color-info-soft)] text-[var(--color-info-text)]",
} as const;

export function getScheduleBadgeClassName(tone: ScheduleTone) {
  if (tone === "delayed") {
    return getProjectStatusStyles("DELAYED").badge;
  }

  return scheduleToneClassName[tone];
}

type ScheduleBadgeProps = {
  label: string;
  description: string;
  className: string;
  icon?: ReactNode | null;
};

export default function ScheduleBadge({ label, description, className, icon }: ScheduleBadgeProps) {
  return (
    <span
      aria-label={description}
      title={description}
      className={`text-badge inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-2 py-0 leading-[18px] font-medium tabular-nums ${className} `}
    >
      {icon === undefined ? <AppIcon icon={Calendar} size="xs" /> : icon}
      {label}
    </span>
  );
}
