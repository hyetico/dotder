import { cn } from "@/lib/cn";

import type { ReactNode } from "react";

type KbdProps = {
  children: ReactNode;
  className?: string;
};

/**
 * 단축키 표시 (보드 .kbd). 테두리 --border(아래 2) · 모서리 4 · 좌우 4 · 12/16 --t3.
 * 쓰는 곳은 빠른 입력의 「Enter ↵」(입력 중에만)와 단축키 안내 창 목록뿐이다 (REBUILD 6 · 11.25).
 * 호버 때 나타나는 단축키(⌘K · N 등)는 두지 않는다.
 *
 * @example
 * {value ? <Kbd>Enter ↵</Kbd> : null}
 */
export default function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "rounded-[var(--radius-kbd)] border border-b-2 border-[var(--border)] bg-[var(--surface)] px-1 font-sans text-xs leading-4 text-[var(--t3)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
