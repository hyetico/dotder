import { notFound } from "next/navigation";

import ProjectAccent from "@/features/projects/components/ProjectAccent";

import { getProject } from "@/features/projects/api/projects";
import { ALL_PROJECTS_SCOPE } from "@/lib/projectRoutes";

type ProjectGoalsLayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    projectId: string;
  }>;
};

/**
 * ProjectGoalsLayout
 *
 * 프로젝트 목표 화면의 왕관 뱃지와 버튼에 그 프로젝트 색을 적용합니다.
 *
 * @param props - ProjectGoalsLayout 컴포넌트 Props
 * @param props.children - 목표 화면
 * @param props.params - 주소의 프로젝트 번호
 * @returns 프로젝트 색이 적용된 목표 화면
 */
export default async function ProjectGoalsLayout({ children, params }: ProjectGoalsLayoutProps) {
  const { projectId } = await params;

  if (projectId !== ALL_PROJECTS_SCOPE && !/^\d+$/.test(projectId)) {
    notFound();
  }

  const project = await getProject(Number(projectId));

  return <ProjectAccent color={project?.color ?? null}>{children}</ProjectAccent>;
}
