"use client";

import { Fragment } from "react";

import { iconStroke, type LucideIcon } from "@/components/ui/icon";

export type SegmentedIconToggleItem<T extends string> = {
  id: T;
  label: string;
  icon: LucideIcon;
};

type SegmentedIconToggleProps<T extends string> = {
  label: string;
  value: T;
  items: SegmentedIconToggleItem<T>[];
  onChange: (value: T) => void;
};

const viewTrackClassName =
  "flex h-11 shrink-0 items-center rounded-[22px] border border-[var(--color-border)] bg-white p-1";

const viewDividerClassName = "h-5 w-px shrink-0 bg-[var(--color-border-strong)]";

/**
 * viewSegmentClassName
 *
 * 보기 전환에서 바깥쪽만 둥글고 가운데 구분선 쪽은 각진 반쪽 칸 클래스를 만듭니다.
 *
 * @param isActive - 이 보기가 선택됐는지 여부
 * @param side - 왼쪽 칸인지 오른쪽 칸인지
 * @returns 칸 버튼 클래스
 */
function viewSegmentClassName(isActive: boolean, side: "left" | "right") {
  const radius =
    side === "left" ? "rounded-l-[18px] rounded-r-none" : "rounded-l-none rounded-r-[18px]";

  return [
    "inline-flex h-9 w-14 shrink-0 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none",
    radius,
    isActive
      ? "bg-[var(--color-hover)] text-[var(--color-text)]"
      : "text-[var(--color-text-muted)] hover:bg-[var(--color-hover-soft)]",
  ].join(" ");
}

/**
 * SegmentedIconToggle
 *
 * 보기 전환을 높이 44px 알약 안에 아이콘 칸으로 보여 줍니다.
 * 칸 사이에는 세로 구분선이 있고, 선택된 칸 배경은 --color-hover입니다.
 *
 * @param props - SegmentedIconToggle 컴포넌트 Props
 * @param props.label - 보기 묶음의 접근 이름
 * @param props.value - 현재 보기
 * @param props.items - 고를 수 있는 보기
 * @param props.onChange - 보기를 바꿀 때 실행되는 함수
 */
export default function SegmentedIconToggle<T extends string>({
  label,
  value,
  items,
  onChange,
}: SegmentedIconToggleProps<T>) {
  return (
    <div className={viewTrackClassName} role="group" aria-label={label}>
      {items.map((item, index) => {
        const Icon = item.icon;
        const isActive = value === item.id;
        const side = index === 0 ? "left" : "right";

        return (
          <Fragment key={item.id}>
            {index > 0 ? <span aria-hidden className={viewDividerClassName} /> : null}
            <button
              type="button"
              aria-pressed={isActive}
              onClick={() => onChange(item.id)}
              aria-label={item.label}
              className={viewSegmentClassName(isActive, side)}
            >
              <Icon size={16} strokeWidth={iconStroke} aria-hidden />
            </button>
          </Fragment>
        );
      })}
    </div>
  );
}
