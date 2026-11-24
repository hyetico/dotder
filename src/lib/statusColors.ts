import type { ProjectStatus } from "@/features/projects/types/project";

/**
 * 상태와 색의 연결은 이 파일에서만 정한다 (style-guide 1-5).
 *
 * 값은 모두 globals.css 토큰이라 라이트·다크가 같이 바뀐다.
 * 기본 상태색은 막대·점·넓은 면에, `-text` 색은 글자와 작은 아이콘에 쓴다.
 */

export type ProjectStatusColorKey = ProjectStatus | "DELAYED";

export type ProjectStatusColorStep = "progress" | "goal" | "task";

export type ProjectStatusColorScale = Record<ProjectStatusColorStep, string>;

const STATUS_TOKEN: Record<ProjectStatusColorKey, string> = {
  PLANNED: "neutral",
  IN_PROGRESS: "info",
  ON_HOLD: "warning",
  DONE: "success",
  DELAYED: "danger",
};

function statusVar(status: ProjectStatusColorKey, suffix = "") {
  return `var(--color-${STATUS_TOKEN[status]}${suffix})`;
}

function mixWithSurface(color: string, percent: number) {
  return `color-mix(in srgb, ${color} ${percent}%, var(--color-surface))`;
}

function byStatus<T>(make: (status: ProjectStatusColorKey) => T) {
  return Object.fromEntries(
    (Object.keys(STATUS_TOKEN) as ProjectStatusColorKey[]).map((status) => [status, make(status)]),
  ) as Record<ProjectStatusColorKey, T>;
}

/** 상태 필터·선택 버튼의 작은 아이콘 색. 흰 바탕 대비 4.5:1을 넘는 `-text` 색이다. */
export const PROJECT_STATUS_FILTER_ICON_COLORS = byStatus((status) => statusVar(status, "-text"));

/** 진행률 막대 바탕. 상태색에서 바탕 쪽으로 옅어지는 그라데이션이다. */
export const progressGradients = byStatus(
  (status) =>
    `linear-gradient(90deg, ${statusVar(status)} 0%, ${mixWithSurface(statusVar(status), 50)} 100%)`,
);

/**
 * 프로젝트 상태 색의 3단계.
 * 진행률(상태색) → 목표(한 단계 옅게) → 태스크(한 단계 반 옅게).
 */
export const PROJECT_STATUS_COLOR_SCALES = byStatus<ProjectStatusColorScale>((status) => ({
  progress: statusVar(status),
  goal: mixWithSurface(statusVar(status), 80),
  task: mixWithSurface(statusVar(status), 65),
}));

/**
 * 상태 아이콘 뒤에 깔 옅은 바탕과 아이콘 색을 만든다.
 *
 * @param color - 아이콘 색. 토큰(`var(...)`)이나 hex 모두 된다
 */
export function getProjectStatusIconSurface(color: string) {
  return {
    backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`,
    color,
  };
}

/**
 * 프로젝트 상태(지연 포함)에 맞는 3단계 색을 고른다.
 *
 * @param status - 프로젝트 상태
 * @param options.delayed - 지연이면 상태와 상관없이 지연 색
 */
export function getProjectStatusColorScale(
  status: ProjectStatus,
  options?: {
    delayed?: boolean;
  },
): ProjectStatusColorScale {
  if (options?.delayed) {
    return PROJECT_STATUS_COLOR_SCALES.DELAYED;
  }

  return PROJECT_STATUS_COLOR_SCALES[status] ?? PROJECT_STATUS_COLOR_SCALES.PLANNED;
}

/* ---------------------------------------------------------------- 상태 필터 버튼 */

export type StatusColorKey = "all" | "planned" | "inProgress" | "onHold" | "done" | "delayed";

export type StatusColorTokens = {
  text: string;
  background: string;
  hoverText: string;
  hoverBackground: string;
  activeBackground: string;
  activeText: string;
};

/**
 * 상태 필터 버튼 색. 버튼 바탕은 상태마다 바꾸지 않고, 선택된 버튼은 주 색을 쓴다.
 */
const STATUS_FILTER_COLORS: StatusColorTokens = {
  text: "var(--color-text-secondary)",
  background: "var(--color-surface)",
  hoverText: "var(--color-text)",
  hoverBackground: "var(--color-hover)",
  activeBackground: "var(--color-primary)",
  activeText: "var(--color-text-inverse)",
};

const STATUS_TONE_BY_ID: Record<string, StatusColorKey> = {
  all: "all",
  PLANNED: "planned",
  NOT_STARTED: "planned",
  TODO: "planned",
  IN_PROGRESS: "inProgress",
  ON_HOLD: "onHold",
  DONE: "done",
  COMPLETED: "done",
  DELAYED: "delayed",
};

/**
 * 상태 필터 버튼 색을 돌려준다. 지금은 모든 상태가 같은 색을 쓴다.
 */
export function getStatusColor(): StatusColorTokens {
  return STATUS_FILTER_COLORS;
}

/**
 * 목록 필터 id를 상태 키로 바꾼다.
 *
 * @param id - 전체, 계획, 진행 중, 보류, 완료, 지연 필터 id
 */
export function getStatusFilterTone(id: string): StatusColorKey {
  return STATUS_TONE_BY_ID[id] ?? "all";
}
