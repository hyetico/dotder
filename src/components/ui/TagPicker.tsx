"use client";

import { cn } from "@/lib/cn";

type TagPickerProps = {
  /** 고를 수 있는 태그 (프로젝트 태그) */
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  /** 최대 개수. 다 고르면 나머지는 누를 수 없다 */
  max?: number;
  /** 라벨 (옆에 「n / max」) */
  label?: string;
  /** 고를 태그가 없을 때 안내 */
  emptyText?: string;
};

/**
 * 태그 고르기 (보드 04-a · 04-b · 프로토타입 goalTagField). 라벨 14 --t2 + 「n / 2」 12 --t3,
 * 아래 줄 칩 28 · 좌우 10 · 사이 6, 고른 칩은 --primary 바탕. 다 고르면 나머지 칩은 누를 수 없다.
 *
 * @example
 * <TagPicker label="태그" options={project.tags} value={tags} onChange={setTags} max={2} />
 */
export default function TagPicker({
  options,
  value,
  onChange,
  max = 2,
  label = "태그",
  emptyText,
}: TagPickerProps) {
  const toggle = (tag: string) =>
    onChange(value.includes(tag) ? value.filter((item) => item !== tag) : [...value, tag]);

  return (
    <div role="group" aria-label={label} className="flex flex-col gap-2">
      <div className="flex items-baseline gap-1.5">
        <span className="text-sm font-medium">{label}</span>
        {options.length > 0 ? (
          <span className="text-xs text-[var(--t3)] tabular-nums">
            {value.length} / {max}
          </span>
        ) : null}
      </div>
      {options.length === 0 ? (
        emptyText ? (
          <p className="text-xs text-[var(--t3)]">{emptyText}</p>
        ) : null
      ) : (
        <div className="flex flex-wrap items-center gap-1.5">
          {options.map((tag) => {
            const isOn = value.includes(tag);
            const isFull = !isOn && value.length >= max;

            return (
              <button
                key={tag}
                type="button"
                aria-pressed={isOn}
                disabled={isFull}
                onClick={() => toggle(tag)}
                className={cn(
                  "kit-focus inline-flex h-7 cursor-pointer items-center rounded-full border px-2.5 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  isOn
                    ? "border-[var(--chip-on-line)] bg-[var(--chip-on-bg)] font-semibold text-[var(--chip-on-fg)]"
                    : "border-[var(--border)] bg-[var(--surface)] text-[var(--t2)] hover:border-[var(--border-2)]",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
