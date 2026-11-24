"use client";

import type { StatusFilterChipItem } from "@/components/ui/StatusFilterChips";

type StatusFilterPillsProps<T extends string> = {
  items: StatusFilterChipItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
};

/**
 * StatusFilterPills
 *
 * 상태 필터를 테두리 없는 알약 버튼으로 한 줄에 보여줍니다.
 * 고른 항목은 옅은 배경에 진한 글자, 고르지 않은 항목은 회색입니다.
 *
 * @param props - StatusFilterPills 컴포넌트 Props
 * @param props.items - 표시할 상태와 개수
 * @param props.value - 현재 선택된 상태
 * @param props.onChange - 상태를 고를 때 실행되는 함수
 * @param props.label - 필터 묶음의 접근 이름. 기본값은 상태
 */
export default function StatusFilterPills<T extends string>({
  items,
  value,
  onChange,
  label = "상태",
}: StatusFilterPillsProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex min-w-0 [scrollbar-width:none] gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden"
    >
      {items.map((item) => {
        const selected = item.id === value;

        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(item.id)}
            className={`text-caption inline-flex h-8 shrink-0 items-center gap-1 rounded-full border-0 px-2.5 font-medium whitespace-nowrap text-[var(--color-text)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none ${
              selected
                ? "bg-[var(--color-hover)]"
                : "bg-[var(--color-surface)] hover:bg-[var(--color-hover-soft)]"
            } `}
          >
            {item.icon ? (
              <span
                className="inline-flex size-3.5 shrink-0 items-center justify-center"
                style={{
                  color: selected ? "currentColor" : "var(--color-text-muted)",
                }}
              >
                {item.icon}
              </span>
            ) : null}
            <span className={selected ? "font-semibold" : "text-[var(--color-text-secondary)]"}>
              {item.label}
            </span>
            {item.count > 0 ? (
              <span
                className={`tabular-nums ${
                  selected ? "font-semibold" : "text-[var(--color-text-secondary)]"
                } `}
              >
                {item.count > 99 ? "+99" : item.count}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
