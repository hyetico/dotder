import MemosPageContent from "@/features/memos/content/MemosPageContent";

type MemosPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectMemosPage({ params }: MemosPageProps) {
  const { projectId } = await params;

  return <MemosPageContent projectId={Number(projectId)} />;
}
