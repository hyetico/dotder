import { getGoals } from "@/features/goals/api/goals";
import { getProjectInitial } from "@/features/projects/utils/projectDisplay";
import { enrichProject, getProjectDaysAfterEnd } from "@/features/projects/utils/projectUtils";
import { getTasks } from "@/features/tasks/api/tasks";

import {
  recordProjectDeadlineChange,
  removeProjectDeadlineChanges,
} from "@/lib/mock/projectDeadlineChanges";
import { mockProjects } from "@/lib/mock/projects";

import type { Project, ProjectListItem } from "@/features/projects/types/project";

export type CreateProjectInput = Omit<Project, "id" | "icon"> & {
  icon?: string;
};

export async function getProjects(): Promise<Project[]> {
  return mockProjects.map((project) => ({
    ...project,
    tags: [...project.tags],
  }));
}

export async function getProjectListItems(): Promise<ProjectListItem[]> {
  const [tasks, goals] = await Promise.all([getTasks("all"), getGoals("all")]);

  return mockProjects.map((project) => enrichProject(project, tasks, goals));
}

export function readProject(projectId: number): Project | undefined {
  return mockProjects.find((project) => project.id === projectId);
}

export function readProjectName(projectId: number): string | undefined {
  return readProject(projectId)?.name;
}

export function readMainProjectId(): number | null {
  return mockProjects.find((project) => project.isMain)?.id ?? null;
}

export async function getProject(projectId: number): Promise<Project | undefined> {
  return mockProjects.find((project) => project.id === projectId);
}

export async function getProjectListItem(projectId: number): Promise<ProjectListItem | undefined> {
  const project = await getProject(projectId);

  if (!project) {
    return undefined;
  }

  const [tasks, goals] = await Promise.all([getTasks("all"), getGoals("all")]);

  return enrichProject(project, tasks, goals);
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const nextId = mockProjects.reduce((maxId, project) => Math.max(maxId, project.id), 0) + 1;

  const newProject: Project = {
    ...input,
    id: nextId,
    icon: input.icon ?? getProjectInitial(input.name),
  };

  if (newProject.isMain) {
    mockProjects.forEach((project) => {
      project.isMain = false;
    });
  }

  mockProjects.push(newProject);

  return newProject;
}

export async function updateProject(
  updatedProject: Project,
  deadlineChangeReason?: string,
): Promise<Project> {
  const projectIndex = mockProjects.findIndex((project) => project.id === updatedProject.id);

  if (projectIndex === -1) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const currentProject = mockProjects[projectIndex];

  const blocksDeadlineChange = (status: Project["status"]) =>
    status === "ON_HOLD" || status === "DONE";

  if (
    currentProject.endDate !== updatedProject.endDate &&
    blocksDeadlineChange(currentProject.status) &&
    blocksDeadlineChange(updatedProject.status)
  ) {
    throw new Error(
      currentProject.status === "ON_HOLD"
        ? "보류 중인 프로젝트는 마감일을 변경할 수 없습니다. 진행 중으로 변경한 뒤 바꿔주세요."
        : "완료된 프로젝트는 마감일을 변경할 수 없습니다.",
    );
  }

  if (updatedProject.isMain) {
    mockProjects.forEach((project) => {
      project.isMain = project.id === updatedProject.id;
    });
  }

  if (currentProject.endDate !== updatedProject.endDate) {
    const overdueDays = getProjectDaysAfterEnd(currentProject.endDate);

    recordProjectDeadlineChange({
      projectId: updatedProject.id,
      previousEndDate: currentProject.endDate,
      nextEndDate: updatedProject.endDate,
      changedAt: new Date().toISOString(),
      overdueDaysAtChange: Math.max(overdueDays, 0),
      reason: deadlineChangeReason,
    });
  }

  mockProjects[projectIndex] = updatedProject;

  return updatedProject;
}

export async function deleteProject(projectId: number): Promise<number> {
  const projectIndex = mockProjects.findIndex((project) => project.id === projectId);

  if (projectIndex === -1) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  mockProjects.splice(projectIndex, 1);
  removeProjectDeadlineChanges(projectId);

  return projectId;
}

export async function setMainProject(projectId: number): Promise<Project> {
  const targetProject = mockProjects.find((project) => project.id === projectId);

  if (!targetProject) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  mockProjects.forEach((project) => {
    project.isMain = project.id === projectId;
  });

  return targetProject;
}

export async function clearMainProject(): Promise<void> {
  mockProjects.forEach((project) => {
    project.isMain = false;
  });
}
