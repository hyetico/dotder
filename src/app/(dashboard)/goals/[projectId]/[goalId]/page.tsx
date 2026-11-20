import { notFound, redirect } from "next/navigation";

import { ALL_PROJECTS_SCOPE, getGoalsListPath, getProjectGoalsPath } from "@/lib/projectRoutes";

type GoalDetailPageProps = {
  params: Promise<{
    projectId: string;
    goalId: string;
  }>;
};

/**
 * GoalDetailPage
 *
 * 목표 상세 주소를 목록의 목표 드로어로 바꿉니다.
 *
 * @param props - GoalDetailPage 컴포넌트 Props
 * @param props.params - 주소의 프로젝트 범위와 목표 번호
 */
export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { projectId, goalId } = await params;

  if (!/^\d+$/.test(goalId) || (projectId !== ALL_PROJECTS_SCOPE && !/^\d+$/.test(projectId))) {
    notFound();
  }

  const listPath =
    projectId === ALL_PROJECTS_SCOPE ? getGoalsListPath() : getProjectGoalsPath(Number(projectId));

  redirect(`${listPath}?goal=${goalId}`);
}
