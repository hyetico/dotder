"use client";

import { useRef, useState } from "react";

import { PickRow } from "@/components/kit/Menu";
import Popover from "@/components/kit/Popover";
import { ChevronDown, ChevronRight } from "@/components/ui/icon";

import { cn } from "@/lib/cn";

type SelectProps<T extends string> = {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
  /** 읽는 이름 · 모바일 시트 제목 */
  label: string;
  /** field: 입력칸 모양 · text: 값 글 + › (보드 T · M 12 설정 줄) */
  variant?: "field" | "text";
  className?: string;
};

/**
 * 고르기 칸 (보드 12 「시작 화면」 · 「날짜 형식」). 입력칸 모양 40(모바일 48) · ▾ 오른쪽 끝,
 * 누르면 칸 폭 목록(모바일 시트)에서 고른다. 브라우저 기본 select는 쓰지 않는다.
 *
 * @example
 * <Select label="시작 화면" value={start} onChange={setStart} options={[{ value: "projects", label: "프로젝트" }]} />
 */
export default function Select<T extends string>({
  value,
  onChange,
  options,
  label,
  variant = "field",
  className,
}: SelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const current = options.find((option) => option.value === value);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`${label} ${current?.label ?? ""}`}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "kit-focus flex min-w-0 cursor-pointer items-center gap-2 text-left text-sm",
          variant === "field"
            ? "h-10 w-full rounded-[var(--radius-sm)] border border-[var(--input-line)] bg-[var(--surface)] px-3 transition-[border-color] hover:border-[var(--input-line-h)] max-md:h-12"
            : "h-9 rounded-[var(--radius-xs)] text-[var(--t2)]",
          className,
        )}
      >
        <span className={cn("min-w-0 truncate", variant === "field" && "flex-1")}>
          {current?.label}
        </span>
        {variant === "field" ? (
          <ChevronDown size={16} aria-hidden className="shrink-0 text-[var(--t3)]" />
        ) : (
          <ChevronRight size={16} aria-hidden className="shrink-0" />
        )}
      </button>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        anchorRef={buttonRef}
        title={label}
        width={variant === "field" ? "anchor" : 200}
        align={variant === "field" ? "start" : "end"}
        role="listbox"
      >
        {options.map((option) => (
          <PickRow
            key={option.value}
            selected={option.value === value}
            onSelect={() => {
              onChange(option.value);
              setIsOpen(false);
            }}
          >
            {option.label}
          </PickRow>
        ))}
      </Popover>
    </>
  );
}
