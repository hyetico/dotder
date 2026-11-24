import { AppIcon, CircleAlert, Folder, iconSize, iconStroke } from "@/components/ui/icon";

import ProjectStatusIcon from "@/features/projects/components/ProjectStatusIcon";
import { getProjectVisualStatus, type ProjectStats } from "@/features/projects/utils/projectUtils";

import { PROJECT_STATUS_FILTER_ICON_COLORS } from "@/lib/statusColors";

import type { StatusFilterChipItem } from "@/components/ui/StatusFilterChips";
import type { ProjectListItem, ProjectStatus } from "@/features/projects/types/project";

export type ProjectFilterTab = "all" | ProjectStatus | "DELAYED";

const allFilterStatusRank = {
  DELAYED: 0,
  IN_PROGRESS: 1,
  ON_HOLD: 2,
  PLANNED: 3,
  DONE: 4,
} as const;

/**
 * compareProjects
 *
 * 메인 프로젝트를 앞에 두고, 그다음 지연·진행·보류·계획·완료 순으로 둡니다.
 *
 * @param a - 비교할 프로젝트
 * @param b - 비교할 프로젝트
 * @returns 정렬 순서. 음수면 a가 앞입니다
 */
export function compareProjects(a: ProjectListItem, b: ProjectListItem) {
  if (a.isMain !== b.isMain) {
    return a.isMain ? -1 : 1;
  }

  const statusOrder =
    allFilterStatusRank[getProjectVisualStatus(a.status, a.isDelayed)] -
    allFilterStatusRank[getProjectVisualStatus(b.status, b.isDelayed)];

  if (statusOrder !== 0) {
    return statusOrder;
  }

  return b.id - a.id;
}

/**
 * getProjectStatusFilters
 *
 * 검색된 프로젝트 수를 상태 필터 항목으로 만듭니다.
 *
 * @param stats - 검색 결과에 대한 상태별 개수
 * @returns 전체·계획·진행 중·보류·완료·지연 필터
 */
export function getProjectStatusFilters(
  stats: ProjectStats,
): StatusFilterChipItem<ProjectFilterTab>[] {
  return [
    {
      id: "all",
      label: "전체",
      count: stats.total,
      iconColor: "var(--color-text-muted)",
      icon: <AppIcon icon={Folder} size="sm" />,
    },
    {
      id: "PLANNED",
      label: "계획",
      count: stats.planned,
      iconColor: PROJECT_STATUS_FILTER_ICON_COLORS.PLANNED,
      icon: <ProjectStatusIcon status="PLANNED" size={iconSize.sm} />,
    },
    {
      id: "IN_PROGRESS",
      label: "진행 중",
      count: stats.inProgress,
      iconColor: PROJECT_STATUS_FILTER_ICON_COLORS.IN_PROGRESS,
      icon: <ProjectStatusIcon status="IN_PROGRESS" size={iconSize.sm} />,
    },
    {
      id: "ON_HOLD",
      label: "보류",
      count: stats.onHold,
      iconColor: PROJECT_STATUS_FILTER_ICON_COLORS.ON_HOLD,
      icon: <ProjectStatusIcon status="ON_HOLD" size={iconSize.sm} />,
    },
    {
      id: "DONE",
      label: "완료",
      count: stats.done,
      iconColor: PROJECT_STATUS_FILTER_ICON_COLORS.DONE,
      icon: <ProjectStatusIcon status="DONE" size={iconSize.sm} />,
    },
    {
      id: "DELAYED",
      label: "지연",
      count: stats.delayed,
      iconColor: PROJECT_STATUS_FILTER_ICON_COLORS.DELAYED,
      icon: <CircleAlert size={iconSize.sm} strokeWidth={iconStroke} aria-hidden />,
    },
  ];
}

/**
 * matchesProjectFilter
 *
 * 프로젝트가 고른 상태 하나와 검색어에 맞는지 확인합니다.
 *
 * @param project - 확인할 프로젝트
 * @param filter - 선택된 상태. 전체면 상태로는 거르지 않습니다
 * @param query - 이름과 설명에 찾을 검색어
 * @returns 목록에 남기면 true
 */
export function matchesProjectFilter(
  project: ProjectListItem,
  filter: ProjectFilterTab,
  query: string,
) {
  if (filter === "DELAYED") {
    if (project.status !== "IN_PROGRESS" || !project.isDelayed) {
      return false;
    }
  } else if (filter !== "all" && project.status !== filter) {
    return false;
  }

  if (!query) {
    return true;
  }

  return (
    project.name.toLowerCase().includes(query) || project.description.toLowerCase().includes(query)
  );
}
