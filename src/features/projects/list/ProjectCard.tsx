"use client";

import { badgeDotClassName, type BadgeTone } from "@/components/ui/Badge";
import FolderCard from "@/components/ui/FolderCard";
import Mosaic from "@/components/ui/Mosaic";

import ProjectCardMenu from "@/features/projects/list/ProjectCardMenu";
import {
  getProjectScheduleMark,
  getProjectStatusLabel,
} from "@/features/projects/utils/projectUtils";

import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/date";
import { getProjectDetailPath } from "@/lib/projectRoutes";

import type { ProjectListItem, ProjectStatus } from "@/features/projects/types/project";
import type { ActivityDay } from "@/features/projects/utils/activityMosaic";
import type { ReactNode } from "react";

/** 상태 점 색 (프로토타입 PST): 계획 중립 · 진행 중 정보 · 보류 경고 · 완료 성공 */
export const PROJECT_STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  PLANNED: "n",
  IN_PROGRESS: "info",
  ON_HOLD: "warn",
  DONE: "ok",
};

/** 지연 일수. 진행 중이고 마감이 지났을 때만 */
export function getLateDays(project: ProjectListItem) {
  const mark = getProjectScheduleMark(project);
  return project.isDelayed && mark?.tone === "delayed" ? mark.days : null;
}

/** 카드 상태 줄 (보드 01): 점 6 + 상태 12 500 · 「N일 지연」 600 --late */
export function ProjectStatusLine({ project }: { project: ProjectListItem }) {
  const lateDays = getLateDays(project);

  return (
    <>
      <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text)]">
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            badgeDotClassName[PROJECT_STATUS_TONE[project.status]],
          )}
        />
        {getProjectStatusLabel(project.status)}
      </span>
      {lateDays != null ? (
        <b className="font-semibold text-[var(--late)]">{lateDays}일 지연</b>
      ) : null}
    </>
  );
}

/** 「~ 2026.09.01 · 목표 1/4 · 태스크 6/9 · 진행률 67%」 (없는 값은 빼고 잇는다) */
export function getProjectMeta(project: ProjectListItem) {
  const progress = Math.min(100, Math.max(0, project.progress));

  return [
    project.endDate ? `~ ${formatDate(project.endDate)}` : null,
    project.totalGoals > 0 ? `목표 ${project.completedGoals}/${project.totalGoals}` : null,
    project.totalTasks > 0 ? `태스크 ${project.completedTasks}/${project.totalTasks}` : null,
    `진행률 ${progress}%`,
  ]
    .filter(Boolean)
    .join(" · ");
}

type ProjectCardProps = {
  project: ProjectListItem;
  activity: readonly ActivityDay[];
  /** 이름 줄 오른쪽 (기본 ⋯ 메뉴, 선택 모드에서는 비움) */
  titleAction?: ReactNode;
  /** 이름 앞 (선택 모드 체크박스) */
  leading?: ReactNode;
  /** 선택 모드에서는 링크 대신 고르기 */
  href?: string | null;
};

/** 프로젝트 목록 폴더 카드 (보드 01). */
export default function ProjectCard({
  project,
  activity,
  titleAction,
  leading,
  href,
}: ProjectCardProps) {
  return (
    <FolderCard
      color={project.color}
      isMain={project.isMain}
      title={project.name}
      leading={leading}
      titleAction={titleAction === undefined ? <ProjectCardMenu project={project} /> : titleAction}
      status={<ProjectStatusLine project={project} />}
      meta={getProjectMeta(project)}
      href={href === undefined ? getProjectDetailPath(project.id) : (href ?? undefined)}
    >
      <Mosaic days={activity} color={project.color} />
    </FolderCard>
  );
}
