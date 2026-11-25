"use client";

import Checkbox from "@/components/kit/Checkbox";

import { formatMonthDot } from "@/features/projects/detail/projectOverviewModel";

import type { Goal } from "@/features/goals/types/goal";
import type { Task } from "@/features/tasks/types/task";

/** 프로젝트 기간을 줄일 때 같이 옮겨야 하는 날짜 하나 */
export type ShiftItem =
  | {
      kind: "goal";
      key: string;
      name: string;
      field: "start" | "end";
      from: string;
      to: string;
      goal: Goal;
    }
  | { kind: "task"; key: string; name: string; field: "end"; from: string; to: string; task: Task };

/**
 * 프로젝트 시작을 늦추거나 마감을 당길 때 범위를 벗어나는 목표 · 태스크 날짜를 찾는다 (DOC1 · REBUILD 6 날짜 범위).
 *
 * 목표 시작이 새 시작보다 이르면 새 시작으로, 목표 · 태스크 마감이 새 마감보다 늦으면 새 마감으로 옮긴다.
 * 옮긴 뒤 목표 시작이 마감을 넘으면 그 날짜도 같이 맞춘다.
 * 완료된 목표 · 태스크는 날짜가 기록이라 옮기지 않는다 (DOC1 날짜 범위).
 *
 * @param range - 새 프로젝트 시작 · 마감. 바뀌지 않은 쪽은 빈 문자열
 */
export function getShiftItems(goals: Goal[], tasks: Task[], range: { start: string; end: string }) {
  const items: ShiftItem[] = [];
  goals.forEach((goal) => {
    if (goal.status === "COMPLETED") return;
    let start = goal.startDate;
    let end = goal.endDate;
    if (range.start && start && start < range.start) start = range.start;
    if (range.end && end && end > range.end) end = range.end;
    if (range.start && end && end < range.start) end = range.start;
    if (range.end && start && start > range.end) start = range.end;
    if (start !== goal.startDate) {
      items.push({
        kind: "goal",
        key: `gs${goal.id}`,
        name: goal.title,
        field: "start",
        from: goal.startDate,
        to: start,
        goal,
      });
    }
    if (end !== goal.endDate) {
      items.push({
        kind: "goal",
        key: `ge${goal.id}`,
        name: goal.title,
        field: "end",
        from: goal.endDate,
        to: end,
        goal,
      });
    }
  });
  tasks.forEach((task) => {
    if (task.status !== "DONE" && range.end && task.dueDate && task.dueDate > range.end) {
      items.push({
        kind: "task",
        key: `t${task.id}`,
        name: task.title,
        field: "end",
        from: task.dueDate,
        to: range.end,
        task,
      });
    }
  });
  return items;
}

/** 목표 하나에 옮길 시작 · 마감을 합친다 (시작 · 마감이 둘 다 바뀌는 목표가 있다) */
export function mergeGoalShifts(items: ShiftItem[]) {
  const byGoal = new Map<number, Goal>();
  items.forEach((item) => {
    if (item.kind !== "goal") return;
    const current = byGoal.get(item.goal.id) ?? { ...item.goal };
    byGoal.set(
      item.goal.id,
      item.field === "start"
        ? { ...current, startDate: item.to }
        : { ...current, endDate: item.to },
    );
  });
  return [...byGoal.values()];
}

type ShiftNoticeProps = {
  items: ShiftItem[];
  /** 무엇이 바뀌었는지에 따라 머리 · 체크 글이 바뀐다 */
  reason: "start" | "end" | "both";
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const TITLE = {
  start: "새 시작보다 이른 목표",
  end: "새 마감보다 늦은 항목",
  both: "새 기간을 벗어나는 항목",
} as const;
const CHECK = {
  start: "새 시작으로 같이 옮기기",
  end: "새 마감으로 같이 옮기기",
  both: "새 기간 안으로 같이 옮기기",
} as const;

/**
 * 같이 옮길 항목 목록 + 「같이 옮기기」 체크 (DOC1 · REBUILD 6 날짜 범위). 체크를 끄면 부모가 [저장]을 막는다.
 */
export function ShiftNotice({ items, reason, checked, onChange }: ShiftNoticeProps) {
  if (items.length === 0) {
    return null;
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <strong className="text-sm">{TITLE[reason]}</strong>
        <span className="text-xs text-[var(--t3)]">{items.length}</span>
      </div>
      <ul className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-1">
        {items.map((item, index) => (
          <li
            key={item.key}
            className={
              index > 0
                ? "flex min-h-10 items-center gap-2.5 border-t border-[var(--divider)] text-sm"
                : "flex min-h-10 items-center gap-2.5 text-sm"
            }
          >
            <span className="flex min-w-0 flex-1 flex-col py-1.5">
              <span className="truncate">{item.name}</span>
              <span className="text-xs text-[var(--t3)]">
                {item.kind === "goal" ? "목표" : "태스크"} ·{" "}
                {item.field === "start" ? "시작" : "마감"}
              </span>
            </span>
            <span className="shrink-0 text-xs text-[var(--t3)] tabular-nums">
              {checked
                ? `${formatMonthDot(item.from)} → ${formatMonthDot(item.to)}`
                : `${formatMonthDot(item.from)} 그대로`}
            </span>
          </li>
        ))}
      </ul>
      <label className="flex min-h-10 cursor-pointer items-center gap-1.5 text-sm">
        <Checkbox checked={checked} onChange={onChange} />
        {CHECK[reason]}
      </label>
      {checked ? null : <p className="text-xs text-[var(--bad)]">같이 옮겨야 저장할 수 있어요.</p>}
    </div>
  );
}

/**
 * 마감을 늦출 때 같이 늦출 수 있는 항목: 마감이 지난(오늘 이전) 끝나지 않은 목표 · 태스크 (DOC1 날짜 범위).
 *
 * @param nextEnd - 새 프로젝트 마감
 * @param today - `YYYY-MM-DD`
 */
export function getOverdueItems(goals: Goal[], tasks: Task[], nextEnd: string, today: string) {
  const items: ShiftItem[] = [];
  goals.forEach((goal) => {
    if (goal.status !== "COMPLETED" && goal.endDate && goal.endDate < today) {
      items.push({
        kind: "goal",
        key: `ge${goal.id}`,
        name: goal.title,
        field: "end",
        from: goal.endDate,
        to: nextEnd,
        goal,
      });
    }
  });
  tasks.forEach((task) => {
    if (task.status !== "DONE" && task.dueDate && task.dueDate < today) {
      items.push({
        kind: "task",
        key: `t${task.id}`,
        name: task.title,
        field: "end",
        from: task.dueDate,
        to: nextEnd,
        task,
      });
    }
  });
  return items;
}

type ExtendNoticeProps = {
  items: ShiftItem[];
  picked: Set<string>;
  onChange: (picked: Set<string>) => void;
};

/**
 * 마감을 늦출 때: 「마감이 지난 목표 · 태스크 N개」 + 「새 마감으로 같이 늦추기」(기본 꺼짐 · 항목별 선택) (DOC1 날짜 범위).
 */
export function ExtendNotice({ items, picked, onChange }: ExtendNoticeProps) {
  if (items.length === 0) {
    return null;
  }
  const isAll = items.every((item) => picked.has(item.key));
  const toggle = (key: string) => {
    const next = new Set(picked);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    onChange(next);
  };
  return (
    <div className="flex flex-col gap-2">
      <strong className="text-sm">마감이 지난 목표 · 태스크 {items.length}개</strong>
      <ul className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-1">
        {items.map((item, index) => {
          const isPicked = picked.has(item.key);
          return (
            <li
              key={item.key}
              className={
                index > 0
                  ? "flex min-h-10 items-center gap-2.5 border-t border-[var(--divider)] text-sm"
                  : "flex min-h-10 items-center gap-2.5 text-sm"
              }
            >
              <Checkbox
                checked={isPicked}
                onChange={() => toggle(item.key)}
                label={`‘${item.name}’ 새 마감으로 같이 늦추기`}
              />
              <span className="flex min-w-0 flex-1 flex-col py-1.5">
                <span className="truncate">{item.name}</span>
                <span className="text-xs text-[var(--t3)]">
                  {item.kind === "goal" ? "목표" : "태스크"}
                </span>
              </span>
              <span className="shrink-0 text-xs text-[var(--t3)] tabular-nums">
                {isPicked
                  ? `${formatMonthDot(item.from)} → ${formatMonthDot(item.to)}`
                  : `${formatMonthDot(item.from)} 그대로`}
              </span>
            </li>
          );
        })}
      </ul>
      {/* 전체 켜기 · 끄기. 기본 꺼짐, 위 목록에서 하나씩도 고른다 */}
      <label className="flex min-h-10 cursor-pointer items-center gap-1.5 text-sm">
        <Checkbox
          checked={isAll}
          onChange={() => onChange(isAll ? new Set() : new Set(items.map((item) => item.key)))}
        />
        새 마감으로 같이 늦추기
      </label>
    </div>
  );
}
