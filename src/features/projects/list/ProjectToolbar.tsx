"use client";

import { useId, useRef, useState } from "react";

import Button from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import Drawer from "@/components/ui/Drawer";
import {
  Check,
  CircleAlert,
  LayoutGrid,
  ListChecks,
  Funnel,
  ListFilter,
} from "@/components/ui/icon";
import Popover from "@/components/ui/Popover";
import SearchField from "@/components/ui/SearchField";
import Segmented from "@/components/ui/Segmented";
import Switch from "@/components/ui/Switch";

import {
  PROJECT_SORT_LABEL,
  PROJECT_STATUS_OPTIONS,
  type ProjectListQuery,
  type ProjectSort,
} from "@/features/projects/list/projectListModel";

import { cn } from "@/lib/cn";

export type ProjectViewMode = "card" | "list";

type ProjectToolbarProps = {
  query: ProjectListQuery;
  onChange: (next: Partial<ProjectListQuery>) => void;
  counts: Record<ProjectListQuery["status"] | "late", number>;
  view: ProjectViewMode;
  onViewChange: (view: ProjectViewMode) => void;
  /** 필터 시트의 태그 (프로젝트 태그 모음) */
  allTags: string[];
  /** 지금 조건으로 보이는 개수 (시트 「프로젝트 N개 보기」) */
  resultCount: number;
};

const SORTS: ProjectSort[] = ["updated", "due", "name"];

/**
 * 프로젝트 목록 도구 줄 (보드 01 · 01-j · M 01-d).
 * 웹: 상태 칸(숫자) · 「마감 지남만 N」 · 오른쪽 검색 240 · 정렬(200 팝오버) · 보기 전환. 좁으면 줄바꿈.
 * 태블릿 · 모바일: 상태 칸(가로 스크롤) + 필터 버튼 → 필터 시트(상태 · 마감 지난 것만 · 태그 · 정렬).
 */
export default function ProjectToolbar({
  query,
  onChange,
  counts,
  view,
  onViewChange,
  allTags,
  resultCount,
}: ProjectToolbarProps) {
  const sortRef = useRef<HTMLButtonElement>(null);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const lateLabelId = useId();

  const statusItems = PROJECT_STATUS_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
    count: counts[option.value],
  }));

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 max-lg:hidden">
        <Segmented
          label="상태"
          value={query.status}
          onChange={(status) => onChange({ status })}
          items={statusItems}
        />
        <Chip
          selected={query.lateOnly}
          onClick={() => onChange({ lateOnly: !query.lateOnly })}
          icon={<CircleAlert size={16} aria-hidden />}
          count={counts.late}
        >
          마감 지남만
        </Chip>
        {/* 모두 한 줄의 형제 칸: 좁으면 정렬 · 보기 전환이 다음 줄 왼쪽으로 (보드 01r 1024) */}
        <div className="ml-auto w-60">
          <SearchField
            value={query.keyword}
            onChange={(keyword) => onChange({ keyword })}
            placeholder="프로젝트 검색"
            ariaLabel="프로젝트 검색"
          />
        </div>
        <Button
          ref={sortRef}
          size="sm"
          aria-haspopup="menu"
          aria-expanded={isSortOpen}
          onClick={() => setIsSortOpen((open) => !open)}
        >
          <ListFilter size={16} aria-hidden />
          {PROJECT_SORT_LABEL[query.sort]}
        </Button>
        <Segmented
          label="보기 방식"
          value={view}
          onChange={onViewChange}
          items={[
            {
              value: "card",
              label: <LayoutGrid size={16} aria-hidden />,
              ariaLabel: "카드 보기",
            },
            {
              value: "list",
              label: <ListChecks size={16} aria-hidden />,
              ariaLabel: "목록 보기",
            },
          ]}
        />
      </div>
      <Popover
        isOpen={isSortOpen}
        onClose={() => setIsSortOpen(false)}
        anchorRef={sortRef}
        title="정렬"
        width={200}
        align="end"
        role="menu"
      >
        <div className="flex flex-col p-0.5">
          {SORTS.map((sort) => (
            <button
              key={sort}
              type="button"
              role="menuitemradio"
              aria-checked={query.sort === sort}
              onClick={() => {
                onChange({ sort });
                setIsSortOpen(false);
              }}
              className={cn(
                "kit-focus flex h-9 w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 text-left text-sm text-[var(--text)] hover:bg-[var(--s3)] max-md:min-h-11",
                query.sort === sort && "bg-[var(--s3)]",
              )}
            >
              <span className="flex-1">{PROJECT_SORT_LABEL[sort]}</span>
              {query.sort === sort ? <Check size={16} aria-hidden /> : null}
            </button>
          ))}
        </div>
      </Popover>

      <div className="flex items-center gap-2 lg:hidden">
        <div className="-mx-4 min-w-0 flex-1 [scrollbar-width:none] overflow-x-auto px-4 md:-mx-6 md:px-6 [&::-webkit-scrollbar]:hidden">
          <Segmented
            label="상태"
            value={query.status}
            onChange={(status) => onChange({ status })}
            items={statusItems}
          />
        </div>
        <Button size="sm" iconOnly aria-label="필터" onClick={() => setIsSheetOpen(true)}>
          <Funnel size={16} aria-hidden />
        </Button>
      </div>
      <Drawer
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="필터"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() =>
                onChange({ status: "all", lateOnly: false, tags: [], sort: "updated" })
              }
            >
              초기화
            </Button>
            <Button variant="primary" onClick={() => setIsSheetOpen(false)}>
              프로젝트 {resultCount}개 보기
            </Button>
          </>
        }
      >
        <FilterGroup title="상태">
          {PROJECT_STATUS_OPTIONS.filter((option) => option.value !== "all").map((option) => (
            <Chip
              key={option.value}
              selected={query.status === option.value}
              onClick={() =>
                onChange({ status: query.status === option.value ? "all" : option.value })
              }
            >
              {option.label}
            </Chip>
          ))}
        </FilterGroup>
        <div className="flex h-12 items-center gap-3 border-y border-[var(--divider)] text-sm">
          <span id={lateLabelId} className="flex-1">
            마감 지난 것만
          </span>
          <Switch
            checked={query.lateOnly}
            onChange={(lateOnly) => onChange({ lateOnly })}
            labelledBy={lateLabelId}
          />
        </div>
        {allTags.length > 0 ? (
          <FilterGroup title="태그">
            {allTags.map((tag) => {
              const isOn = query.tags.includes(tag);

              return (
                <Chip
                  key={tag}
                  selected={isOn}
                  onClick={() =>
                    onChange({
                      tags: isOn ? query.tags.filter((item) => item !== tag) : [...query.tags, tag],
                    })
                  }
                >
                  {tag}
                </Chip>
              );
            })}
          </FilterGroup>
        ) : null}
        <FilterGroup title="정렬">
          {SORTS.map((sort) => (
            <Chip key={sort} selected={query.sort === sort} onClick={() => onChange({ sort })}>
              {PROJECT_SORT_LABEL[sort]}
            </Chip>
          ))}
        </FilterGroup>
      </Drawer>
    </>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <strong className="text-xs font-semibold">{title}</strong>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
