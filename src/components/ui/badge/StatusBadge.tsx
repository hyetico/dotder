import type { StatusTextTone } from "@/components/ui/StatusText";

export type StatusBadgeTone = StatusTextTone;

type StatusBadgeProps = {
  /** 뱃지 글자. 예: "진행 중", "81일 지연" */
  label: string;
  /** 색. 상태와 색의 연결은 `lib/statusColors.ts`를 따른다. 지연은 `danger`. */
  tone: StatusBadgeTone;
  /** 글자 앞 6px 점. 상태 뱃지는 켜고, 지연 뱃지는 끈다. */
  showDot?: boolean;
  /** 프로젝트 색 카드 위에 올릴 때 켠다. 바탕만 흰색(`--color-surface`)으로 바뀐다. */
  onColor?: boolean;
  className?: string;
};

const toneBackgroundClassName: Record<StatusBadgeTone, string> = {
  neutral: "bg-[var(--color-neutral-soft)]",
  info: "bg-[var(--color-info-soft)]",
  warning: "bg-[var(--color-warning-soft)]",
  success: "bg-[var(--color-success-soft)]",
  danger: "bg-[var(--color-danger-soft)]",
};

const toneTextClassName: Record<StatusBadgeTone, string> = {
  neutral: "text-[var(--color-neutral-text)]",
  info: "text-[var(--color-info-text)]",
  warning: "text-[var(--color-warning-text)]",
  success: "text-[var(--color-success-text)]",
  danger: "text-[var(--color-danger-text)]",
};

const statusBadgeClassName =
  "text-badge inline-flex h-6 shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] px-2 whitespace-nowrap";

/**
 * 목록 줄 · 상세 · 고르는 목록에서 쓰는 알약형 상태 뱃지 (Components 10, 높이 24 · 모서리 8).
 *
 * 프로젝트 · 목표 · 태스크 상태 뱃지는 모두 이 위에 만든다. 폴더 카드 안에서는 `StatusText`를 쓴다.
 * 지연은 상태 뱃지 옆에 `tone="danger"` · `showDot={false}`로 따로 붙인다.
 *
 * @example
 * <StatusBadge label="진행 중" tone="info" />
 * <StatusBadge label="81일 지연" tone="danger" showDot={false} />
 */
export default function StatusBadge({
  label,
  tone,
  showDot = true,
  onColor = false,
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`${statusBadgeClassName} ${toneTextClassName[tone]} ${
        onColor ? "bg-[var(--color-surface)]" : toneBackgroundClassName[tone]
      } ${className}`}
    >
      {showDot ? <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" /> : null}
      {label}
    </span>
  );
}
