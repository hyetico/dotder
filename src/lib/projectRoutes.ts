export const PROJECT_VIEWS = ["tasks", "memos", "goals"] as const;

export type ProjectView = (typeof PROJECT_VIEWS)[number];

export const FLAT_PROJECT_VIEW_ROUTES: Record<ProjectView, string> = {
  tasks: "/tasks",
  memos: "/memos",
  goals: "/goals",
};

export const DEFAULT_PROJECT_ID = 1;

export const ALL_PROJECTS_SCOPE = "all" as const;

export type ProjectScope = number | typeof ALL_PROJECTS_SCOPE;

const PROJECT_SCOPE_PATTERN = /^\/projects\/(all|\d+)/;

const GOALS_PROJECT_PATTERN = /^\/goals\/(\d+)(?:\/|$)/;

export function parseProjectScope(raw: string): ProjectScope {
  if (raw === ALL_PROJECTS_SCOPE) {
    return ALL_PROJECTS_SCOPE;
  }

  const projectId = Number(raw);

  if (Number.isNaN(projectId)) {
    return DEFAULT_PROJECT_ID;
  }

  return projectId;
}

export function isFlatProjectViewPath(
  pathname: string,
): pathname is (typeof FLAT_PROJECT_VIEW_ROUTES)[ProjectView] {
  return pathname === "/tasks" || pathname === "/memos" || pathname === "/goals";
}

export function isAllGoalsPath(pathname: string): boolean {
  return pathname === "/goals";
}

export function isProjectGoalsPath(pathname: string): boolean {
  return /^\/goals\/\d+$/.test(pathname);
}

/**
 * isFavoriteGoalsPath
 *
 * 주소가 즐겨찾기 프로젝트 목표 목록인지 확인합니다.
 *
 * @param pathname - 현재 주소
 * @returns 즐겨찾기 목표 목록이면 true
 */
export function isFavoriteGoalsPath(pathname: string): boolean {
  return pathname === "/goals/favorites";
}

/**
 * getFavoriteGoalsPath
 *
 * 즐겨찾기 프로젝트 목표 목록 주소를 만듭니다.
 *
 * @returns 즐겨찾기 목표 목록 주소
 */
export function getFavoriteGoalsPath(): string {
  return "/goals/favorites";
}

export function isGoalsListPath(pathname: string): boolean {
  return isAllGoalsPath(pathname) || isProjectGoalsPath(pathname) || isFavoriteGoalsPath(pathname);
}

export function getGoalsListPath(): string {
  return "/goals";
}

export function getProjectGoalsPath(projectId: number): string {
  return `/goals/${projectId}`;
}

export function getGoalIdFromPath(pathname: string): number | null {
  const match = pathname.match(/^\/goals\/(?:all|\d+)\/(\d+)$/);

  if (!match) {
    return null;
  }

  return Number(match[1]);
}

export function parseProjectScopeFromSearchParam(raw: string | null | undefined): ProjectScope {
  if (!raw) {
    return DEFAULT_PROJECT_ID;
  }

  return parseProjectScope(raw);
}

export const TASK_VIEW_MODES = ["board", "calendar"] as const;

export type TaskViewMode = (typeof TASK_VIEW_MODES)[number];

export const DEFAULT_TASK_VIEW_MODE: TaskViewMode = "board";

export function parseTaskViewMode(raw: string | null | undefined): TaskViewMode {
  if (raw && TASK_VIEW_MODES.includes(raw as TaskViewMode)) {
    return raw as TaskViewMode;
  }

  return DEFAULT_TASK_VIEW_MODE;
}

function appendProjectScopeParam(params: URLSearchParams, scope: ProjectScope) {
  if (scope === ALL_PROJECTS_SCOPE) {
    params.set("project", ALL_PROJECTS_SCOPE);
    return;
  }

  if (scope !== DEFAULT_PROJECT_ID) {
    params.set("project", String(scope));
  }
}

export function buildScopedViewPath(
  scope: ProjectScope,
  view: ProjectView,
  extraParams?: Record<string, string | undefined>,
): string {
  const base =
    view === "goals"
      ? scope === ALL_PROJECTS_SCOPE
        ? getGoalsListPath()
        : getProjectGoalsPath(scope)
      : FLAT_PROJECT_VIEW_ROUTES[view];
  const params = new URLSearchParams();

  if (view !== "goals") {
    appendProjectScopeParam(params, scope);
  }

  if (extraParams) {
    for (const [key, value] of Object.entries(extraParams)) {
      if (value) {
        params.set(key, value);
      }
    }
  }

  const query = params.toString();

  return query ? `${base}?${query}` : base;
}

export function buildTasksPath(scope: ProjectScope, viewMode?: TaskViewMode): string {
  return buildScopedViewPath(
    scope,
    "tasks",
    viewMode && viewMode !== DEFAULT_TASK_VIEW_MODE ? { view: viewMode } : undefined,
  );
}

export function buildNavHref(
  href: string,
  scope: ProjectScope,
  searchParams: URLSearchParams,
): string {
  if (href === "/goals") {
    return getGoalsListPath();
  }

  if (!isFlatProjectViewPath(href)) {
    return href;
  }

  const params = new URLSearchParams(searchParams.toString());

  appendProjectScopeParam(params, scope);

  const query = params.toString();

  return query ? `${href}?${query}` : href;
}

export function buildScopeChangeHref(
  pathname: string,
  searchParams: URLSearchParams,
  nextScope: ProjectScope,
): string | null {
  if (isGoalsListPath(pathname)) {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("project");

    const query = params.toString();
    const base =
      nextScope === ALL_PROJECTS_SCOPE ? getGoalsListPath() : getProjectGoalsPath(nextScope);

    return query ? `${base}?${query}` : base;
  }

  if (!isFlatProjectViewPath(pathname) && pathname !== "/projects") {
    return null;
  }

  const params = new URLSearchParams(searchParams.toString());

  if (nextScope === DEFAULT_PROJECT_ID) {
    params.delete("project");
  } else {
    params.set(
      "project",
      nextScope === ALL_PROJECTS_SCOPE ? ALL_PROJECTS_SCOPE : String(nextScope),
    );
  }

  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function getProjectScopeFromPath(pathname: string): ProjectScope | null {
  const match = pathname.match(PROJECT_SCOPE_PATTERN) ?? pathname.match(GOALS_PROJECT_PATTERN);

  if (!match) {
    return null;
  }

  if (match[1] === ALL_PROJECTS_SCOPE) {
    return ALL_PROJECTS_SCOPE;
  }

  return Number(match[1]);
}

/**
 * isMainProjectsPath
 *
 * 주소가 메인 탭 프로젝트 목록인지 확인합니다.
 *
 * @param pathname - 현재 주소
 * @returns 메인 탭 목록이면 true
 */
export function isMainProjectsPath(pathname: string): boolean {
  return pathname === "/projects/main";
}

/**
 * getMainProjectsPath
 *
 * 메인 탭 프로젝트 목록 주소를 만듭니다.
 *
 * @returns 메인 탭 프로젝트 목록 주소
 */
export function getMainProjectsPath(): string {
  return "/projects/main";
}

/**
 * isFavoriteProjectsPath
 *
 * 주소가 즐겨찾기 프로젝트 목록인지 확인합니다.
 *
 * @param pathname - 현재 주소
 * @returns 즐겨찾기 프로젝트 목록이면 true
 */
export function isFavoriteProjectsPath(pathname: string): boolean {
  return pathname === "/projects/favorites";
}

/**
 * getFavoriteProjectsPath
 *
 * 즐겨찾기 프로젝트 목록 주소를 만듭니다.
 *
 * @returns 즐겨찾기 프로젝트 목록 주소
 */
export function getFavoriteProjectsPath(): string {
  return "/projects/favorites";
}

export function isProjectsListPath(pathname: string): boolean {
  return (
    pathname === "/projects" || isMainProjectsPath(pathname) || isFavoriteProjectsPath(pathname)
  );
}

/**
 * isMainMemosPath
 *
 * 주소가 메인 탭 메모 목록인지 확인합니다.
 *
 * @param pathname - 현재 주소
 * @returns 메인 탭 메모 목록이면 true
 */
export function isMainMemosPath(pathname: string): boolean {
  return pathname === "/memos/main";
}

/**
 * getMainMemosPath
 *
 * 메인 탭 메모 목록 주소를 만듭니다.
 *
 * @returns 메인 탭 메모 목록 주소
 */
export function getMainMemosPath(): string {
  return "/memos/main";
}

/**
 * isFavoriteMemosPath
 *
 * 주소가 즐겨찾기 메모 목록인지 확인합니다.
 *
 * @param pathname - 현재 주소
 * @returns 즐겨찾기 메모 목록이면 true
 */
export function isFavoriteMemosPath(pathname: string): boolean {
  return pathname === "/memos/favorites";
}

/**
 * getFavoriteMemosPath
 *
 * 즐겨찾기 메모 목록 주소를 만듭니다.
 *
 * @returns 즐겨찾기 메모 목록 주소
 */
export function getFavoriteMemosPath(): string {
  return "/memos/favorites";
}

/**
 * isMemosListPath
 *
 * 주소가 메모 목록 화면인지 확인합니다.
 *
 * @param pathname - 현재 주소
 * @returns 전체, 메인, 즐겨찾기 메모 목록이면 true
 */
export function isMemosListPath(pathname: string): boolean {
  return pathname === "/memos" || isMainMemosPath(pathname) || isFavoriteMemosPath(pathname);
}

export function isProjectsSectionPath(pathname: string): boolean {
  return pathname === "/projects" || pathname.startsWith("/projects/");
}

export function isProjectNewPath(pathname: string): boolean {
  return pathname === "/projects/new";
}

export function isGoalDetailPath(pathname: string): boolean {
  return /^\/goals\/(?:all|\d+)\/\d+$/.test(pathname);
}

export function getGoalDetailPath(goalId: number, projectId: number | null): string {
  const scope = projectId ?? ALL_PROJECTS_SCOPE;

  return `/goals/${scope}/${goalId}`;
}

export function isProjectDetailPath(pathname: string): boolean {
  return /^\/projects\/\d+$/.test(pathname);
}

export function isProjectEditPath(pathname: string): boolean {
  return /^\/projects\/\d+\/edit$/.test(pathname);
}

export function isGoalsSectionPath(pathname: string): boolean {
  return pathname === "/goals" || pathname.startsWith("/goals/");
}

export function getContextualMainProjectPath(
  pathname: string,
  projectId: number,
  searchParams?: URLSearchParams,
): string {
  if (isGoalsSectionPath(pathname)) {
    return getProjectGoalsPath(projectId);
  }

  if (pathname === "/tasks" || pathname.startsWith("/tasks/")) {
    return buildTasksPath(projectId, parseTaskViewMode(searchParams?.get("view")));
  }

  if (pathname === "/memos" || pathname.startsWith("/memos/")) {
    return buildScopedViewPath(projectId, "memos");
  }

  return getProjectDetailPath(projectId);
}

export function getProjectDetailPath(projectId: number): string {
  return `/projects/${projectId}`;
}

export function getProjectEditPath(projectId: number, section?: "settings"): string {
  const path = `/projects/${projectId}/edit`;

  if (section == null) {
    return path;
  }

  return `${path}?section=${section}`;
}

export function isProjectFormPath(pathname: string): boolean {
  return isProjectNewPath(pathname) || isProjectEditPath(pathname);
}

export function isStaticNavActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  if (href === "/projects") {
    return isProjectsSectionPath(pathname);
  }

  if (href === "/playground") {
    return pathname === "/playground";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

/** 프로젝트 만들기 드로어를 여는 주소 값 (`/projects?new=1`) */
export const NEW_PROJECT_PARAM = "new";

/**
 * 프로젝트 만들기 드로어를 여는 주소. 예전 `/projects/new` 페이지는 여기로 넘긴다.
 *
 * @example
 * getNewProjectPath() // "/projects?new=1"
 */
export function getNewProjectPath(): string {
  return `/projects?${NEW_PROJECT_PARAM}=1`;
}
