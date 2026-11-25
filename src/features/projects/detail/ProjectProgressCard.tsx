import { Calendar, Target } from "@/components/ui/icon";

import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/date";
import { projectColorVar } from "@/lib/projectPalette";

import type { ProjectListItem } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

type ProjectProgressCardProps = {
  project: ProjectListItem;
  tasks: Task[];
  /** 마감이 지난 태스크 id */
  lateTaskIds: Set<number>;
  /** 프로젝트 지연 일수. 지연이 아니면 null */
  lateDays: number | null;
};

const cardClassName =
  "rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)]";

/**
 * 진행 카드 (보드 03 · T · M 03). 태스크 하나가 막대 한 칸: 완료는 프로젝트 색, 지연은 빨간 테두리, 남음은 --track.
 * 웹: 큰 % 40/48 + 「N개 중 N개 완료」 | 막대 12 + 범례(완료 · 지연 · 남음 | 목표 · 마감).
 * 태블릿 · 모바일: 「67%」 28/36 + 「태스크 6 / 9 완료」 → 막대 14 → 「■ 완료 · □ 지연」.
 */
export default function ProjectProgressCard({
  project,
  tasks,
  lateTaskIds,
  lateDays,
}: ProjectProgressCardProps) {
  const done = tasks.filter((task) => task.status === "DONE").length;
  const late = tasks.filter((task) => lateTaskIds.has(task.id)).length;
  const remaining = tasks.length - done - late;
  const progress = Math.min(100, Math.max(0, project.progress));
  const color = projectColorVar(project.color);
  const segmentTone = (task: Task) =>
    task.status === "DONE" ? "done" : lateTaskIds.has(task.id) ? "late" : "rest";
  // 완료 → 지연 → 남음 순으로 칸을 놓는다 (보드 03)
  const toneOrder = { done: 0, late: 1, rest: 2 } as const;
  const segments = [...tasks].sort((a, b) => toneOrder[segmentTone(a)] - toneOrder[segmentTone(b)]);
  const barLabel = `태스크 ${tasks.length}개 중 ${done}개 완료${late ? `, ${late}개 지연` : ""}`;

  return (
    <section aria-label="진행" className={cardClassName}>
      {/* 웹 (보드 03): 40/24/24 · 왼쪽 숫자 | 오른쪽 막대 · 범례, 사이 40 */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-10 px-6 pt-10 pb-6 max-lg:hidden">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <strong className="text-5xl font-bold tracking-[-0.02em] tabular-nums">
              {progress}
            </strong>
            <span className="text-xl font-semibold">%</span>
          </div>
          <span className="text-xs text-[var(--t3)]">
            {tasks.length}개 중 {done}개 완료
          </span>
        </div>
        <div className="flex min-w-0 flex-col gap-3.5">
          <div role="img" aria-label={barLabel} className="flex gap-1">
            {tasks.length === 0 ? (
              <span className="h-3 flex-1 rounded-[var(--radius-kbd)] bg-[var(--track)]" />
            ) : (
              segments.map((task) => (
                <span
                  key={task.id}
                  title={task.title}
                  style={segmentTone(task) === "done" ? { background: color } : undefined}
                  className={cn(
                    "h-3 flex-1 rounded-[var(--radius-kbd)]",
                    segmentTone(task) === "late" &&
                      "bg-[var(--surface)] shadow-[inset_0_0_0_2px_var(--late-line)]",
                    segmentTone(task) === "rest" && "bg-[var(--track)]",
                  )}
                />
              ))
            )}
          </div>
          <div className="flex flex-wrap items-center gap-5 text-xs">
            <LegendItem
              swatch={
                <span
                  className="size-2 rounded-[var(--radius-tile)]"
                  style={{ background: color }}
                />
              }
              label="완료"
            >
              {done}
            </LegendItem>
            <LegendItem
              swatch={
                <span className="size-2 rounded-[var(--radius-tile)] bg-[var(--surface)] shadow-[inset_0_0_0_2px_var(--late-line)]" />
              }
              label="지연"
            >
              <span className={cn(late > 0 && "font-semibold text-[var(--bad)]")}>{late}</span>
            </LegendItem>
            <LegendItem
              swatch={<span className="size-2 rounded-[var(--radius-tile)] bg-[var(--track)]" />}
              label="남음"
            >
              {remaining}
            </LegendItem>
            <span aria-hidden className="h-3.5 w-px bg-[var(--border)]" />
            <LegendItem
              swatch={<Target size={12} aria-hidden className="text-[var(--t3)]" />}
              label="목표"
            >
              {project.completedGoals} / {project.totalGoals}
            </LegendItem>
            <LegendItem
              swatch={<Calendar size={12} aria-hidden className="text-[var(--t3)]" />}
              label="마감"
            >
              {lateDays != null ? (
                <span className="text-[var(--bad)]">{lateDays}일 지남</span>
              ) : project.endDate ? (
                formatDate(project.endDate)
              ) : (
                "없음"
              )}
            </LegendItem>
          </div>
        </div>
      </div>

      {/* 태블릿 · 모바일 (보드 T · M 03): 16 · 사이 10 */}
      <div className="flex flex-col gap-2.5 p-4 lg:hidden">
        <div className="flex items-center gap-2">
          <strong className="text-3xl font-bold tabular-nums">{progress}%</strong>
          <span className="text-xs text-[var(--t3)]">
            태스크 {done} / {tasks.length} 완료
          </span>
        </div>
        <div role="img" aria-label={barLabel} className="flex gap-0.75">
          {tasks.length === 0 ? (
            <span className="h-3.5 flex-1 rounded-[var(--radius-bar)] bg-[var(--track)]" />
          ) : (
            segments.map((task) => (
              <span
                key={task.id}
                style={segmentTone(task) === "done" ? { background: color } : undefined}
                className={cn(
                  "h-3.5 flex-1 rounded-[var(--radius-bar)]",
                  segmentTone(task) === "late" &&
                    "border-[length:var(--line-dash)] border-[var(--late-line)]",
                  segmentTone(task) === "rest" && "bg-[var(--track)]",
                )}
              />
            ))
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-[var(--t3)]">
          <span>■ 완료 {done}</span>
          {late > 0 ? <span className="text-[var(--bad)]">□ 지연 {late}</span> : null}
        </div>
      </div>
    </section>
  );
}

function LegendItem({
  swatch,
  label,
  children,
}: {
  swatch: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {swatch}
      <span className="text-[var(--t3)]">{label}</span>
      <strong className="font-bold text-[var(--text)] tabular-nums">{children}</strong>
    </span>
  );
}
