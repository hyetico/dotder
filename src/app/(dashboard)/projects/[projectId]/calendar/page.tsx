import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

// 캘린더는 상세 태스크 탭 안 보기 (보드 06)
export default async function ProjectCalendarRedirect({ params }: Props) {
  const { projectId } = await params;

  redirect(`/projects/${projectId}?tab=tasks`);
}
