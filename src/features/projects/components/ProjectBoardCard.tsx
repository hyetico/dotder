import Link from "next/link";

import FavoriteSelectBox from "@/features/projects/components/FavoriteSelectBox";
import ProjectFolder from "@/features/projects/components/ProjectFolder";
import ProjectStatusIcon from "@/features/projects/components/ProjectStatusIcon";
import { getProjectAccentColor } from "@/features/projects/utils/projectColors";
import {
  getProjectScheduleMark,
  getProjectStatusLabel,
  getProjectStatusStyles,
} from "@/features/projects/utils/projectUtils";

import { getProjectDetailPath } from "@/lib/projectRoutes";

import type { ProjectListItem } from "@/features/projects/types/project";
import type { ReactNode } from "react";

type ProjectBoardCardProps = {
  project: ProjectListItem;
  onClick?: () => void;
  cornerAction?: ReactNode;
  selected?: boolean;
  onToggleSelected?: () => void;
  onSelect?: () => void;
  pressed?: boolean;
};

const folderCountClassName =
  "inline-flex max-w-full min-w-0 items-center gap-1 overflow-hidden whitespace-nowrap";
const folderCountLabelClassName =
  "text-sm leading-5 font-medium text-[var(--color-text-secondary)]";
const folderCountValueClassName =
  "text-sm leading-5 font-semibold text-[var(--color-text)] tabular-nums";

/**
 * formatAbbreviatedCount
 *
 * 화면 표시용으로 개수를 축약합니다. 원본 숫자는 바꾸지 않습니다.
 *
 * @param count - 실제 개수
 * @returns 1,000 미만은 그대로, 1,000 이상은 천, 10,000 이상은 만 단위
 */
function formatAbbreviatedCount(count: number) {
  const abs = Math.abs(Math.trunc(count));
  const sign = count < 0 ? "-" : "";

  if (abs < 1000) {
    return `${sign}${abs}`;
  }

  const divisor = abs < 10000 ? 1000 : 10000;
  const unit = abs < 10000 ? "천" : "만";
  const rounded = Math.round((abs / divisor) * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);

  return `${sign}${text}${unit}`;
}

/**
 * CountInline
 *
 * 목표나 태스크의 완료 수와 전체 수를 한 줄로 표시합니다.
 *
 * @param props - CountInline 컴포넌트 Props
 * @param props.label - 항목 이름
 * @param props.completed - 완료된 수
 * @param props.total - 전체 수
 */
function CountInline({
  label,
  completed,
  total,
}: {
  label: string;
  completed: number;
  total: number;
}) {
  return (
    <span
      title={`${completed} / ${total}`}
      aria-label={`${label} ${completed}개 완료, 전체 ${total}개`}
      className={folderCountClassName}
    >
      <span className={folderCountLabelClassName}>{label}</span>
      <span className={folderCountValueClassName}>
        {formatAbbreviatedCount(completed)}/{formatAbbreviatedCount(total)}
      </span>
    </span>
  );
}

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
      className={`flex min-w-0 overflow-hidden rounded-[28px] shadow-[var(--shadow-project-card)] transition-shadow hover:shadow-[var(--shadow-project-card-hover)] ${labelOnTop ? "flex-col" : ""} `}
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

const cardProgressLabelClassName =
  "text-xs leading-5 font-medium text-[var(--color-text-secondary)]";
const cardProgressPercentClassName =
  "text-base leading-6 font-bold text-[var(--color-text)] tabular-nums";
const cardProgressTrackClassName =
  "h-1.5 overflow-hidden rounded-full bg-[var(--color-hover-strong)]";
const cardProgressFillClassName = "h-full rounded-full bg-[var(--color-primary)]";
const cardStatusRowClassName = "flex min-w-0 items-center justify-between gap-2";
const cardStatusLabelClassName =
  "inline-flex min-w-0 items-center gap-1.5 text-xs leading-5 font-medium text-[var(--color-text)]";
const cardDelayLabelClassName =
  "inline-flex shrink-0 items-center gap-1 text-xs leading-5 font-medium text-[var(--color-danger-text)] tabular-nums";
const cardTitleClassName =
  "min-w-0 flex-1 text-base leading-6 font-semibold text-[var(--color-text)]";
const cardTitleRowClassName = "flex min-w-0 items-start gap-2";
const cardTitleCheckClassName = "mt-1 flex shrink-0";
const cardTitleTrailingClassName = "self-start";
const cardStatRowClassName = "flex min-w-0 items-center";
const cardStatCellClassName = "flex min-w-0 flex-1 items-center justify-center px-2";
const cardStatDividerClassName = "h-3 w-px shrink-0 bg-[var(--color-border)]";

/**
 * ProjectCardProgress
 *
 * 폴더 카드 아래에 진행률 글자, 얇은 막대, 상태와 지연 글을 표시합니다.
 * 지연은 글자로 두고, 진행률 숫자와 분리합니다.
 *
 * @param props - ProjectCardProgress 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 */
function ProjectCardProgress({ project }: { project: ProjectListItem }) {
  const progress = Math.min(100, Math.max(0, project.progress));
  const schedule = getProjectScheduleMark(project);
  const delayDays = project.isDelayed && schedule?.tone === "delayed" ? schedule.days : null;
  const statusLabel = getProjectStatusLabel(project.status);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className={cardProgressLabelClassName}>진행률</span>
        <span className={cardProgressPercentClassName}>{progress}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="진행률"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className={cardProgressTrackClassName}
      >
        <div className={cardProgressFillClassName} style={{ width: `${progress}%` }} />
      </div>
      <div className={cardStatusRowClassName}>
        <span className={cardStatusLabelClassName}>
          <ProjectStatusIcon
            status={project.status}
            size={16}
            className={getProjectStatusStyles(project.status).text}
          />
          <span className="truncate">{statusLabel}</span>
        </span>
        {delayDays != null ? (
          <span className={cardDelayLabelClassName} title={`${delayDays}일 지연`}>
            {delayDays}일 지연
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * ProjectCardStats
 *
 * 즐겨찾기 편집 중 목표와 태스크를 프로젝트 카드와 같이 완료/전체로 보여 줍니다.
 * 가운데 구분선은 글자보다 짧게 둡니다.
 *
 * @param props - ProjectCardStats 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 */
function ProjectCardStats({ project }: { project: ProjectListItem }) {
  return (
    <div className={cardStatRowClassName}>
      <div className={cardStatCellClassName}>
        <CountInline label="목표" completed={project.completedGoals} total={project.totalGoals} />
      </div>
      <span aria-hidden className={cardStatDividerClassName} />
      <div className={cardStatCellClassName}>
        <CountInline label="태스크" completed={project.completedTasks} total={project.totalTasks} />
      </div>
    </div>
  );
}

/**
 * ProjectCardFace
 *
 * 폴더 카드의 본문입니다.
 * 이름과 상태를 표시하고 진행률은 맨 아래에 둡니다.
 *
 * @param props - ProjectCardFace 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.className - 본문 영역에 더할 클래스
 * @param props.leading - 이름 앞에 둘 내용. 즐겨찾기 편집의 체크입니다
 * @param props.trailing - 이름 뒤에 둘 내용. 즐겨찾기 편집의 해제 버튼입니다
 * @param props.showStats - 진행률 아래에 목표와 태스크 수를 둘지 여부
 */
export function ProjectCardFace({
  project,
  className = "",
  leading,
  trailing,
  showStats = false,
}: {
  project: ProjectListItem;
  className?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  showStats?: boolean;
}) {
  return (
    <div className={`flex min-h-0 min-w-0 flex-1 flex-col p-4 ${className}`}>
      <div className={cardTitleRowClassName}>
        {leading ? <span className={cardTitleCheckClassName}>{leading}</span> : null}
        <h3 title={project.name} className={cardTitleClassName}>
          {project.name}
        </h3>
        {trailing ? <span className={cardTitleTrailingClassName}>{trailing}</span> : null}
      </div>

      <div className={showStats ? "mt-auto flex flex-col gap-3 pt-4" : "mt-auto pt-4"}>
        <ProjectCardProgress project={project} />
        {showStats ? <ProjectCardStats project={project} /> : null}
      </div>
    </div>
  );
}

const projectFolderCountDividerClassName = "h-3 w-px shrink-0 bg-[var(--color-border)]";
const projectFolderCountsRowClassName = "flex h-8 min-w-0 items-center gap-2";

/**
 * ProjectFolderCounts
 *
 * 목표와 태스크를 왼쪽부터 한 줄로 두고, 그 사이에 짧은 구분을 둡니다.
 *
 * @param props - ProjectFolderCounts 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 */
function ProjectFolderCounts({ project }: { project: ProjectListItem }) {
  const showGoals = project.totalGoals > 0;
  const showTasks = project.totalTasks > 0;

  return (
    <div className={projectFolderCountsRowClassName}>
      {showGoals ? (
        <CountInline label="목표" completed={project.completedGoals} total={project.totalGoals} />
      ) : null}
      {showGoals && showTasks ? (
        <span aria-hidden className={projectFolderCountDividerClassName} />
      ) : null}
      {showTasks ? (
        <CountInline label="태스크" completed={project.completedTasks} total={project.totalTasks} />
      ) : null}
    </div>
  );
}

const projectFolderPocketClassName = "relative flex min-h-0 flex-1 flex-col";
const projectFolderSheetWrapClassName = "relative mt-4 shrink-0";
const projectFolderSheetClassName =
  "relative z-0 mx-2 flex h-10 min-w-0 shrink-0 flex-col rounded-[12px] bg-[var(--color-surface)] px-2";
const projectFolderShellClassName =
  "relative z-10 -mt-2 flex min-h-0 flex-1 flex-col rounded-t-[14px] rounded-b-[16px] bg-[var(--folder-shell)] shadow-[0_-1px_0_rgb(0_0_0/6%)]";
const projectFolderShellClosedClassName =
  "relative z-10 flex min-h-0 flex-1 flex-col rounded-tr-[16px] rounded-b-[16px] bg-[var(--folder-shell)] shadow-[0_-1px_0_rgb(0_0_0/6%)]";
const projectBoardCardBaseClassName = "min-h-[268px] transition-[filter]";
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
}: ProjectBoardCardProps) {
  const editing = Boolean(onToggleSelected);
  const hasFolderCounts = project.totalGoals > 0 || project.totalTasks > 0;
  const isFolderClosed = editing || !hasFolderCounts;
  const shellClassName = isFolderClosed
    ? projectFolderShellClosedClassName
    : projectFolderShellClassName;
  const folderClassName = [
    projectBoardCardBaseClassName,
    pressed ? projectBoardCardPressedClassName : projectBoardCardHoverClassName,
  ].join(" ");
  const folder = (
    <ProjectFolder
      color={project.color}
      tabLabel={project.isMain ? "메인프로젝트" : undefined}
      wideTab={false}
      className={folderClassName}
    >
      <div className={projectFolderPocketClassName}>
        {isFolderClosed ? null : (
          <div className={projectFolderSheetWrapClassName}>
            <div className={projectFolderSheetClassName}>
              <ProjectFolderCounts project={project} />
            </div>
          </div>
        )}
        <div className={shellClassName}>
          <ProjectCardFace
            project={project}
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
            showStats={editing && hasFolderCounts}
          />
        </div>
      </div>
    </ProjectFolder>
  );

  if (onToggleSelected) {
    return (
      <div className="group relative block min-w-0 cursor-pointer" onClick={onToggleSelected}>
        {folder}
      </div>
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
