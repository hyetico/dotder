"use client";

import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import { Tag } from "@/components/ui/Chip";
import { Check, ChevronRight, Trash2 } from "@/components/ui/icon";
import { MenuItem, MenuSeparator, MoreMenu } from "@/components/ui/Menu";

import { formatMonthDot, GOAL_STATUS_BADGE } from "@/features/projects/detail/projectOverviewModel";

import type { GoalStats } from "@/features/goals/list/goalListModel";
import type { Goal } from "@/features/goals/types/goal";

type GoalRowProps = {
  goal: Goal;
  stats: GoalStats;
  onOpen: () => void;
  onComplete: () => void;
  onDelete: () => void;
};

const barClassName = "block h-1.5 overflow-hidden rounded-full bg-[var(--track)]";
const fillClassName = "block h-full rounded-full bg-[var(--badge-info-dot)]";

/**
 * 목표 줄 (보드 04 · T · M 04 · 프로토타입 goalsBlock).
 * 웹: 카드 16 · 사이 16 — 이름 + 태그 / 막대 240 + 「50% · 태스크 2/4」 | 마감 120 | 상태 96 | 지연 88 | ⋯.
 * 태블릿 · 모바일: 위 선 · 위아래 12 — 이름 500 + 상태 / 막대 + % + 「지연」.
 * 줄을 누르면 상세(04-b), ⋯는 상세 보기 · 완료 · 삭제(04-e).
 */
export default function GoalRow({ goal, stats, onOpen, onComplete, onDelete }: GoalRowProps) {
  const badge = GOAL_STATUS_BADGE[goal.status];

  return (
    <li className="relative">
      {/* 웹 */}
      <Card interactive data-list-row className="flex items-center gap-4 p-4 max-lg:hidden">
        <button
          type="button"
          data-list-open
          onClick={onOpen}
          aria-label={`‘${goal.title}’ 상세 열기`}
          className="kit-focus absolute inset-0 cursor-pointer rounded-[inherit]"
        />
        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <strong className="truncate text-sm">{goal.title}</strong>
            {goal.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </span>
          <span className="flex items-center gap-3">
            <span className={`${barClassName} w-60`}>
              <i className={fillClassName} style={{ width: `${stats.percent}%` }} />
            </span>
            <span className="text-xs text-[var(--t3)] tabular-nums">
              {stats.percent}% · 태스크 {stats.done}/{stats.total}
            </span>
          </span>
        </span>
        <span className="w-30 text-xs text-[var(--t3)]">
          {goal.endDate ? `~ ${formatMonthDot(goal.endDate)}` : ""}
        </span>
        <span className="flex w-24 justify-end">
          <Badge tone={badge.tone} dot>
            {badge.label}
          </Badge>
        </span>
        <span className="flex w-22 justify-end">
          {stats.lateDays != null ? <Badge tone="bad">{stats.lateDays}일 지남</Badge> : null}
        </span>
        <span className="relative z-10">
          <MoreMenu label={`‘${goal.title}’ 메뉴`} title="목표" size="xs">
            {(close) => (
              <>
                <MenuItem
                  icon={<ChevronRight />}
                  onSelect={() => {
                    close();
                    onOpen();
                  }}
                >
                  상세 보기
                </MenuItem>
                <MenuItem
                  icon={<Check />}
                  disabled={goal.status === "COMPLETED"}
                  onSelect={() => {
                    close();
                    onComplete();
                  }}
                >
                  완료
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  danger
                  icon={<Trash2 />}
                  onSelect={() => {
                    close();
                    onDelete();
                  }}
                >
                  삭제
                </MenuItem>
              </>
            )}
          </MoreMenu>
        </span>
      </Card>

      {/* 태블릿 · 모바일 */}
      <button
        type="button"
        data-list-row
        data-list-open
        onClick={onOpen}
        className="kit-focus flex w-full cursor-pointer flex-col gap-1.5 border-t border-[var(--divider)] py-3 text-left transition-colors duration-120 hover:bg-[var(--s2)] lg:hidden"
      >
        <span className="flex w-full items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{goal.title}</span>
          <Badge tone={badge.tone} dot>
            {badge.label}
          </Badge>
        </span>
        <span className="flex w-full items-center gap-2 text-xs text-[var(--t3)]">
          <span className={`${barClassName} flex-1`}>
            <i className={fillClassName} style={{ width: `${stats.percent}%` }} />
          </span>
          <span className="tabular-nums">{stats.percent}%</span>
          {stats.lateDays != null ? <Badge tone="bad">마감 지남</Badge> : null}
        </span>
      </button>
    </li>
  );
}
