"use client";

import { useQueryClient } from "@tanstack/react-query";

import Badge from "@/components/kit/Badge";
import Button from "@/components/kit/Button";
import Checkbox from "@/components/kit/Checkbox";

import {
  formatMonthDot,
  getNextTasks,
  getTaskLateDays,
} from "@/features/projects/detail/projectOverviewModel";
import ProjectProgressCard from "@/features/projects/detail/ProjectProgressCard";
import ProjectScheduleCard from "@/features/projects/detail/ProjectScheduleCard";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";

import { cn } from "@/lib/cn";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Goal } from "@/features/goals/types/goal";
import type { ProjectDeadlineChange, ProjectListItem } from "@/features/projects/types/project";
import type { ActivityDay } from "@/features/projects/utils/activityMosaic";
import type { Task } from "@/features/tasks/types/task";

type ProjectOverviewProps = {
  project: ProjectListItem;
  goals: Goal[];
  tasks: Task[];
  activity: ActivityDay[];
  deadlineChanges: ProjectDeadlineChange[];
  lateDays: number | null;
  today: string;
  /** 「태스크 보기」 · 「기록 보기」 주소 */
  tabHref: (tab: "tasks" | "history") => string;
};

const cardClassName =
  "rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]";

/**
 * 상세 개요 탭 (보드 03 · T · M 03). 진행 → 일정 → [다음에 할 일 2 | 최근 기록 1] (웹),
 * 태블릿 · 모바일은 진행 → 일정 → 다음에 할 일(2개)만.
 */
export default function ProjectOverview({
  project,
  goals,
  tasks,
  activity,
  deadlineChanges,
  lateDays,
  today,
  tabHref,
}: ProjectOverviewProps) {
  const lateTaskIds = new Set(
    tasks.filter((task) => getTaskLateDays(task, today) != null).map((task) => task.id),
  );

  return (
    <>
      <ProjectProgressCard
        project={project}
        tasks={tasks}
        lateTaskIds={lateTaskIds}
        lateDays={lateDays}
      />
      <ProjectScheduleCard
        project={project}
        goals={goals}
        activity={activity}
        deadlineChanges={deadlineChanges}
        lateDays={lateDays}
        today={today}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <NextTasksCard
          projectId={project.id}
          tasks={tasks}
          goals={goals}
          today={today}
          href={tabHref("tasks")}
        />
        {deadlineChanges.length > 0 ? (
          <RecentRecordsCard changes={deadlineChanges} href={tabHref("history")} />
        ) : null}
      </div>
    </>
  );
}

function NextTasksCard({
  projectId,
  tasks,
  goals,
  today,
  href,
}: {
  projectId: number;
  tasks: Task[];
  goals: Goal[];
  today: string;
  href: string;
}) {
  const queryClient = useQueryClient();
  const { updateTaskMutation } = useTaskMutations(projectId);
  const next = getNextTasks(tasks, 3);
  const goalName = (task: Task) => goals.find((goal) => goal.id === task.goalId)?.title;

  const complete = async (task: Task) => {
    await updateTaskMutation.mutateAsync({ ...task, status: "DONE" });
    // 진행률 · 지연 수는 프로젝트 쪽에서 다시 센다
    await queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
  };

  return (
    <section
      aria-labelledby="project-next-title"
      className={cn(cardClassName, "p-5 max-lg:px-4 max-lg:py-2")}
    >
      <div className="flex items-center gap-2 max-lg:py-2">
        <h2
          id="project-next-title"
          className="text-lg font-semibold max-lg:text-sm max-lg:font-bold"
        >
          다음에 할 일
        </h2>
        <span className="text-xs text-[var(--t3)] max-lg:hidden">마감 지난 순</span>
        <span className="flex-1" />
        <Button href={href} variant="ghost" size="xs" className="max-lg:hidden">
          태스크 보기
        </Button>
      </div>
      {next.length === 0 ? (
        <p className="mt-2 text-xs text-[var(--t3)]">남은 태스크가 없어요</p>
      ) : (
        <ul className="mt-2 max-lg:mt-0">
          {next.map((task, index) => {
            const late = getTaskLateDays(task, today);
            const goal = goalName(task);

            return (
              <li
                key={task.id}
                className={cn(
                  "flex min-h-10 items-center gap-2.5 text-sm max-lg:min-h-12 max-lg:border-t max-lg:border-[var(--divider)]",
                  index > 0 && "border-t border-[var(--divider)]",
                  // 태블릿 · 모바일은 2개 (보드 T · M 03)
                  index > 1 && "max-lg:hidden",
                )}
              >
                <Checkbox
                  checked={task.status === "DONE"}
                  onChange={() => void complete(task)}
                  label={`‘${task.title}’ 완료`}
                />
                <span className="min-w-0 flex-1 truncate">{task.title}</span>
                {goal ? (
                  <span className="max-w-40 shrink-0 truncate text-xs text-[var(--t3)] max-lg:hidden">
                    {goal}
                  </span>
                ) : null}
                {late != null ? (
                  <Badge tone="bad">
                    {late}일<span className="max-lg:hidden"> 지연</span>
                  </Badge>
                ) : task.dueDate ? (
                  <span className="shrink-0 text-xs text-[var(--t3)]">
                    {formatMonthDot(task.dueDate)}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function RecentRecordsCard({ changes, href }: { changes: ProjectDeadlineChange[]; href: string }) {
  return (
    <section
      aria-labelledby="project-records-title"
      className={cn(cardClassName, "flex flex-col gap-3 p-5 max-lg:hidden")}
    >
      <div className="flex items-center gap-2">
        <h3 id="project-records-title" className="flex-1 text-base font-semibold">
          최근 기록
        </h3>
        <Button href={href} variant="ghost" size="xs">
          기록 보기
        </Button>
      </div>
      {changes.slice(0, 3).map((change) => (
        <div key={change.id} className="flex flex-col gap-0.5 text-sm">
          <span>
            마감일 {formatMonthDot(change.previousEndDate)} → {formatMonthDot(change.nextEndDate)}
          </span>
          <span className="text-xs text-[var(--t3)]">
            {formatMonthDot(change.changedAt.slice(0, 10))}
            {change.reason ? ` · 사유: ${change.reason}` : ""}
          </span>
        </div>
      ))}
    </section>
  );
}
