"use client";

import Link from "next/link";

import Badge from "@/components/kit/Badge";
import ProjectMarker from "@/components/kit/ProjectMarker";

import { PROJECT_STATUS_TONE, getLateDays } from "@/features/projects/list/ProjectCard";
import ProjectCardMenu from "@/features/projects/list/ProjectCardMenu";
import { getProjectStatusLabel } from "@/features/projects/utils/projectUtils";

import { formatDate } from "@/lib/date";
import { getProjectDetailPath } from "@/lib/projectRoutes";

import type { ProjectListItem } from "@/features/projects/types/project";

/**
 * 목록 보기 한 줄 (프로토타입 projRow · .lrow). 안쪽 14/16 · 사이 16 · 테두리 --border · 모서리 12.
 * 색 점(메인은 왕관) · 이름 500 · 마감 110 · 태스크 110 · 상태 배지 96 · 지연 배지 88 · ⋯.
 * 모바일은 마감 · 태스크를 뺀다.
 */
export default function ProjectListRow({ project }: { project: ProjectListItem }) {
  const lateDays = getLateDays(project);

  return (
    <li className="relative flex min-h-12 items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3.5 text-sm transition-colors duration-120 hover:border-[var(--border-2)] hover:bg-[var(--s2)]">
      <ProjectMarker color={project.color} isMain={project.isMain} />
      <Link
        href={getProjectDetailPath(project.id)}
        className="min-w-0 flex-1 truncate font-medium text-[var(--text)] outline-none after:absolute after:inset-0 after:rounded-[var(--radius-md)] after:content-[''] focus-visible:after:shadow-[0_0_0_2px_var(--ring-gap),0_0_0_4px_var(--primary)]"
      >
        {project.name}
      </Link>
      <span className="w-27.5 shrink-0 text-xs text-[var(--t3)] tabular-nums max-md:hidden">
        {project.endDate ? `~ ${formatDate(project.endDate)}` : "—"}
      </span>
      <span className="w-27.5 shrink-0 text-xs text-[var(--t3)] tabular-nums max-md:hidden">
        태스크 {project.completedTasks}/{project.totalTasks}
      </span>
      <span className="flex w-24 shrink-0 justify-end">
        <Badge tone={PROJECT_STATUS_TONE[project.status]} dot>
          {getProjectStatusLabel(project.status)}
        </Badge>
      </span>
      <span className="flex w-22 shrink-0 justify-end max-md:w-auto">
        {lateDays != null ? <Badge tone="bad">{lateDays}일 지연</Badge> : null}
      </span>
      <span className="relative z-10 shrink-0">
        <ProjectCardMenu project={project} />
      </span>
    </li>
  );
}
