"use client";

import { useId, useState } from "react";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import { AppIcon, ClipboardList, LayoutDashboard, Plus } from "@/components/ui/icon";

import HoldAddNotice from "@/features/projects/components/HoldAddNotice";
import SectionHeader from "@/features/projects/components/SectionHeader";
import {
  PROJECT_STATUS_COLOR_SCALES,
  progressGradients,
} from "@/features/projects/constants/projectStatusColors";
import CreateTaskButton from "@/features/tasks/components/board/CreateTaskButton";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";

import type { Goal } from "@/features/goals/types/goal";
import type { ProjectListItem } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

const progressFormulaItems = [
  {
    label: "진행률 = 완료한 태스크 ÷ 전체 태스크 × 100",
    description: "예: 6 ÷ 10 × 100 = 60%",
  },
] as const;

const panelClassName =
  "relative rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]";

type ProjectDetailProgressProps = {
  project: ProjectListItem;
  goals: Goal[];
  tasks: Task[];
};

type TaskCounts = {
  total: number;
  done: number;
  percent: number;
};

/**
 * countTasks
 *
 * 진행 현황에 쓰는 태스크 수와 완료 비율을 계산합니다.
 *
 * @param tasks - 프로젝트 태스크
 * @returns 완료 개수와 완료 비율
 */
function countTasks(tasks: Task[]): TaskCounts {
  const done = tasks.filter((task) => task.status === "DONE").length;
  const total = tasks.length;

  return {
    total,
    done,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  };
}

/**
 * ProgressDonut
 *
 * 완료 태스크 비율을 고리와 가운데 숫자로 표시합니다.
 *
 * @param props - ProgressDonut 컴포넌트 Props
 * @param props.value - 0부터 100 사이의 완료 비율
 * @param props.gradient - 프로젝트 카드와 같은 진행 구간 그라데이션
 * @param props.trackColor - 진행률 고리의 남은 구간 색
 */
function ProgressDonut({
  value,
  gradient,
  trackColor = "var(--color-hover)",
}: {
  value: number;
  gradient: string;
  trackColor?: string;
}) {
  const gradientId = useId().replace(/:/g, "");
  const stops = gradient.match(/#[0-9A-Fa-f]{6}/g) ?? [];
  const from = stops[0] ?? "#6B7280";
  const to = stops[1] ?? from;
  const shown = Math.min(100, Math.max(0, value));
  const radius = 42;
  const trackStroke = 12;
  const progressStroke = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - shown / 100);

  return (
    <div className="relative h-40 w-40">
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={`진행률 ${shown}%`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={trackStroke}
        />
        {shown > 0 ? (
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={progressStroke}
            strokeLinecap={shown >= 100 ? "butt" : "round"}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        ) : null}
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-2xl leading-7 font-bold text-[var(--color-text)] tabular-nums">
        {shown}%
      </span>
    </div>
  );
}

/**
 * ProgressCountLabel
 *
 * 진행률 아래에 완료 수와 전체 태스크 기준을 표시합니다.
 *
 * @param props - ProgressCountLabel 컴포넌트 Props
 * @param props.done - 완료한 개수
 * @param props.total - 전체 개수
 */
function ProgressCountLabel({ done, total }: { done: number; total: number }) {
  return (
    <span className="inline-flex flex-col items-center text-center">
      <span className="text-sm leading-5 font-medium whitespace-nowrap text-[var(--color-text)]">
        <span className="tabular-nums">완료 {done}</span>
        <span className="tabular-nums">
          {" / 전체 "}
          {total}개
        </span>
      </span>
      <span className="text-sm leading-5 text-[var(--color-text-secondary)]">전체 태스크 기준</span>
    </span>
  );
}

/**
 * ProjectDetailProgress
 *
 * 프로젝트 진행률을 표시합니다.
 *
 * @param props - ProjectDetailProgress 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.goals - 프로젝트 목표
 * @param props.tasks - 프로젝트 태스크
 */
export default function ProjectDetailProgress({
  project,
  goals,
  tasks,
}: ProjectDetailProgressProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const { handleCreateTask } = useTaskMutations(project.id);
  const counts = countTasks(tasks);
  const progressGradient = project.isDelayed
    ? progressGradients.IN_PROGRESS
    : progressGradients[project.status];
  const progressTrackColor = project.isDelayed
    ? PROJECT_STATUS_COLOR_SCALES.DELAYED.progress
    : "var(--color-hover)";
  const hasTasks = counts.total > 0;
  const hasGoals = goals.length > 0;
  const onHold = project.status === "ON_HOLD";

  return (
    <section className={`${panelClassName} p-3`}>
      <SectionHeader
        icon={<AppIcon icon={LayoutDashboard} size="md" />}
        title="프로젝트 진행 현황"
        titleClassName="text-base leading-5 font-semibold"
        plain
        tooltip="완료한 태스크를 전체 태스크로 나눈 값입니다. 태스크가 없으면 집계하지 않습니다."
        tooltipItems={progressFormulaItems}
        tooltipCentered
      />

      {onHold && (hasTasks || hasGoals) ? <HoldAddNotice className="mt-3" /> : null}

      {!hasTasks && !hasGoals ? (
        <div className="flex flex-col items-center py-10 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-hover)] text-[var(--color-text-secondary)]">
            <AppIcon icon={ClipboardList} size="xl" />
          </span>
          <p className="mt-4 text-sm leading-5 font-semibold text-[var(--color-text)]">
            아직 등록된 작업이 없어요
          </p>
          {onHold ? (
            <HoldAddNotice className="mt-3" />
          ) : (
            <>
              <p className="mt-1 text-xs leading-4 text-[var(--color-text-secondary)]">
                첫 태스크를 추가해 프로젝트 진행을 시작하세요.
              </p>
              <div className="mt-5 flex justify-center">
                <PrimaryButton
                  className="h-9 max-h-9 min-h-9"
                  icon={
                    <AppIcon icon={Plus} size="sm" className="text-[var(--color-text-inverse)]" />
                  }
                  onClick={() => setCreateOpen(true)}
                >
                  태스크 추가
                </PrimaryButton>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="mt-2 flex flex-col items-center">
          {hasTasks ? (
            <div className="w-full md:hidden">
              <div className="flex items-center justify-between gap-3">
                <p className="text-2xl leading-7 font-bold text-[var(--color-text)] tabular-nums">
                  {counts.percent}%
                </p>
                <p className="text-sm leading-5 text-[var(--color-text-secondary)]">
                  <ProgressCountLabel done={counts.done} total={counts.total} />
                </p>
              </div>
              <div className="relative mt-3 h-3">
                {counts.percent < 100 ? (
                  <div
                    className={
                      counts.percent <= 0
                        ? "absolute inset-x-0 top-1/2 h-2 -translate-y-1/2 rounded-full"
                        : "absolute top-1/2 right-0 h-2 -translate-y-1/2 rounded-r-full"
                    }
                    style={{
                      backgroundColor: progressTrackColor,
                      ...(counts.percent > 0
                        ? {
                            left: `calc(${counts.percent}% - 1px)`,
                          }
                        : {}),
                    }}
                  />
                ) : null}
                {counts.percent > 0 ? (
                  <div
                    className={
                      counts.percent >= 100
                        ? "absolute inset-y-0 left-0 rounded-full"
                        : "absolute inset-y-0 left-0 rounded-l-full"
                    }
                    style={{
                      width: `${counts.percent}%`,
                      backgroundImage: progressGradient,
                    }}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
          <div className="hidden w-40 flex-col items-center justify-center text-center md:flex">
            {hasTasks ? (
              <>
                <ProgressDonut
                  value={counts.percent}
                  gradient={progressGradient}
                  trackColor={progressTrackColor}
                />
                <p className="mt-3 flex w-full justify-center">
                  <ProgressCountLabel done={counts.done} total={counts.total} />
                </p>
              </>
            ) : (
              <>
                <div className="flex h-40 w-40 items-center justify-center rounded-full border-2 border-dashed border-[var(--color-border-strong)] text-2xl leading-7 font-bold text-[var(--color-text-muted)]">
                  —
                </div>
                <p className="mt-3 text-sm leading-5 font-medium text-[var(--color-text)]">
                  진행률 집계 전
                </p>
                <p className="mt-1 text-xs leading-4 text-[var(--color-text-secondary)]">
                  태스크 등록 후 계산됩니다.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <CreateTaskButton
        projectScope={project.id}
        projects={[project]}
        status="TODO"
        showStatusField
        hideTrigger
        isModalOpen={createOpen}
        onModalOpenChange={setCreateOpen}
        onCreate={handleCreateTask}
      />
    </section>
  );
}
