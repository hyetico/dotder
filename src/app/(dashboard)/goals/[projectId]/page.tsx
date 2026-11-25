import { notFound, redirect } from "next/navigation";

import GoalsScreen from "@/features/goals/list/GoalsScreen";

type ProjectGoalsPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

// `/goals/main`은 메인 프로젝트 탭, 프로젝트 번호는 상세의 목표 탭으로 (보드 09 · 04)
export default async function ProjectGoalsPage({ params }: ProjectGoalsPageProps) {
  const { projectId } = await params;

  if (projectId === "main") {
    return <GoalsScreen scope="main" />;
  }

  if (projectId === "all") {
    redirect("/goals");
  }

  if (!/^\d+$/.test(projectId)) {
    notFound();
  }

  redirect(`/projects/${projectId}?tab=goals`);
}
