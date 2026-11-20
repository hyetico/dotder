import { getGoalScheduleMark, isGoalDelayed } from "@/features/goals/utils/goalUtils";
import { isProjectDelayed } from "@/features/projects/utils/projectUtils";

import type { Goal } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";

export function isGoalDelayedByProject(
  goal: Pick<Goal, "status" | "projectId">,
  projects: readonly Pick<Project, "id" | "status" | "endDate">[],
) {
  if (goal.projectId == null) {
    return false;
  }

  const project = projects.find((item) => item.id === goal.projectId);

  if (!project) {
    return false;
  }

  return isGoalDelayed(goal, isProjectDelayed(project));
}

/**
 * isGoalShownDelayed
 *
 * 목표 자신의 마감 초과이거나, 속한 프로젝트가 지연인지 확인합니다.
 *
 * @param goal - 확인할 목표
 * @param projects - 지연 판단에 쓰는 프로젝트
 * @returns 지연으로 보여야 하면 true
 */
export function isGoalShownDelayed(
  goal: Goal,
  projects: readonly Pick<Project, "id" | "status" | "endDate">[],
) {
  const overdue = goal.status !== "COMPLETED" && getGoalScheduleMark(goal).tone === "delayed";

  return overdue || isGoalDelayedByProject(goal, projects);
}
