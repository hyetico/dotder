import { redirect } from "next/navigation";

type ProjectBoardRedirectProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectBoardRedirectPage({ params }: ProjectBoardRedirectProps) {
  const { projectId } = await params;

  redirect(`/projects/${projectId}/tasks`);
}
