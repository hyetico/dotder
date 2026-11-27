import { X } from "@/components/ui/icon";

import { cn } from "@/lib/cn";

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** 켜짐 (주 색 바탕). 토글이면 `aria-pressed`로 읽힌다 */
  selected?: boolean;
  /** 왼쪽 아이콘 16 */
  icon?: ReactNode;
  /** 오른쪽 숫자 (12 · 꺼짐 --t3) */
  count?: number;
  /**
   * 못 누름 (데이터가 0개일 때 도구 줄). 40% · `aria-disabled` · 누르거나 Tab으로 들어오지 않는다.
   * 선택 표시는 끈다
   */
  disabled?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children: ReactNode;
};

/**
 * 도구 줄 칩 (프로토타입 .chip, 예: 「마감 지남만 3」). 36 · 좌우 12 · 모서리 8 · 테두리 --border.
 *
 * @example
 * <Chip selected={lateOnly} onClick={toggle} icon={<CircleAlert size={16} />} count={3}>마감 지남만</Chip>
 * <Chip disabled={isEmpty} …>마감 지남만</Chip>
 */
export function Chip({
  selected: isSelected = false,
  icon,
  count,
  disabled = false,
  className,
  children,
  onClick,
  ...props
}: ChipProps) {
  const selected = isSelected && !disabled;

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-disabled={disabled || undefined}
      onClick={disabled ? undefined : onClick}
      className={cn(
        "kit-focus inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border px-3 text-sm whitespace-nowrap transition-colors",
        disabled && "pointer-events-none opacity-40",
        selected
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--t2)] hover:border-[var(--border-2)] hover:text-[var(--text)]",
        className,
      )}
      {...props}
      tabIndex={disabled ? -1 : props.tabIndex}
    >
      {icon}
      {children}
      {count != null ? (
        <span
          className={cn(
            "text-xs tabular-nums",
            selected ? "text-[var(--on-primary)]" : "text-[var(--bad)]",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

type TagProps = {
  children: ReactNode;
  /** 넘기면 × 버튼을 붙인다. 읽는 이름은 「{children} 태그 지우기」 */
  onRemove?: () => void;
  removeLabel?: string;
  className?: string;
};

/**
 * 태그 (보드 .tag). 24 · 좌우 8 · 둥근 끝 · 12 · --t2 · 테두리 --border · 바탕 --surface.
 *
 * @example
 * <Tag onRemove={() => remove(tag)} removeLabel={`${tag} 태그 지우기`}>{tag}</Tag>
 */
export function Tag({ children, onRemove, removeLabel, className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center gap-1 rounded-[var(--radius-full)] border border-[var(--border)] bg-[var(--surface)] text-xs whitespace-nowrap text-[var(--t2)]",
        onRemove ? "pr-1 pl-2" : "px-2",
        className,
      )}
    >
      {children}
      {onRemove ? (
        <button
          type="button"
          aria-label={removeLabel}
          onClick={onRemove}
          className="kit-focus inline-flex size-4 cursor-pointer items-center justify-center rounded-[var(--radius-full)] text-[var(--t3)] hover:bg-[var(--s3)] hover:text-[var(--text)]"
        >
          <X size={12} aria-hidden />
        </button>
      ) : null}
    </span>
  );
}
