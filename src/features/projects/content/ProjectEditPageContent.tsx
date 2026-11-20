"use client";

import { useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { AppIcon, Trash2 } from "@/components/ui/icon";

import { CreatePageLayout } from "@/components/layout/pages/CreatePage/CreatePageFrame";

import ProjectEditForm from "@/features/projects/components/ProjectEditForm/ProjectEditForm";
import type { ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { useAlert } from "@/components/ui/modal/AlertModal";

import { getProjectListItem, getProjects } from "@/features/projects/api/projects";

import { useProjectMutations } from "@/features/projects/hooks/useProjectMutations";

import { getProjectDeadlineChanges } from "@/lib/mock/projectDeadlineChanges";

import { summarizeProjectDeadlineChanges } from "@/features/projects/utils/projectUtils";

import { projectQueryKeys } from "@/lib/queryKeys";

import { getProjectDetailPath } from "@/lib/projectRoutes";

import { isGlobalProjectTag, PROJECT_TAG_PRESETS } from "@/features/projects/constants/projectTags";

import {
  parseProjectTeamSelection,
  toProjectTeamFormValue,
} from "@/features/projects/utils/projectTeam";

type ProjectEditPageContentProps = {
  projectId: number;
  initialSection?: "basic" | "settings";
};

const deleteRowClassName = "flex items-center justify-between gap-4 pt-4";
const deleteActionClassName = "inline-flex shrink-0 items-center gap-1.5 text-body font-medium text-[var(--color-danger)] transition-colors hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50";
const deleteHintClassName = "min-w-0 text-right text-body text-[var(--color-text-muted)]";

export default function ProjectEditPageContent({
  projectId,
  initialSection = "basic",
}: ProjectEditPageContentProps) {
  const router = useRouter();

  const { updateProject, isUpdating, deleteProject, isDeleting } = useProjectMutations();

  const { confirm } = useAlert();

  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: projectQueryKeys.detail(projectId),
    queryFn: () => getProjectListItem(projectId),
  });

  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const currentMainProject = useMemo(
    () => projects.find((item) => item.isMain && item.id !== projectId) ?? null,
    [projects, projectId],
  );

  if (isLoading || isProjectsLoading) {
    return (
      <CreatePageLayout fitViewport>
        <p className="text-body-sm py-12 text-center text-[var(--color-text-secondary)]">
          프로젝트를 불러오는 중...
        </p>
      </CreatePageLayout>
    );
  }

  if (!project) {
    return (
      <CreatePageLayout fitViewport>
        <p className="text-body-sm py-12 text-center text-[var(--color-text-secondary)]">
          프로젝트를 찾을 수 없습니다.
        </p>
      </CreatePageLayout>
    );
  }

  const handleSubmit = (data: ProjectFormData, deadlineChangeReason?: string) => {
    const team = parseProjectTeamSelection(data.teamId);

    updateProject(
      {
        project: {
          ...project,
          name: data.name,
          description: data.description,
          teamId: team.teamId,
          isPersonal: team.isPersonal,
          color: data.color,
          startDate: project.startDate,
          endDate: data.endDate,
          status: data.status,
          isMain: data.isMain,
          tags: data.tags,
        },
        deadlineChangeReason,
      },
      {
        onSuccess: () => {
          router.push(getProjectDetailPath(project.id));
        },
      },
    );
  };

  const originalEndDate = summarizeProjectDeadlineChanges(
    getProjectDeadlineChanges(project.id),
    project.endDate,
  ).originalEndDate;

  const handleCancel = () => {
    router.push(getProjectDetailPath(project.id));
  };

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "프로젝트 삭제",
      description: `"${project.name}" 프로젝트를 삭제하시겠습니까? 삭제한 프로젝트는 복구할 수 없습니다.`,
      confirmLabel: "삭제",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    deleteProject(project.id, {
      onSuccess: () => {
        router.push("/projects");
      },
      onError: () => {
        setDeleteError("프로젝트를 삭제하지 못했습니다. 다시 시도해 주세요.");
      },
    });
  };

  const isBusy = isUpdating || isDeleting;

  return (
    <CreatePageLayout fitViewport>
      <ProjectEditForm
        key={project.id}
        initialSection={initialSection}
        projectId={project.id}
        submitLabel="변경사항 저장"
        isSubmitting={isBusy}
        adminName={project.creatorName}
        currentMainProject={currentMainProject}
        scheduleEndDate={project.endDate}
        originalEndDate={originalEndDate}
        columnFooter={
          <div>
            <div className={deleteRowClassName}>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting || isUpdating}
                className={deleteActionClassName}
              >
                <AppIcon icon={Trash2} size="sm" />
                {isDeleting ? "삭제 중..." : "프로젝트 삭제"}
              </button>

              <p className={deleteHintClassName}>삭제한 프로젝트는 복구할 수 없습니다.</p>
            </div>

            {deleteError ? <p className="text-caption mt-2 text-red-500">{deleteError}</p> : null}
          </div>
        }
        defaultValues={{
          name: project.name,
          description: project.description,
          color: project.color,
          teamId: toProjectTeamFormValue(project),
          startDate: project.startDate,
          endDate: project.endDate,
          status: project.status,
          isMain: project.isMain,
          tags: [...PROJECT_TAG_PRESETS, ...project.tags.filter((tag) => !isGlobalProjectTag(tag))],
        }}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </CreatePageLayout>
  );
}
