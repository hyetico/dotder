import type { ProjectStatus } from "@/features/projects/types/project";

/**
 * 상태 색을 고를 때 쓰는 상태 키 (프로젝트 상태 + 지연).
 * 상태 → 배지 색 연결은 ui Badge의 tone과 각 화면 모델(projectOverviewModel 등)에서 정한다.
 */
export type ProjectStatusColorKey = ProjectStatus | "DELAYED";
