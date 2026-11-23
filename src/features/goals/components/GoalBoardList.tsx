"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { AppIcon, Folder, ListChecks, Target } from "@/components/ui/icon";
import MemberAvatar from "@/components/ui/MemberAvatar";

import GoalStatusLabel from "@/features/goals/components/GoalStatusLabel";
import GoalTag from "@/features/goals/components/GoalTag";
import { getGoalScheduleMark } from "@/features/goals/utils/goalUtils";

import { getMemberInitial, getTeamMember } from "@/lib/mock/teamMembers";

import type { Goal, GoalStatus } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";

type GoalBoardProject = Pick<Project, "id" | "name" | "color">;

type GoalBoardListProps = {
  goals: Goal[];
  projects: GoalBoardProject[];
  showProject?: boolean;
  empty?: ReactNode;
  onSelect: (goal: Goal) => void;
  selectedGoalId?: number | null;
  draft?: Goal | null;
};

const stripTheme: Record<
  GoalStatus,
  {
    badgeClassName: string;
    barClassName: string;
    percentClassName: string;
  }
> = {
  COMPLETED: {
    badgeClassName: "bg-[#e8f8ef] text-[#16a34a]",
    barClassName: "bg-[#22c55e]",
    percentClassName: "text-[#16a34a]",
  },
  IN_PROGRESS: {
    badgeClassName: "bg-[#eaf2ff] text-[#2563eb]",
    barClassName: "bg-[#3b82f6]",
    percentClassName: "text-[#2563eb]",
  },
  NOT_STARTED: {
    badgeClassName: "bg-[#f3f4f6] text-[#9ca3af]",
    barClassName: "bg-[#d1d5db]",
    percentClassName: "text-[#9ca3af]",
  },
};

const goalGridClassName =
  "grid min-w-0 grid-cols-1 items-stretch gap-4 @[680px]:grid-cols-2 @[1080px]:grid-cols-4";

const goalCardButtonClassName =
  "block h-full w-full min-w-0 cursor-pointer rounded-[16px] bg-transparent p-0 text-left outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";

const goalCardClassName =
  "flex h-full min-w-0 flex-col gap-3 rounded-[16px] bg-[var(--color-surface)] p-4 shadow-[0_1px_2px_rgb(20_25_35/4%)] transition-shadow hover:shadow-[0_6px_14px_rgb(20_25_35/8%)]";
const goalCardBorderClassName = "border border-[#e6e8eb]";
const goalSelectedCardClassName = "selected-border";

const goalTitleClassName =
  "min-w-0 flex-1 basis-0 break-words break-keep text-[16px] leading-6 font-semibold tracking-[-0.01em] text-[var(--color-text)]";

const goalTaskCountClassName =
  "inline-flex shrink-0 items-center gap-1 rounded-[8px] px-2 py-1 text-[12px] leading-none font-semibold tabular-nums";

const goalProgressTrackClassName = "h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#eceff3]";

const goalProgressPercentClassName = "shrink-0 text-[13px] leading-5 font-semibold tabular-nums";

const goalStatusRowClassName = "mt-auto flex items-center gap-3 pt-1";

const goalStatusGroupClassName = "inline-flex min-w-0 items-center gap-2";

const goalOverdueDividerClassName = "shrink-0 text-[13px] leading-5 font-normal text-[#d1d5db]";

const goalOverdueClassName =
  "inline-flex min-w-0 items-center text-[13px] leading-5 font-semibold text-[#e5484d]";

const goalTagRowClassName = "flex min-h-7 flex-wrap gap-1.5";
const goalProjectLineClassName =
  "flex min-w-0 items-center gap-1.5 text-[12px] leading-none font-semibold text-[var(--color-text-secondary)]";

const goalPreviewTitleClassName =
  "min-w-0 flex-1 basis-0 break-words break-keep text-[16px] leading-6 font-semibold tracking-[-0.01em] text-[var(--color-text-muted)]";

/**
 * goalOverdueLabel
 *
 * 완료되지 않은 목표의 마감 초과 문구를 만듭니다.
 *
 * @param goal - 확인할 목표
 * @returns 마감이 지났으면 "N일 초과", 아니면 null
 */
function goalOverdueLabel(goal: Goal) {
  const mark = getGoalScheduleMark(goal);

  if (mark.tone !== "delayed") {
    return null;
  }

  const days = Number(mark.label.replace(/[^\d]/g, ""));

  if (!Number.isFinite(days) || days <= 0) {
    return null;
  }

  return `${days}일 초과`;
}

/**
 * goalProjectName
 *
 * 카드에 보여줄 소속 프로젝트 이름을 찾습니다.
 *
 * @param goal - 표시할 목표
 * @param projects - 이름을 찾을 프로젝트
 * @returns 프로젝트 이름. 없으면 "프로젝트 없음"
 */
function goalProjectName(goal: Goal, projects: GoalBoardProject[]) {
  if (goal.projectId == null) {
    return "프로젝트 없음";
  }

  return projects.find((project) => project.id === goal.projectId)?.name ?? "프로젝트 없음";
}

/**
 * GoalAssignee
 *
 * 담당자 프로필 하나를 카드 오른쪽에 표시합니다.
 *
 * @param props - GoalAssignee 컴포넌트 Props
 * @param props.assigneeIds - 담당자 번호
 */
function GoalAssignee({ assigneeIds }: { assigneeIds: number[] }) {
  const assignees = assigneeIds.map((id) => getTeamMember(id)).filter((member) => member != null);
  const assignee = assignees[0];

  if (!assignee) {
    return null;
  }

  return (
    <MemberAvatar
      label={getMemberInitial(assignee.name)}
      title={assignees.map((member) => member.name).join(", ")}
      bordered={false}
    />
  );
}

/**
 * GoalCard
 *
 * 목표 하나를 제목, 태스크 수, 태그, 진행 막대, 상태와 담당자로 표시합니다.
 * 카드를 누르면 목표 상세 드로어를 엽니다.
 *
 * @param props - GoalCard 컴포넌트 Props
 * @param props.goal - 표시할 목표
 * @param props.projects - 프로젝트 이름에 쓰는 프로젝트
 * @param props.showProject - 프로젝트 이름을 보여줄지
 * @param props.onSelect - 카드를 눌렀을 때 실행되는 함수
 * @param props.selected - 이 카드가 선택된 상태인지 여부
 * @param props.readOnly - 누르지 않는 보기 카드인지 여부
 */
function GoalCard({
  goal,
  projects,
  showProject,
  onSelect,
  selected = false,
  readOnly = false,
}: {
  goal: Goal;
  projects: GoalBoardProject[];
  showProject: boolean;
  onSelect?: (goal: Goal) => void;
  selected?: boolean;
  readOnly?: boolean;
}) {
  const theme = stripTheme[goal.status];
  const overdueLabel = goalOverdueLabel(goal);
  const completedTasks = Math.max(0, goal.completedTasks);
  const totalTasks = Math.max(0, goal.totalTasks);
  const progress = Math.min(100, Math.max(0, Math.round(goal.progress)));
  const projectName = goalProjectName(goal, projects);
  const title = goal.title.trim();
  const cardClassName = [
    goalCardClassName,
    readOnly || selected ? goalSelectedCardClassName : goalCardBorderClassName,
  ].join(" ");
  const card = (
    <div className={cardClassName}>
      <div className="flex min-w-0 items-start gap-2">
        <AppIcon icon={Target} size="md" className="mt-0.5 shrink-0 text-[var(--color-text)]" />
        <h3
          title={title || "새 목표"}
          className={title ? goalTitleClassName : goalPreviewTitleClassName}
        >
          {title || "새 목표"}
        </h3>
        <span
          className={`${goalTaskCountClassName} ${theme.badgeClassName}`}
          title={`태스크 ${completedTasks}/${totalTasks}`}
        >
          <AppIcon icon={ListChecks} size="xs" />
          {completedTasks}/{totalTasks}
        </span>
      </div>
      <div className={goalTagRowClassName}>
        {goal.tags.map((tag) => (
          <GoalTag key={tag} tag={tag} />
        ))}
      </div>
      {showProject ? (
        <span className={goalProjectLineClassName} title={projectName}>
          <AppIcon icon={Folder} size="xs" className="shrink-0" />
          <span className="min-w-0 truncate">{projectName}</span>
        </span>
      ) : null}
      <div className="flex min-w-0 items-center gap-3">
        <div
          role="progressbar"
          aria-label="진행률"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className={goalProgressTrackClassName}
        >
          <div
            className={`h-full rounded-full ${theme.barClassName}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className={`${goalProgressPercentClassName} ${theme.percentClassName}`}>
          {progress}%
        </span>
      </div>
      <div className={goalStatusRowClassName}>
        <span className={goalStatusGroupClassName}>
          <GoalStatusLabel status={goal.status} />
          {overdueLabel ? (
            <>
              <span aria-hidden className={goalOverdueDividerClassName}>
                |
              </span>
              <span className={goalOverdueClassName}>
                <span className="truncate">{overdueLabel}</span>
              </span>
            </>
          ) : null}
        </span>
        <span className="ml-auto shrink-0">
          <GoalAssignee assigneeIds={goal.assigneeIds} />
        </span>
      </div>
    </div>
  );

  if (readOnly) {
    return <div className="h-full w-full min-w-0">{card}</div>;
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect?.(goal)}
      className={goalCardButtonClassName}
    >
      {card}
    </button>
  );
}

/**
 * GoalBoardList
 *
 * 목표를 카드로 표시합니다. 너비가 부족하면 다음 줄로 넘깁니다.
 * 전체 목표와 프로젝트 목표에서 같은 카드를 씁니다.
 *
 * @param props - GoalBoardList 컴포넌트 Props
 * @param props.goals - 표시할 목표
 * @param props.projects - 프로젝트 이름에 쓰는 프로젝트
 * @param props.showProject - 프로젝트 이름을 보여줄지
 * @param props.empty - 목표가 없을 때 보여 주는 문구
 * @param props.onSelect - 목표 카드를 눌렀을 때 실행되는 함수
 * @param props.selectedGoalId - 선택 테두리를 둘 목표 번호
 * @param props.draft - 작성 중이라 목록 앞에 보여주는 목표. 보기만 됩니다
 */
export default function GoalBoardList({
  goals,
  projects,
  showProject = false,
  empty = "등록된 목표가 없습니다.",
  onSelect,
  selectedGoalId = null,
  draft = null,
}: GoalBoardListProps) {
  const draftRef = useRef<HTMLDivElement>(null);
  const showingDraft = draft != null;

  useEffect(() => {
    if (!showingDraft) {
      return;
    }

    draftRef.current?.scrollIntoView({ block: "nearest" });
  }, [showingDraft]);

  if (goals.length === 0 && !draft) {
    return (
      <div className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
        <p className="text-body-sm px-5 py-8 text-center text-[var(--color-text-secondary)]">
          {empty}
        </p>
      </div>
    );
  }

  return (
    <div className={goalGridClassName}>
      {draft ? (
        <div ref={draftRef} className="h-full min-w-0">
          <GoalCard goal={draft} projects={projects} showProject={showProject} readOnly />
        </div>
      ) : null}
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          projects={projects}
          showProject={showProject}
          selected={selectedGoalId === goal.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
