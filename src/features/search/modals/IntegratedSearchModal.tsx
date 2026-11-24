"use client";

import { useMemo, useState, type ReactNode } from "react";

import SecondaryButton from "@/components/ui/button/SecondaryButton";
import {
  AppIcon,
  Folder,
  iconSize,
  List,
  ListTodo,
  SquareCheck,
  Target,
  X,
} from "@/components/ui/icon";
import Modal, {
  modalSidePaddingClassName,
  stableListModalPanelClassName,
} from "@/components/ui/modal/Modal";
import LineTabMenu, { type TabMenuItem } from "@/components/ui/tab/LineTabMenu";

import GoalStatusBadge from "@/features/goals/components/GoalStatusBadge";
import GoalStatusIcon from "@/features/goals/components/GoalStatusIcon";
import {
  isGoalDelayedByProject,
  isGoalShownDelayed,
} from "@/features/goals/utils/goalProjectDelay";
import {
  getGoalScheduleMark,
  getGoalStatusLabel,
  getGoalVisualStatus,
  type GoalVisualStatus,
} from "@/features/goals/utils/goalUtils";
import ProjectBadge from "@/features/projects/components/ProjectBadge";
import ProjectList, { ListScroll } from "@/features/projects/components/ProjectPicker/ProjectList";
import ProjectPickerFields from "@/features/projects/components/ProjectPicker/ProjectPickerFields";
import {
  getPickerStatusItems,
  matchesProjectPicker,
  sortProjectsByName,
} from "@/features/projects/utils/projectPicker";
import { isProjectDelayed } from "@/features/projects/utils/projectUtils";
import TaskStatusBadge from "@/features/tasks/components/TaskStatusBadge";
import TaskStatusIcon from "@/features/tasks/components/TaskStatusIcon";
import { getTaskStatusLabel } from "@/features/tasks/utils/taskUtils";

import { buildTasksPath, getGoalDetailPath, getProjectDetailPath } from "@/lib/projectRoutes";

import type { LucideIcon } from "@/components/ui/icon/icons";
import type { StatusFilterChipItem } from "@/components/ui/StatusFilterChips";
import type { Goal, GoalStatus } from "@/features/goals/types/goal";
import type { ProjectFilterTab } from "@/features/projects/constants/projectFilters";
import type { Project } from "@/features/projects/types/project";
import type { Task, TaskStatus } from "@/features/tasks/types/task";

type SearchTab = "projects" | "goals" | "tasks";

type GoalSearchFilter = "all" | "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "DELAYED";

type TaskSearchFilter = "all" | TaskStatus;

const searchTabs: TabMenuItem<SearchTab>[] = [
  {
    id: "projects",
    label: "프로젝트",
    icon: Folder,
  },
  {
    id: "goals",
    label: "목표",
    icon: Target,
  },
  {
    id: "tasks",
    label: "태스크",
    icon: ListTodo,
  },
];

type IntegratedSearchModalProps = {
  isOpen: boolean;
  projects: Project[];
  goals: Goal[];
  tasks: Task[];
  onNavigate: (href: string, projectId: number | null) => void;
  onClose: () => void;
};

/**
 * includesQuery
 *
 * 검색어가 비어 있거나 값 중 하나에 포함되면 통과합니다.
 *
 * @param query - 입력된 검색어
 * @param values - 비교할 문구
 * @returns 목록에 남기면 true
 */
function includesQuery(query: string, values: Array<string | undefined>) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return values.some((value) => value?.toLowerCase().includes(normalized));
}

/**
 * matchesGoalSearchStatus
 *
 * 목표가 목표 상태 필터에 들어가는지 확인합니다.
 *
 * @param goal - 확인할 목표
 * @param projects - 지연 판단에 쓰는 프로젝트
 * @param status - 고른 목표 상태
 * @returns 목록에 남기면 true
 */
function matchesGoalSearchStatus(goal: Goal, projects: Project[], status: GoalSearchFilter) {
  const delayed = isGoalShownDelayed(goal, projects);

  if (status === "all") {
    return true;
  }

  if (status === "DELAYED") {
    return delayed;
  }

  return goal.status === status;
}

/**
 * matchesTaskSearchStatus
 *
 * 태스크가 태스크 상태 필터에 들어가는지 확인합니다.
 *
 * @param task - 확인할 태스크
 * @param status - 고른 태스크 상태
 * @returns 목록에 남기면 true
 */
function matchesTaskSearchStatus(task: Task, status: TaskSearchFilter) {
  return status === "all" || task.status === status;
}

/**
 * isTaskPastDue
 *
 * 완료되지 않았고 마감일이 지난 태스크인지 확인합니다.
 *
 * @param task - 확인할 태스크
 * @returns 마감이 지났으면 true
 */
function isTaskPastDue(task: Task) {
  if (task.status === "DONE" || !task.dueDate) {
    return false;
  }

  const today = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const current = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  return task.dueDate < current;
}

/**
 * sortByTitle
 *
 * 이름순으로 정렬한 새 배열을 돌려줍니다.
 *
 * @param items - 정렬할 항목
 * @param title - 항목에서 이름을 꺼내는 함수
 * @returns 정렬된 새 배열
 */
function sortByTitle<T extends { id: number }>(items: T[], title: (item: T) => string) {
  return [...items].sort(
    (left, right) => title(left).localeCompare(title(right), "ko") || left.id - right.id,
  );
}

type ScopeChipProps = {
  icon: LucideIcon;
  label: string;
  clearLabel: string;
  onClear: () => void;
};

/**
 * ScopeChip
 *
 * 검색창 위에 프로젝트나 목표 범위를 박스로 표시하고 해제할 수 있게 합니다.
 *
 * @param props - ScopeChip 컴포넌트 Props
 * @param props.icon - 범위 종류 아이콘
 * @param props.label - 박스에 보여줄 범위 이름
 * @param props.clearLabel - 해제 버튼의 접근 이름
 * @param props.onClear - 범위를 해제할 때 실행되는 함수
 */
function ScopeChip({ icon, label, clearLabel, onClear }: ScopeChipProps) {
  return (
    <div className="text-caption flex h-6 w-fit max-w-[14rem] min-w-0 items-center gap-1 rounded-[6px] border border-[var(--color-border)] bg-[var(--color-hover)] px-2 text-[var(--color-text-secondary)]">
      <AppIcon icon={icon} size="xs" className="shrink-0" />
      <span className="min-w-0 truncate">{label}</span>
      <button
        type="button"
        aria-label={clearLabel}
        onClick={onClear}
        className="inline-flex shrink-0 text-[var(--color-text-secondary)]"
      >
        <AppIcon icon={X} size="xs" />
      </button>
    </div>
  );
}

type ViewLinkProps = {
  label: string;
  onClick: () => void;
};

/**
 * ViewLink
 *
 * 연결된 목표나 태스크 탭으로 이동하는 링크입니다.
 *
 * @param props - ViewLink 컴포넌트 Props
 * @param props.label - 링크 문구
 * @param props.onClick - 링크를 눌렀을 때 실행되는 함수
 */
function ViewLink({ label, onClick }: ViewLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-badge-sm inline-flex h-5 shrink-0 items-center rounded-[4px] border border-[var(--color-border)] bg-white px-1 leading-3 font-medium whitespace-nowrap text-[var(--color-text)] transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-text-muted)] hover:text-white"
    >
      {label}
    </button>
  );
}

const goalSearchStatusClassName =
  "text-badge-sm inline-flex h-4 shrink-0 items-center gap-0.5 leading-none";

const goalSearchStatusColor: Record<GoalVisualStatus, string> = {
  NOT_STARTED: "text-[var(--color-text-secondary)]",
  IN_PROGRESS: "text-blue-600",
  COMPLETED: "text-green-600",
  DELAYED: "text-red-600",
};

type GoalSearchStatusProps = {
  status: GoalStatus;
  delayed?: boolean;
};

/**
 * GoalSearchStatus
 *
 * 통합 검색의 목표 상태를 배경 없이 아이콘과 글자로 표시합니다.
 *
 * @param props - GoalSearchStatus 컴포넌트 Props
 * @param props.status - 표시할 목표 상태
 * @param props.delayed - 지연으로 보여줄지 여부
 */
function GoalSearchStatus({ status, delayed = false }: GoalSearchStatusProps) {
  const appearance = getGoalVisualStatus(status, delayed);

  return (
    <span className={[goalSearchStatusClassName, goalSearchStatusColor[appearance]].join(" ")}>
      <GoalStatusIcon status={appearance} size={10} />
      {getGoalStatusLabel(appearance)}
    </span>
  );
}

type ResultRowProps = {
  leading: ReactNode;
  title: string;
  subtitle?: string;
  status: ReactNode;
  onOpen: () => void;
  extra?: ReactNode;
};

/**
 * ResultRow
 *
 * 목표나 태스크 한 줄을 표시합니다.
 *
 * @param props - ResultRow 컴포넌트 Props
 * @param props.leading - 이름 왼쪽 표시
 * @param props.title - 항목 이름
 * @param props.subtitle - 이름 아래 보조 문구
 * @param props.status - 오른쪽에 둘 상태
 * @param props.onOpen - 항목을 열 때 실행되는 함수
 * @param props.extra - 보조 문구 아래 추가 내용
 */
function ResultRow({ leading, title, subtitle, status, onOpen, extra }: ResultRowProps) {
  return (
    <li
      className={`rounded-[var(--radius-sm)] px-2 pt-2 ${extra ? "pb-1" : "pb-2"} hover:bg-[var(--color-hover)]`}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          {leading}
          <span className="min-w-0 flex-1">
            <span className="text-caption block truncate font-semibold text-[var(--color-text)]">
              {title}
            </span>
            {subtitle ? (
              <span className="text-caption mt-0.5 block truncate text-[var(--color-text-secondary)]">
                {subtitle}
              </span>
            ) : null}
          </span>
        </button>
        <div className="flex shrink-0 items-center">{status}</div>
      </div>
      {extra ? (
        <div className="mt-0.5 flex items-center gap-1 pl-[46px]">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{extra}</div>
        </div>
      ) : null}
    </li>
  );
}

/**
 * IntegratedSearchModal
 *
 * 프로젝트, 목표, 태스크를 각 상태에 맞춰 검색합니다.
 *
 * @param props - IntegratedSearchModal 컴포넌트 Props
 * @param props.isOpen - 모달을 열지 여부
 * @param props.projects - 검색할 프로젝트
 * @param props.goals - 검색할 목표
 * @param props.tasks - 검색할 태스크
 * @param props.onNavigate - 항목을 열 때 실행되는 함수
 * @param props.onClose - 모달을 닫을 때 실행되는 함수
 */
export default function IntegratedSearchModal({
  isOpen,
  projects,
  goals,
  tasks,
  onNavigate,
  onClose,
}: IntegratedSearchModalProps) {
  const [tab, setTab] = useState<SearchTab>("projects");
  const [scopeId, setScopeId] = useState<number | null>(null);
  const [goalScopeId, setGoalScopeId] = useState<number | null>(null);
  const [projectQuery, setProjectQuery] = useState("");
  const [goalQuery, setGoalQuery] = useState("");
  const [taskQuery, setTaskQuery] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectFilterTab>("all");
  const [goalStatus, setGoalStatus] = useState<GoalSearchFilter>("all");
  const [taskStatus, setTaskStatus] = useState<TaskSearchFilter>("all");
  const [wasOpen, setWasOpen] = useState(isOpen);

  if (!isOpen && wasOpen) {
    setWasOpen(false);
  }

  if (isOpen && !wasOpen) {
    setWasOpen(true);
    setTab("projects");
    setScopeId(null);
    setGoalScopeId(null);
    setProjectQuery("");
    setGoalQuery("");
    setTaskQuery("");
    setProjectStatus("all");
    setGoalStatus("all");
    setTaskStatus("all");
  }

  const scopeProject =
    scopeId == null ? null : (projects.find((project) => project.id === scopeId) ?? null);

  const scopeGoal =
    goalScopeId == null ? null : (goals.find((goal) => goal.id === goalScopeId) ?? null);

  const activeScopeId = scopeProject?.id ?? null;
  const activeGoalScopeId = scopeGoal?.id ?? null;

  const goalCountByProject = useMemo(() => {
    const counts = new Map<number, number>();

    goals.forEach((goal) => {
      if (goal.projectId == null) {
        return;
      }

      counts.set(goal.projectId, (counts.get(goal.projectId) ?? 0) + 1);
    });

    return counts;
  }, [goals]);

  const taskCountByProject = useMemo(() => {
    const counts = new Map<number, number>();

    tasks.forEach((task) => {
      counts.set(task.projectId, (counts.get(task.projectId) ?? 0) + 1);
    });

    return counts;
  }, [tasks]);

  const taskCountByGoal = useMemo(() => {
    const counts = new Map<number, number>();

    tasks.forEach((task) => {
      if (task.goalId == null) {
        return;
      }

      counts.set(task.goalId, (counts.get(task.goalId) ?? 0) + 1);
    });

    return counts;
  }, [tasks]);

  const projectNameById = useMemo(() => {
    const names = new Map<number, string>();

    projects.forEach((project) => {
      names.set(project.id, project.name);
    });

    return names;
  }, [projects]);

  const goalById = useMemo(() => {
    const byId = new Map<number, Goal>();

    goals.forEach((goal) => {
      byId.set(goal.id, goal);
    });

    return byId;
  }, [goals]);

  const searchedProjects = useMemo(
    () =>
      sortProjectsByName(
        projects.filter((project) => matchesProjectPicker(project, "all", projectQuery)),
      ),
    [projects, projectQuery],
  );

  const visibleProjects = useMemo(
    () =>
      searchedProjects.filter((project) =>
        matchesProjectPicker(project, projectStatus, projectQuery),
      ),
    [searchedProjects, projectStatus, projectQuery],
  );

  const projectStatusItems = useMemo(
    () => getPickerStatusItems(searchedProjects),
    [searchedProjects],
  );

  const scopedGoals = useMemo(
    () => goals.filter((goal) => activeScopeId == null || goal.projectId === activeScopeId),
    [goals, activeScopeId],
  );

  const queriedGoals = useMemo(
    () =>
      sortByTitle(
        scopedGoals.filter((goal) =>
          includesQuery(goalQuery, [
            goal.title,
            goal.description,
            goal.projectId == null ? "" : projectNameById.get(goal.projectId),
          ]),
        ),
        (goal) => goal.title,
      ),
    [scopedGoals, goalQuery, projectNameById],
  );

  const visibleGoals = useMemo(
    () => queriedGoals.filter((goal) => matchesGoalSearchStatus(goal, projects, goalStatus)),
    [queriedGoals, projects, goalStatus],
  );

  const goalStatusItems: StatusFilterChipItem<GoalSearchFilter>[] = useMemo(() => {
    const count = (status: GoalSearchFilter) =>
      queriedGoals.filter((goal) => matchesGoalSearchStatus(goal, projects, status)).length;

    return [
      {
        id: "all",
        label: "전체",
        count: queriedGoals.length,
        iconColor: "var(--color-text-muted)",
        icon: <AppIcon icon={Target} size="sm" />,
      },
      {
        id: "NOT_STARTED",
        label: getGoalStatusLabel("NOT_STARTED"),
        count: count("NOT_STARTED"),
        iconColor: "var(--color-neutral-text)",
        icon: <GoalStatusIcon status="NOT_STARTED" size={iconSize.sm} />,
      },
      {
        id: "IN_PROGRESS",
        label: getGoalStatusLabel("IN_PROGRESS"),
        count: count("IN_PROGRESS"),
        iconColor: "var(--color-info-text)",
        icon: <GoalStatusIcon status="IN_PROGRESS" size={iconSize.sm} />,
      },
      {
        id: "COMPLETED",
        label: getGoalStatusLabel("COMPLETED"),
        count: count("COMPLETED"),
        iconColor: "var(--color-success-text)",
        icon: <GoalStatusIcon status="COMPLETED" size={iconSize.sm} />,
      },
      {
        id: "DELAYED",
        label: "마감 초과",
        count: count("DELAYED"),
        iconColor: "var(--color-danger-text)",
        icon: <GoalStatusIcon status="DELAYED" size={iconSize.sm} />,
      },
    ];
  }, [queriedGoals, projects]);

  const scopedTasks = useMemo(
    () =>
      tasks.filter((task) => {
        if (activeGoalScopeId != null && task.goalId !== activeGoalScopeId) {
          return false;
        }

        return activeScopeId == null || task.projectId === activeScopeId;
      }),
    [tasks, activeScopeId, activeGoalScopeId],
  );

  const queriedTasks = useMemo(
    () =>
      sortByTitle(
        scopedTasks.filter((task) =>
          includesQuery(taskQuery, [
            task.title,
            task.description,
            projectNameById.get(task.projectId),
            task.goalId == null ? "" : goalById.get(task.goalId)?.title,
          ]),
        ),
        (task) => task.title,
      ),
    [scopedTasks, taskQuery, projectNameById, goalById],
  );

  const visibleTasks = useMemo(
    () => queriedTasks.filter((task) => matchesTaskSearchStatus(task, taskStatus)),
    [queriedTasks, taskStatus],
  );

  const taskStatusItems: StatusFilterChipItem<TaskSearchFilter>[] = useMemo(() => {
    const count = (status: TaskStatus) =>
      queriedTasks.filter((task) => task.status === status).length;

    return [
      {
        id: "all",
        label: "전체",
        count: queriedTasks.length,
        iconColor: "var(--color-text-muted)",
        icon: <AppIcon icon={List} size="sm" />,
      },
      {
        id: "TODO",
        label: getTaskStatusLabel("TODO"),
        count: count("TODO"),
        iconColor: "var(--color-neutral-text)",
        icon: <TaskStatusIcon status="TODO" size={iconSize.sm} />,
      },
      {
        id: "IN_PROGRESS",
        label: getTaskStatusLabel("IN_PROGRESS"),
        count: count("IN_PROGRESS"),
        iconColor: "var(--color-info-text)",
        icon: <TaskStatusIcon status="IN_PROGRESS" size={iconSize.sm} />,
      },
      {
        id: "DONE",
        label: getTaskStatusLabel("DONE"),
        count: count("DONE"),
        iconColor: "var(--color-success-text)",
        icon: <TaskStatusIcon status="DONE" size={iconSize.sm} />,
      },
    ];
  }, [queriedTasks]);

  /**
   * clearProjectScope
   *
   * 프로젝트 범위와 그 아래 목표 범위를 함께 해제합니다.
   */
  const clearProjectScope = () => {
    setScopeId(null);
    setGoalScopeId(null);
  };

  const openGoals = (projectId: number) => {
    setScopeId(projectId);
    setGoalScopeId(null);
    setGoalQuery("");
    setGoalStatus("all");
    setTab("goals");
  };

  const openTasks = (projectId: number | null) => {
    setScopeId(projectId);
    setGoalScopeId(null);
    setTaskQuery("");
    setTaskStatus("all");
    setTab("tasks");
  };

  /**
   * openGoalTasks
   *
   * 고른 목표의 프로젝트 박스와 목표 박스를 띄우고, 그 목표의 태스크만 보여 줍니다.
   *
   * @param goal - 태스크 범위로 둘 목표
   */
  const openGoalTasks = (goal: Goal) => {
    setScopeId(goal.projectId);
    setGoalScopeId(goal.id);
    setTaskQuery("");
    setTaskStatus("all");
    setTab("tasks");
  };

  const projectScopeChip = scopeProject ? (
    <ScopeChip
      icon={Folder}
      label={`프로젝트: ${scopeProject.name}`}
      clearLabel="프로젝트 범위 해제"
      onClear={clearProjectScope}
    />
  ) : null;

  const goalScopeChip = scopeGoal ? (
    <ScopeChip
      icon={SquareCheck}
      label={`목표: ${scopeGoal.title}`}
      clearLabel="목표 범위 해제"
      onClear={() => setGoalScopeId(null)}
    />
  ) : null;

  let body: ReactNode;

  if (tab === "projects") {
    body = (
      <>
        <div className={`shrink-0 ${modalSidePaddingClassName} py-4`}>
          <ProjectPickerFields
            query={projectQuery}
            onQueryChange={setProjectQuery}
            placeholder="프로젝트명으로 검색"
            ariaLabel="프로젝트 검색"
            statusItems={projectStatusItems}
            status={projectStatus}
            onStatusChange={setProjectStatus}
            statusLabel="프로젝트 상태"
          />
        </div>
        <ListScroll>
          <ProjectList
            projects={visibleProjects}
            mark="folder"
            pairDelay
            onSelect={(project) => onNavigate(getProjectDetailPath(project.id), project.id)}
            emptyLabel={
              projects.length === 0 ? "등록된 프로젝트가 없습니다." : "검색 결과가 없습니다."
            }
            renderExtra={(project) => {
              const goalCount = goalCountByProject.get(project.id) ?? 0;
              const taskCount = taskCountByProject.get(project.id) ?? 0;

              if (goalCount === 0 && taskCount === 0) {
                return null;
              }

              return (
                <div className="flex flex-wrap gap-1">
                  {goalCount > 0 ? (
                    <ViewLink
                      label={`목표 ${goalCount} 보기`}
                      onClick={() => openGoals(project.id)}
                    />
                  ) : null}
                  {taskCount > 0 ? (
                    <ViewLink
                      label={`태스크 ${taskCount} 보기`}
                      onClick={() => openTasks(project.id)}
                    />
                  ) : null}
                </div>
              );
            }}
          />
        </ListScroll>
      </>
    );
  } else if (tab === "goals") {
    body = (
      <>
        <div className={`shrink-0 ${modalSidePaddingClassName} py-4`}>
          <div className="space-y-3">
            {projectScopeChip}
            <ProjectPickerFields
              query={goalQuery}
              onQueryChange={setGoalQuery}
              placeholder={scopeProject ? "이 프로젝트의 목표를 검색하세요." : "목표명으로 검색"}
              ariaLabel="목표 검색"
              statusItems={goalStatusItems}
              status={goalStatus}
              onStatusChange={setGoalStatus}
              statusLabel="목표 상태"
            />
          </div>
        </div>
        <ListScroll>
          {visibleGoals.length === 0 ? (
            <p className="text-caption px-2 py-8 text-center text-[var(--color-text-secondary)]">
              {scopedGoals.length === 0 ? "해당하는 목표가 없습니다." : "검색 결과가 없습니다."}
            </p>
          ) : (
            <ul aria-label="목표" className="space-y-0.5">
              {visibleGoals.map((goal) => {
                const linkedTaskCount = taskCountByGoal.get(goal.id) ?? 0;

                return (
                  <ResultRow
                    key={goal.id}
                    leading={
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-white text-[var(--color-text-secondary)]">
                        <AppIcon icon={Target} size="sm" />
                      </span>
                    }
                    title={goal.title}
                    subtitle={
                      goal.projectId == null ? undefined : projectNameById.get(goal.projectId)
                    }
                    status={
                      <span className="inline-flex items-center gap-1">
                        <GoalSearchStatus status={goal.status} />
                        {goal.status !== "COMPLETED" &&
                        getGoalScheduleMark(goal).tone === "delayed" ? (
                          <span className="text-badge-sm inline-flex h-4 shrink-0 items-center leading-none text-red-600">
                            마감 초과
                          </span>
                        ) : null}
                        {isGoalDelayedByProject(goal, projects) ? (
                          <GoalSearchStatus status={goal.status} delayed />
                        ) : null}
                      </span>
                    }
                    onOpen={() =>
                      onNavigate(getGoalDetailPath(goal.id, goal.projectId), goal.projectId)
                    }
                    extra={
                      linkedTaskCount > 0 ? (
                        <ViewLink
                          label={`연결 태스크 ${linkedTaskCount} 보기`}
                          onClick={() => openGoalTasks(goal)}
                        />
                      ) : undefined
                    }
                  />
                );
              })}
            </ul>
          )}
        </ListScroll>
      </>
    );
  } else {
    body = (
      <>
        <div className={`shrink-0 ${modalSidePaddingClassName} py-4`}>
          <div className="space-y-3">
            {projectScopeChip}
            {goalScopeChip}
            <ProjectPickerFields
              query={taskQuery}
              onQueryChange={setTaskQuery}
              placeholder={
                scopeProject
                  ? "이 프로젝트의 태스크를 검색하세요."
                  : scopeGoal
                    ? "이 목표의 태스크를 검색하세요."
                    : "태스크명으로 검색"
              }
              ariaLabel="태스크 검색"
              statusItems={taskStatusItems}
              status={taskStatus}
              onStatusChange={setTaskStatus}
              statusLabel="태스크 상태"
            />
          </div>
        </div>
        <ListScroll>
          {visibleTasks.length === 0 ? (
            <p className="text-caption px-2 py-8 text-center text-[var(--color-text-secondary)]">
              {scopedTasks.length === 0 ? "해당하는 태스크가 없습니다." : "검색 결과가 없습니다."}
            </p>
          ) : (
            <ul aria-label="태스크" className="space-y-0.5">
              {visibleTasks.map((task) => {
                const goal = task.goalId == null ? undefined : goalById.get(task.goalId);
                const project = projects.find((item) => item.id === task.projectId);

                return (
                  <ResultRow
                    key={task.id}
                    leading={
                      <ProjectBadge
                        color={goal?.color ?? project?.color ?? null}
                        size="sm"
                        mark="task"
                        selected
                      />
                    }
                    title={task.title}
                    subtitle={goal ? `목표: ${goal.title}` : project ? project.name : undefined}
                    status={
                      <span className="inline-flex items-center gap-1">
                        <TaskStatusBadge status={task.status} size="sm" />
                        {isTaskPastDue(task) ? (
                          <span className="text-badge-sm inline-flex h-4 shrink-0 items-center leading-none text-red-600">
                            마감 초과
                          </span>
                        ) : null}
                        {project && task.status !== "DONE" && isProjectDelayed(project) ? (
                          <GoalStatusBadge status="IN_PROGRESS" delayed size="sm" />
                        ) : null}
                      </span>
                    }
                    onOpen={() => onNavigate(buildTasksPath(task.projectId), task.projectId)}
                  />
                );
              })}
            </ul>
          )}
        </ListScroll>
      </>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      padded={false}
      labelledBy="integrated-search-modal-title"
      zIndexClassName="z-[180]"
      maxWidthClassName="max-w-[520px]"
      panelClassName={stableListModalPanelClassName}
    >
      <Modal.Header
        id="integrated-search-modal-title"
        title="통합 검색"
        onClose={onClose}
        closeLabel="통합 검색 닫기"
      />
      <LineTabMenu
        ariaLabel="통합 검색 범위"
        value={tab}
        items={searchTabs}
        onChange={setTab}
        className={`w-full shrink-0 ${modalSidePaddingClassName} `}
      />
      {body}
      <Modal.Footer>
        <SecondaryButton size="modal" onClick={onClose}>
          닫기
        </SecondaryButton>
      </Modal.Footer>
    </Modal>
  );
}
