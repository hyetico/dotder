"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

import Badge from "@/components/ui/badge/Badge";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import {
  AppIcon,
  ArrowRight,
  Calendar,
  CalendarDays,
  Clock,
  History,
  List,
  TrendingUp,
} from "@/components/ui/icon";
import ExpandableList, {
  type ExpandableListColumn,
  type ExpandableListRow,
} from "@/components/ui/list/ExpandableList";

import SectionHeader from "@/features/projects/components/SectionHeader";
import ProjectOverviewSummary from "@/features/projects/content/ProjectDetailPageContent/ProjectDetailStatus/ProjectOverviewSummary";
import {
  formatSignedProjectDays,
  getProjectScheduleSnapshot,
  summarizeProjectDeadlineChanges,
} from "@/features/projects/utils/projectUtils";

import { formatDate, getDayDelta } from "@/lib/date";
import { getProjectDeadlineChanges } from "@/lib/mock/projectDeadlineChanges";
import { getProjectEditPath } from "@/lib/projectRoutes";

import type { Goal } from "@/features/goals/types/goal";
import type { ProjectDeadlineChange } from "@/features/projects/types/project";
import type { ProjectListItem } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

const panelClassName =
  "relative rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]";

const historyColumns: ExpandableListColumn[] = [
  {
    id: "schedule",
    header: "변경된 일정",
    width: 44,
    align: "start",
    headerAlign: "start",
    mobile: "title",
  },
  {
    id: "delta",
    header: "변경폭",
    width: 18,
    align: "start",
    headerAlign: "start",
    mobile: "meta",
    mobileHeader: "",
  },
  {
    id: "actor",
    header: "변경자",
    width: 16,
    align: "start",
    headerAlign: "start",
    mobile: "hidden",
  },
  {
    id: "changedAt",
    header: "변경 시각",
    width: 22,
    align: "start",
    headerAlign: "start",
    mobile: "hidden",
  },
];

const previewCount = 3;

export type ProjectDetailSection = "summary" | "timeline" | "history";

type ProjectDetailStatusProps = {
  project: ProjectListItem;
  goals: Goal[];
  tasks: Task[];
  section?: ProjectDetailSection;
};

/**
 * formatChangedAt
 *
 * 변경 시각을 날짜와 시분으로 표시합니다.
 *
 * @param value - 변경 시각
 * @returns 화면용 변경 시점
 */
function formatChangedAt(value: string) {
  const [date, time = ""] = value.split("T");
  const clock = time.slice(0, 5);

  if (!clock) {
    return formatDate(date);
  }

  return `${formatDate(date)} ${clock}`;
}

/**
 * changeReason
 *
 * 마감일 변경 행에 보여줄 짧은 사유입니다.
 *
 * @param change - 마감일 변경 기록
 * @returns 변경 사유
 */
function changeReason(change: ProjectDeadlineChange) {
  const reason = change.reason?.trim();

  if (reason) {
    return reason;
  }

  if (change.overdueDaysAtChange > 0) {
    return "지연 일정 조정";
  }

  return "일정 조정";
}

/**
 * formatExtensionLabel
 *
 * 마감일이 늘어난 날수를 연장 문구로 바꿉니다.
 *
 * @param delta - 이전 마감일과 변경 마감일의 일수 차이
 * @returns 연장 또는 단축 문구
 */
function formatExtensionLabel(delta: number) {
  if (delta > 0) {
    return `${delta}일 연장`;
  }

  if (delta < 0) {
    return `${Math.abs(delta)}일 단축`;
  }

  return "변경 없음";
}

/**
 * HistoryChangeDetail
 *
 * 마감일 변경 행을 펼쳤을 때 사유와 경과를 보여 줍니다.
 * 좁은 화면에서는 변경자와 변경 시각도 함께 둡니다.
 *
 * @param props - HistoryChangeDetail 컴포넌트 Props
 * @param props.change - 마감일 변경 기록
 * @param props.actor - 변경한 사람
 */
function HistoryChangeDetail({ change, actor }: { change: ProjectDeadlineChange; actor: string }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 border-b border-[var(--color-border)] pb-3 md:gap-6 md:border-b-0 md:pb-0">
        <p className="shrink-0 text-xs leading-5 font-medium text-[var(--color-text-secondary)]">
          변경 사유
        </p>
        <p className="text-sm leading-5 text-[var(--color-text)]">{changeReason(change)}</p>
      </div>
      <div className="mt-3 space-y-2 md:hidden">
        <p className="flex items-baseline gap-2">
          <span className="shrink-0 text-xs leading-5 font-medium text-[var(--color-text-secondary)]">
            변경자
          </span>
          <span className="text-sm leading-5 font-medium text-[var(--color-text)]">{actor}</span>
        </p>
        <p className="flex items-baseline gap-2">
          <span className="shrink-0 text-xs leading-5 font-medium text-[var(--color-text-secondary)]">
            변경 시각
          </span>
          <span className="text-sm leading-5 font-medium text-[var(--color-text)] tabular-nums">
            {formatChangedAt(change.changedAt)}
          </span>
        </p>
      </div>
      {change.overdueDaysAtChange > 0 ? (
        <p className="mt-3 flex items-center gap-1 text-xs leading-4 text-[var(--color-danger-text)]">
          <AppIcon icon={Clock} size="xs" className="shrink-0" />
          변경 당시 이전 마감일 {change.overdueDaysAtChange}일 경과
        </p>
      ) : null}
    </div>
  );
}

/**
 * IconTile
 *
 * 상태 카드 제목 옆의 검정 아이콘입니다.
 *
 * @param props - IconTile 컴포넌트 Props
 * @param props.children - 칸 안 아이콘
 */
function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-[var(--color-text)] [&_svg]:h-4 [&_svg]:w-4">
      {children}
    </span>
  );
}

/**
 * DeadlineChangeButton
 *
 * 프로젝트 수정 화면으로 이동하는 마감일 변경 버튼입니다.
 * 세컨더리 버튼이고, 좁은 화면에서는 높이를 줄입니다.
 *
 * @param props - DeadlineChangeButton 컴포넌트 Props
 * @param props.projectId - 프로젝트 번호
 * @param props.compact - 좁은 화면용으로 높이와 여백을 줄일지
 * @param props.fullWidth - 버튼을 칸 너비에 맞출지
 */
function DeadlineChangeButton({
  projectId,
  compact = false,
  fullWidth = false,
}: {
  projectId: number;
  compact?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <Link
      href={getProjectEditPath(projectId, "settings")}
      className={fullWidth ? "block w-full" : undefined}
    >
      <SecondaryButton
        className={
          fullWidth
            ? "h-9 max-h-9 min-h-9 w-full justify-center"
            : compact
              ? "h-8 max-h-8 min-h-8 gap-1 px-2"
              : "h-9 max-h-9 min-h-9"
        }
        icon={fullWidth ? undefined : <AppIcon icon={Calendar} size={compact ? "xs" : "sm"} />}
      >
        마감일 변경
      </SecondaryButton>
    </Link>
  );
}

/**
 * DeadlineTimeline
 *
 * 마감일 변경을 시간 순으로 짧게 보여 줍니다.
 *
 * @param props - DeadlineTimeline 컴포넌트 Props
 * @param props.changes - 마감일 변경 기록
 */
function DeadlineTimeline({ changes }: { changes: ProjectDeadlineChange[] }) {
  if (changes.length === 0) {
    return (
      <p className="text-sm leading-5 text-[var(--color-text-secondary)]">
        기록된 일정이 없습니다.
      </p>
    );
  }

  return (
    <ol className="flex flex-col">
      {changes.map((change) => (
        <li
          key={change.id}
          className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-3 border-b border-[var(--color-border)] py-3 last:border-b-0"
        >
          <p className="text-xs leading-5 font-medium text-[var(--color-text-secondary)] tabular-nums">
            {formatChangedAt(change.changedAt)}
          </p>
          <div className="min-w-0">
            <p className="text-sm leading-5 font-medium text-[var(--color-text)] tabular-nums">
              {formatDate(change.previousEndDate)} → {formatDate(change.nextEndDate)}
            </p>
            <p className="mt-0.5 text-sm leading-5 text-[var(--color-text-secondary)]">
              {changeReason(change)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * ProjectDetailStatus
 *
 * 프로젝트 현황 탭입니다.
 * 진행률, 상태 카드, 마감일 변경 이력을 표시합니다.
 *
 * @param props - ProjectDetailStatus 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.goals - 프로젝트 목표
 * @param props.tasks - 프로젝트 태스크
 * @param props.section - 개요 안에서 볼 구역. 요약, 타임라인, 변경 이력
 */
export default function ProjectDetailStatus({
  project,
  goals,
  tasks,
  section = "summary",
}: ProjectDetailStatusProps) {
  const schedule = getProjectScheduleSnapshot(project);
  const changes = getProjectDeadlineChanges(project.id);
  const summary = summarizeProjectDeadlineChanges(changes, project.endDate);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const visibleChanges = showAllHistory ? changes : changes.slice(0, previewCount);
  const historyTruncated = !showAllHistory && changes.length > previewCount;
  const rows: ExpandableListRow[] = visibleChanges.map((change, index) => {
    const delta = getDayDelta(change.previousEndDate, change.nextEndDate);

    return {
      id: String(change.id),
      label: `${index + 1}번 마감일 변경`,
      cells: {
        schedule: (
          <span className="inline-flex items-center gap-2">
            <span className="text-[var(--color-text)] tabular-nums">
              {formatDate(change.previousEndDate)}
            </span>
            <AppIcon icon={ArrowRight} size="sm" className="text-[var(--color-text-secondary)]" />
            <span className="font-semibold text-[var(--color-text)] tabular-nums">
              {formatDate(change.nextEndDate)}
            </span>
          </span>
        ),
        delta: (
          <Badge
            shape="rounded"
            className="bg-[var(--color-hover)] font-semibold text-[var(--color-text-secondary)] tabular-nums"
          >
            {formatExtensionLabel(delta)}
          </Badge>
        ),
        actor: <span className="font-medium text-[var(--color-text)]">{project.creatorName}</span>,
        changedAt: (
          <span className="text-[var(--color-text-secondary)] tabular-nums">
            {formatChangedAt(change.changedAt)}
          </span>
        ),
      },
      detail: <HistoryChangeDetail change={change} actor={project.creatorName} />,
    };
  });

  if (section === "timeline") {
    return <DeadlineTimeline changes={changes} />;
  }

  if (section === "summary") {
    return <ProjectOverviewSummary project={project} goals={goals} tasks={tasks} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <section className={`${panelClassName} order-4 min-w-0 overflow-hidden`}>
        <div className="px-3 py-3 md:px-4 md:py-3">
          <SectionHeader
            icon={<AppIcon icon={History} size="md" />}
            title="마감일 변경 이력"
            titleClassName="text-base leading-5 font-semibold"
            plain
            actions={
              <div className="hidden items-center gap-2 md:flex">
                {historyTruncated ? (
                  <SecondaryButton
                    className="h-9 max-h-9 min-h-9"
                    icon={<AppIcon icon={List} size="sm" />}
                    onClick={() => setShowAllHistory(true)}
                  >
                    전체 {changes.length}건 보기
                  </SecondaryButton>
                ) : null}
                <DeadlineChangeButton projectId={project.id} />
              </div>
            }
          />
          {project.isDelayed ? (
            <div className="mt-3 hidden flex-wrap items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-hover-soft)] px-3 py-2 text-sm leading-5 md:flex">
              <AppIcon icon={Clock} size="sm" className="shrink-0 text-[var(--color-danger)]" />
              <Badge
                shape="rounded"
                className="bg-[var(--color-danger-soft)] font-semibold text-[var(--color-danger)] tabular-nums"
              >
                {schedule.overdueDays}일 경과
              </Badge>
              <span>
                <span className="font-semibold text-[var(--color-text)]">
                  현재 마감일을 넘겼어요.
                </span>{" "}
                <span className="font-normal text-[var(--color-text-secondary)]">
                  남은 작업과 일정을 확인해 주세요.
                </span>
              </span>
            </div>
          ) : null}
          <div className="mt-3 hidden items-stretch md:flex">
            {(
              [
                {
                  icon: History,
                  label: "변경 횟수",
                  value: `${summary.changeCount}회`,
                  valueClassName: "text-[var(--color-text)]",
                },
                {
                  icon: CalendarDays,
                  label: "최초 마감일",
                  value: formatDate(summary.originalEndDate),
                  valueClassName: "text-[var(--color-text)]",
                },
                {
                  icon: TrendingUp,
                  label: "최초 대비 마감",
                  value: formatSignedProjectDays(summary.slipFromOriginalDays),
                  valueClassName:
                    summary.slipFromOriginalDays > 0
                      ? "text-[var(--color-danger-text)]"
                      : "text-[var(--color-text)]",
                },
              ] as const
            ).map((item, index) => (
              <div
                key={item.label}
                className={`flex min-w-0 flex-1 flex-col ${index > 0 ? "border-l border-[var(--color-border)] pl-6" : ""}`}
              >
                <div className="flex items-center gap-2">
                  <IconTile>
                    <AppIcon icon={item.icon} size="sm" />
                  </IconTile>
                  <p className="text-xs leading-5 font-medium text-[var(--color-text)]">
                    {item.label}
                  </p>
                </div>
                <p
                  className={`mt-2 text-xl leading-7 font-bold tabular-nums ${item.valueClassName}`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-2 rounded-[var(--radius-sm)] bg-[var(--color-hover-soft)] px-3 py-3 text-center text-sm leading-5 md:hidden">
            <p className="text-[var(--color-text-secondary)]">
              변경{" "}
              <span className="font-semibold text-[var(--color-text)]">
                {summary.changeCount}회
              </span>
            </p>
            <p className="border-l border-[var(--color-border)] text-[var(--color-text-secondary)]">
              최초 대비{" "}
              <span
                className={`font-semibold tabular-nums ${summary.slipFromOriginalDays > 0 ? "text-[var(--color-danger-text)]" : "text-[var(--color-text)]"}`}
              >
                {formatSignedProjectDays(summary.slipFromOriginalDays)}
              </span>
            </p>
          </div>
        </div>
        <div className="px-3 pb-3 md:px-4 md:pb-3">
          <ExpandableList
            columns={historyColumns}
            rows={rows}
            defaultExpandedIds={rows[0] ? [rows[0].id] : []}
            headerPaddingLeft={10}
            headerPaddingRight={10}
            minWidth={640}
            detailClassName="bg-[var(--color-hover-soft)]"
            empty="마감일 변경 이력이 없습니다."
          />
        </div>
        {historyTruncated ? (
          <>
            <p className="hidden px-5 pb-4 text-right text-xs leading-4 text-[var(--color-text-secondary)] md:block">
              최근 {previewCount}건만 표시합니다.
            </p>
            <div className="px-[10px] pb-[10px] md:hidden">
              <SecondaryButton
                className="h-10 w-full justify-center"
                onClick={() => setShowAllHistory(true)}
              >
                전체 {changes.length}건 보기
              </SecondaryButton>
            </div>
          </>
        ) : null}
      </section>
    </div>
  );
}
