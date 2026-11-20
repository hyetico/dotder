import type { ProjectStatus } from "@/features/projects/types/project";

export type ProjectStatusColorKey = ProjectStatus | "DELAYED";

export type ProjectStatusColorStep = "progress" | "goal" | "task";

export type ProjectStatusColorScale = Record<ProjectStatusColorStep, string>;

/**
 * 프로젝트 상태 컬러의 3단계.
 * 진행률(500) → 목표(한 단계, 400) → 태스크(한 단계 반, 300–400).
 */
/**
 * 프로젝트 목록 필터 버튼에 쓰는 상태 아이콘 색입니다.
 */
export const PROJECT_STATUS_FILTER_ICON_COLORS: Record<ProjectStatusColorKey, string> = {
  PLANNED: "#9CA3AF",
  IN_PROGRESS: "#3B82F6",
  ON_HOLD: "#F59E0B",
  DONE: "#10B981",
  DELAYED: "#EF4444",
};

/** 상세와 즐겨찾기에서 진행률 막대에 쓰는 상태 그라데이션입니다. */
export const progressGradients: Record<ProjectStatusColorKey, string> = {
  PLANNED: "linear-gradient(90deg, #9CA3AF 0%, #E5E7EB 100%)",
  IN_PROGRESS: "linear-gradient(90deg, #3B82F6 0%, #93C5FD 100%)",
  ON_HOLD: "linear-gradient(90deg, #F59E0B 0%, #FCD34D 100%)",
  DONE: "linear-gradient(90deg, #10B981 0%, #6EE7B7 100%)",
  DELAYED: "linear-gradient(90deg, #EF4444 0%, #FCA5A5 100%)",
};

export const PROJECT_STATUS_COLOR_SCALES: Record<ProjectStatusColorKey, ProjectStatusColorScale> = {
  IN_PROGRESS: {
    progress: "#3B82F6",
    goal: "#60A5FA",
    task: "#7AB5FC",
  },
  PLANNED: {
    progress: "#6B7280",
    goal: "#9CA3AF",
    task: "#B7BCC5",
  },
  ON_HOLD: {
    progress: "#F59E0B",
    goal: "#FBBF24",
    task: "#FCC939",
  },
  DONE: {
    progress: "#10B981",
    goal: "#34D399",
    task: "#51DDA8",
  },
  DELAYED: {
    progress: "#EF4444",
    goal: "#F87171",
    task: "#FA8B8B",
  },
};

function hexChannels(color: string) {
  const value = color.replace("#", "").trim();

  const channel = (start: number) => Number.parseInt(value.slice(start, start + 2), 16);

  return {
    red: channel(0),
    green: channel(2),
    blue: channel(4),
  };
}

export function getProjectStatusIconSurface(color: string) {
  const { red, green, blue } = hexChannels(color);

  return {
    backgroundColor: `rgba(${red}, ${green}, ${blue}, 0.14)`,
    color,
  };
}

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
