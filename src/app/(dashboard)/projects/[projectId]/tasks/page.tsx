import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

// 태스크는 상세의 태스크 탭 (REBUILD 3-3 · 보드 05)
export default async function ProjectTasksRedirect({ params }: Props) {
  const { projectId } = await params;

  redirect(`/projects/${projectId}?tab=tasks`);
}
