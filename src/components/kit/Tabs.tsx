"use client";

import Link from "next/link";

import { cn } from "@/lib/cn";

export type TabItem = {
  key: string;
  label: string;
  /** 링크 탭이면 주소 */
  href?: string;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange?: (key: string) => void;
  label: string;
  className?: string;
};

const tabClassName =
  "kit-focus -mb-px inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 border-b-2 text-sm whitespace-nowrap transition-colors";

/**
 * 밑줄 탭 (보드 .tabs). 탭 사이 24 · 높이 40 · 14 --t3, 고른 탭은 --text 600 + 밑줄 2.
 * 숫자는 넣지 않는다 (REBUILD 6-3). 넘치면 가로 스크롤(스크롤바 숨김).
 *
 * @example
 * <Tabs label="프로젝트 범위" value="all" items={[{ key: "all", label: "전체", href: "/projects" }]} />
 */
export default function Tabs({ items, value, onChange, label, className }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "flex [scrollbar-width:none] gap-6 overflow-x-auto border-b border-[var(--border)] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {items.map((item) => {
        const isOn = item.key === value;
        const classes = cn(
          tabClassName,
          isOn
            ? "border-[var(--text)] font-semibold text-[var(--text)]"
            : "border-transparent text-[var(--t3)] hover:text-[var(--text)]",
        );

        return item.href ? (
          <Link key={item.key} href={item.href} role="tab" aria-selected={isOn} className={classes}>
            {item.label}
          </Link>
        ) : (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={isOn}
            onClick={() => onChange?.(item.key)}
            className={classes}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
