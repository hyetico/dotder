import MemosPageContent from "@/features/memos/content/MemosPageContent";

type BacklogPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectBacklogPage({ params }: BacklogPageProps) {
  const { projectId } = await params;

  return <MemosPageContent projectId={Number(projectId)} />;
}
