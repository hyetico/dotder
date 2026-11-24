"use client";

import type { ReactNode } from "react";

const pillMutedColor = "var(--color-text-muted)";
const pillButtonClassName =
  "text-body inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border-0 px-3 font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none";

export type StatusFilterChipItem<T extends string> = {
  id: T;
  label: string;
  count: number;
  icon: ReactNode;
  iconColor: string;
};

type StatusFilterChipsProps<T extends string> = {
  items: StatusFilterChipItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  pill?: boolean;
};

type StatusFilterChipButtonProps<T extends string> = {
  item: StatusFilterChipItem<T>;
  selected?: boolean;
  expanded?: boolean;
  role?: "radio";
  onClick?: () => void;
  className?: string;
  hideIconOnMobile?: boolean;
  grouped?: boolean;
  framed?: boolean;
  pill?: boolean;
};

/**
 * StatusFilterChipButton
 *
 * 상태 하나와 개수를 웹 필터 버튼 모양으로 보여줍니다.
 *
 * @param props - StatusFilterChipButton 컴포넌트 Props
 * @param props.item - 표시할 상태와 개수
 * @param props.selected - 고른 상태인지 여부
 * @param props.expanded - 이 버튼으로 연 패널이 열려 있는지 여부
 * @param props.role - 라디오 그룹 안에서 쓸 때 radio
 * @param props.onClick - 버튼을 누를 때 실행되는 함수. 없으면 표시만 합니다
 * @param props.className - 추가로 덮어쓸 클래스
 * @param props.hideIconOnMobile - 모바일에서 상태 아이콘을 숨길지 여부
 * @param props.grouped - 회색 그룹 안에 둘 때 테두리 없이 선택만 흰 바탕으로 띄울지 여부
 * @param props.framed - 회색 바탕 안에 흰 버튼을 두어 보기 전환과 같은 모양으로 보일지 여부
 * @param props.pill - grouped와 함께 쓰면 그룹 바탕 없이 알약 버튼으로 보이고, 고른 항목만 진한 글자와 상태 색 아이콘을 쓸지 여부
 */
export function StatusFilterChipButton<T extends string>({
  item,
  selected = false,
  expanded,
  role,
  onClick,
  className = "",
  hideIconOnMobile = false,
  grouped = false,
  framed = false,
  pill = false,
}: StatusFilterChipButtonProps<T>) {
  const Tag = onClick ? "button" : "div";
  const isPill = pill && grouped;

  const control = (
    <Tag
      type={onClick ? "button" : undefined}
      role={role}
      aria-checked={role === "radio" ? selected : undefined}
      aria-expanded={role === "radio" ? undefined : expanded}
      aria-pressed={role === "radio" || !onClick ? undefined : selected}
      onClick={onClick}
      className={
        isPill
          ? `${pillButtonClassName} ${selected ? "bg-white text-[var(--color-text)] shadow-sm" : "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-soft)]"} ${className}`
          : `text-body inline-flex shrink-0 items-center gap-1.5 ${
              framed || grouped
                ? "rounded-[6px] border-0 px-2.5"
                : "rounded-[var(--radius-sm)] border px-3"
            } font-medium whitespace-nowrap text-[var(--color-text)] transition-[background-color,box-shadow] focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none ${
              framed
                ? `h-9 bg-white shadow-sm`
                : grouped
                  ? `h-8 border-transparent ${
                      selected ? `bg-white shadow-sm` : `bg-transparent hover:bg-white/80`
                    } `
                  : `h-9 border-[var(--color-border)] bg-white ${
                      selected
                        ? `shadow-[0_1px_2px_rgba(15,23,42,0.08),0_1px_3px_rgba(15,23,42,0.06)]`
                        : "hover:bg-[var(--color-hover-soft)]"
                    } `
            } ${className} `
      }
    >
      {item.icon ? (
        <span
          className={`inline-flex size-4 shrink-0 items-center justify-center ${hideIconOnMobile ? "max-lg:hidden" : ""} `}
          style={{
            color: isPill && !selected ? pillMutedColor : item.iconColor,
          }}
        >
          {item.icon}
        </span>
      ) : null}
      <span className={isPill && selected ? "font-semibold" : undefined}>{item.label}</span>
      <span
        className={`tabular-nums ${isPill ? (selected ? "font-semibold" : "") : "text-[var(--color-text-secondary)]"}`}
      >
        {item.count > 99 ? "+99" : item.count}
      </span>
    </Tag>
  );

  if (!framed) {
    return control;
  }

  return (
    <div className="inline-flex h-10 shrink-0 items-center rounded-[var(--radius-sm)] bg-[var(--color-hover)] p-0.5">
      {control}
    </div>
  );
}

/**
 * StatusFilterChips
 *
 * 상태를 하나만 고르는 데스크톱 필터입니다.
 * 칩은 회색 그룹 안에 두고, 고른 항목만 흰 바탕과 그림자로 띄웁니다.
 * pill을 켜면 그룹 바탕 없이 알약 버튼만 놓고, 고른 항목만 진한 글자와 상태 색 아이콘을 씁니다.
 *
 * @param props - StatusFilterChips 컴포넌트 Props
 * @param props.items - 표시할 상태. 아이콘은 currentColor를 따릅니다
 * @param props.value - 현재 선택된 상태
 * @param props.onChange - 상태를 고를 때 실행되는 함수
 * @param props.label - 필터 묶음의 접근 이름. 기본값은 상태
 * @param props.pill - 그룹 바탕 없이 알약 버튼으로 보이고, 고른 항목만 진한 글자와 상태 색 아이콘을 쓸지 여부
 */
export default function StatusFilterChips<T extends string>({
  items,
  value,
  onChange,
  label = "상태",
  pill = false,
}: StatusFilterChipsProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={
        pill
          ? "inline-flex max-w-full min-w-0 flex-wrap items-center gap-1.5"
          : "inline-flex max-w-full min-w-0 flex-wrap items-center gap-0.5 rounded-[var(--radius-sm)] bg-[var(--color-hover)] p-0.5"
      }
    >
      {items.map((item) => {
        const selected = item.id === value;

        return (
          <StatusFilterChipButton
            key={item.id}
            item={item}
            selected={selected}
            grouped
            pill={pill}
            role="radio"
            onClick={() => onChange(item.id)}
          />
        );
      })}
    </div>
  );
}
