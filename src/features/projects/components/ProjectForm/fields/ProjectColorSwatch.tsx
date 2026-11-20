"use client";

import { type ReactNode } from "react";

/**
 * ProjectColorSwatch
 *
 * 프로젝트 색상 칩을 그리고, 선택된 칩에는 입력칸 포커스와 같은 테두리를 둡니다.
 *
 * @param props - ProjectColorSwatch 컴포넌트 Props
 * @param props.selected - 이 색이 선택된 상태인지 여부
 * @param props.label - 버튼 접근 이름
 * @param props.onClick - 색을 고르거나 해제할 때 실행되는 함수
 * @param props.children - 안에 둘 색상 뱃지
 */
export function ProjectColorSwatch({
  selected,
  label,
  onClick,
  children,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className="relative inline-flex w-fit shrink-0 p-0 transition-transform hover:scale-105"
    >
      <span
        className={`relative inline-flex rounded-[var(--radius-sm)] ${selected ? "shadow-[0_0_0_var(--selected-border-width)_var(--color-selected-border)]" : ""} `}
      >
        {children}
      </span>
    </button>
  );
}
