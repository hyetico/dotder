import { redirect } from "next/navigation";

import { getProjectGoalsPath, parseProjectScope } from "@/lib/projectRoutes";

type ProjectGoalsRedirectProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectGoalsRedirect({ params }: ProjectGoalsRedirectProps) {
  const { projectId } = await params;
  const scope = parseProjectScope(projectId);

  redirect(typeof scope === "number" ? getProjectGoalsPath(scope) : "/goals");
}
