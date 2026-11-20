import { redirect } from "next/navigation";

import GoalsPageContent from "@/features/goals/content/GoalsPageContent";

import { ALL_PROJECTS_SCOPE } from "@/lib/projectRoutes";

type ProjectGoalsPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectGoalsPage({ params }: ProjectGoalsPageProps) {
  const { projectId } = await params;

  if (projectId === ALL_PROJECTS_SCOPE) {
    redirect("/goals");
  }

  return <GoalsPageContent />;
}
