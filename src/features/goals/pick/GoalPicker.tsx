"use client";

import { useRef, useState } from "react";

import { MenuSeparator, PickRow } from "@/components/kit/Menu";
import Popover from "@/components/kit/Popover";
import { ChevronDown } from "@/components/ui/icon";

import { cn } from "@/lib/cn";

import type { Goal } from "@/features/goals/types/goal";

type GoalPickerProps = {
  goals: Goal[];
  /** 고른 목표 id. null은 「목표 없음」 */
  value: number | null;
  onChange: (goalId: number | null) => void;
  /** field: 입력칸 모양 (보드 05-a) · row: 상세 드로어 속성 줄 (보드 05-b) */
  variant?: "field" | "row";
};

/**
 * 목표 고르기 (프로토타입 taskForm data-gsel). 칸 폭 목록(모바일 시트)에서 목표 · 「목표 없음」.
 */
export default function GoalPicker({ goals, value, onChange, variant = "field" }: GoalPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = goals.find((goal) => goal.id === value) ?? null;
  const pick = (goalId: number | null) => {
    onChange(goalId);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`목표 ${current?.title ?? "목표 없음"}`}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "kit-focus flex w-full min-w-0 cursor-pointer items-center gap-2 text-left text-sm",
          variant === "field"
            ? "h-10 rounded-[var(--radius-sm)] border border-[var(--input-line)] bg-[var(--surface)] px-3 hover:border-[var(--input-line-h)] max-md:h-12"
            : "-ml-2.5 min-h-9 rounded-[var(--radius-sm)] px-2.5 hover:bg-[var(--s3)]",
        )}
      >
        <span
          className={cn(
            "min-w-0 truncate",
            variant === "field" && "flex-1",
            !current && "text-[var(--t3)]",
          )}
        >
          {current?.title ?? "목표 없음"}
        </span>
        <ChevronDown size={16} aria-hidden className="shrink-0 text-[var(--t3)]" />
      </button>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        anchorRef={buttonRef}
        title="목표"
        width={variant === "field" ? "anchor" : 220}
        role="listbox"
      >
        <div className="flex max-h-80 flex-col overflow-y-auto">
          {goals.map((goal) => (
            <PickRow key={goal.id} selected={goal.id === value} onSelect={() => pick(goal.id)}>
              {goal.title}
            </PickRow>
          ))}
          {goals.length ? <MenuSeparator /> : null}
          <PickRow selected={value == null} onSelect={() => pick(null)}>
            목표 없음
          </PickRow>
        </div>
      </Popover>
    </>
  );
}
