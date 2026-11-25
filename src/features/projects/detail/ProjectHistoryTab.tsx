"use client";

import { useState } from "react";

import EmptyState from "@/components/kit/EmptyState";
import Segmented from "@/components/kit/Segmented";
import { CalendarSync, History } from "@/components/ui/icon";

import { formatMonthDot } from "@/features/projects/detail/projectOverviewModel";

import type { ProjectDeadlineChange } from "@/features/projects/types/project";

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

/**
 * 상세 기록 탭 (보드 08 · 프로토타입 historyTab). 종류 칸(전체 · 마감 변경 · 상태 · 항목 추가·삭제) →
 * 날짜 묶음(12 600 --t3) → 기록 줄(아이콘 원 32 · 글 · 시각 · 사유 상자).
 * 지금 저장되는 기록은 마감일 변경뿐이라 다른 종류는 빈 상태로 보인다 (보고에 적음).
 */
export default function ProjectHistoryTab({ changes }: { changes: ProjectDeadlineChange[] }) {
  const [kind, setKind] = useState<HistoryKind>("all");
  const visible = kind === "all" || kind === "deadline" ? changes : [];
  const days = [...new Set(visible.map((change) => change.changedAt.slice(0, 10)))];

  return (
    <>
      <div className="flex">
        <Segmented label="기록 종류" value={kind} onChange={setKind} items={KIND_ITEMS} />
      </div>
      {visible.length === 0 ? (
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
                  .filter((change) => change.changedAt.startsWith(day))
                  .map((change) => (
                    <li key={change.id} className="flex items-start gap-3 py-3">
                      <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--s3)] text-[var(--bad)]">
                        <CalendarSync size={16} aria-hidden />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
                        <span>
                          마감일{" "}
                          <b>
                            {formatMonthDot(change.previousEndDate)} →{" "}
                            {formatMonthDot(change.nextEndDate)}
                          </b>
                        </span>
                        <span className="text-xs text-[var(--t3)]">
                          {change.changedAt.slice(11, 16)}
                        </span>
                        {change.reason ? (
                          <span className="mt-1 rounded-[var(--radius-sm)] bg-[var(--s2)] px-3 py-2 text-xs">
                            사유: {change.reason}
                          </span>
                        ) : null}
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
