"use client";

import Button from "@/components/kit/Button";
import Checkbox from "@/components/kit/Checkbox";
import { MenuHeader, MenuSeparator } from "@/components/kit/Menu";
import Popover from "@/components/kit/Popover";

import type { Goal } from "@/features/goals/types/goal";
import type { ReactNode, RefObject } from "react";

type GoalFilterPopoverProps = {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  goals: Goal[];
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  /** 거른 뒤 남는 목표 수 (「결과 N개」) */
  resultCount: number;
  /** 태그 위에 더 넣을 칸 (태블릿 · 모바일 필터 시트의 지연만 · 묶기) */
  before?: ReactNode;
  onReset?: () => void;
};

/**
 * 목표 필터 팝오버 (보드 04-c · 09-f). 280 · 「태그」 머리 → 체크 · 태그 · 개수 줄 → 「결과 N개」 · [초기화].
 * 모바일은 아래 시트.
 */
export default function GoalFilterPopover({
  isOpen,
  onClose,
  anchorRef,
  goals,
  tags,
  onTagsChange,
  resultCount,
  before,
  onReset,
}: GoalFilterPopoverProps) {
  const allTags = [...new Set(goals.flatMap((goal) => goal.tags))];

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      anchorRef={anchorRef}
      title="필터"
      width={280}
      align="end"
    >
      {before}
      <MenuHeader>태그</MenuHeader>
      {/* 태그가 많으면 이 부분만 스크롤 */}
      <div className="flex max-h-72 flex-col overflow-y-auto [&>*]:shrink-0">
        {allTags.map((tag) => {
          const isOn = tags.includes(tag);
          const toggle = () =>
            onTagsChange(isOn ? tags.filter((item) => item !== tag) : [...tags, tag]);
          return (
            <label
              key={tag}
              className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 text-sm transition-colors duration-120 hover:bg-[var(--s3)] max-md:min-h-13"
            >
              <Checkbox checked={isOn} onChange={toggle} label={tag} />
              <span className="flex-1">{tag}</span>
              <span className="text-xs text-[var(--t3)] tabular-nums">
                {goals.filter((goal) => goal.tags.includes(tag)).length}
              </span>
            </label>
          );
        })}
      </div>
      <MenuSeparator />
      <div className="flex items-center gap-2 px-1.5 py-1">
        <span className="flex-1 text-xs text-[var(--t3)]">결과 {resultCount}개</span>
        <Button variant="ghost" size="xs" onClick={onReset ?? (() => onTagsChange([]))}>
          초기화
        </Button>
      </div>
    </Popover>
  );
}
