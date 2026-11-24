export type StatusTextTone = "neutral" | "info" | "warning" | "success" | "danger";

type StatusTextProps = {
  /** 상태 이름. 예: "진행 중" */
  label: string;
  /** 점 색. 상태와 색의 연결은 `lib/statusColors.ts`를 따른다. */
  tone: StatusTextTone;
  /** 같은 줄 오른쪽에 붙는 지연 글자. 예: "81일 지연". 없으면 숨긴다. */
  delayLabel?: string | null;
  className?: string;
};

/**
 * 알약 없이 점과 글자로만 보여주는 상태. 폴더 카드 전용이다 (handoff B9).
 *
 * 목록 줄 · 상세처럼 바탕이 흰 곳에서는 알약 모양의 상태 뱃지를 쓴다.
 *
 * @example
 * <StatusText label="진행 중" tone="info" delayLabel="81일 지연" />
 */
export default function StatusText({ label, tone, delayLabel, className = "" }: StatusTextProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2 text-xs ${className}`}>
      <span className="inline-flex min-w-0 items-center gap-1.5 font-medium text-[var(--color-text)]">
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: `var(--color-${tone})` }}
        />
        <span className="truncate">{label}</span>
      </span>
      {delayLabel ? (
        <span className="shrink-0 font-semibold text-[var(--color-danger-text)] tabular-nums">
          {delayLabel}
        </span>
      ) : null}
    </span>
  );
}
