"use client";

import { useState, type Ref } from "react";

import Kbd from "@/components/kit/Kbd";
import { Plus } from "@/components/ui/icon";

import { cn } from "@/lib/cn";

type QuickAddInputProps = {
  /** Enter로 보낸 글 (앞뒤 빈칸을 뺀 값, 비어 있으면 부르지 않는다) */
  onSubmit: (value: string) => void;
  /** 안내 글. `QUICK_ADD_PLACEHOLDER`에서 가져온다 */
  placeholder: string;
  /** 읽는 이름 */
  ariaLabel: string;
  /** 40(md) · 36(sm) */
  size?: "md" | "sm";
  /** field: 입력칸 모양 · row: 테두리 없는 줄(md 40 목표 상세 태스크 목록 · sm 24 메모 카드 · 보드 04-b · 07) */
  variant?: "field" | "row";
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
};

/**
 * 빠른 입력 줄 (프로토타입 data-quick · REBUILD 5-3). + 아이콘 · 입력 · 「Enter ↵」.
 * 「Enter ↵」는 글자가 있을 때만 보인다. Enter로 보내면 칸을 비우고 초점은 그대로 남는다.
 *
 * @example
 * <QuickAddInput placeholder={QUICK_ADD_PLACEHOLDER.task} ariaLabel="태스크 추가" onSubmit={add} />
 */
export default function QuickAddInput({
  onSubmit,
  placeholder,
  ariaLabel,
  size = "md",
  variant = "field",
  inputRef,
  className,
}: QuickAddInputProps) {
  const [value, setValue] = useState("");

  return (
    <label
      className={cn(
        "flex w-full min-w-0 items-center gap-2 text-sm text-[var(--text)]",
        variant === "row"
          ? cn(
              "rounded-[var(--radius-xs)] focus-within:bg-[var(--s2)]",
              // 목록 끝 줄 40 · 카드 안 한 줄 24 (보드 07 「생각 적기」)
              size === "md" ? "h-10" : "h-6",
            )
          : cn(
              "rounded-[var(--radius-sm)] border border-[var(--input-line)] bg-[var(--surface)] px-3 transition-[border-color,box-shadow] focus-within:border-[var(--primary)] focus-within:shadow-[0_0_0_3px_var(--input-ring)] hover:border-[var(--input-line-h)]",
              size === "md" ? "h-10" : "h-9",
            ),
        className,
      )}
    >
      <Plus size={16} aria-hidden className="shrink-0 text-[var(--t3)]" />
      <input
        ref={inputRef}
        value={value}
        aria-label={ariaLabel}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          // 한글 조합 중 Enter는 글자 확정이라 보내지 않는다
          if (event.key !== "Enter" || event.nativeEvent.isComposing) {
            return;
          }

          event.preventDefault();
          const text = value.trim();

          if (text) {
            onSubmit(text);
            setValue("");
          }
        }}
        className="kit-input h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--t3)]"
      />
      {value.trim() ? <Kbd>Enter ↵</Kbd> : null}
    </label>
  );
}
