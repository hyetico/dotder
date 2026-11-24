"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import CrownBadge from "@/components/ui/badge/CrownBadge";
import List, { type ListColumn, type ListRow } from "@/components/ui/list/List";

import DelayIssueBadge from "@/features/projects/components/DelayIssueBadge";
import FavoriteSelectBox from "@/features/projects/components/FavoriteSelectBox";
import ProjectAccent from "@/features/projects/components/ProjectAccent";
import { ProjectCardShell } from "@/features/projects/components/ProjectBoardCard";
import { ProjectStatusIconMark } from "@/features/projects/components/ProjectStatusBadge";
import { getProjectAccentColor } from "@/features/projects/utils/projectColors";
import {
  formatProjectDate,
  formatProjectDateRange,
  getProjectScheduleMark,
} from "@/features/projects/utils/projectUtils";

import { getProjectDetailPath } from "@/lib/projectRoutes";

import type { ProjectListItem } from "@/features/projects/types/project";
import type { CSSProperties, ReactNode } from "react";

type ProjectListRowProps = {
  project: ProjectListItem;
  onClick?: () => void;
  narrow?: boolean;
  cornerAction?: ReactNode;
  selected?: boolean;
  onToggleSelected?: () => void;
};

const listCardDetailClassName = "flex min-w-0 items-start justify-between gap-3 md:hidden";
const listCardDetailNarrowClassName = "flex min-w-0 items-start justify-between gap-3";
const listCardWideClassName = "hidden min-w-0 grid-cols-4 items-center md:grid";

/**
 * formatListCardDate
 *
 * 리스트 카드용으로 연도를 두 자리로 줄인 날짜를 만듭니다.
 *
 * @param value - YYYY-MM-DD 날짜
 * @returns `26.08.01` 형태
 */
function formatListCardDate(value: string) {
  const formatted = formatProjectDate(value);

  if (formatted.length < 10) {
    return formatted;
  }

  return formatted.slice(2);
}

/**
 * formatListCardDateRange
 *
 * 리스트 카드용 기간을 짧은 연도로 표시합니다.
 *
 * @param startDate - 시작일
 * @param endDate - 종료일
 * @returns `26.08.01 ~ 26.09.01` 형태
 */
function formatListCardDateRange(startDate: string, endDate: string) {
  return `${formatListCardDate(startDate)} ~ ${formatListCardDate(endDate)}`;
}

/**
 * ListCountPair
 *
 * 목표·태스크처럼 이름과 완료/전체 수를 한 줄로 표시합니다.
 *
 * @param props - ListCountPair 컴포넌트 Props
 * @param props.label - 항목 이름
 * @param props.completed - 완료 수
 * @param props.total - 전체 수
 * @param props.className - 추가 클래스
 */
function ListCountPair({
  label,
  completed,
  total,
  className = "",
}: {
  label: string;
  completed: number;
  total: number;
  className?: string;
}) {
  return (
    <span
      className={`text-caption inline-flex min-w-0 items-center gap-1 tabular-nums ${className} `}
      title={`${completed} / ${total}`}
      aria-label={`${label} ${completed}개 완료, 전체 ${total}개`}
    >
      <span className="shrink-0 font-medium text-[var(--color-info-text)]">{label}</span>
      <span className="min-w-0 truncate font-semibold text-[var(--color-text)]">
        {completed}
        <span className="mx-1 font-medium text-[var(--color-text-disabled)]">/</span>
        {total}
      </span>
    </span>
  );
}

const progressValueClassName =
  "shrink-0 text-base leading-6 font-bold text-[var(--color-text)] tabular-nums";

/**
 * getListDelayDays
 *
 * 리스트에서 보여줄 지연 일수를 구합니다.
 *
 * @param project - 표시할 프로젝트
 * @returns 지연이면 일수, 아니면 null
 */
function getListDelayDays(project: ProjectListItem) {
  const schedule = getProjectScheduleMark(project);

  if (!project.isDelayed || schedule?.tone !== "delayed") {
    return null;
  }

  return schedule.days;
}

/**
 * ListProgressValue
 *
 * 리스트 카드와 표에서 상태 아이콘 옆에 진행률이나 지연 글자를 표시합니다.
 *
 * @param props - ListProgressValue 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.progress - 0부터 100 사이의 진행률
 */
function ListProgressValue({ project, progress }: { project: ProjectListItem; progress: number }) {
  const delayDays = getListDelayDays(project);

  if (delayDays == null) {
    return <span className={progressValueClassName}>{progress}%</span>;
  }

  return <DelayIssueBadge days={delayDays} />;
}

/**
 * ProjectListCardFace
 *
 * 리스트 카드 본문입니다. 제목·상태·진행률과 목표·태스크·팀·기간을 표시합니다.
 *
 * @param props - ProjectListCardFace 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.narrow - 화면 너비와 관계없이 모바일 배치를 쓸지 여부
 */
function ProjectListCardFace({
  project,
  narrow = false,
  selected = false,
  onToggleSelected,
}: {
  project: ProjectListItem;
  narrow?: boolean;
  selected?: boolean;
  onToggleSelected?: () => void;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-[22px] bg-[var(--color-surface)] px-3 py-3.5 md:px-4">
      <div className="flex min-w-0 items-center gap-2">
        {onToggleSelected ? (
          <FavoriteSelectBox
            checked={selected}
            label={`${project.name} 선택`}
            onChange={onToggleSelected}
          />
        ) : null}
        <h3 className="min-w-0 flex-1 truncate text-base leading-6 font-semibold tracking-[-0.01em] text-[var(--color-text)]">
          {project.name}
        </h3>
        {project.isMain ? (
          <ProjectAccent color={project.color}>
            <CrownBadge
              size="mobile"
              variant="label"
              label="메인"
              title="메인 프로젝트"
              className={`shrink-0 [&_svg]:!hidden ${listBadgeClassName}`}
            />
          </ProjectAccent>
        ) : null}
      </div>

      <div className={narrow ? listCardDetailNarrowClassName : listCardDetailClassName}>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <ListCountPair
            label="목표"
            completed={project.completedGoals}
            total={project.totalGoals}
          />
          <span className="text-caption min-w-0 truncate font-medium text-[var(--color-text-secondary)]">
            {project.teamName}
          </span>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <ListCountPair
            label="태스크"
            completed={project.completedTasks}
            total={project.totalTasks}
          />
          <span className="text-caption font-medium whitespace-nowrap text-[var(--color-text-secondary)] tabular-nums">
            {formatListCardDateRange(project.startDate, project.endDate)}
          </span>
        </div>
      </div>

      <div className={narrow ? "hidden" : listCardWideClassName}>
        <div className="flex min-w-0 justify-center">
          <ListCountPair
            label="목표"
            completed={project.completedGoals}
            total={project.totalGoals}
          />
        </div>
        <div className="flex min-w-0 justify-center">
          <ListCountPair
            label="태스크"
            completed={project.completedTasks}
            total={project.totalTasks}
          />
        </div>
        <span className="text-caption min-w-0 truncate text-center font-medium text-[var(--color-text-secondary)]">
          {project.teamName}
        </span>
        <span className="text-caption min-w-0 truncate text-center font-medium whitespace-nowrap text-[var(--color-text-secondary)] tabular-nums">
          {formatListCardDateRange(project.startDate, project.endDate)}
        </span>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-1">
        <ProjectStatusIconMark status={project.status} />
        <ListProgressValue
          project={project}
          progress={Math.min(100, Math.max(0, project.progress))}
        />
      </div>
    </div>
  );
}

/**
 * ProjectListRow
 *
 * 좁은 화면에서 프로젝트 한 건을 왼쪽 색 라벨 카드로 표시합니다.
 *
 * @param props - ProjectListRow 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.onClick - 카드를 눌러 이동할 때 함께 실행되는 함수
 * @param props.narrow - 화면 너비와 관계없이 모바일 배치를 쓸지 여부
 */
export default function ProjectListRow({
  project,
  onClick,
  narrow = false,
  cornerAction,
  selected = false,
  onToggleSelected,
}: ProjectListRowProps) {
  const card = (
    <ProjectCardShell project={project} placement="start">
      <ProjectListCardFace
        project={project}
        narrow={narrow}
        selected={selected}
        onToggleSelected={onToggleSelected}
      />
    </ProjectCardShell>
  );

  if (onToggleSelected) {
    return (
      <div className="relative block min-w-0 cursor-pointer" onClick={onToggleSelected}>
        {card}
        {cornerAction}
      </div>
    );
  }

  if (cornerAction) {
    return (
      <div className="relative block min-w-0">
        {card}
        {cornerAction}
      </div>
    );
  }

  return (
    <Link href={getProjectDetailPath(project.id)} onClick={onClick} className="block min-w-0">
      {card}
    </Link>
  );
}

const projectListColumns: ListColumn[] = [
  {
    id: "title",
    header: "프로젝트",
    width: 28,
    headerWidth: 28,
    mobile: "title",
    align: "start",
  },
  {
    id: "status",
    header: "상태",
    width: 12,
    headerWidth: 12,
    mobile: "meta",
    align: "center",
  },
  {
    id: "progress",
    header: "진행률",
    width: 10,
    headerWidth: 10,
    mobile: "meta",
    align: "center",
  },
  {
    id: "goals",
    header: "목표",
    width: 10,
    headerWidth: 10,
    mobile: "meta",
    align: "center",
  },
  {
    id: "tasks",
    header: "태스크",
    width: 10,
    headerWidth: 10,
    mobile: "meta",
    align: "center",
  },
  {
    id: "team",
    header: "담당 팀",
    width: 14,
    headerWidth: 14,
    mobile: "meta",
    align: "center",
  },
  {
    id: "period",
    header: "기간",
    width: 16,
    headerWidth: 16,
    mobile: "meta",
    align: "end",
  },
];

const PROJECT_LIST_ACCENT_WIDTH_PX = 3;

/** 리스트에서 쓰는 뱃지. 모바일 최소 높이(20px)로 고정합니다. */
const listBadgeClassName = `
  !h-5
  !gap-0.5
  !rounded
  !px-1.5
  !text-2xs
  !leading-3

  lg:!h-5
  lg:!gap-0.5
  lg:!rounded
  lg:!px-1.5

  [&_svg]:!size-2.5
`;

const projectRowClass = `
  relative

  !border-b-0

  bg-[var(--color-surface)]
  bg-left
  bg-no-repeat

  after:pointer-events-none
  after:absolute
  after:right-0
  after:bottom-0
  after:left-[3px]
  after:h-px
  after:bg-[var(--color-border)]

  last:after:hidden

  hover:bg-[var(--color-hover)]
`;

/**
 * projectListTableRow
 *
 * 프로젝트 한 건을 웹 리스트 행으로 바꿉니다.
 *
 * @param project - 표시할 프로젝트
 * @param onOpen - 행을 눌렀을 때 상세로 이동하는 함수
 * @returns 리스트 행
 */
function projectListTableRow(
  project: ProjectListItem,
  onOpen?: (projectId: number) => void,
  action?: ReactNode,
  selected = false,
  onToggleSelected?: () => void,
): ListRow {
  const progress = Math.min(100, Math.max(0, project.progress));
  const accent = getProjectAccentColor(project.color);
  const accentGradient = `linear-gradient(180deg, ${accent} 0%, ${accent} 100%)`;

  return {
    id: String(project.id),
    onClick: onToggleSelected ? onToggleSelected : onOpen ? () => onOpen(project.id) : undefined,
    action,
    className: projectRowClass,
    style: {
      backgroundImage: accentGradient,
      backgroundSize: `${PROJECT_LIST_ACCENT_WIDTH_PX}px 100%`,
    } as CSSProperties,
    cells: {
      title: {
        content: (
          <div className="flex w-full min-w-0 items-center gap-2">
            {onToggleSelected ? (
              <FavoriteSelectBox
                checked={selected}
                label={`${project.name} 선택`}
                onChange={onToggleSelected}
              />
            ) : null}
            <h3
              className="min-w-0 flex-1 truncate text-base leading-6 font-semibold tracking-[-0.01em] text-[var(--color-text)]"
              title={project.name}
            >
              {project.name}
            </h3>
            {project.isMain ? (
              <ProjectAccent color={project.color}>
                <CrownBadge
                  size="mobile"
                  variant="label"
                  label="메인"
                  title="메인 프로젝트"
                  className={`shrink-0 [&_svg]:!hidden ${listBadgeClassName}`}
                />
              </ProjectAccent>
            ) : null}
          </div>
        ),
        align: "start",
        contentWidth: 100,
      },
      status: {
        content: <ProjectStatusIconMark status={project.status} />,
        contentWidth: 100,
      },
      progress: {
        content: <ListProgressValue project={project} progress={progress} />,
        contentWidth: 100,
      },
      goals: {
        content: (
          <span className="text-sm leading-5 font-medium text-[var(--color-text-secondary)] tabular-nums">
            {project.completedGoals}
            <span className="mx-0.5 text-[var(--color-text-disabled)]">/</span>
            {project.totalGoals}
          </span>
        ),
        contentWidth: 100,
      },
      tasks: {
        content: (
          <span className="text-sm leading-5 font-medium text-[var(--color-text-secondary)] tabular-nums">
            {project.completedTasks}
            <span className="mx-0.5 text-[var(--color-text-disabled)]">/</span>
            {project.totalTasks}
          </span>
        ),
        contentWidth: 100,
      },
      team: {
        content: (
          <span
            className="min-w-0 truncate text-sm leading-5 font-medium text-[var(--color-text-secondary)]"
            title={project.teamName}
          >
            {project.teamName}
          </span>
        ),
        contentWidth: 100,
      },
      period: {
        content: (
          <span className="text-sm leading-5 font-medium text-[var(--color-text-secondary)] tabular-nums">
            {formatProjectDateRange(project.startDate, project.endDate)}
          </span>
        ),
        contentWidth: 100,
      },
    },
  };
}

type ProjectListTableProps = {
  projects: ProjectListItem[];
  removeAction?: (project: ProjectListItem) => ReactNode;
  selectedIds?: number[];
  onToggleSelected?: (projectId: number) => void;
};

/**
 * ProjectListTable
 *
 * 넓은 화면에서 프로젝트를 표 형태로 보여 줍니다.
 * 행 앞에는 프로젝트 색 세로선을 둡니다.
 *
 * @param props - ProjectListTable 컴포넌트 Props
 * @param props.projects - 표시할 프로젝트 목록
 */
export function ProjectListTable({
  projects,
  removeAction,
  selectedIds,
  onToggleSelected,
}: ProjectListTableProps) {
  const router = useRouter();

  const rows = projects.map((project) =>
    projectListTableRow(
      project,
      removeAction || onToggleSelected
        ? undefined
        : (projectId) => {
            router.push(getProjectDetailPath(projectId));
          },
      removeAction?.(project),
      selectedIds?.includes(project.id) ?? false,
      onToggleSelected ? () => onToggleSelected(project.id) : undefined,
    ),
  );

  return (
    <List
      columns={projectListColumns}
      rows={rows}
      stackOnMobile={false}
      showAction={removeAction != null}
      headerPaddingLeft={24}
      headerPaddingRight={24}
      headerHeight={40}
      rowHeight={56}
      minWidth={980}
      headerClassName="
        relative

        !border-b-0

        bg-[var(--color-surface)]

        before:pointer-events-none
        before:absolute
        before:inset-y-0
        before:left-0
        before:w-[3px]
        before:bg-[var(--color-border-strong)]

        after:pointer-events-none
        after:absolute
        after:right-0
        after:bottom-0
        after:left-[3px]
        after:h-px
        after:bg-[var(--color-border)]
      "
      className="shadow-[var(--shadow-card)]"
    />
  );
}
