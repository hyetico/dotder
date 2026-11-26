import type { ProjectStatus } from "@/features/projects/types/project";

/** 상태 색 이름 (배지 · 글자 색에 쓴다) */
export type StatusBadgeTone = "neutral" | "info" | "warning" | "success" | "danger";

/**
 * 상태와 색의 연결은 이 파일에서만 정한다 (style-guide 1-5).
 *
 * 값은 모두 globals.css 토큰이라 라이트·다크가 같이 바뀐다.
 * 기본 상태색은 막대·점·넓은 면에, `-text` 색은 글자와 작은 아이콘에 쓴다.
 */

export type ProjectStatusColorKey = ProjectStatus | "DELAYED";

export type ProjectStatusColorStep = "progress" | "goal" | "task";

export type ProjectStatusColorScale = Record<ProjectStatusColorStep, string>;

const STATUS_TOKEN: Record<ProjectStatusColorKey, StatusBadgeTone> = {
  PLANNED: "neutral",
  IN_PROGRESS: "info",
  ON_HOLD: "warning",
  DONE: "success",
  DELAYED: "danger",
};

/**
 * 상태 뱃지 · 상태 글자에 넘길 색 이름을 돌려준다.
 *
 * @param status - 프로젝트 상태. 목표 · 태스크는 `getGoalStatusColorKey` 등으로 바꿔서 넘긴다
 * @returns 상태 색 이름 (`tone`)
 *
 * @example
 * getStatusTone("IN_PROGRESS") // "info"
 */
export function getStatusTone(status: ProjectStatusColorKey): StatusBadgeTone {
  return STATUS_TOKEN[status];
}

// 상태 색 [진한 색, 글자 색]. 글자 색은 ui 토큰 · 진한 색은 값이 같은 ui 토큰이 없어 예전 토큰 (11.26 표)
const STATUS_VARS: Record<StatusBadgeTone, [string, string]> = {
  neutral: ["var(--t4)", "var(--t2)"],
  info: ["var(--color-info)", "var(--info)"],
  warning: ["var(--color-warning)", "var(--warn)"],
  success: ["var(--color-success)", "var(--ok)"],
  danger: ["var(--color-danger)", "var(--badge-bad-fg)"],
};

function statusVar(status: ProjectStatusColorKey, suffix: "" | "-text" = "") {
  return STATUS_VARS[STATUS_TOKEN[status]][suffix ? 1 : 0];
}

function mixWithSurface(color: string, percent: number) {
  return `color-mix(in srgb, ${color} ${percent}%, var(--surface))`;
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
