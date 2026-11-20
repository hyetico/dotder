"use client";

import { useState } from "react";

import { AppIcon, ListFilter } from "@/components/ui/icon";

import MobileFilterDrawer, {
  type MobileFilterOption,
  type MobileFilterSortOption,
} from "@/components/ui/MobileFilterDrawer";

type MobileFilterMenuProps<T extends string> = {
  label: string;
  activeFilter: T;
  onFilterChange: (filter: T) => void;
  allFilter: T;
  filterOptions: MobileFilterOption<T>[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  sortOptions?: MobileFilterSortOption[];
  defaultSort?: string;
};

/**
 * MobileFilterMenu
 *
 * 좁은 화면에서 필터 드로어를 여는 버튼입니다.
 * 상태나 정렬이 기본이 아니면 점을 표시합니다.
 *
 * @param props - MobileFilterMenu 컴포넌트 Props
 * @param props.label - 버튼과 드로어의 접근 이름
 * @param props.activeFilter - 현재 적용된 상태 필터
 * @param props.onFilterChange - 상태 필터를 적용할 때 실행되는 함수
 * @param props.allFilter - 전체를 뜻하는 필터 값
 * @param props.filterOptions - 드로어에 보여줄 상태 필터
 * @param props.sortValue - 현재 적용된 정렬
 * @param props.onSortChange - 정렬을 적용할 때 실행되는 함수
 * @param props.sortOptions - 드로어에 보여줄 정렬
 * @param props.defaultSort - 기본 정렬. 기본값은 latest
 */
export default function MobileFilterMenu<T extends string>({
  label,
  activeFilter,
  onFilterChange,
  allFilter,
  filterOptions,
  sortValue = "",
  onSortChange,
  sortOptions = [],
  defaultSort = "latest",
}: MobileFilterMenuProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSort = sortOptions.length > 0 && Boolean(onSortChange);
  const hasActiveFilters = activeFilter !== allFilter || (hasSort && sortValue !== defaultSort);

  return (
    <>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[#F1F3F5] p-0.5 min-[1025px]:hidden">
        <button
          type="button"
          aria-label={label}
          aria-expanded={isOpen}
          onClick={() => setIsOpen(true)}
          className={`relative flex size-9 shrink-0 items-center justify-center rounded-[6px] transition-colors ${
            hasActiveFilters
              ? `bg-white text-[var(--color-text)] shadow-sm`
              : `text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]`
          } `}
        >
          <AppIcon icon={ListFilter} size="sm" />

          {hasActiveFilters ? (
            <span
              aria-hidden
              className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]"
            />
          ) : null}
        </button>
      </span>

      <MobileFilterDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        label={label}
        filterOptions={filterOptions}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
        allFilter={allFilter}
        sortOptions={sortOptions}
        sortValue={sortValue}
        onSortChange={onSortChange}
        defaultSort={defaultSort}
      />
    </>
  );
}
