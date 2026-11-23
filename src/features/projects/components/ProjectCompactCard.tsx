import Link from "next/link";

import { AppIcon, ArrowUpRight } from "@/components/ui/icon";

import {
  getProjectTintColor,
  getProjectTintInkColor,
  getProjectTintLineColor,
} from "@/features/projects/utils/projectColors";

import { getProjectDetailPath } from "@/lib/projectRoutes";

import type { ProjectListItem } from "@/features/projects/types/project";
import type { CSSProperties } from "react";

type ProjectCompactCardProps = {
  project: ProjectListItem;
};

const compactCardClassName = "flex max-w-full shrink flex-col items-center gap-1";
const compactFolderClassName = "group relative h-[37px] w-[64px]";
const compactFolderShapeClassName = "h-full w-full";
const compactFolderPathClassName = "fill-[var(--folder-fill)] stroke-[var(--folder-line)] transition-colors group-hover:fill-[var(--folder-fill-hover)]";
const compactDetailLinkClassName = "absolute inset-0 flex items-center justify-center text-[var(--folder-ink)] outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";
const compactIconClassName = "translate-y-0.5";
const compactTitleClassName = "w-max max-w-[15rem] text-center text-[12px] leading-4 font-medium break-keep text-[var(--color-text-secondary)]";
const compactFolderPath = "M8 9V7.2Q8 2.75 13 2.75H20Q24 2.75 26 6L28.5 9H50.5Q56 9 56 14.5V30Q56 35.5 50.5 35.5H13.5Q8 35.5 8 30Z";

/**
 * ProjectCompactCard
 *
 * 메인 프로젝트 목표에서 드로어가 열렸을 때 큰 폴더 카드 대신 보여 주는 작은 폴더입니다.
 * 폴더 아래에는 프로젝트 이름만 두고, 폴더 안 화살표로 프로젝트 상세로 이동합니다.
 *
 * @param props - ProjectCompactCard 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 */
export default function ProjectCompactCard({ project }: ProjectCompactCardProps) {
  const color = project.color?.trim() || null;
  const folderStyle = {
    "--folder-fill": getProjectTintColor(color),
    "--folder-line": getProjectTintLineColor(color),
    "--folder-ink": color ? getProjectTintInkColor(color) : "var(--color-text-secondary)",
    "--folder-fill-hover": color ? `color-mix(in srgb, ${color} 22%, white)` : "#E4E7EB",
  } as CSSProperties;

  return (
    <div className={compactCardClassName}>
      <div className={compactFolderClassName} style={folderStyle}>
        <svg viewBox="0 0 64 37" className={compactFolderShapeClassName} aria-hidden>
          <path
            d={compactFolderPath}
            className={compactFolderPathClassName}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <Link
          href={getProjectDetailPath(project.id)}
          aria-label={`${project.name} 자세히 보기`}
          title="프로젝트 자세히 보기"
          className={compactDetailLinkClassName}
        >
          <span className={compactIconClassName}>
            <AppIcon icon={ArrowUpRight} size="sm" />
          </span>
        </Link>
      </div>
      <p className={compactTitleClassName}>{project.name}</p>
    </div>
  );
}
