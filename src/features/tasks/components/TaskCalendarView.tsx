"use client";

import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { AppIcon, ChevronLeft, ChevronRight, Plus } from "@/components/ui/icon";
import Modal from "@/components/ui/modal/Modal";

import { getProjects } from "@/features/projects/api/projects";
import { canAddProjectItems } from "@/features/projects/utils/projectUtils";
import { getTasks } from "@/features/tasks/api/tasks";
import CreateTaskButton from "@/features/tasks/components/board/CreateTaskButton";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";
import EditTaskModal from "@/features/tasks/modals/EditTaskModal";
import {
  filterTasksBySearchQuery,
  matchesTaskStatusFilter,
  taskTodayStamp,
  type TaskFilterTab,
} from "@/features/tasks/utils/taskUtils";

import { projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

import type { Task, TaskStatus } from "@/features/tasks/types/task";
import type { ProjectScope } from "@/lib/projectRoutes";

type TaskCalendarViewProps = {
  projectScope: ProjectScope;
  searchQuery?: string;
  statusFilter?: TaskFilterTab;
};

type TaskPriority = Task["priority"];

type CalendarDay = {
  date: Date;
  dateKey: string;
  day: number;
  isCurrentMonth: boolean;
};

const statusStyle: Record<
  TaskStatus,
  {
    label: string;
    bar: string;
  }
> = {
  TODO: {
    label: "TODO",
    bar: "bg-slate-400",
  },

  IN_PROGRESS: {
    label: "IN PROGRESS",
    bar: "bg-blue-600",
  },

  DONE: {
    label: "DONE",
    bar: "bg-green-600",
  },
};

const priorityStyle: Record<TaskPriority, string> = {
  HIGH: "bg-red-50 text-red-500",

  MEDIUM: "bg-orange-50 text-orange-500",

  LOW: "bg-emerald-50 text-emerald-600",
};

const priorityLabel: Record<TaskPriority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/*
 * Date를 Task dueDate 형식과 동일하게 변환
 *
 * 예:
 * 2026-09-03
 */
function formatDateKey(date: Date) {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
 * dateKey → Modal 제목용
 *
 * 예: 2026-09-03 → 2026년 9월 3일
 */
function formatDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return `${year}년 ${month}월 ${day}일`;
}

type CalendarTaskCardProps = {
  task: Task;
  showProjectName: boolean;
  projectName?: string;
  onClick: () => void;
  compact?: boolean;
};

function CalendarTaskCard({
  task,
  showProjectName,
  projectName,
  onClick,
  compact = false,
}: CalendarTaskCardProps) {
  const status = statusStyle[task.status];

  if (compact) {
    return (
      <button
        type="button"
        aria-label={`${task.title} 상세 보기`}
        onClick={onClick}
        className="group flex w-full max-w-full min-w-0 items-stretch gap-1 overflow-hidden rounded-[2px] py-px text-left transition-colors hover:bg-[var(--color-hover-soft)]"
        title={task.title}
      >
        <span
          className={`w-0.5 shrink-0 self-stretch rounded-full ${status.bar} `}
          aria-hidden="true"
        />

        <span className="min-w-0 flex-1 basis-0 overflow-hidden text-2xs leading-[14px] text-ellipsis whitespace-nowrap text-[var(--color-text-secondary)] group-hover:text-[var(--color-text)]">
          {task.title}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-label={`${task.title} 상세 보기`}
      onClick={onClick}
      className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5 text-left transition-colors hover:border-gray-300 hover:bg-[var(--color-hover-soft)]"
    >
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={`h-3.5 w-0.5 shrink-0 rounded-full ${status.bar} `} aria-hidden="true" />

        <p className="text-caption min-w-0 flex-1 truncate font-medium text-[var(--color-text)]">
          {task.title}
        </p>

        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-2xs font-medium ${priorityStyle[task.priority]} `}
        >
          {priorityLabel[task.priority]}
        </span>
      </div>

      {showProjectName && (
        <p className="mt-1 truncate text-2xs text-[var(--color-text-muted)]">
          {projectName ?? "알 수 없는 프로젝트"}
        </p>
      )}
    </button>
  );
}

/*
 * 현재 월을 기준으로
 * 7일 × 6주 = 42개의 날짜 생성
 */
function createCalendarDays(currentMonth: Date): CalendarDay[] {
  const year = currentMonth.getFullYear();

  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);

  /*
   * 이번 달 1일이 무슨 요일인지
   */
  const firstDayIndex = firstDay.getDay();

  /*
   * 달력 첫 번째 칸에 들어갈 날짜
   *
   * 이전 달 날짜가 포함될 수 있음
   */
  const calendarStart = new Date(year, month, 1 - firstDayIndex);

  return Array.from(
    {
      length: 42,
    },
    (_, index) => {
      const date = new Date(calendarStart);

      date.setDate(calendarStart.getDate() + index);

      return {
        date,

        dateKey: formatDateKey(date),

        day: date.getDate(),

        isCurrentMonth: date.getMonth() === month,
      };
    },
  );
}

export default function TaskCalendarView({
  projectScope,
  searchQuery = "",
  statusFilter = "all",
}: TaskCalendarViewProps) {
  /*
   * 현재 보고 있는 월
   *
   * 처음에는 현재 월
   */
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();

    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  /*
   * 카드 클릭 시 EditTaskModal에 표시할 Task
   */
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  /*
   * "+ N개 더보기" 클릭 시
   * 해당 날짜 Task 목록 Modal
   */
  const [expandedDateKey, setExpandedDateKey] = useState<string | null>(null);

  const { handleCreateTask, handleUpdateTask, handleDeleteTask } = useTaskMutations(projectScope);

  /*
   * 날짜 셀 + 버튼 → Task 생성 Modal
   */
  const [createTaskDateKey, setCreateTaskDateKey] = useState<string | null>(null);

  /*
   * taskQueryKeys.list() — Board / List와 같은 캐시 주소
   */
  const {
    data: tasks = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: taskQueryKeys.list(projectScope),

    queryFn: () => getTasks(projectScope),
  });

  /*
   * 전체 프로젝트 보기일 때
   * 프로젝트명을 표시하기 위해 조회
   */
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,

    queryFn: getProjects,
  });

  const showProjectName = projectScope === "all";
  const scopedProject =
    typeof projectScope === "number"
      ? projects.find((project) => project.id === projectScope)
      : undefined;
  const taskAddDisabled = !canAddProjectItems(scopedProject?.status);

  /*
   * projectId → projectName
   */
  const projectNames = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.name])),
    [projects],
  );

  /*
   * 현재 Calendar에 표시할
   * 42개의 날짜
   */
  const calendarDays = useMemo(() => createCalendarDays(currentMonth), [currentMonth]);

  const today = taskTodayStamp();
  const visibleTasks = useMemo(
    () =>
      filterTasksBySearchQuery(
        tasks,
        searchQuery,
        showProjectName ? projectNames : undefined,
      ).filter((task) => matchesTaskStatusFilter(task, statusFilter, today)),
    [tasks, searchQuery, showProjectName, projectNames, statusFilter, today],
  );

  /*
   * 날짜별 Task 그룹
   *
   * 예:
   * {
   *   "2026-09-01": [Task, Task],
   *   "2026-09-03": [Task]
   * }
   */
  const tasksByDate = useMemo(() => {
    return visibleTasks.reduce<Record<string, Task[]>>((groupedTasks, task) => {
      if (!groupedTasks[task.dueDate]) {
        groupedTasks[task.dueDate] = [];
      }

      groupedTasks[task.dueDate].push(task);

      return groupedTasks;
    }, {});
  }, [visibleTasks]);

  const currentMonthTaskCount = useMemo(() => {
    const year = currentMonth.getFullYear();

    const month = currentMonth.getMonth() + 1;

    return visibleTasks.filter((task) => {
      const [taskYear, taskMonth] = task.dueDate.split("-").slice(0, 2).map(Number);

      return taskYear === year && taskMonth === month;
    }).length;
  }, [visibleTasks, currentMonth]);

  /*
   * 오늘 날짜
   */
  const todayKey = formatDateKey(new Date());

  /*
   * 이전 달
   */
  const handlePreviousMonth = () => {
    setCurrentMonth(
      (previousMonth) => new Date(previousMonth.getFullYear(), previousMonth.getMonth() - 1, 1),
    );
  };

  /*
   * 다음 달
   */
  const handleNextMonth = () => {
    setCurrentMonth(
      (previousMonth) => new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 1),
    );
  };

  /*
   * 오늘이 속한 달로 이동
   */
  const handleToday = () => {
    const today = new Date();

    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  /*
   * Loading
   */
  if (isLoading) {
    return (
      <div className="flex h-[var(--tasks-calendar-height)] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <p className="text-body text-[var(--color-text-secondary)]">Task를 불러오는 중입니다...</p>
      </div>
    );
  }

  /*
   * Error
   */
  if (isError) {
    return (
      <div className="flex h-[var(--tasks-calendar-height)] shrink-0 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <p className="text-body text-red-500">Task를 불러오지 못했습니다.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[var(--tasks-calendar-height)] shrink-0 flex-col overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
      {/*
       * =====================================================
       * Calendar Header
       * =====================================================
       */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] px-3 py-2.5 md:px-4">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <h2 className="text-card-title shrink-0 font-semibold text-[var(--color-text)]">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </h2>

          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-[var(--color-text-secondary)]">
            {currentMonthTaskCount}
          </span>

          <span className="shrink-0 rounded-full bg-gray-100 px-2 py-1 text-xs text-[var(--color-text-secondary)]">
            마감일 기준
          </span>
        </div>

        {/*
         * 월 이동
         */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="text-caption h-9 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)]"
          >
            오늘
          </button>

          <button
            type="button"
            onClick={handlePreviousMonth}
            aria-label="이전 달"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)]"
          >
            <AppIcon icon={ChevronLeft} size="md" />
          </button>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="다음 달"
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)]"
          >
            <AppIcon icon={ChevronRight} size="md" />
          </button>
        </div>
      </div>

      {/*
       * =====================================================
       * Calendar Body
       *
       * Header를 제외한 나머지 높이를
       * 모두 Calendar가 사용
       * =====================================================
       */}
      <div className="min-h-0 flex-1 overflow-x-auto">
        <div className="flex h-full min-w-[900px] flex-col">
          {/*
           * =================================================
           * Week Header
           * =================================================
           */}
          <div className="grid shrink-0 grid-cols-7 border-b border-[var(--color-border)] bg-[var(--color-hover-soft)]/70">
            {weekDays.map((weekDay) => (
              <div
                key={weekDay}
                className="border-r border-[var(--color-border)] px-2 py-0.5 text-center text-2xs leading-[14px] font-medium text-[var(--color-text-secondary)] last:border-r-0"
              >
                {weekDay}
              </div>
            ))}
          </div>

          {/*
           * =================================================
           * Calendar Grid
           *
           * 남은 높이를 6개의 주가
           * 동일하게 나눠 가짐
           * =================================================
           */}
          <div className="grid min-h-0 min-w-0 flex-1 grid-cols-7 grid-rows-6">
            {calendarDays.map((calendarDay, index) => {
              const dayTasks = tasksByDate[calendarDay.dateKey] ?? [];

              const isToday = calendarDay.dateKey === todayKey;

              /*
               * 제한된 높이 안에서
               * 최대 2개의 Task만 노출
               */
              const visibleTasks = dayTasks.slice(0, 2);

              const hiddenTaskCount = dayTasks.length - visibleTasks.length;

              return (
                <div
                  key={calendarDay.dateKey}
                  className={`flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-r border-b border-[var(--color-border)] px-1.5 py-1 ${
                    !calendarDay.isCurrentMonth
                      ? "bg-[var(--color-hover-soft)]/50"
                      : "bg-[var(--color-surface)]"
                  } ${(index + 1) % 7 === 0 ? "border-r-0" : ""} `}
                >
                  {/*
                   * =========================================
                   * 날짜 + 액션
                   * =========================================
                   */}
                  <div className="flex shrink-0 items-center justify-between gap-1">
                    <div className="flex min-w-0 items-center gap-1">
                      <span
                        className={`flex h-5 min-w-5 items-center justify-center rounded-full px-0.5 text-xs leading-none font-medium ${
                          isToday
                            ? "bg-primary-gradient text-[var(--color-text-inverse)]"
                            : calendarDay.isCurrentMonth
                              ? "text-[var(--color-text)]"
                              : "text-[var(--color-text-muted)]"
                        } `}
                      >
                        {calendarDay.day}
                      </span>

                      {/* {dayTasks.length >
                          0 && (
                          <span
                            className="
                              shrink-0

                              rounded-[3px]

                              bg-red-500

                              px-1

                              text-2xs
                              leading-[14px]
                              font-medium
                              text-[var(--color-text-inverse)]
                            "
                          >
                            {
                              dayTasks.length
                            }
                          </span>
                        )} */}
                    </div>

                    <button
                      type="button"
                      disabled={taskAddDisabled}
                      aria-label={`${calendarDay.day}일 Task 추가`}
                      title={
                        taskAddDisabled
                          ? "보류 중인 프로젝트에는 태스크를 추가할 수 없습니다."
                          : `${calendarDay.day}일 Task 추가`
                      }
                      onClick={() => setCreateTaskDateKey(calendarDay.dateKey)}
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] text-[var(--color-text-muted)] transition-colors hover:bg-gray-100 hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[var(--color-text-muted)]"
                    >
                      <AppIcon icon={Plus} size="xs" />
                    </button>
                  </div>

                  {/*
                   * =========================================
                   * Task
                   *
                   * 상·하 flex-1 → Task 박스 전체를 셀 세로 중앙
                   * 박스 내부 — 카드·더보기는 flex-col top 정렬
                   * =========================================
                   */}
                  <div className="flex min-h-1 min-w-0 flex-1 flex-col overflow-hidden">
                    <div className="flex h-full w-full min-w-0 overflow-hidden">
                      <div className="w-full max-w-full min-w-0 items-center overflow-hidden pt-1.5">
                        <div className="flex w-full max-w-full min-w-0 flex-col items-stretch gap-0.5 overflow-hidden py-1">
                          {visibleTasks.map((task) => (
                            <CalendarTaskCard
                              key={task.id}
                              task={task}
                              compact
                              showProjectName={showProjectName}
                              projectName={projectNames[task.projectId]}
                              onClick={() => setEditingTask(task)}
                            />
                          ))}

                          {/*
                           * Task가 2개보다 많으면
                           * 나머지 개수 표시
                           */}
                          {hiddenTaskCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedDateKey(calendarDay.dateKey)}
                              className="group flex w-full min-w-0 shrink-0 items-stretch gap-1 py-px text-left transition-colors hover:bg-[var(--color-hover-soft)]"
                            >
                              {/*
                               * Task 카드와 동일 — bar 자리 spacer로 텍스트 정렬
                               */}
                              <span className="w-0.5 shrink-0" aria-hidden="true" />

                              <span className="min-w-0 flex-1 truncate text-2xs leading-[14px] font-normal text-[var(--color-text-muted)] group-hover:text-[var(--color-text-secondary)]">
                                {hiddenTaskCount}개 더 보기
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/*
       * 날짜 셀 + 버튼용 Task 생성 Modal
       */}
      <CreateTaskButton
        projectScope={projectScope}
        projects={projects}
        status="TODO"
        onCreate={handleCreateTask}
        hideTrigger
        defaultDueDate={createTaskDateKey ?? undefined}
        isModalOpen={createTaskDateKey !== null}
        onModalOpenChange={(open) => {
          if (!open) {
            setCreateTaskDateKey(null);
          }
        }}
      />

      {/*
       * 해당 날짜 Task 전체 목록
       */}
      <Modal isOpen={expandedDateKey !== null} onClose={() => setExpandedDateKey(null)}>
        <Modal.Header
          title={expandedDateKey ? `${formatDateLabel(expandedDateKey)} Task` : "Task 목록"}
          description={
            expandedDateKey ? `총 ${(tasksByDate[expandedDateKey] ?? []).length}개` : undefined
          }
          onClose={() => setExpandedDateKey(null)}
          closeLabel="날짜별 Task 목록 닫기"
        />

        <Modal.Body className="max-h-[min(24rem,60dvh)] overflow-y-auto">
          <div className="space-y-2">
            {expandedDateKey &&
              (tasksByDate[expandedDateKey] ?? []).map((task) => (
                <CalendarTaskCard
                  key={task.id}
                  task={task}
                  showProjectName={showProjectName}
                  projectName={projectNames[task.projectId]}
                  onClick={() => {
                    setExpandedDateKey(null);
                    setEditingTask(task);
                  }}
                />
              ))}
          </div>
        </Modal.Body>
      </Modal>

      {/*
       * List / Board와 동일한 EditTaskModal 재사용
       * (캘린더 카드 클릭 → 수정)
       */}
      {editingTask && (
        <EditTaskModal
          isOpen
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onUpdate={(updatedTask) => {
            handleUpdateTask(updatedTask);
            setEditingTask(null);
          }}
          onDelete={(taskId) => {
            handleDeleteTask(taskId);
            setEditingTask(null);
          }}
        />
      )}
    </div>
  );
}
