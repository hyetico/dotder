"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type PillItem<T extends string> = {
  value: T;
  label: ReactNode;
  /** 앞 점 6 색 클래스 (예: `badgeDotClassName.info`) */
  dotClassName?: string;
  count?: number;
};

type PillGroupProps<T extends string> = {
  items: PillItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 묶음 읽는 이름 */
  label: string;
};

/**
 * 알약 고르기 (보드 T · M 05 상태). 32 · 좌우 12 · 모서리 끝까지 · 사이 8 · 점 6 + 이름 + 숫자 12.
 * 고른 알약은 --marker 바탕 · --on-marker 글자 · 숫자 --on-marker-muted, 나머지는 선 --border.
 * 넘치면 가로 스크롤(스크롤바 숨김). 라디오 묶음이라 ← →로 옮긴다.
 *
 * @example
 * <PillGroup label="상태" value={status} onChange={setStatus} items={[{ value: "TODO", label: "할 일", count: 1 }]} />
 */
export default function PillGroup<T extends string>({
  items,
  value,
  onChange,
  label,
}: PillGroupProps<T>) {
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
      className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 whitespace-nowrap [&::-webkit-scrollbar]:hidden"
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
            tabIndex={isOn ? 0 : -1}
            onClick={() => onChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "kit-focus inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm transition-colors duration-120",
              isOn
                ? "border-[var(--marker)] bg-[var(--marker)] text-[var(--on-marker)]"
                : "border-[var(--border)] text-[var(--text)] hover:bg-[var(--s2)]",
            )}
          >
            {item.dotClassName ? (
              <span aria-hidden className={cn("size-1.5 rounded-full", item.dotClassName)} />
            ) : null}
            {item.label}
            {item.count != null ? (
              <span
                className={cn(
                  "text-xs tabular-nums",
                  isOn ? "text-[var(--on-marker-muted)]" : "text-[var(--t3)]",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
