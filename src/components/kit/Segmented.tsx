"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type SegmentedItem<T extends string> = {
  value: T;
  label: ReactNode;
  /** 오른쪽 숫자 (12 · --t3) */
  count?: number;
  /** 아이콘만 있는 칸이면 읽는 이름 */
  ariaLabel?: string;
};

type SegmentedProps<T extends string> = {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 묶음 읽는 이름. 예: "프로젝트 상태" */
  label: string;
  className?: string;
};

/**
 * 세그먼트 (보드 .seg). 바탕 --s3 · 높이 36 · 안쪽 2 · 칸 32 · 좌우 12 · 모서리 6,
 * 고른 칸은 --surface + 600 + 작은 그림자. 라디오 묶음이라 Tab 한 번에 들어오고 ← →로 옮긴다.
 *
 * @example
 * <Segmented label="보기" value={view} onChange={setView} items={[{ value: "card", label: <LayoutGrid size={16} />, ariaLabel: "카드 보기" }]} />
 */
export default function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
  className,
}: SegmentedProps<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const step = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;

    if (!step) {
      return;
    }

    event.preventDefault();
    const next = (index + step + items.length) % items.length;
    onChange(items[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn(
        "inline-flex h-9 shrink-0 gap-0.5 rounded-[var(--radius-sm)] bg-[var(--s3)] p-0.5",
        className,
      )}
    >
      {items.map((item, index) => {
        const isOn = item.value === value;

        return (
          <button
            key={item.value}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={isOn}
            aria-label={item.ariaLabel}
            tabIndex={isOn ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "kit-focus inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-[var(--radius-xs)] text-sm whitespace-nowrap transition-colors",
              // 아이콘만 있는 칸은 32 × 32 (보드 01 보기 전환)
              item.ariaLabel ? "w-8" : "px-3",
              isOn
                ? "bg-[var(--surface)] font-semibold text-[var(--text)] shadow-[0_1px_2px_rgb(0_0_0/8%)]"
                : "text-[var(--t2)] hover:text-[var(--text)]",
            )}
          >
            {item.label}
            {item.count != null ? (
              <span className="text-xs font-normal text-[var(--t3)] tabular-nums">
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
