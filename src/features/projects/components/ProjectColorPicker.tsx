"use client";

import { useRef, type KeyboardEvent } from "react";

import { PROJECT_COLOR_OPTIONS } from "@/features/projects/utils/projectColors";

import { projectColorVar, type ProjectColorKey } from "@/lib/projectPalette";

type ProjectColorPickerProps = {
  value: ProjectColorKey;
  onChange: (value: ProjectColorKey) => void;
  /** 읽는 이름. 예: "색상" */
  label: string;
  /** 라벨과 이어 줄 id (`aria-labelledby`). */
  labelledBy?: string;
};

// 웹 · 태블릿: 칸 28 · 한 줄 10개(폭 334) / 모바일: 칸 44 · 5개씩 2줄 · 간격 6 (원본 01a)
const pickerClassName = "grid w-fit grid-cols-5 gap-1.5 md:flex";
const swatchClassName =
  "flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] md:size-7";

const NEXT_KEYS = ["ArrowRight", "ArrowDown"];
const PREV_KEYS = ["ArrowLeft", "ArrowUp"];

/**
 * 프로젝트 색 고르기 칸 (원본 01a · Components 04). 10색 중 하나를 꼭 고른다.
 *
 * 칸 바탕은 그 색의 tint, 가운데 색 점 10, 고르면 그 색 테두리 2. 라디오 묶음이라 Tab으로 한 번 들어오고
 * ← → (↑ ↓)로 옮기며 고른다.
 *
 * @example
 * <ProjectColorPicker label="색상" value={color} onChange={setColor} />
 */
export default function ProjectColorPicker({
  value,
  onChange,
  label,
  labelledBy,
}: ProjectColorPickerProps) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = NEXT_KEYS.includes(event.key) ? 1 : PREV_KEYS.includes(event.key) ? -1 : 0;

    if (step === 0) {
      return;
    }

    event.preventDefault();
    const nextIndex = (index + step + PROJECT_COLOR_OPTIONS.length) % PROJECT_COLOR_OPTIONS.length;
    onChange(PROJECT_COLOR_OPTIONS[nextIndex].value);
    buttonRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      className={pickerClassName}
    >
      {PROJECT_COLOR_OPTIONS.map((option, index) => {
        const isSelected = option.value === value;

        return (
          <button
            key={option.value}
            ref={(node) => {
              buttonRefs.current[index] = node;
            }}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
            title={option.label}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={swatchClassName}
            style={{
              backgroundColor: projectColorVar(option.value, "tint"),
              borderColor: isSelected ? projectColorVar(option.value) : "transparent",
            }}
          >
            <span
              aria-hidden
              className="size-2.5 rounded-full"
              style={{ backgroundColor: projectColorVar(option.value) }}
            />
          </button>
        );
      })}
    </div>
  );
}
