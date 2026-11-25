import { notFound, redirect } from "next/navigation";

type GoalDetailPageProps = {
  params: Promise<{
    projectId: string;
    goalId: string;
  }>;
};

// 목표 상세 주소는 전체 목표의 상세 드로어로 연다 (보드 09-b)
export default async function GoalDetailPage({ params }: GoalDetailPageProps) {
  const { goalId } = await params;

  if (!/^\d+$/.test(goalId)) {
    notFound();
  }

  redirect(`/goals?goal=${goalId}`);
}
