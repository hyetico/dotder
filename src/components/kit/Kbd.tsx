import { cn } from "@/lib/cn";

import type { ReactNode } from "react";

type KbdProps = {
  children: ReactNode;
  /** 늘 보이게 한다 (단축키 안내 창 목록). 기본은 부모에 마우스 · 키보드 초점이 갈 때만 보인다 */
  keep?: boolean;
  className?: string;
};

/**
 * 단축키 표시 (보드 .kbd · REBUILD 5-3). 테두리 --border(아래 2) · 모서리 4 · 좌우 4 · 12/16 --t3.
 * 평소 숨기고, 부모에 마우스를 올리거나 키보드 초점이 갈 때만 보인다(`globals.css` .kit-kbd).
 *
 * @example
 * <button>검색 <Kbd>⌘K</Kbd></button>
 */
export default function Kbd({ children, keep = false, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "kit-kbd rounded-[var(--radius-kbd)] border border-b-2 border-[var(--border)] bg-[var(--surface)] px-1 font-sans text-xs leading-4 text-[var(--t3)]",
        keep && "keep",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
