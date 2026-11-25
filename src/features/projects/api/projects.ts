import { getGoals } from "@/features/goals/api/goals";
import { decodeActivityCounts, type ActivityDay } from "@/features/projects/utils/activityMosaic";
import { getProjectInitial } from "@/features/projects/utils/projectDisplay";
import {
  enrichProject,
  getProjectDaysAfterEnd,
  resolveProjectStatus,
} from "@/features/projects/utils/projectUtils";
import { getTasks } from "@/features/tasks/api/tasks";

import { MOCK_ACTIVITY_FROM, mockProjectActivity } from "@/lib/mock/projectActivity";
import {
  getProjectDeadlineChanges,
  recordProjectDeadlineChange,
  removeProjectDeadlineChanges,
} from "@/lib/mock/projectDeadlineChanges";
import { mockProjects } from "@/lib/mock/projects";

import type {
  Project,
  ProjectDeadlineChange,
  ProjectListItem,
} from "@/features/projects/types/project";

export type CreateProjectInput = Omit<Project, "id" | "icon"> & {
  icon?: string;
};

// 보관한 프로젝트는 목록 · 전환 · 고르기에서 뺀다 (보관함은 getArchivedProjects)
const isActiveProject = (project: Project) => !project.archivedAt;

export async function getProjects(): Promise<Project[]> {
  return mockProjects.filter(isActiveProject).map((project) => ({
    ...project,
    status: resolveProjectStatus(project),
    tags: [...project.tags],
  }));
}

export async function getProjectListItems(): Promise<ProjectListItem[]> {
  const [tasks, goals] = await Promise.all([getTasks("all"), getGoals("all")]);

  return mockProjects
    .filter(isActiveProject)
    .map((project) =>
      enrichProject({ ...project, status: resolveProjectStatus(project) }, tasks, goals),
    );
}

/**
 * 보관함(01-h)에 보일 프로젝트. 최근에 보관한 것이 앞.
 */
export async function getArchivedProjectListItems(): Promise<ProjectListItem[]> {
  const [tasks, goals] = await Promise.all([getTasks("all"), getGoals("all")]);

  return mockProjects
    .filter((project) => project.archivedAt)
    .sort((a, b) => (b.archivedAt ?? "").localeCompare(a.archivedAt ?? ""))
    .map((project) =>
      enrichProject({ ...project, status: resolveProjectStatus(project) }, tasks, goals),
    );
}

/**
 * 프로젝트를 보관하거나(`archivedAt` = 오늘) 보관함에서 꺼낸다(`null`). 메모 보관과 같은 방식.
 *
 * @param archivedAt - 보관한 날 `YYYY-MM-DD`. 복원은 `null`
 * @throws 프로젝트가 없으면
 */
export async function setProjectArchived(
  projectId: number,
  archivedAt: string | null,
): Promise<Project> {
  const project = mockProjects.find((item) => item.id === projectId);

  if (!project) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  project.archivedAt = archivedAt;
  project.updatedAt = new Date().toISOString();

  // 메인 프로젝트를 보관하면 메인을 푼다 (보관한 것은 메인이 될 수 없다)
  if (archivedAt) {
    project.isMain = false;
  }

  return project;
}

/**
 * 프로젝트를 복제한다 (프로토타입 pmenu 「복제」). 이름 뒤에 「 (사본)」, 메인 · 보관은 따라가지 않는다.
 * 목표 · 태스크는 복제하지 않는다.
 */
export async function duplicateProject(projectId: number): Promise<Project> {
  const source = mockProjects.find((item) => item.id === projectId);

  if (!source) {
    throw new Error("프로젝트를 찾을 수 없습니다.");
  }

  const index = mockProjects.indexOf(source);
  const nextId = mockProjects.reduce((maxId, project) => Math.max(maxId, project.id), 0) + 1;
  const copy: Project = {
    ...source,
    id: nextId,
    name: `${source.name.slice(0, 20)} (사본)`,
    isMain: false,
    archivedAt: null,
    tags: [...source.tags],
  };

  mockProjects.splice(index + 1, 0, copy);

  return copy;
}

/**
 * 프로젝트별 날짜별 활동 기록을 읽는다 (활동 모자이크).
 *
 * @returns 프로젝트 id → 기록이 있는 날 목록. 기록이 없는 프로젝트는 빠진다
 */
export async function getProjectActivity(): Promise<Record<number, ActivityDay[]>> {
  return Object.fromEntries(
    mockProjectActivity.map((item) => [
      item.projectId,
      decodeActivityCounts(MOCK_ACTIVITY_FROM, item.counts),
    ]),
  );
}

/**
 * 프로젝트 마감일 변경 기록을 읽는다 (보드 03 일정 ◇ · 최근 기록).
 *
 * @returns 최근에 바꾼 것이 앞
 */
export async function getProjectDeadlineChangeList(
  projectId: number,
): Promise<ProjectDeadlineChange[]> {
  return getProjectDeadlineChanges(projectId).map((change) => ({ ...change }));
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
    updatedAt: new Date().toISOString(),
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

  mockProjects[projectIndex] = { ...updatedProject, updatedAt: new Date().toISOString() };

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

/**
 * 지운 프로젝트를 같은 id로 다시 넣는다 (삭제 토스트 「되돌리기」). 마감 변경 기록은 돌아오지 않는다.
 */
export async function restoreDeletedProject(project: Project): Promise<Project> {
  if (!mockProjects.some((item) => item.id === project.id)) {
    mockProjects.push({ ...project, tags: [...project.tags] });
  }

  return project;
}
