import { redirect } from "next/navigation";

type ProjectCalendarRedirectProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectCalendarRedirectPage({
  params,
}: ProjectCalendarRedirectProps) {
  const { projectId } = await params;

  redirect(`/projects/${projectId}/tasks?view=calendar`);
}
