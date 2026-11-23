"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CalendarDays, ListTodo } from "@/components/ui/icon";
import SearchInput from "@/components/ui/input/SearchInput";
import SegmentedIconToggle from "@/components/ui/SegmentedIconToggle";
import Select from "@/components/ui/select/Select";
import StatusFilterBar from "@/components/ui/StatusFilterBar";

import { DEFAULT_TASK_VIEW_MODE, parseTaskViewMode, type TaskViewMode } from "@/lib/projectRoutes";

import type { StatusFilterChipItem } from "@/components/ui/StatusFilterChips";
import type { TaskFilterTab } from "@/features/tasks/utils/taskUtils";
import type { ReactNode } from "react";

type TasksToolbarProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: TaskFilterTab;
  onFilterChange: (filter: TaskFilterTab) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  filterItems: StatusFilterChipItem<TaskFilterTab>[];
  action?: ReactNode;
};

const toolbarRowClassName =
  "flex min-w-0 flex-col items-start gap-2 min-[1025px]:flex-row min-[1025px]:items-center min-[1025px]:justify-between";

const toolbarActionsClassName = "flex shrink-0 items-center gap-2";

const sortOptions = [
  {
    value: "latest",
    label: "최신",
  },
  {
    value: "oldest",
    label: "오래된",
  },
  {
    value: "due",
    label: "마감일",
  },
  {
    value: "name",
    label: "이름",
  },
];

const viewTabs: {
  id: TaskViewMode;
  label: string;
  icon: typeof ListTodo;
}[] = [
  {
    id: "board",
    label: "보드",
    icon: ListTodo,
  },
  {
    id: "calendar",
    label: "캘린더",
    icon: CalendarDays,
  },
];

/**
 * TasksToolbar
 *
 * 태스크 목록의 검색, 상태 필터, 정렬, 보기, 추가 버튼을 프로젝트 목록과 같은 줄로 놓습니다.
 *
 * @param props - TasksToolbar 컴포넌트 Props
 * @param props.searchQuery - 검색어
 * @param props.onSearchChange - 검색어가 바뀔 때 실행되는 함수
 * @param props.activeFilter - 현재 선택된 상태 필터
 * @param props.onFilterChange - 상태 필터를 바꿀 때 실행되는 함수
 * @param props.sortValue - 현재 정렬
 * @param props.onSortChange - 정렬을 바꿀 때 실행되는 함수
 * @param props.filterItems - 상태 필터에 보여줄 상태와 개수
 * @param props.action - 오른쪽에 둘 추가 버튼
 */
export default function TasksToolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  sortValue,
  onSortChange,
  filterItems,
  action,
}: TasksToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = parseTaskViewMode(searchParams.get("view"));

  /**
   * handleViewChange
   *
   * 보드, 캘린더 보기를 주소에 반영합니다.
   *
   * @param view - 고른 보기
   */
  const handleViewChange = (view: TaskViewMode) => {
    if (view === activeView) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (view === DEFAULT_TASK_VIEW_MODE) {
      params.delete("view");
    } else {
      params.set("view", view);
    }

    const query = params.toString();

    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <SearchInput value={searchQuery} onChange={onSearchChange} placeholder="태스크 검색..." />

      <div className={toolbarRowClassName}>
        <StatusFilterBar
          items={filterItems}
          value={activeFilter}
          onChange={onFilterChange}
          label="태스크 필터"
          title="태스크 필터"
          sectionLabel="태스크 상태"
          resetValue="all"
        />

        <div className={toolbarActionsClassName}>
          <Select
            value={sortValue}
            onChange={onSortChange}
            options={sortOptions}
            size="sm"
            className="w-[5.25rem] shrink-0"
          />

          <SegmentedIconToggle
            label="태스크 보기"
            value={activeView}
            items={viewTabs}
            onChange={handleViewChange}
          />

          {action}
        </div>
      </div>
    </div>
  );
}
