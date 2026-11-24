import Link from "next/link";

import { Crown } from "@/components/ui/icon";
import StatusText, { type StatusTextTone } from "@/components/ui/StatusText";

import ActivityMosaic from "@/features/projects/components/ActivityMosaic";
import FavoriteSelectBox from "@/features/projects/components/FavoriteSelectBox";
import ProjectFolder from "@/features/projects/components/ProjectFolder";
import { getProjectAccentColor } from "@/features/projects/utils/projectColors";
import {
  getProjectScheduleMark,
  getProjectStatusLabel,
} from "@/features/projects/utils/projectUtils";

import { formatDate } from "@/lib/date";
import { getProjectDetailPath } from "@/lib/projectRoutes";

import type { ProjectListItem, ProjectStatus } from "@/features/projects/types/project";
import type { ActivityDay } from "@/features/projects/utils/activityMosaic";
import type { ReactNode } from "react";

type ProjectBoardCardProps = {
  project: ProjectListItem;
  onClick?: () => void;
  cornerAction?: ReactNode;
  selected?: boolean;
  onToggleSelected?: () => void;
  onSelect?: () => void;
  pressed?: boolean;
  /** 날짜별 활동 기록. 넘기면 카드 아래에 활동 모자이크를 그린다 (프로젝트 목록). */
  activity?: readonly ActivityDay[];
};

type ProjectCardLabelPlacement = "top" | "start";

/**
 * ProjectCardShell
 *
 * 프로젝트 색 라벨과 흰 본문을 한 카드로 감쌉니다.
 * 보드는 라벨을 위에, 리스트는 라벨을 앞에 둡니다.
 *
 * @param props - ProjectCardShell 컴포넌트 Props
 * @param props.project - 색을 가져올 프로젝트
 * @param props.placement - 라벨 위치. top은 위, start는 앞
 * @param props.children - 카드 본문
 */
export function ProjectCardShell({
  project,
  placement,
  children,
}: {
  project: ProjectListItem;
  placement: ProjectCardLabelPlacement;
  children: ReactNode;
}) {
  const hasColor = Boolean(project.color?.trim());
  const labelOnTop = placement === "top";

  return (
    <article
      className={`flex min-w-0 overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-project-card)] transition-shadow hover:shadow-[var(--shadow-project-card-hover)] ${labelOnTop ? "flex-col" : ""} `}
      style={{
        backgroundColor: hasColor
          ? getProjectAccentColor(project.color)
          : "var(--color-hover-strong)",
      }}
    >
      <div aria-hidden className={labelOnTop ? "h-[6px] shrink-0" : "w-[6px] shrink-0"} />
      {children}
    </article>
  );
}

const STATUS_TEXT_TONE: Record<ProjectStatus, StatusTextTone> = {
  PLANNED: "neutral",
  IN_PROGRESS: "info",
  ON_HOLD: "warning",
  DONE: "success",
};

const cardFaceClassName = "flex min-h-0 min-w-0 flex-1 flex-col gap-2.5 p-4";
const cardTitleRowClassName = "flex min-w-0 items-start gap-2";
const cardTitleCheckClassName = "mt-1 flex shrink-0";
const cardTitleClassName = "text-card-title line-clamp-2 min-w-0 flex-1 text-[var(--color-text)]";
const cardMetaClassName = "text-caption truncate text-[var(--color-text-secondary)] tabular-nums";

/**
 * 폴더 카드의 기간 · 목표 · 태스크 · 진행률 한 줄을 만든다. 없는 값은 빼고 잇는다.
 *
 * @param project - 표시할 프로젝트
 * @returns 예: `~ 2026.09.01 · 목표 1/4 · 태스크 6/9 · 진행률 67%`
 */
function getProjectCardMeta(project: ProjectListItem) {
  const progress = Math.min(100, Math.max(0, project.progress));
  const deadline = formatDate(project.endDate);
  const parts = [
    deadline ? `~ ${deadline}` : null,
    project.totalGoals > 0 ? `목표 ${project.completedGoals}/${project.totalGoals}` : null,
    project.totalTasks > 0 ? `태스크 ${project.completedTasks}/${project.totalTasks}` : null,
    `진행률 ${progress}%`,
  ];

  return parts.filter(Boolean).join(" · ");
}

/**
 * 폴더 카드 본문: 이름(2줄) → 상태 줄 → 기간 · 목표 · 태스크 · 진행률 (handoff C1).
 *
 * @param props.leading - 이름 앞. 즐겨찾기 편집의 체크
 * @param props.trailing - 이름 뒤. 즐겨찾기 편집의 해제 버튼
 */
export function ProjectCardFace({
  project,
  className = "",
  leading,
  trailing,
}: {
  project: ProjectListItem;
  className?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  const schedule = getProjectScheduleMark(project);
  const delayDays = project.isDelayed && schedule?.tone === "delayed" ? schedule.days : null;

  return (
    <div className={`${cardFaceClassName} ${className}`}>
      <div className={cardTitleRowClassName}>
        {leading ? <span className={cardTitleCheckClassName}>{leading}</span> : null}
        <h3 title={project.name} className={cardTitleClassName}>
          {project.name}
        </h3>
        {trailing ? <span className="self-start">{trailing}</span> : null}
      </div>
      <StatusText
        label={getProjectStatusLabel(project.status)}
        tone={STATUS_TEXT_TONE[project.status]}
        delayLabel={delayDays != null ? `${delayDays}일 지연` : null}
      />
      <p className={cardMetaClassName}>{getProjectCardMeta(project)}</p>
    </div>
  );
}

const projectFolderShellClosedClassName =
  "relative z-10 flex min-h-0 flex-1 flex-col rounded-tr-[16px] rounded-b-[16px] bg-[var(--folder-shell)] shadow-[0_-1px_0_rgb(0_0_0/6%)]";
const projectBoardCardBaseClassName = "h-full transition-[filter]";
const projectBoardCardHoverClassName = "group-hover:drop-shadow-[0_6px_10px_rgb(0_0_0/10%)]";
const projectBoardCardPressedClassName = "drop-shadow-[0_6px_10px_rgb(0_0_0/18%)]";
const projectBoardSelectClassName =
  "group block w-full min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left";

/**
 * ProjectBoardCard
 *
 * 프로젝트 목록 카드를 폴더 모양으로 표시합니다.
 * 왼쪽 위 둥근 탭이 몸통으로 부드럽게 이어지며, 프로젝트 색의 옅은 바탕과 윤곽선으로 칠합니다.
 *
 * @param props - ProjectBoardCard 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.onClick - 카드를 눌러 이동할 때 함께 실행되는 함수
 * @param props.cornerAction - 즐겨찾기 편집 중 이름 옆에 둘 버튼
 * @param props.selected - 즐겨찾기 편집에서 이 카드를 골랐는지 여부
 * @param props.onToggleSelected - 카드 선택을 바꿀 때 실행되는 함수
 * @param props.onSelect - 이동 없이 이 폴더만 고를 때 실행되는 함수
 * @param props.pressed - 고른 폴더인지 여부
 */

export default function ProjectBoardCard({
  project,
  onClick,
  cornerAction,
  selected = false,
  onToggleSelected,
  onSelect,
  pressed = false,
  activity,
}: ProjectBoardCardProps) {
  const folderClassName = [
    projectBoardCardBaseClassName,
    pressed ? projectBoardCardPressedClassName : projectBoardCardHoverClassName,
  ].join(" ");
  const folder = (
    <ProjectFolder
      color={project.color}
      tabLabel={
        project.isMain ? (
          <>
            <Crown size={12} aria-hidden className="mr-1 shrink-0 fill-current" />
            메인 프로젝트
          </>
        ) : undefined
      }
      wideTab={false}
      className={folderClassName}
    >
      <div className={projectFolderShellClosedClassName}>
        <ProjectCardFace
          project={project}
          className="px-4.5"
          leading={
            onToggleSelected ? (
              <FavoriteSelectBox
                checked={selected}
                label={`${project.name} 선택`}
                onChange={onToggleSelected}
              />
            ) : undefined
          }
          trailing={cornerAction}
        />
        {activity ? (
          <div className="px-4.5 pb-4">
            <ActivityMosaic days={activity} color={project.color} />
          </div>
        ) : null}
      </div>
    </ProjectFolder>
  );

  if (onToggleSelected) {
    return (
      // 카드 어디를 눌러도 안의 체크 버튼이 눌린다 (label 기본 동작). 키보드는 체크 버튼으로.
      <label className="group relative block min-w-0 cursor-pointer">{folder}</label>
    );
  }

  if (cornerAction) {
    return <div className="group relative block min-w-0">{folder}</div>;
  }

  if (onSelect) {
    return (
      <button
        type="button"
        aria-pressed={pressed}
        onClick={onSelect}
        className={projectBoardSelectClassName}
      >
        {folder}
      </button>
    );
  }

  return (
    <Link href={getProjectDetailPath(project.id)} onClick={onClick} className="group block min-w-0">
      {folder}
    </Link>
  );
}
