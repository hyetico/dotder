"use client";

import { useLayoutEffect, useRef } from "react";

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
        // 모바일 입력칸은 48 (보드 M 01-a · 03-a · 03-g)
        size === "md" ? "h-10 max-md:h-12" : "h-9",
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
  /** 최소 높이: 기본 96 · detail 88 (보드 05-b) · md 80 (보드 03-g) · sm 64 (보드 04-b). 모바일은 모두 72 */
  minSize?: "md" | "sm" | "detail";
  ref?: Ref<HTMLTextAreaElement>;
};

/**
 * 여러 줄 입력칸 (보드 .input.ta). 최소 96 · 위아래 10 · 좌우 12, 크기 조절 손잡이 없음.
 *
 * @example
 * <TextArea id={id} placeholder="어떤 프로젝트인지 적어 두세요" maxLength={500} />
 */
export function TextArea({ invalid = false, minSize, className, ref, ...props }: TextAreaProps) {
  return (
    <span
      className={cn(
        boxClassName,
        stateClassName(invalid),
        disabledClassName,
        // 바깥은 좌우 12만, 위아래 10은 안쪽 글 상자가 가진다 (REBUILD 6 · 눌러도 바로 쓸 수 있게)
        "items-stretch px-3",
        className,
      )}
    >
      <textarea
        ref={ref}
        aria-invalid={invalid || undefined}
        // 최소 높이 = 바깥 칸(96 · 88 · 80 · 64, 모바일 72) − 테두리 2
        className={cn(
          fieldClassName,
          "resize-none py-2.5 max-md:min-h-17.5",
          minSize === "sm"
            ? "min-h-15.5"
            : minSize === "md"
              ? "min-h-19.5"
              : minSize === "detail"
                ? "min-h-21.5"
                : "min-h-23.5",
        )}
        {...props}
      />
    </span>
  );
}

type GrowingInputProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "rows"> & {
  value: string;
  invalid?: boolean;
};

/**
 * 한 줄 입력칸처럼 보이지만 글이 넘치면 높이가 늘어나는 칸 (REBUILD 6 프로젝트 이름).
 * 40(모바일 48)에서 시작하고, Enter는 줄을 바꾸지 않고 폼을 보낸다.
 *
 * @example
 * <GrowingInput id={id} value={name} maxLength={50} onChange={(e) => setName(e.target.value)} />
 */
export function GrowingInput({
  invalid = false,
  className,
  value,
  onKeyDown,
  ...props
}: GrowingInputProps) {
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const field = fieldRef.current;

    if (!field) {
      return;
    }

    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  }, [value]);

  return (
    <span
      className={cn(
        boxClassName,
        stateClassName(invalid),
        disabledClassName,
        "items-stretch px-3",
        className,
      )}
    >
      <textarea
        ref={fieldRef}
        rows={1}
        value={value}
        aria-invalid={invalid || undefined}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.key === "Enter" && !event.nativeEvent.isComposing && !event.defaultPrevented) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        // 칸 40 − 테두리 2 = 글 20 + 위아래 9 (모바일 48 → 13)
        className={cn(fieldClassName, "resize-none overflow-hidden py-2.25 max-md:py-3.25")}
        {...props}
      />
    </span>
  );
}
