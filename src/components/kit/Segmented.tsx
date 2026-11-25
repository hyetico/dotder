"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

import { useSlidingIndicator } from "@/components/kit/useSlidingIndicator";

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
  /** 칸을 같은 너비로 늘려 줄을 채운다 (보드 03-a 상태) */
  fill?: boolean;
  className?: string;
};

const segmentOnClassName =
  "rounded-[var(--radius-xs)] bg-[var(--surface)] shadow-[0_1px_2px_rgb(0_0_0/8%)]";

/**
 * 세그먼트 (보드 .seg). 바탕 --s3 · 높이 36 · 안쪽 2 · 칸 32 · 좌우 12 · 모서리 6,
 * 고른 칸은 --surface + 600 + 작은 그림자(0.15초 동안 옮겨 감 · DOC3 14). 라디오 묶음이라 Tab 한 번에 들어오고 ← →로 옮긴다.
 *
 * @example
 * <Segmented label="보기" value={view} onChange={setView} items={[{ value: "card", label: <LayoutGrid size={16} />, ariaLabel: "카드 보기" }]} />
 */
export default function Segmented<T extends string>({
  items,
  value,
  onChange,
  label,
  fill = false,
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

  const groupRef = useRef<HTMLDivElement>(null);
  const place = useSlidingIndicator(groupRef, '[aria-checked="true"]', value);

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label}
      className={cn(
        "relative h-9 shrink-0 gap-0.5 rounded-[var(--radius-sm)] bg-[var(--s3)] p-0.5",
        fill ? "flex w-full" : "inline-flex",
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
              "kit-focus relative z-10 inline-flex h-8 cursor-pointer items-center justify-center gap-1 rounded-[var(--radius-xs)] text-sm whitespace-nowrap transition-colors",
              // 아이콘만 있는 칸은 32 × 32 (보드 01 보기 전환)
              item.ariaLabel ? "w-8" : "px-3",
              fill && "flex-1",
              // 잰 뒤에는 움직이는 바탕이 대신 그린다
              isOn
                ? cn("font-semibold text-[var(--text)]", !place && segmentOnClassName)
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
      {place ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-0.5 h-8 transition-[left,width] duration-150 ease-out motion-reduce:duration-0",
            segmentOnClassName,
          )}
          style={{ left: place.left, width: place.width }}
        />
      ) : null}
    </div>
  );
}
