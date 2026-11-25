"use client";

import { useQueryClient } from "@tanstack/react-query";

import Badge from "@/components/kit/Badge";
import Button from "@/components/kit/Button";
import Checkbox from "@/components/kit/Checkbox";
import { useToast } from "@/components/kit/Toast";
import { collapseClassName, useDelayedComplete } from "@/components/kit/useDelayedComplete";

import { TOAST_TEXT } from "@/content/ui";
import { historyWideText } from "@/features/projects/detail/projectHistoryModel";
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
import type { Task } from "@/features/tasks/types/task";
import type { ProjectHistoryEntry } from "@/lib/mock/projectHistory";

type ProjectOverviewProps = {
  project: ProjectListItem;
  goals: Goal[];
  tasks: Task[];
  deadlineChanges: ProjectDeadlineChange[];
  history: ProjectHistoryEntry[];
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
  deadlineChanges,
  history,
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
        tasks={tasks}
        deadlineChanges={deadlineChanges}
        lateDays={lateDays}
        today={today}
        historyHref={tabHref("history")}
      />
      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <NextTasksCard
          projectId={project.id}
          tasks={tasks}
          goals={goals}
          today={today}
          href={tabHref("tasks")}
        />
        {history.length > 0 ? (
          <RecentRecordsCard entries={history} href={tabHref("history")} />
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
  const toast = useToast();
  const { updateTaskMutation } = useTaskMutations(projectId);
  const next = getNextTasks(tasks, 3);
  const goalName = (task: Task) => goals.find((goal) => goal.id === task.goalId)?.title;

  const complete = async (task: Task) => {
    await updateTaskMutation.mutateAsync({ ...task, status: "DONE" });
    // 진행률 · 지연 수는 프로젝트 쪽에서 다시 센다
    await queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
    toast(TOAST_TEXT.taskCompleted, {
      undo: () =>
        void updateTaskMutation
          .mutateAsync(task)
          .then(() => queryClient.invalidateQueries({ queryKey: projectQueryKeys.all })),
    });
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
          {next.map((task, index) => (
            <NextTaskRow
              key={task.id}
              task={task}
              goal={goalName(task)}
              late={getTaskLateDays(task, today)}
              index={index}
              onComplete={() => void complete(task)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentRecordsCard({ entries, href }: { entries: ProjectHistoryEntry[]; href: string }) {
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
      {entries.slice(0, 3).map((entry) => {
        const { text, strong } = historyWideText(entry);
        return (
          <div key={entry.id} className="flex flex-col gap-0.5 text-sm">
            <span className="truncate">
              {text}
              {strong}
            </span>
            <span className="text-xs text-[var(--t3)]">
              {formatMonthDot(entry.at.slice(0, 10))}
              {entry.reason ? ` · 사유: ${entry.reason}` : ""}
            </span>
          </div>
        );
      })}
    </section>
  );
}

/** 다음에 할 일 한 줄. 체크하면 1초 뒤 접히며 완료 (보드 S5) */
function NextTaskRow({
  task,
  goal,
  late,
  index,
  onComplete,
}: {
  task: Task;
  goal?: string;
  late: number | null;
  index: number;
  onComplete: () => void;
}) {
  const { stage, start } = useDelayedComplete(onComplete);
  const looksDone = stage !== "idle";

  return (
    // 태블릿 · 모바일은 2개 (보드 T · M 03)
    <li className={cn(collapseClassName(stage), index > 1 && "max-lg:hidden")}>
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "flex min-h-10 items-center gap-2.5 text-sm max-lg:min-h-12 max-lg:border-t max-lg:border-[var(--divider)]",
            index > 0 && "border-t border-[var(--divider)]",
          )}
        >
          <Checkbox checked={looksDone} onChange={start} label={`‘${task.title}’ 완료`} />
          <span
            className={cn(
              "min-w-0 flex-1 truncate transition-colors duration-150",
              looksDone && "text-[var(--t3)] line-through",
            )}
          >
            {task.title}
          </span>
          {goal ? (
            <span className="max-w-40 shrink-0 truncate text-xs text-[var(--t3)] max-lg:hidden">
              {goal}
            </span>
          ) : null}
          {late != null ? (
            <Badge tone="bad">{late}일 지남</Badge>
          ) : task.dueDate ? (
            <span className="shrink-0 text-xs text-[var(--t3)]">
              {formatMonthDot(task.dueDate)}
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}
