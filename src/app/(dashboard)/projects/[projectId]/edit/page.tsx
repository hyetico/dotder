import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    projectId: string;
  }>;
};

// 수정은 상세의 수정 드로어 (보드 03-a)
export default async function ProjectEditRedirect({ params }: Props) {
  const { projectId } = await params;

  redirect(`/projects/${projectId}`);
}
