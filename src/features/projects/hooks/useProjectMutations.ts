"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createProject,
  deleteProject,
  updateProject,
  type CreateProjectInput,
} from "@/features/projects/api/projects";

import { getProjectDetailPath } from "@/lib/projectRoutes";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Project } from "@/features/projects/types/project";

type UpdateProjectVariables = {
  project: Project;
  deadlineChangeReason?: string;
};

export function useProjectMutations() {
  const queryClient = useQueryClient();

  const router = useRouter();

  const invalidateProjects = async () => {
    await queryClient.invalidateQueries({
      queryKey: projectQueryKeys.all,
    });
  };

  const createProjectMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),

    onSuccess: async (project) => {
      await invalidateProjects();
      router.push(project.isMain ? getProjectDetailPath(project.id) : "/projects");
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ project, deadlineChangeReason }: UpdateProjectVariables) =>
      updateProject(project, deadlineChangeReason),

    onSuccess: async () => {
      await invalidateProjects();
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (projectId: number) => deleteProject(projectId),

    onSuccess: async () => {
      await invalidateProjects();
    },
  });

  return {
    createProject: createProjectMutation.mutate,
    createProjectAsync: createProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    updateProject: updateProjectMutation.mutate,
    updateProjectAsync: updateProjectMutation.mutateAsync,
    isUpdating: updateProjectMutation.isPending,
    deleteProject: deleteProjectMutation.mutate,
    deleteProjectAsync: deleteProjectMutation.mutateAsync,
    isDeleting: deleteProjectMutation.isPending,
  };
}
