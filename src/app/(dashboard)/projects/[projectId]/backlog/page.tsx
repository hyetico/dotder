import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

// 메모는 상세의 메모 탭 (보드 07)
export default async function ProjectMemosRedirect({ params }: Props) {
  const { projectId } = await params;

  redirect(`/projects/${projectId}?tab=memos`);
}
