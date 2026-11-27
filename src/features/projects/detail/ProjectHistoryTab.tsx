"use client";

import { useState } from "react";

import EmptyState from "@/components/ui/EmptyState";
import {
  CalendarSync,
  Check,
  Folder,
  History,
  Pencil,
  Target,
  Trash2,
  ListTodo,
} from "@/components/ui/icon";
import Segmented from "@/components/ui/Segmented";

import {
  historyCompactText,
  historyWideText,
} from "@/features/projects/detail/projectHistoryModel";

import { cn } from "@/lib/cn";

import type { ProjectHistoryEntry } from "@/lib/mock/projectHistory";

type HistoryKind = "all" | "deadline" | "status" | "items";

const KIND_ITEMS: { value: HistoryKind; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "deadline", label: "마감 변경" },
  { value: "status", label: "상태" },
  { value: "items", label: "항목 추가·삭제" },
];

const dayLabel = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return `${year}년 ${month}월 ${day}일`;
};

// 웹 종류 칸 (보드 08)
const matchesWide = (kind: HistoryKind, entry: ProjectHistoryEntry) =>
  kind === "all" ||
  (kind === "deadline" && (entry.kind === "deadline" || entry.kind === "start")) ||
  (kind === "status" && (entry.kind === "status" || entry.kind === "done")) ||
  (kind === "items" &&
    (entry.kind === "add" || entry.kind === "delete" || entry.kind === "create"));

/** 기록 아이콘 원 (보드 08): 마감 변경 빨강 · 상태 파랑 · 그 밖은 --t2 */
export function HistoryIcon({ entry }: { entry: ProjectHistoryEntry }) {
  const icon =
    entry.kind === "deadline" || entry.kind === "start" ? (
      <CalendarSync size={16} aria-hidden />
    ) : entry.kind === "status" ? (
      <Pencil size={16} aria-hidden />
    ) : entry.kind === "done" ? (
      <Check size={16} aria-hidden />
    ) : entry.kind === "delete" ? (
      <Trash2 size={16} aria-hidden />
    ) : entry.kind === "create" ? (
      <Folder size={16} aria-hidden />
    ) : entry.target === "goal" ? (
      <Target size={16} aria-hidden />
    ) : (
      <ListTodo size={16} aria-hidden />
    );
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--t2)]",
        (entry.kind === "deadline" || entry.kind === "start") && "text-[var(--bad)]",
        entry.kind === "status" && "text-[var(--badge-info-fg)]",
      )}
    >
      {icon}
    </span>
  );
}

/**
 * 상세 기록 탭 (보드 08 · T · M 08). 웹과 태블릿 · 모바일 보드의 모양이 달라 둘을 따로 그린다.
 * 웹: 종류 칸(전체 · 마감 변경 · 상태 · 항목 추가·삭제) → 날짜 묶음 → 아이콘 원 32 · 글 · 시각 · 사유 상자.
 * 기록: 프로젝트 만듦 · 목표/태스크 추가 · 삭제 · 상태 · 완료 · 마감 변경 (REBUILD 6 버그 2).
 */
export default function ProjectHistoryTab({ entries }: { entries: ProjectHistoryEntry[] }) {
  return (
    <>
      <div className="flex flex-col gap-6 max-lg:hidden">
        <WideHistory entries={entries} />
      </div>
      <div className="flex flex-col gap-3 lg:hidden">
        <CompactHistory entries={entries} />
      </div>
    </>
  );
}

type CompactKind = "all" | "task" | "schedule" | "goal";

const COMPACT_KIND_ITEMS: { value: CompactKind; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "task", label: "태스크" },
  { value: "schedule", label: "일정" },
  { value: "goal", label: "목표" },
];

const matchesCompact = (kind: CompactKind, entry: ProjectHistoryEntry) =>
  kind === "all" ||
  (kind === "task" && entry.target === "task") ||
  (kind === "goal" && entry.target === "goal") ||
  (kind === "schedule" &&
    (entry.target === "project" || entry.kind === "deadline" || entry.kind === "start"));

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

// 기록 시각은 ISO(UTC)라 기기 시간대로 바꿔 본다
const localDay = (iso: string) => {
  const date = new Date(iso);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const localTime = (iso: string) => {
  const date = new Date(iso);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};
const localTimeKo = (iso: string) => {
  const date = new Date(iso);
  const hours = date.getHours();
  return `${hours < 12 ? "오전" : "오후"} ${hours % 12 || 12}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const DOT_CLASS: Record<ProjectHistoryEntry["kind"], string> = {
  deadline: "bg-[var(--badge-warn-dot)]",
  start: "bg-[var(--badge-warn-dot)]",
  status: "bg-[var(--badge-info-dot)]",
  done: "bg-[var(--badge-ok-dot)]",
  add: "bg-[var(--badge-n-dot)]",
  delete: "bg-[var(--badge-n-dot)]",
  create: "bg-[var(--badge-n-dot)]",
};

/** 태블릿 · 모바일 (보드 T · M 08): 종류 칸 → 「MM.DD (요일)」 → 점 10 + 세로 선 · 글 · 작은 글 */
function CompactHistory({ entries }: { entries: ProjectHistoryEntry[] }) {
  const [kind, setKind] = useState<CompactKind>("all");
  // 기록이 0개면 거를 것이 없다: 종류 칸을 못 누르게 하고 기본값(전체)으로
  const isEmpty = entries.length === 0;
  if (isEmpty && kind !== "all") {
    setKind("all");
  }
  const visible = entries.filter((entry) => matchesCompact(kind, entry));
  const days = [...new Set(visible.map((entry) => localDay(entry.at)))];

  return (
    <>
      {/* 칸이 모두 비활성이면 스크롤 칸 자체가 Tab 초점을 받지 않게 */}
      <div
        tabIndex={isEmpty ? -1 : undefined}
        className="-mx-4 flex [scrollbar-width:none] overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden"
      >
        <Segmented
          label="기록 종류"
          value={kind}
          onChange={setKind}
          items={COMPACT_KIND_ITEMS}
          disabled={isEmpty}
        />
      </div>
      {isEmpty ? (
        <EmptyState icon={<History size={24} />} title="아직 기록이 없어요" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<History size={24} />}
          title="이 종류의 기록이 없어요"
          text="다른 종류를 선택해 보세요."
        />
      ) : (
        days.map((day) => {
          const [, month, date] = day.split("-");
          const weekday = WEEKDAYS[new Date(`${day}T00:00:00`).getDay()];
          return (
            <section key={day}>
              <h3 className="py-2 text-xs font-semibold text-[var(--t3)]">
                {month}.{date} ({weekday})
              </h3>
              <ul>
                {visible
                  .filter((entry) => localDay(entry.at) === day)
                  .map((entry) => (
                    <li key={entry.id} className="flex items-start gap-3 py-1.5">
                      <span aria-hidden className="flex flex-col items-center pt-1">
                        <span className={cn("size-2.5 rounded-full", DOT_CLASS[entry.kind])} />
                        <span className="h-7.5 w-0.5 bg-[var(--border)]" />
                      </span>
                      <span className="flex min-w-0 flex-col text-sm">
                        <span>{historyCompactText(entry)}</span>
                        {entry.reason ? (
                          <span className="text-xs text-[var(--t3)]">사유: {entry.reason}</span>
                        ) : entry.target !== "project" || entry.kind !== "deadline" ? (
                          <span className="text-xs text-[var(--t3)]">{localTimeKo(entry.at)}</span>
                        ) : null}
                      </span>
                    </li>
                  ))}
              </ul>
            </section>
          );
        })
      )}
    </>
  );
}

function WideHistory({ entries }: { entries: ProjectHistoryEntry[] }) {
  const [kind, setKind] = useState<HistoryKind>("all");
  // 기록이 0개면 거를 것이 없다: 종류 칸을 못 누르게 하고 기본값(전체)으로
  const isEmpty = entries.length === 0;
  if (isEmpty && kind !== "all") {
    setKind("all");
  }
  const visible = entries.filter((entry) => matchesWide(kind, entry));
  const days = [...new Set(visible.map((entry) => localDay(entry.at)))];

  return (
    <>
      <div className="flex">
        <Segmented
          label="기록 종류"
          value={kind}
          onChange={setKind}
          items={KIND_ITEMS}
          disabled={isEmpty}
        />
      </div>
      {isEmpty ? (
        <EmptyState icon={<History size={24} />} title="아직 기록이 없어요" />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<History size={24} />}
          title="이 종류의 기록이 없어요"
          text="다른 종류를 선택해 보세요."
        />
      ) : (
        <div className="flex flex-col gap-1">
          {days.map((day, index) => (
            <section key={day} className={index > 0 ? "mt-4" : undefined}>
              <h3 className="text-xs font-semibold text-[var(--t3)]">{dayLabel(day)}</h3>
              <ul>
                {visible
                  .filter((entry) => localDay(entry.at) === day)
                  .map((entry) => {
                    const { text, strong } = historyWideText(entry);
                    return (
                      <li key={entry.id} className="flex items-start gap-3 py-3">
                        <HistoryIcon entry={entry} />
                        <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
                          <span>
                            {text}
                            {strong ? <b>{strong}</b> : null}
                          </span>
                          <span className="text-xs text-[var(--t3)]">{localTime(entry.at)}</span>
                          {entry.reason ? (
                            <span className="mt-1 rounded-[var(--radius-sm)] bg-[var(--s2)] px-3 py-2 text-xs">
                              사유: {entry.reason}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
