import {
  getProjectStatusFilters,
  type ProjectFilterTab,
} from "@/features/projects/constants/projectFilters";

import { computeProjectStats, isProjectDelayed } from "@/features/projects/utils/projectUtils";

import type { Project } from "@/features/projects/types/project";

/**
 * isProjectExcludedFromSettings
 *
 * 보류·완료 프로젝트는 메인과 즐겨찾기 설정 목록에서 제외합니다.
 *
 * @param project - 확인할 프로젝트
 * @returns 설정 목록에서 빼야 하면 true
 */
export function isProjectExcludedFromSettings(project: Pick<Project, "status">) {
  return project.status === "ON_HOLD" || project.status === "DONE";
}

/**
 * canShowInProjectSettings
 *
 * 보류·완료라도 이미 메인이나 즐겨찾기에 있으면 해제할 수 있게 목록에 남깁니다.
 *
 * @param project - 확인할 프로젝트
 * @param pinnedIds - 이미 설정되어 있어 보여 줄 프로젝트 아이디
 * @returns 설정 목록에 두면 true
 */
export function canShowInProjectSettings(project: Project, pinnedIds: ReadonlySet<number>) {
  if (!isProjectExcludedFromSettings(project)) {
    return true;
  }

  return pinnedIds.has(project.id);
}

/**
 * matchesProjectPicker
 *
 * 프로젝트가 상태 필터와 이름·설명 검색에 맞는지 확인합니다.
 *
 * @param project - 확인할 프로젝트
 * @param filter - 고른 상태. 전체면 상태로는 거르지 않습니다
 * @param query - 이름과 설명에서 찾을 검색어
 * @returns 목록에 남기면 true
 */
export function matchesProjectPicker(project: Project, filter: ProjectFilterTab, query: string) {
  if (filter === "DELAYED") {
    if (project.status !== "IN_PROGRESS" || !isProjectDelayed(project)) {
      return false;
    }
  } else if (filter !== "all" && project.status !== filter) {
    return false;
  }

  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return (
    project.name.toLowerCase().includes(normalized) ||
    project.description.toLowerCase().includes(normalized)
  );
}

/**
 * sortProjectsByName
 *
 * 프로젝트 이름을 가나다순으로 정렬합니다.
 *
 * @param projects - 정렬할 프로젝트
 * @returns 정렬된 새 배열
 */
export function sortProjectsByName(projects: Project[]) {
  return [...projects].sort(
    (left, right) => left.name.localeCompare(right.name, "ko") || left.id - right.id,
  );
}

/**
 * getPickerStatusItems
 *
 * 검색된 프로젝트 수를 상태 필터 항목으로 만듭니다.
 *
 * @param projects - 개수에 넣을 프로젝트
 * @returns 전체·계획·진행 중·보류·완료·지연 필터
 */
export function getPickerStatusItems(projects: Project[]) {
  return getProjectStatusFilters(
    computeProjectStats(
      projects.map((project) => ({
        status: project.status,
        isDelayed: isProjectDelayed(project),
      })),
    ),
  );
}

/**
 * sameIdSet
 *
 * 두 아이디 목록이 순서와 상관없이 같은지 확인합니다.
 *
 * @param left - 비교할 아이디 목록
 * @param right - 비교할 아이디 목록
 * @returns 구성이 같으면 true
 */
export function sameIdSet(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  const rightIds = new Set(right);

  return left.every((id) => rightIds.has(id));
}
