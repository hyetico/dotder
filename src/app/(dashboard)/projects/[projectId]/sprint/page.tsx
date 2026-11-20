import PageHeading from "@/components/layout/pages/Page/PageHeading";
import PageInset from "@/components/layout/pages/Page/PageInset";

type SprintPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectSprintPage({ params }: SprintPageProps) {
  const { projectId } = await params;

  return (
    <PageInset>
      <PageHeading title="Sprint" description={`프로젝트 ${projectId}의 스프린트를 관리하세요.`} />
    </PageInset>
  );
}
