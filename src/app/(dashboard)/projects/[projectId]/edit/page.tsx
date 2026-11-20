import ProjectEditPageContent from "@/features/projects/content/ProjectEditPageContent";

type ProjectEditPageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams: Promise<{
    section?: string | string[];
  }>;
};

export default async function ProjectEditPage({ params, searchParams }: ProjectEditPageProps) {
  const { projectId } = await params;
  const { section } = await searchParams;
  const sectionValue = Array.isArray(section) ? section[0] : section;

  return (
    <ProjectEditPageContent
      projectId={Number(projectId)}
      initialSection={sectionValue === "settings" ? "settings" : "basic"}
    />
  );
}
