"use client";

import { useRef, type KeyboardEvent } from "react";

import { cn } from "@/lib/cn";
import {
  PROJECT_COLOR_KEYS,
  PROJECT_PALETTE,
  projectColorVar,
  type ProjectColorKey,
} from "@/lib/projectPalette";

type ColorSwatchesProps = {
  value: ProjectColorKey;
  onChange: (value: ProjectColorKey) => void;
  /** 라벨 id (`aria-labelledby`) */
  labelledBy?: string;
};

/**
 * 프로젝트 색 칸 (보드 01-a). 칸 28 · 모서리 8 · 바탕 tint · 테두리 --border · 가운데 점 10,
 * 고른 칸은 2px 띄운 2px --primary 링 · 칸 사이 6. 모든 기기에서 한 줄 10개 (REBUILD 3-0 · 보드 01-a).
 * 라디오 묶음: Tab 한 번에 들어오고 ← → ↑ ↓로 옮기며 고른다.
 *
 * @example
 * <ColorSwatches value={color} onChange={setColor} labelledBy={labelId} />
 */
export default function ColorSwatches({ value, onChange, labelledBy }: ColorSwatchesProps) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const keys = PROJECT_COLOR_KEYS;

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    const step = ["ArrowRight", "ArrowDown"].includes(event.key)
      ? 1
      : ["ArrowLeft", "ArrowUp"].includes(event.key)
        ? -1
        : 0;

    if (!step) {
      return;
    }

    event.preventDefault();
    const next = (index + step + keys.length) % keys.length;
    onChange(keys[next]);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-1.5">
      {keys.map((key, index) => {
        const isOn = key === value;

        return (
          <button
            key={key}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={isOn}
            aria-label={PROJECT_PALETTE[key].label}
            title={PROJECT_PALETTE[key].label}
            tabIndex={isOn ? 0 : -1}
            onClick={() => onChange(key)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              "kit-focus inline-flex size-7 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--border)]",
              isOn && "shadow-[0_0_0_2px_var(--surface),0_0_0_4px_var(--primary)]",
            )}
            style={{ backgroundColor: projectColorVar(key, "tint") }}
          >
            <span
              aria-hidden
              className="size-2.5 rounded-full"
              style={{ backgroundColor: projectColorVar(key) }}
            />
          </button>
        );
      })}
    </div>
  );
}
