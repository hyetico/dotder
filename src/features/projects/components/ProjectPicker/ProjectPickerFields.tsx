"use client";

import type { ReactNode } from "react";

import SearchInput from "@/components/ui/input/SearchInput";
import type { StatusFilterChipItem } from "@/components/ui/StatusFilterChips";
import StatusFilterPills from "@/components/ui/StatusFilterPills";

type ProjectPickerFieldsProps<T extends string> = {
  query: string;
  onQueryChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  leading?: ReactNode;
  statusItems: StatusFilterChipItem<T>[];
  status: T;
  onStatusChange: (value: T) => void;
  statusLabel: string;
  note?: string;
};

/**
 * ProjectPickerFields
 *
 * 검색창과 상태 필터, 안내 문구를 모달 상단에 둡니다.
 *
 * @param props - ProjectPickerFields 컴포넌트 Props
 * @param props.query - 입력된 검색어
 * @param props.onQueryChange - 검색어가 바뀔 때 실행되는 함수
 * @param props.placeholder - 검색창에 보여줄 문구
 * @param props.ariaLabel - 검색창의 접근 이름
 * @param props.leading - 검색 아이콘 옆에 둘 내용
 * @param props.statusItems - 상태 필터 항목
 * @param props.status - 현재 고른 상태
 * @param props.onStatusChange - 상태를 고를 때 실행되는 함수
 * @param props.statusLabel - 상태 필터의 접근 이름
 * @param props.note - 필터 아래 안내 문구
 */
export default function ProjectPickerFields<T extends string>({
  query,
  onQueryChange,
  placeholder,
  ariaLabel,
  leading,
  statusItems,
  status,
  onStatusChange,
  statusLabel,
  note,
}: ProjectPickerFieldsProps<T>) {
  return (
    <div className="space-y-3">
      <SearchInput
        value={query}
        onChange={onQueryChange}
        placeholder={placeholder}
        ariaLabel={ariaLabel}
        leading={leading}
      />
      <StatusFilterPills
        label={statusLabel}
        items={statusItems}
        value={status}
        onChange={onStatusChange}
      />
      {note ? <p className="text-caption text-[var(--color-text-secondary)]">{note}</p> : null}
    </div>
  );
}
