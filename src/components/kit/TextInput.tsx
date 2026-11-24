import { cn } from "@/lib/cn";

import type { InputHTMLAttributes, ReactNode, Ref, TextareaHTMLAttributes } from "react";

// 보드 .input: 높이 40(sm 36) · 좌우 12 · 모서리 8 · 14 · 테두리 --input-line(호버 --input-line-h)
// 초점은 --primary 테두리 + 3px 링, 오류는 --bad, 못 쓰면 --s2 바탕 · --t4 글자
const boxClassName =
  "flex min-w-0 w-full items-center gap-2 rounded-[var(--radius-sm)] border bg-[var(--surface)] text-sm text-[var(--text)] transition-[border-color,box-shadow]";
const stateClassName = (invalid: boolean) =>
  invalid
    ? "border-[var(--bad)] focus-within:shadow-[0_0_0_3px_var(--input-ring-bad)]"
    : "border-[var(--input-line)] hover:border-[var(--input-line-h)] focus-within:border-[var(--primary)] focus-within:shadow-[0_0_0_3px_var(--input-ring)]";
const disabledClassName =
  "has-[:disabled]:border-[var(--input-line)] has-[:disabled]:bg-[var(--s2)] has-[:disabled]:text-[var(--t4)]";
const fieldClassName =
  "kit-input min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-[var(--t3)] disabled:cursor-not-allowed";

type TextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** 높이 40(md) · 36(sm). 기본 md */
  size?: "md" | "sm";
  /** 오류 표시 (테두리 --bad, `aria-invalid`) */
  invalid?: boolean;
  /** 왼쪽 아이콘 등 */
  leading?: ReactNode;
  ref?: Ref<HTMLInputElement>;
};

/**
 * 한 줄 입력칸 (보드 .input). 안내 글은 글자를 입력할 때만 사라진다.
 *
 * @example
 * <TextInput id={id} placeholder="예: 포트폴리오 리뉴얼" maxLength={50} invalid={!!error} />
 */
export function TextInput({
  size = "md",
  invalid = false,
  leading,
  className,
  ref,
  ...props
}: TextInputProps) {
  return (
    <span
      className={cn(
        boxClassName,
        stateClassName(invalid),
        disabledClassName,
        size === "md" ? "h-10" : "h-9",
        "px-3",
        className,
      )}
    >
      {leading}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(fieldClassName, "h-full")}
        {...props}
      />
    </span>
  );
}

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
};

/**
 * 여러 줄 입력칸 (보드 .input.ta). 최소 96 · 위아래 10 · 좌우 12, 크기 조절 손잡이 없음.
 *
 * @example
 * <TextArea id={id} placeholder="어떤 프로젝트인지 적어 두세요" maxLength={500} />
 */
export function TextArea({ invalid = false, className, ref, ...props }: TextAreaProps) {
  return (
    <span
      className={cn(
        boxClassName,
        stateClassName(invalid),
        disabledClassName,
        "min-h-24 items-start px-3 py-2.5",
        className,
      )}
    >
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(fieldClassName, "min-h-18.5 resize-none")}
        {...props}
      />
    </span>
  );
}
