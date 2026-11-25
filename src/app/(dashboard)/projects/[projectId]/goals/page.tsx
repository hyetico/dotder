import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

// 목표는 상세의 목표 탭 (보드 04)
export default async function ProjectGoalsRedirect({ params }: Props) {
  const { projectId } = await params;

  redirect(`/projects/${projectId}?tab=goals`);
}
