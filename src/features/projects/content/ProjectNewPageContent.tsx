"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { getProjects } from "@/features/projects/api/projects";
import ProjectAccent from "@/features/projects/components/ProjectAccent";
import ProjectCreateWizard from "@/features/projects/components/ProjectCreateWizard/ProjectCreateWizard";
import { useProjectMutations } from "@/features/projects/hooks/useProjectMutations";
import { parseProjectTeamSelection } from "@/features/projects/utils/projectTeam";

import { currentUser, mockUsers } from "@/lib/mock/users";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { ProjectFormData } from "@/features/projects/schemas/projectSchema";

function getTodayDateValue() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function ProjectNewPageContent() {
  const router = useRouter();

  const { createProject, isCreating } = useProjectMutations();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const mainProject = useMemo(() => projects.find((project) => project.isMain) ?? null, [projects]);

  const handleSubmit = (data: ProjectFormData, adminName: string) => {
    const team = parseProjectTeamSelection(data.teamId);

    const creatorId = mockUsers.find((user) => user.name === adminName)?.id ?? currentUser.id;

    createProject({
      name: data.name,
      description: data.description,
      teamId: team.teamId,
      isPersonal: team.isPersonal,
      color: data.color,
      startDate: data.startDate,
      endDate: data.endDate,
      completedAt: null,
      status: data.status,
      isMain: data.isMain,
      tags: data.tags,
      creatorId,
    });
  };

  const handleCancel = () => {
    router.push("/projects");
  };

  const today = getTodayDateValue();

  return (
    <ProjectAccent>
      {isLoading ? (
        <p className="text-body-sm py-12 text-center text-[var(--color-text-secondary)]">
          프로젝트 정보를 불러오는 중...
        </p>
      ) : (
        <ProjectCreateWizard
          minDate={today}
          currentMainProject={mainProject}
          isSubmitting={isCreating}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </ProjectAccent>
  );
}
