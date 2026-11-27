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

  activity: ["projects", "activity"] as const,

  /** 마감일 변경 기록 (보드 03). `all` 아래라 프로젝트를 고치면 같이 새로 읽는다 */
  deadlineChanges: (projectId: number) => ["projects", "deadline-changes", projectId] as const,

  /** 기록 탭 · 최근 기록 (보드 08). `all` 아래라 프로젝트를 고치면 같이 새로 읽는다 */
  history: (projectId: number) => ["projects", "history", projectId] as const,

  /** 보관함 (01-h) */
  archived: ["projects", "archived"] as const,
};

export const goalQueryKeys = {
  all: ["goals"] as const,

  list: (projectScope: ProjectScope) => ["goals", projectScope] as const,

  detail: (goalId: number) => ["goals", "detail", goalId] as const,
};

export const memoQueryKeys = {
  all: ["memos"] as const,
};

export const dataQueryKeys = {
  /** 이 브라우저에 저장된 내 기록의 개수 (설정 → 데이터). 모두 지우기 뒤 전체를 새로 읽을 때 같이 바뀐다 */
  saved: ["saved-data"] as const,
};
