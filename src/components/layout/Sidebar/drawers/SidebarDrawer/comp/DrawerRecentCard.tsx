"use client";

import Link from "next/link";

import DropdownMenu, { DropdownMenuLink } from "@/components/ui/DropdownMenu";

import ProjectBadge from "@/features/projects/components/ProjectBadge";
import { formatProjectRelativeTime } from "@/features/projects/utils/projectUtils";

import { getProjectDetailPath } from "@/lib/projectRoutes";

import type { Project } from "@/features/projects/types/project";

type DrawerRecentCardProps = {
  project: Project;
  openedAt: string;
  isFavorite: boolean;
  onOpen: () => void;
  onToggleFavorite: () => void;
};

/**
 * DrawerRecentCard
 *
 * 최근 프로젝트를 아이콘, 이름, 설명, 상대 시간, 더보기 메뉴로 표시합니다.
 *
 * @param props - DrawerRecentCard 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.openedAt - 프로젝트를 연 시각
 * @param props.isFavorite - 즐겨찾기된 프로젝트인지 여부
 * @param props.onOpen - 프로젝트를 열 때 실행되는 함수
 * @param props.onToggleFavorite - 즐겨찾기를 켜거나 끌 때 실행되는 함수
 */
export default function DrawerRecentCard({
  project,
  openedAt,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: DrawerRecentCardProps) {
  return (
    <div className="group flex items-center gap-2 rounded-[var(--radius-sm)] p-2 hover:bg-[var(--color-hover)]">
      <Link
        href={getProjectDetailPath(project.id)}
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-2"
      >
        <ProjectBadge
          color={project.color}
          size="sm"
          isMain={project.isMain}
          isFavorite={isFavorite}
        />

        <span className="min-w-0 flex-1">
          <span className="text-body block truncate font-semibold! text-[var(--color-text)]">
            {project.name}
          </span>
          <span className="text-caption mt-0.5 block truncate font-normal text-[var(--color-text-secondary)]">
            {project.description}
          </span>
        </span>

        <span className="text-caption shrink-0 whitespace-nowrap text-[var(--color-text-secondary)]">
          {formatProjectRelativeTime(openedAt)}
        </span>
      </Link>

      <DropdownMenu label={`${project.name} 메뉴`} stopPropagation panelClassName="w-40">
        {(close) => (
          <>
            <DropdownMenuLink
              href={getProjectDetailPath(project.id)}
              onClick={() => {
                close();
                onOpen();
              }}
            >
              프로젝트 열기
            </DropdownMenuLink>

            {project.isMain ? null : (
              <button
                type="button"
                onClick={() => {
                  close();
                  onToggleFavorite();
                }}
                className="text-caption flex w-full items-center rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)]"
              >
                {isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
              </button>
            )}
          </>
        )}
      </DropdownMenu>
    </div>
  );
}
