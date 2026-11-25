import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

// 보드 보기는 상세 태스크 탭의 보드 (보드 05)
export default async function ProjectBoardRedirect({ params }: Props) {
  const { projectId } = await params;

  redirect(`/projects/${projectId}?tab=tasks`);
}
