"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

import { useSlidingIndicator } from "@/components/kit/useSlidingIndicator";

import { cn } from "@/lib/cn";

export type TabItem = {
  key: string;
  label: string;
  /** 링크 탭이면 주소 */
  href?: string;
  /** 앞 아이콘 16 (보드 03 상세 탭) */
  icon?: ReactNode;
  /** 뒤 숫자 (보드 03 상세 탭 「목표 4」). 목록 탭에는 넣지 않는다 (REBUILD 6-3) */
  count?: number;
};

type TabsProps = {
  items: TabItem[];
  value: string;
  onChange?: (key: string) => void;
  label: string;
  /** 태블릿 · 모바일에서 아이콘을 숨긴다 (보드 T · M 03 상세 탭) */
  hideIconsBelowLg?: boolean;
  className?: string;
};

function TabContent({ item, hideIcon }: { item: TabItem; hideIcon: boolean }) {
  return (
    <>
      {item.icon ? (
        <span className={cn("inline-flex shrink-0 [&_svg]:size-4", hideIcon && "max-lg:hidden")}>
          {item.icon}
        </span>
      ) : null}
      {item.label}
      {item.count != null ? (
        <span className="font-normal text-[var(--t3)] tabular-nums">{item.count}</span>
      ) : null}
    </>
  );
}

const tabClassName =
  "kit-focus -mb-px inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 border-b-2 text-sm whitespace-nowrap transition-colors";

/**
 * 밑줄 탭 (보드 .tabs). 탭 사이 24 · 높이 40 · 14 --t3, 고른 탭은 --text 600 + 밑줄 2.
 * 목록 탭은 숫자를 넣지 않고(REBUILD 6-3), 상세 탭은 아이콘 16 + 숫자(400 · --t3)를 붙인다(보드 03).
 * 넘치면 가로 스크롤(스크롤바 숨김). 고른 탭을 바꾸면 밑줄이 0.15초 동안 옮겨 간다 (DOC3 14).
 *
 * @example
 * <Tabs label="프로젝트 범위" value="all" items={[{ key: "all", label: "전체", href: "/projects" }]} />
 */
export default function Tabs({
  items,
  value,
  onChange,
  label,
  hideIconsBelowLg = false,
  className,
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const place = useSlidingIndicator(listRef, '[aria-selected="true"]', value);

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className={cn(
        "relative flex [scrollbar-width:none] gap-6 overflow-x-auto border-b border-[var(--border)] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {items.map((item) => {
        const isOn = item.key === value;
        const classes = cn(
          tabClassName,
          // 잰 뒤에는 움직이는 밑줄이 대신 그린다
          isOn
            ? cn(
                "font-semibold text-[var(--text)]",
                place ? "border-transparent" : "border-[var(--text)]",
              )
            : "border-transparent text-[var(--t3)] hover:text-[var(--text)]",
        );

        return item.href ? (
          <Link key={item.key} href={item.href} role="tab" aria-selected={isOn} className={classes}>
            <TabContent item={item} hideIcon={hideIconsBelowLg} />
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
            <TabContent item={item} hideIcon={hideIconsBelowLg} />
          </button>
        );
      })}
      {place ? (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 h-0.5 bg-[var(--text)] transition-[left,width] duration-150 ease-out motion-reduce:duration-0"
          style={{ left: place.left, width: place.width }}
        />
      ) : null}
    </div>
  );
}
