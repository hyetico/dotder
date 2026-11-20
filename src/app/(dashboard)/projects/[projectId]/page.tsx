import PageInset from "@/components/layout/pages/Page/PageInset";
import ProjectDetailPageContent from "@/features/projects/content/ProjectDetailPageContent/ProjectDetailPageContent";

import { getGoals } from "@/features/goals/api/goals";
import { getProjectListItem } from "@/features/projects/api/projects";
import { getTasks } from "@/features/tasks/api/tasks";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId: projectIdParam } = await params;
  const projectId = Number(projectIdParam);

  const missingProject = (
    <PageInset
      top="header"
      bottom={false}
      className="text-body-sm py-12 text-center text-[var(--color-text-secondary)]"
    >
      프로젝트를 찾을 수 없습니다.
    </PageInset>
  );

  if (!Number.isFinite(projectId)) {
    return <div className="-mt-[var(--header-height)] min-h-dvh bg-white">{missingProject}</div>;
  }

  const [project, goals, tasks] = await Promise.all([
    getProjectListItem(projectId),
    getGoals(projectId),
    getTasks(projectId),
  ]);

  return (
    <div className="-mt-[var(--header-height)] min-h-dvh bg-white">
      {project ? (
        <ProjectDetailPageContent project={project} goals={goals} tasks={tasks} />
      ) : (
        missingProject
      )}
    </div>
  );
}
