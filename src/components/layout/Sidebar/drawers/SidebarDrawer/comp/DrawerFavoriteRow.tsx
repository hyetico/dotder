"use client";

import Link from "next/link";

import ProjectProgressMeter from "@/components/layout/Sidebar/drawers/SidebarDrawer/comp/ProjectProgressMeter";
import DropdownMenu, { DropdownMenuLink } from "@/components/ui/DropdownMenu";

import ProjectBadge from "@/features/projects/components/ProjectBadge";
import { progressGradients } from "@/features/projects/constants/projectStatusColors";
import { getProjectVisualStatus, isProjectDelayed } from "@/features/projects/utils/projectUtils";

import { getProjectDetailPath } from "@/lib/projectRoutes";

import type { Project } from "@/features/projects/types/project";

type DrawerFavoriteRowProps = {
  project: Project;
  progress: number;
  isFavorite: boolean;
  showFavorite?: boolean;
  onOpen: () => void;
  onToggleFavorite?: () => void;
};

/**
 * DrawerFavoriteRow
 *
 * 즐겨찾기 요약에서 프로젝트 이름, 설명, 진행률을 한 줄로 보여 줍니다.
 *
 * @param props - DrawerFavoriteRow 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.progress - 프로젝트 진행률
 * @param props.isFavorite - 즐겨찾기된 프로젝트인지 여부
 * @param props.showFavorite - 즐겨찾기 버튼을 항상 보일지 여부
 * @param props.onOpen - 프로젝트를 열 때 실행되는 함수
 * @param props.onToggleFavorite - 즐겨찾기를 켜거나 끌 때 실행되는 함수
 */
export default function DrawerFavoriteRow({
  project,
  progress,
  isFavorite,
  onOpen,
  onToggleFavorite,
}: DrawerFavoriteRowProps) {
  const gradient =
    progressGradients[getProjectVisualStatus(project.status, isProjectDelayed(project))];

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

        <ProjectProgressMeter progress={progress} gradient={gradient} />
      </Link>

      {onToggleFavorite ? (
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
                  className="text-body-sm flex w-full items-center rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)]"
                >
                  {isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
                </button>
              )}
            </>
          )}
        </DropdownMenu>
      ) : null}
    </div>
  );
}
