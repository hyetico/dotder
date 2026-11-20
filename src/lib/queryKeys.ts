import type { ProjectScope } from "./projectRoutes";

/*
 * TanStack Query 캐시 "주소"를 한곳에서 관리
 *
 * 문자열을 각 파일에 직접 쓰면 오타·불일치로
 * Board / List / Calendar 캐시가 어긋날 수 있음
 */
export const taskQueryKeys = {
  all: ["tasks"] as const,

  list: (projectScope: ProjectScope) => ["tasks", projectScope] as const,
};

export const projectQueryKeys = {
  all: ["projects"] as const,

  detail: (projectId: number) => ["projects", "detail", projectId] as const,
};

export const goalQueryKeys = {
  all: ["goals"] as const,

  list: (projectScope: ProjectScope) => ["goals", projectScope] as const,

  detail: (goalId: number) => ["goals", "detail", goalId] as const,
};

export const memoQueryKeys = {
  all: ["memos"] as const,
};
