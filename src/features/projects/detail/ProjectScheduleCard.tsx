"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

import Badge, { badgeDotClassName } from "@/components/kit/Badge";
import Button from "@/components/kit/Button";
import Segmented from "@/components/kit/Segmented";

import {
  GOAL_STATUS_BADGE,
  formatMonthDot,
  getActivityBarHeight,
  getActivityInRange,
  getGoalLateDays,
  getTimelineMonths,
  getTimelinePercent,
  getTimelineRange,
  getTimelineWeeks,
  type TimelineRange,
  type TimelineScale,
} from "@/features/projects/detail/projectOverviewModel";

import { cn } from "@/lib/cn";
import { projectColorVar } from "@/lib/projectPalette";

import type { Goal } from "@/features/goals/types/goal";
import type { ProjectDeadlineChange, ProjectListItem } from "@/features/projects/types/project";
import type { ActivityDay } from "@/features/projects/utils/activityMosaic";

type ProjectScheduleCardProps = {
  project: ProjectListItem;
  goals: Goal[];
  activity: ActivityDay[];
  deadlineChanges: ProjectDeadlineChange[];
  /** 프로젝트 지연 일수. 지연이 아니면 null */
  lateDays: number | null;
  /** 오늘 `YYYY-MM-DD` */
  today: string;
};

const SCALE_ITEMS: { value: TimelineScale; label: string }[] = [
  { value: "week", label: "주" },
  { value: "month", label: "월" },
  { value: "all", label: "전체" },
];

// 마감 지남 빗금 (보드 03): 빗금 4 · 바탕 4, 둘레 1
const lateStripeStyle: CSSProperties = {
  background: "repeating-linear-gradient(135deg, var(--late-stripe) 0 4px, var(--surface) 4px 8px)",
};
const lateStripeClassName = "shadow-[inset_0_0_0_1px_var(--late-stripe-line)]";

const cardClassName =
  "rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]";

/**
 * 일정 카드 (보드 03 · T · M 03).
 * 웹: 「일정」 + 「시작 · 마감 · 오늘」 + 주 · 월 · 전체 + 「오늘로」 → 왼쪽 이름 200 | 기간 막대.
 * 달 눈금 · 주 선 · 마감(빨간 점선 + 배지) · 오늘(진한 선 + 배지) · 마감 변경 ◇ · 프로젝트 · 목표 줄 36 ·
 * 마감 지남 빗금 + 「N일 지연」 · 활동(하루 한 일 수) · 범례.
 * 태블릿 · 모바일: 이름 + 배지 → 막대 8 (전체 기간 기준).
 */
export default function ProjectScheduleCard({
  project,
  goals,
  activity,
  deadlineChanges,
  lateDays,
  today,
}: ProjectScheduleCardProps) {
  const [scale, setScale] = useState<TimelineScale>("all");
  const [focus, setFocus] = useState(project.endDate || today);
  const range = getTimelineRange(scale, project, today, focus);
  const allRange = getTimelineRange("all", project, today, today);
  const pos = (date: string, base: TimelineRange = range) => getTimelinePercent(date, base);
  const inRange = (date: string) => date >= range.from && date <= range.to;
  const color = projectColorVar(project.color);
  const summary = [
    project.startDate ? `${formatMonthDot(project.startDate)} 시작` : null,
    project.endDate ? `${formatMonthDot(project.endDate)} 마감` : null,
    `오늘 ${formatMonthDot(today)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section aria-labelledby="project-schedule-title" className={cardClassName}>
      {/* 웹 (보드 03): 20/20/16 */}
      <div className="px-5 pt-5 pb-4 max-lg:hidden">
        <div className="mb-3 flex items-center gap-2">
          <h3 id="project-schedule-title" className="text-base font-semibold">
            일정
          </h3>
          <span className="ml-2 text-xs text-[var(--t3)]">{summary}</span>
          <span className="flex-1" />
          <Segmented label="일정 보기 단위" value={scale} onChange={setScale} items={SCALE_ITEMS} />
          <Button size="xs" onClick={() => setFocus(today)}>
            오늘로
          </Button>
        </div>

        <div className="grid grid-cols-[--spacing(50)_1fr]">
          <span />
          <div className="relative h-7">
            {getTimelineMonths(range).map((month) => (
              <span
                key={month.key}
                className="absolute top-1 ml-1.5 text-xs font-semibold text-[var(--t2)]"
                style={{ left: `${pos(month.key)}%` }}
              >
                {month.label}
              </span>
            ))}
          </div>
        </div>

        <div className="relative">
          {/* 선 · 마감 · 오늘: 이름 칸 오른쪽, 달 줄 위까지 */}
          <div aria-hidden className="pointer-events-none absolute -top-7 right-0 bottom-0 left-50">
            {getTimelineWeeks(range).map((week) => (
              <span
                key={week}
                className="absolute inset-y-0 border-l border-[var(--divider)]"
                style={{ left: `${pos(week)}%` }}
              />
            ))}
            {getTimelineMonths(range).map((month) => (
              <span
                key={month.key}
                className="absolute inset-y-0 border-l border-[var(--border)]"
                style={{ left: `${pos(month.key)}%` }}
              />
            ))}
            {project.endDate && inRange(project.endDate) ? (
              <>
                <span
                  className="absolute top-7 bottom-0 z-10 border-l-2 border-dashed border-[var(--late-line)]"
                  style={{ left: `${pos(project.endDate)}%` }}
                />
                <span
                  className="absolute top-0.5 z-10 -translate-x-1/2"
                  style={{ left: `${pos(project.endDate)}%` }}
                >
                  <Badge tone="bad" small>
                    마감 {formatMonthDot(project.endDate)}
                  </Badge>
                </span>
              </>
            ) : null}
            {inRange(today) ? (
              <>
                <span
                  className="absolute top-7 bottom-0 z-10 border-l-2 border-[var(--marker)]"
                  style={{ left: `${pos(today)}%` }}
                />
                <span
                  className="absolute top-0.5 z-10 inline-flex h-5 -translate-x-1/2 items-center rounded-[var(--radius-xs)] bg-[var(--marker)] px-1.5 text-xs font-medium whitespace-nowrap text-[var(--on-marker)]"
                  style={{ left: `${pos(today)}%` }}
                >
                  오늘
                </span>
              </>
            ) : null}
          </div>

          {/* 마감 변경 ◇ (보드 03: 첫 줄 아래 끝) */}
          <div aria-hidden className="pointer-events-none absolute top-0 right-0 left-50 h-9">
            {deadlineChanges
              .filter((change) => inRange(change.changedAt.slice(0, 10)))
              .map((change) => (
                <span
                  key={change.id}
                  title="마감일 변경"
                  className="absolute top-9 z-10 size-3 -translate-x-1/2 rotate-45 border-2 border-[var(--marker)] bg-[var(--surface)]"
                  style={{ left: `${pos(change.changedAt.slice(0, 10))}%` }}
                />
              ))}
          </div>

          <TimelineRow
            label={
              <>
                <span className="truncate text-sm font-semibold">프로젝트 전체</span>
                <span
                  aria-hidden
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: color }}
                />
              </>
            }
          >
            <SpanBar
              range={range}
              from={project.startDate}
              to={project.endDate}
              progress={project.progress}
              trackClassName="bg-[var(--track)]"
              fillClassName="bg-[var(--marker)]"
            />
            <LateStripe range={range} from={project.endDate} today={today} days={lateDays} />
          </TimelineRow>

          {goals.map((goal) => {
            const badge = GOAL_STATUS_BADGE[goal.status];
            const goalLate = getGoalLateDays(goal, today);
            const hasPeriod = Boolean(goal.startDate && goal.endDate);

            return (
              <TimelineRow
                key={goal.id}
                label={
                  <>
                    <span className="truncate text-sm">{goal.title}</span>
                    <Badge tone={badge.tone} dot small>
                      {badge.label}
                    </Badge>
                  </>
                }
              >
                {hasPeriod ? (
                  <>
                    <SpanBar
                      range={range}
                      from={goal.startDate}
                      to={goal.endDate}
                      progress={goal.status === "COMPLETED" ? 100 : goal.progress}
                      trackClassName={badgeTrackClassName[badge.tone]}
                      fillClassName={badgeDotClassName[badge.tone]}
                    />
                    {goal.status === "COMPLETED" && inRange(goal.endDate) ? (
                      <span
                        className="absolute top-1.75 ml-1.5 text-xs whitespace-nowrap text-[var(--t2)]"
                        style={{ left: `${pos(goal.endDate)}%` }}
                      >
                        {formatMonthDot(goal.endDate)} 완료
                      </span>
                    ) : null}
                    <LateStripe range={range} from={goal.endDate} today={today} days={goalLate} />
                  </>
                ) : (
                  <span className="absolute top-1.75 left-0 text-xs text-[var(--t3)]">
                    기간 없음
                  </span>
                )}
              </TimelineRow>
            );
          })}

          <div className="mt-1 grid h-14 grid-cols-[--spacing(50)_1fr] items-end border-t border-[var(--divider)]">
            <div className="flex flex-col pb-1.5">
              <span className="text-sm">활동</span>
              <span className="text-xs text-[var(--t3)]">하루에 한 일 수</span>
            </div>
            <div className="relative h-12">
              {getActivityInRange(activity, range).map((day) => (
                <span
                  key={day.date}
                  title={`${formatMonthDot(day.date)} · ${day.count}`}
                  className="absolute bottom-0 w-1 rounded-[var(--radius-tile)]"
                  style={{
                    left: `${pos(day.date)}%`,
                    height: getActivityBarHeight(day.count),
                    background: color,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--t3)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-4 rounded-full bg-[var(--badge-info-dot)]" />
            진행률
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className={cn("h-2 w-4 rounded-full", lateStripeClassName)}
              style={lateStripeStyle}
            />
            마감 지남
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rotate-45 border-2 border-[var(--marker)]" />
            변경 기록
          </span>
        </div>
      </div>

      {/* 태블릿 · 모바일 (보드 T · M 03): 16 · 사이 10, 줄 사이 4 */}
      <div className="flex flex-col gap-2.5 p-4 lg:hidden">
        <strong className="text-sm">일정</strong>
        <CompactRow
          name="프로젝트 전체"
          badge={lateDays != null ? <Badge tone="bad">{lateDays}일</Badge> : null}
          left={project.startDate ? pos(project.startDate, allRange) : 0}
          right={project.endDate ? pos(project.endDate, allRange) : 0}
          fillStyle={{ background: color }}
        />
        {goals.map((goal) => {
          const badge = GOAL_STATUS_BADGE[goal.status];
          return (
            <CompactRow
              key={goal.id}
              name={goal.title}
              badge={
                <Badge tone={badge.tone} dot>
                  {badge.label}
                </Badge>
              }
              left={goal.startDate ? pos(goal.startDate, allRange) : 0}
              right={goal.endDate ? pos(goal.endDate, allRange) : 0}
              fillClassName={badgeDotClassName[badge.tone]}
            />
          );
        })}
      </div>
    </section>
  );
}

// 목표 막대 바탕 = 배지 바탕 (보드 03: 진행 중 #dbeafe · 완료 #dcfce7)
const badgeTrackClassName = {
  n: "bg-[var(--track)]",
  info: "bg-[var(--badge-info-bg)]",
  ok: "bg-[var(--badge-ok-bg)]",
  warn: "bg-[var(--badge-warn-bg)]",
  bad: "bg-[var(--badge-bad-bg)]",
} as const;

function TimelineRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="grid h-9 grid-cols-[--spacing(50)_1fr] items-center">
      <div className="flex min-w-0 items-center gap-2 pr-3">{label}</div>
      <div className="relative h-8">{children}</div>
    </div>
  );
}

function SpanBar({
  range,
  from,
  to,
  progress,
  trackClassName,
  fillClassName,
}: {
  range: TimelineRange;
  from: string;
  to: string;
  progress: number;
  trackClassName: string;
  fillClassName: string;
}) {
  if (!from || !to || to < range.from || from > range.to) {
    return null;
  }

  const left = getTimelinePercent(from, range);
  const width = Math.max(getTimelinePercent(to, range) - left, 0.5);

  return (
    <span
      className={cn("absolute top-2.5 h-3 overflow-hidden rounded-full", trackClassName)}
      style={{ left: `${left}%`, width: `${width}%` }}
    >
      <i
        className={cn("absolute inset-y-0 left-0 rounded-full", fillClassName)}
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </span>
  );
}

function LateStripe({
  range,
  from,
  today,
  days,
}: {
  range: TimelineRange;
  from: string;
  today: string;
  days: number | null;
}) {
  if (days == null || !from || from > range.to || today < range.from) {
    return null;
  }

  const left = getTimelinePercent(from, range);
  const end = getTimelinePercent(today, range);

  return (
    <>
      <span
        className={cn("absolute top-3 h-2 rounded-r-full", lateStripeClassName)}
        style={{ ...lateStripeStyle, left: `${left}%`, width: `${Math.max(end - left, 0)}%` }}
      />
      <span className="absolute -top-0.5 -ml-2.5 -translate-x-full" style={{ left: `${end}%` }}>
        <Badge tone="bad" small>
          {days}일 지연
        </Badge>
      </span>
    </>
  );
}

function CompactRow({
  name,
  badge,
  left,
  right,
  fillStyle,
  fillClassName,
}: {
  name: string;
  badge: ReactNode;
  left: number;
  right: number;
  fillStyle?: CSSProperties;
  fillClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2 text-xs">
        <span className="min-w-0 flex-1 truncate">{name}</span>
        {badge}
      </div>
      <div className="relative h-2 rounded-full bg-[var(--track)]">
        {right > left ? (
          <i
            className={cn("absolute inset-y-0 rounded-full", fillClassName)}
            style={{ ...fillStyle, left: `${left}%`, width: `${right - left}%` }}
          />
        ) : null}
      </div>
    </div>
  );
}
