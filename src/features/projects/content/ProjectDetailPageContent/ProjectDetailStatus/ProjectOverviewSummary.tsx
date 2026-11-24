import Link from "next/link";

import Badge from "@/components/ui/badge/Badge";
import { AppIcon, ArrowRight, Calendar, CircleAlert } from "@/components/ui/icon";

import { getGoalScheduleMark } from "@/features/goals/utils/goalUtils";
import {
  formatProjectDate,
  getProjectDaysAfterEnd,
  getProjectScheduleSnapshot,
  getProjectStatusStyles,
} from "@/features/projects/utils/projectUtils";
import { taskTodayStamp } from "@/features/tasks/utils/taskUtils";

import { getGoalDetailPath } from "@/lib/projectRoutes";

import type { Goal } from "@/features/goals/types/goal";
import type { ProjectListItem } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

const sectionTitleClassName = "text-lg leading-7 font-bold text-[var(--color-text)]";
const labelClassName = "text-xs leading-4 font-medium text-[var(--color-text-secondary)]";
const valueClassName = "text-base leading-6 font-bold text-[var(--color-text)] tabular-nums";
const bodyClassName = "text-sm leading-5 font-medium text-[var(--color-text)]";
const viewLinkClassName =
  "inline-flex shrink-0 items-center gap-1 text-xs leading-5 font-medium text-[var(--color-text-secondary)]";
const noticeCardClassName =
  "rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-4";
const summaryTrackClassName = "h-3 overflow-hidden rounded-full bg-[#E8EEF5]";
const goalTrackClassName = "h-2 overflow-hidden rounded-full bg-[#E8EEF5]";
const taskTrackClassName = "h-4 overflow-hidden rounded-full bg-[#E8EEF5]";
const progressFillClassName = "h-full rounded-full bg-[#3B82F6]";
const delayBadgeClassName = getProjectStatusStyles("DELAYED").badge;
const dueBadgeClassName = getProjectStatusStyles("IN_PROGRESS").badge;

const taskSegmentColors = {
  done: "#3B82F6",
  active: "#93C5FD",
  delayed: "#EF4444",
  waiting: "#D1D5DB",
} as const;

type ScheduleItem = {
  id: string;
  title: string;
  date: string;
  daysAfter: number;
};

type ProjectOverviewSummaryProps = {
  project: ProjectListItem;
  goals: Goal[];
  tasks: Task[];
};

/**
 * isOpenTaskDelayed
 *
 * 끝나지 않은 태스크가 마감일을 넘겼는지 확인합니다.
 *
 * @param task - 확인할 태스크
 * @param today - 오늘 날짜. YYYY-MM-DD
 * @returns 지연이면 true
 */
function isOpenTaskDelayed(task: Task, today: string) {
  return task.status !== "DONE" && task.dueDate < today;
}

/**
 * formatDueBadge
 *
 * 마감까지 남은 날을 D-n 뱃지 문구로 바꿉니다.
 *
 * @param daysAfter - 오늘이 마감일보다 며칠 뒤인지. 음수면 아직 전입니다
 * @returns 뱃지 문구
 */
function formatDueBadge(daysAfter: number) {
  if (daysAfter === 0) {
    return "D-Day";
  }

  return `D-${Math.abs(daysAfter)}`;
}

/**
 * findUpcomingItem
 *
 * 아직 끝나지 않은 목표와 태스크 중 가장 가까운 일정을 고릅니다.
 *
 * @param goals - 프로젝트 목표
 * @param tasks - 프로젝트 태스크
 * @returns 다가오는 일정. 없으면 null
 */
function findUpcomingItem(goals: Goal[], tasks: Task[]): ScheduleItem | null {
  const items: ScheduleItem[] = [
    ...goals
      .filter((goal) => goal.status !== "COMPLETED")
      .map((goal) => ({
        id: `goal-${goal.id}`,
        title: goal.title,
        date: goal.endDate,
        daysAfter: getProjectDaysAfterEnd(goal.endDate),
      })),
    ...tasks
      .filter((task) => task.status !== "DONE")
      .map((task) => ({
        id: `task-${task.id}`,
        title: task.title,
        date: task.dueDate,
        daysAfter: getProjectDaysAfterEnd(task.dueDate),
      })),
  ];

  return (
    items
      .filter((item) => item.daysAfter <= 0)
      .sort((left, right) => right.daysAfter - left.daysAfter)[0] ?? null
  );
}

/**
 * ProjectOverviewSummary
 *
 * 개요의 요약 탭에 진행률, 진행 중인 목표, 태스크 현황, 일정과 확인 항목을 표시합니다.
 *
 * @param props - ProjectOverviewSummary 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.goals - 프로젝트 목표
 * @param props.tasks - 프로젝트 태스크
 */
export default function ProjectOverviewSummary({
  project,
  goals,
  tasks,
}: ProjectOverviewSummaryProps) {
  const schedule = getProjectScheduleSnapshot(project);
  const today = taskTodayStamp();
  const percent = Math.min(100, Math.max(0, project.progress));
  const activeGoals = goals.filter((goal) => goal.status === "IN_PROGRESS");
  const doneCount = tasks.filter((task) => task.status === "DONE").length;
  const delayedTasks = tasks
    .filter((task) => isOpenTaskDelayed(task, today))
    .sort((left, right) => left.dueDate.localeCompare(right.dueDate));
  const delayedCount = delayedTasks.length;
  const activeCount = tasks.filter(
    (task) => task.status === "IN_PROGRESS" && !isOpenTaskDelayed(task, today),
  ).length;
  const waitingCount = tasks.filter(
    (task) => task.status === "TODO" && !isOpenTaskDelayed(task, today),
  ).length;
  const taskTotal = tasks.length;
  const upcoming = findUpcomingItem(goals, tasks);
  const attention = delayedTasks.slice(0, 3);
  const taskSegments = [
    { id: "done", count: doneCount, color: taskSegmentColors.done },
    { id: "active", count: activeCount, color: taskSegmentColors.active },
    { id: "delayed", count: delayedCount, color: taskSegmentColors.delayed },
    { id: "waiting", count: waitingCount, color: taskSegmentColors.waiting },
  ];
  const summaryStats = [
    {
      label: "목표",
      value: `${project.completedGoals} / ${project.totalGoals} 완료`,
      delayed: false,
    },
    {
      label: "태스크",
      value: `${project.completedTasks} / ${project.totalTasks} 완료`,
      delayed: false,
    },
    {
      label: "남은 일정",
      value:
        schedule.remainingDays > 0
          ? `${schedule.remainingDays}일`
          : schedule.tone === "today"
            ? "D-Day"
            : "0일",
      delayed: schedule.overdueDays > 0,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className={sectionTitleClassName}>진행 요약</h2>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="shrink-0 sm:w-[7.5rem]">
            <p className="text-4xl leading-9 font-bold text-[var(--color-text)] tabular-nums">
              {percent}%
            </p>
            <p className="mt-1 text-xs leading-4 text-[var(--color-text-secondary)]">
              전체 태스크 기준
            </p>
          </div>
          <div className="grid min-w-0 flex-1 grid-cols-3">
            {summaryStats.map((item) => (
              <div
                key={item.label}
                className="min-w-0 border-l border-[var(--color-border)] px-3 text-center"
              >
                <p className={labelClassName}>{item.label}</p>
                <p className={`mt-1 ${valueClassName}`}>{item.value}</p>
                {item.delayed ? (
                  <Badge shape="pill" size="sm" className={`mt-1.5 ${delayBadgeClassName}`}>
                    {schedule.overdueDays}일 지연
                  </Badge>
                ) : null}
              </div>
            ))}
          </div>
        </div>
        <div className={`mt-4 ${summaryTrackClassName}`}>
          <div className={progressFillClassName} style={{ width: `${percent}%` }} />
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 md:gap-0">
        <section className="min-w-0 md:pr-6">
          <h2 className={sectionTitleClassName}>진행 중인 목표</h2>
          {activeGoals.length === 0 ? (
            <p className="mt-4 text-sm leading-5 text-[var(--color-text-secondary)]">
              진행 중인 목표가 없습니다.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-5">
              {activeGoals.map((goal) => {
                const delayed = getGoalScheduleMark(goal).tone === "delayed";
                const goalPercent = Math.min(100, Math.max(0, goal.progress));

                return (
                  <li key={goal.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className={`min-w-0 truncate ${bodyClassName}`}>{goal.title}</p>
                      <p className="shrink-0 text-sm leading-5 font-bold text-[var(--color-text)] tabular-nums">
                        {goalPercent}%
                      </p>
                    </div>
                    <div className={`mt-2 ${goalTrackClassName}`}>
                      <div className={progressFillClassName} style={{ width: `${goalPercent}%` }} />
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="flex min-w-0 items-center gap-2 text-xs leading-5 font-medium text-[var(--color-text-secondary)]">
                        <span className="tabular-nums">
                          태스크 {goal.completedTasks} / {goal.totalTasks}
                        </span>
                        {delayed ? (
                          <Badge shape="pill" size="sm" className={delayBadgeClassName}>
                            지연
                          </Badge>
                        ) : null}
                      </p>
                      <Link
                        href={getGoalDetailPath(goal.id, project.id)}
                        className={viewLinkClassName}
                      >
                        목표 보기
                        <AppIcon icon={ArrowRight} size="sm" />
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="mt-8 min-w-0 border-[var(--color-border)] md:mt-0 md:border-l md:pl-6">
          <h2 className={sectionTitleClassName}>태스크 현황</h2>
          <div className="mt-4 grid grid-cols-4">
            {[
              { label: "완료", count: doneCount, className: "text-[var(--color-text)]" },
              { label: "진행 중", count: activeCount, className: "text-[var(--color-text)]" },
              { label: "지연", count: delayedCount, className: "text-red-500" },
              { label: "미시작", count: waitingCount, className: "text-[var(--color-text)]" },
            ].map((item) => (
              <div key={item.label} className="min-w-0 text-center">
                <p className={labelClassName}>{item.label}</p>
                <p className={`mt-1 text-2xl leading-8 font-bold tabular-nums ${item.className}`}>
                  {item.count}
                </p>
              </div>
            ))}
          </div>
          <div className={`mt-4 ${taskTrackClassName}`}>
            {taskTotal > 0 ? (
              <div className="flex h-full">
                {taskSegments.map((segment) =>
                  segment.count > 0 ? (
                    <div
                      key={segment.id}
                      className="h-full"
                      style={{
                        width: `${(segment.count / taskTotal) * 100}%`,
                        backgroundColor: segment.color,
                      }}
                    />
                  ) : null,
                )}
              </div>
            ) : null}
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className={noticeCardClassName}>
          <div className="flex items-center gap-2">
            <AppIcon icon={Calendar} size="sm" />
            <h2 className={sectionTitleClassName}>다가오는 일정</h2>
          </div>
          {upcoming ? (
            <div className="mt-4 flex items-center justify-between gap-3">
              <p className={`min-w-0 truncate ${bodyClassName}`}>{upcoming.title}</p>
              <p className="flex shrink-0 items-center gap-2">
                <span className={`${bodyClassName} tabular-nums`}>
                  {formatProjectDate(upcoming.date)}
                </span>
                <Badge shape="pill" size="sm" className={dueBadgeClassName}>
                  {formatDueBadge(upcoming.daysAfter)}
                </Badge>
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-5 text-[var(--color-text-secondary)]">
              다가오는 일정이 없습니다.
            </p>
          )}
        </section>

        <section className={noticeCardClassName}>
          <div className="flex items-center gap-2">
            <AppIcon icon={CircleAlert} size="sm" className="text-red-500" />
            <h2 className={sectionTitleClassName}>확인 필요</h2>
          </div>
          {attention.length === 0 ? (
            <p className="mt-4 text-sm leading-5 text-[var(--color-text-secondary)]">
              확인할 항목이 없습니다.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {attention.map((task) => (
                <li key={task.id} className="flex items-center justify-between gap-3">
                  <p className={`min-w-0 truncate ${bodyClassName}`}>{task.title}</p>
                  <Badge shape="pill" size="sm" className={delayBadgeClassName}>
                    {getProjectDaysAfterEnd(task.dueDate)}일 지연
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
