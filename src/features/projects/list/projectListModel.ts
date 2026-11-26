import { computeProjectStats } from "@/features/projects/utils/projectUtils";

import type { ProjectListItem, ProjectStatus } from "@/features/projects/types/project";

/** 상태 칸 (보드 01): 전체 · 계획 · 진행 중 · 보류 · 완료 */
export type ProjectStatusFilter = "all" | ProjectStatus;

/** 정렬 (보드 01-j): 최근 수정순 · 마감 빠른순 · 이름순 */
export type ProjectSort = "updated" | "due" | "name";

export const PROJECT_SORT_LABEL: Record<ProjectSort, string> = {
  updated: "최근 수정순",
  due: "마감 빠른순",
  name: "이름순",
};

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatusFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "PLANNED", label: "계획" },
  { value: "IN_PROGRESS", label: "진행 중" },
  { value: "ON_HOLD", label: "보류" },
  { value: "DONE", label: "완료" },
];

export type ProjectListQuery = {
  status: ProjectStatusFilter;
  /** 「마감 지남만」 */
  lateOnly: boolean;
  /** 검색어 (이름 · 설명) */
  keyword: string;
  sort: ProjectSort;
  /** 태그 (모바일 필터 시트). 비면 모두 */
  tags: string[];
};

/** 진행 중인데 마감이 지난 프로젝트 (보드 「마감 지남」 · 「마감 지남만」 숫자) */
export function isLateProject(project: ProjectListItem) {
  return project.status === "IN_PROGRESS" && project.isDelayed;
}

/** 상태 칸 숫자와 「N개 중 N개 진행 중 · N개 마감 지남」 */
export function getProjectCounts(projects: ProjectListItem[]) {
  const stats = computeProjectStats(projects);

  return {
    all: stats.total,
    PLANNED: stats.planned,
    IN_PROGRESS: stats.inProgress,
    ON_HOLD: stats.onHold,
    DONE: stats.done,
    late: stats.delayed,
  } satisfies Record<ProjectStatusFilter | "late", number>;
}

const byName = new Intl.Collator("ko");

/**
 * 상태 · 마감 지남만 · 검색어 · 태그로 거르고 정렬한다.
 *
 * 메인은 늘 맨 앞. 최근 수정순은 `updatedAt`(없으면 id가 큰 것)이 앞, 마감 빠른순은 마감이 없으면 맨 뒤.
 */
export function selectProjects(projects: ProjectListItem[], query: ProjectListQuery) {
  const keyword = query.keyword.trim().toLowerCase();

  const filtered = projects.filter(
    (project) =>
      (query.status === "all" || project.status === query.status) &&
      (!query.lateOnly || isLateProject(project)) &&
      (!keyword ||
        project.name.toLowerCase().includes(keyword) ||
        project.description.toLowerCase().includes(keyword)) &&
      (query.tags.length === 0 || query.tags.some((tag) => project.tags.includes(tag))),
  );

  return [...filtered].sort((a, b) => {
    // 메인 프로젝트는 어느 정렬에서도 맨 앞 (보드 01)
    if (a.isMain !== b.isMain) {
      return a.isMain ? -1 : 1;
    }

    if (query.sort === "name") {
      return byName.compare(a.name, b.name);
    }

    if (query.sort === "due") {
      if (!a.endDate || !b.endDate) {
        return a.endDate ? -1 : b.endDate ? 1 : 0;
      }

      return a.endDate.localeCompare(b.endDate);
    }

    const updated = (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
    return updated !== 0 ? updated : b.id - a.id;
  });
}
