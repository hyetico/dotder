import { getProject } from "@/features/projects/api/projects";
import LayoutShell from "@/features/projects/components/LayoutShell";
import ProjectAccent from "@/features/projects/components/ProjectAccent";

type ProjectLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { projectId } = await params;
  const project = await getProject(Number(projectId));

  return (
    <LayoutShell>
      <ProjectAccent color={project?.color ?? null}>{children}</ProjectAccent>
    </LayoutShell>
  );
}
