"use client";

import type { ReactNode } from "react";

import FilterButton, { FilterButtonGroup } from "@/components/ui/FilterButton";

import { getStatusFilterTone } from "@/lib/statusColors";

export type FilterStatItem<T extends string> = {
  id: T;
  label: string;
  value: number;
  icon?: ReactNode;
};

type StatFilterButtonsProps<T extends string> = {
  items: FilterStatItem<T>[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
  allFilter: T;
  size?: "sm" | "md";
};

/**
 * StatFilterButtons
 *
 * 개수가 붙은 상태 필터 버튼을 한 줄로 표시합니다.
 * 선택된 필터를 다시 누르면 전체로 돌아갑니다.
 *
 * @param props - StatFilterButtons 컴포넌트 Props
 * @param props.items - 표시할 필터 항목
 * @param props.activeFilter - 현재 선택된 필터
 * @param props.onFilterChange - 필터를 바꿀 때 실행되는 함수
 * @param props.allFilter - 선택을 해제할 때 돌아갈 전체 필터
 * @param props.size - 필터 버튼 크기. 기본값은 sm
 */
export default function StatFilterButtons<T extends string>({
  items,
  activeFilter,
  onFilterChange,
  allFilter,
  size = "sm",
}: StatFilterButtonsProps<T>) {
  return (
    <FilterButtonGroup className={size === "sm" ? "gap-1" : "gap-1.5"}>
      {items.map((item) => (
        <FilterButton
          key={item.id}
          size={size}
          tone={getStatusFilterTone(item.id)}
          selected={activeFilter === item.id}
          count={item.value}
          icon={item.icon}
          onClick={() => onFilterChange(activeFilter === item.id ? allFilter : item.id)}
        >
          {item.label}
        </FilterButton>
      ))}
    </FilterButtonGroup>
  );
}
