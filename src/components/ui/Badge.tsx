import { cn } from "@/lib/cn";

import type { ReactNode } from "react";

export type BadgeTone = "n" | "info" | "ok" | "warn" | "bad";

const toneClassName: Record<BadgeTone, string> = {
  n: "bg-[var(--badge-n-bg)] text-[var(--badge-n-fg)]",
  info: "bg-[var(--badge-info-bg)] text-[var(--badge-info-fg)]",
  ok: "bg-[var(--badge-ok-bg)] text-[var(--badge-ok-fg)]",
  warn: "bg-[var(--badge-warn-bg)] text-[var(--badge-warn-fg)]",
  bad: "bg-[var(--badge-bad-bg)] text-[var(--badge-bad-fg)]",
};

/** 상태 점 색 (보드 .badge .dot). 폴더 카드 상태 줄에도 쓴다 */
export const badgeDotClassName: Record<BadgeTone, string> = {
  n: "bg-[var(--badge-n-dot)]",
  info: "bg-[var(--badge-info-dot)]",
  ok: "bg-[var(--badge-ok-dot)]",
  warn: "bg-[var(--badge-warn-dot)]",
  bad: "bg-[var(--badge-bad-dot)]",
};

type BadgeProps = {
  tone?: BadgeTone;
  /** 앞에 점 6을 그린다 (상태 배지) */
  dot?: boolean;
  /** 20 · 좌우 6 · 모서리 6 (보드 .badge.sm) */
  small?: boolean;
  children: ReactNode;
};

/**
 * 배지 (보드 .badge). 24 · 좌우 8 · 모서리 8 · 12/18 500 · 점 6 + 사이 6.
 *
 * @example
 * <Badge tone="info" dot>진행 중</Badge>
 */
export default function Badge({ tone = "n", dot = false, small = false, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 text-xs font-medium whitespace-nowrap",
        small ? "h-5 rounded-[var(--radius-xs)] px-1.5" : "h-6 rounded-[var(--radius-sm)] px-2",
        toneClassName[tone],
      )}
    >
      {dot ? (
        <span aria-hidden className={cn("size-1.5 rounded-full", badgeDotClassName[tone])} />
      ) : null}
      {children}
    </span>
  );
}
