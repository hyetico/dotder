"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  type CreateProjectInput,
  clearMainProject,
  createProject,
  deleteProject,
  duplicateProject,
  restoreDeletedProject,
  setMainProject,
  setProjectArchived,
  updateProject,
} from "@/features/projects/api/projects";

import { getProjectDetailPath } from "@/lib/projectRoutes";
import { recordRecentProjectId } from "@/lib/projectSwitcherPreferences";
import { goalQueryKeys, memoQueryKeys, projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

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
      // 프로젝트 전환 「최근」에 바로 보이게 (예시 모드는 예시 키에만)
      recordRecentProjectId(project.id);
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
      // 목표 · 태스크 · 메모도 함께 지우거나 되살린다 (REBUILD 6 버그 2)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: goalQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: memoQueryKeys.all }),
      ]);
    },
  });

  const archiveProjectMutation = useMutation({
    mutationFn: ({ projectId, archivedAt }: { projectId: number; archivedAt: string | null }) =>
      setProjectArchived(projectId, archivedAt),

    onSuccess: async () => {
      await invalidateProjects();
    },
  });

  const duplicateProjectMutation = useMutation({
    mutationFn: (projectId: number) => duplicateProject(projectId),

    onSuccess: async (copy) => {
      recordRecentProjectId(copy.id);
      await invalidateProjects();
    },
  });

  const mainProjectMutation = useMutation({
    mutationFn: async ({ projectId, isMain }: { projectId: number; isMain: boolean }) => {
      if (isMain) {
        await setMainProject(projectId);
      } else {
        await clearMainProject();
      }
    },

    onSuccess: async () => {
      await invalidateProjects();
    },
  });

  const restoreDeletedMutation = useMutation({
    mutationFn: (project: Project) => restoreDeletedProject(project),

    onSuccess: async () => {
      await invalidateProjects();
      // 목표 · 태스크 · 메모도 함께 지우거나 되살린다 (REBUILD 6 버그 2)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: goalQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: memoQueryKeys.all }),
      ]);
    },
  });

  return {
    /** 메인 지정(`isMain: true`) · 해제 */
    setMainProjectAsync: mainProjectMutation.mutateAsync,
    /** 삭제 되돌리기 */
    restoreDeletedProjectAsync: restoreDeletedMutation.mutateAsync,
    /** 보관(오늘 날짜) · 복원(`null`) */
    setProjectArchivedAsync: archiveProjectMutation.mutateAsync,
    duplicateProjectAsync: duplicateProjectMutation.mutateAsync,
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
