"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import Card from "@/components/kit/Card";
import Checkbox from "@/components/kit/Checkbox";
import { Chip } from "@/components/kit/Chip";
import { MenuHeader, MenuSeparator, PickRow } from "@/components/kit/Menu";
import Popover from "@/components/kit/Popover";
import QuickAddInput from "@/components/kit/QuickAddInput";
import SearchField from "@/components/kit/SearchField";
import Segmented from "@/components/kit/Segmented";
import { useToast } from "@/components/kit/Toast";
import { HeaderActions } from "@/components/layout/Header/HeaderActions";
import { usePageMeta } from "@/components/shell/PageMeta";
import {
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Funnel,
  LayoutGrid,
  List,
  ListFilter,
  Plus,
} from "@/components/ui/icon";

import { QUICK_ADD_PLACEHOLDER, TOAST_TEXT } from "@/content/ui";
import { getGoals } from "@/features/goals/api/goals";
import { getProjects } from "@/features/projects/api/projects";
import { getTaskLateDays } from "@/features/projects/detail/projectOverviewModel";
import { getTasks } from "@/features/tasks/api/tasks";
import TaskAddDrawer from "@/features/tasks/drawers/TaskAddDrawer";
import TaskDetailDrawer from "@/features/tasks/drawers/TaskDetailDrawer";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
} from "@/features/tasks/taskModel";
import {
  TaskBoardView,
  TaskCalendarView,
  TaskListView,
  type TaskGroupBy,
  type TaskViewHandlers,
} from "@/features/tasks/views/TaskViews";

import { cn } from "@/lib/cn";
import { toDateKey } from "@/lib/date";
import { projectColorVar } from "@/lib/projectPalette";
import { goalQueryKeys, projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/types/task";

type TaskView = "board" | "list" | "calendar";

const GROUP_LABEL: Record<TaskGroupBy, string> = { due: "마감일", project: "프로젝트" };

// 빠른 입력으로 만드는 태스크 id (옛 화면 CreateTaskButton과 같은 방식, 목업 저장)
const createTaskId = () => Date.now();

const shiftMonth = (month: string, step: number) => {
  const [year, index] = month.split("-").map(Number);
  const date = new Date(year, index - 1 + step, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * 전체 태스크 (REBUILD 3-5 · 보드 10 ~ 10-f · T · M 10).
 * 웹: 제목 「태스크」 + 「오늘 할 일 N개 · 지연 N개」 → 도구 줄(보드 · 목록 · 캘린더 · 프로젝트 200 · 지연만 · ─ ·
 * 묶기 · 필터) → 빠른 입력 → 목록(묶음 카드) / 보드 / 캘린더.
 * 태블릿 · 모바일: 도구 줄 없이 빠른 입력 + 목록 (보드 T · M 10).
 */
export default function TasksScreen() {
  return (
    <Suspense fallback={null}>
      <TasksBody />
    </Suspense>
  );
}

function TasksBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const projectRef = useRef<HTMLButtonElement>(null);
  const groupRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const today = toDateKey(new Date());
  const [view, setView] = useState<TaskView>("list");
  const [projectFilter, setProjectFilter] = useState<number | "all">("all");
  const [projectQuery, setProjectQuery] = useState("");
  const [lateOnly, setLateOnly] = useState(false);
  const [groupBy, setGroupBy] = useState<TaskGroupBy>("due");
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [priorities, setPriorities] = useState<TaskPriority[]>([]);
  const [panel, setPanel] = useState<"project" | "group" | "filter" | null>(null);
  const [month, setMonth] = useState(today.slice(0, 7));
  const [addPreset, setAddPreset] = useState<{ status?: TaskStatus; dueDate?: string } | null>(
    null,
  );
  const [openTaskId, setOpenTaskId] = useState<number | null>(null);
  // 통합 검색 · 단축키에서 온 주소: ?new=1 태스크 추가 · ?task=id 상세
  const [handledQuery, setHandledQuery] = useState("");
  const queryKey = searchParams.toString();
  if (queryKey && queryKey !== handledQuery) {
    setHandledQuery(queryKey);
    if (searchParams.get("new") === "1") {
      setAddPreset({});
    }
    const taskParam = Number(searchParams.get("task"));
    if (taskParam) {
      setOpenTaskId(taskParam);
    }
  }
  const clearQuery = () => {
    if (searchParams.toString()) {
      router.replace("/tasks", { scroll: false });
    }
  };

  const { data: tasks = [] } = useQuery({
    queryKey: taskQueryKeys.list("all"),
    queryFn: () => getTasks("all"),
  });
  const { data: goals = [] } = useQuery({
    queryKey: goalQueryKeys.list("all"),
    queryFn: () => getGoals("all"),
  });
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
  const { updateTaskMutation, deleteTaskMutation, createTaskMutation } = useTaskMutations("all");

  const lateCount = tasks.filter((task) => getTaskLateDays(task, today) != null).length;
  const todayCount = tasks.filter(
    (task) => task.status !== "DONE" && task.dueDate === today,
  ).length;
  const visible = tasks
    .filter((task) => projectFilter === "all" || task.projectId === projectFilter)
    .filter((task) => !lateOnly || getTaskLateDays(task, today) != null)
    .filter((task) => statuses.length === 0 || statuses.includes(task.status))
    .filter((task) => priorities.length === 0 || priorities.includes(task.priority));
  const currentProject = projects.find((project) => project.id === projectFilter);
  const openTask = tasks.find((task) => task.id === openTaskId) ?? null;
  const filterCount = statuses.length + priorities.length;
  const refresh = () => queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });

  usePageMeta("태스크", `오늘 할 일 ${todayCount}개`);

  const handlers: TaskViewHandlers = {
    onOpen: (task) => setOpenTaskId(task.id),
    onToggleDone: (task) => {
      const isCompleting = task.status !== "DONE";
      void updateTaskMutation
        .mutateAsync({ ...task, status: isCompleting ? "DONE" : "TODO" })
        .then(() => {
          void refresh();
          // 완료하면 되돌리기 토스트 (보드 S5 · 프로토타입 tcheck)
          if (isCompleting) {
            toast(TOAST_TEXT.taskCompleted, {
              undo: () => void updateTaskMutation.mutateAsync(task).then(refresh),
            });
          }
        });
    },
    onMove: (task, status) =>
      void updateTaskMutation.mutateAsync({ ...task, status }).then(refresh),
    onDelete: (task) =>
      void deleteTaskMutation.mutateAsync(task.id).then(() => {
        void refresh();
        setOpenTaskId(null);
        toast(TOAST_TEXT.deleted, {
          undo: () => void createTaskMutation.mutateAsync(task).then(refresh),
        });
      }),
    onAdd: (preset) => setAddPreset(preset),
  };

  // 프로토타입 data-quick: 이름만 받아 할 일 · 마감 오늘로 만든다 (프로젝트는 고른 것, 없으면 없음)
  const quickAdd = (title: string) => {
    const task: Task = {
      id: createTaskId(),
      projectId: projectFilter === "all" ? 0 : projectFilter,
      title,
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: today,
      createdBy: 0,
      order: tasks.length,
    };
    void createTaskMutation
      .mutateAsync(task)
      .then(() => {
        void refresh();
        toast(TOAST_TEXT.saved);
      })
      .catch((error: unknown) =>
        toast(error instanceof Error && error.message ? error.message : TOAST_TEXT.saveFailed),
      );
  };

  const toggle = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((item) => item !== value) : [...list, value];

  return (
    <div className="min-h-full bg-[var(--bg)]">
      <div className="mx-auto flex w-full max-w-320 flex-col gap-3 px-4 pt-6 pb-8 md:px-6 md:pt-8 lg:gap-6 lg:px-10 lg:pt-10 lg:pb-16">
        <HeaderActions>
          <Button
            variant="primary"
            size="sm"
            className="max-lg:hidden"
            onClick={() => setAddPreset({})}
          >
            <Plus size={16} aria-hidden />
            추가
          </Button>
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="새로 만들기"
            className="lg:hidden"
            onClick={() => setAddPreset({})}
          >
            <Plus size={18} aria-hidden />
          </Button>
        </HeaderActions>

        <header className="flex flex-col gap-1 max-lg:hidden">
          <h1 className="text-2xl font-bold">태스크</h1>
          <p className="text-sm text-[var(--t2)]">
            오늘 할 일 {todayCount}개
            {lateCount > 0 ? (
              <>
                {" · "}
                <span className="text-[var(--bad)]">지연 {lateCount}개</span>
              </>
            ) : null}
          </p>
        </header>

        {/* 웹 도구 줄 (보드 10) */}
        <div className="flex flex-wrap items-center gap-2 max-lg:hidden">
          <Segmented
            label="보기"
            value={view}
            onChange={setView}
            items={[
              {
                value: "board",
                label: (
                  <>
                    <LayoutGrid size={16} aria-hidden />
                    보드
                  </>
                ),
              },
              {
                value: "list",
                label: (
                  <>
                    <List size={16} aria-hidden />
                    목록
                  </>
                ),
              },
              {
                value: "calendar",
                label: (
                  <>
                    <Calendar size={16} aria-hidden />
                    캘린더
                  </>
                ),
              },
            ]}
          />
          <button
            ref={projectRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={panel === "project"}
            onClick={() => setPanel(panel === "project" ? null : "project")}
            className="kit-focus flex h-9 w-50 min-w-0 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--input-line)] bg-[var(--surface)] px-3 text-left text-sm hover:border-[var(--input-line-h)]"
          >
            <span className="min-w-0 flex-1 truncate">
              프로젝트: {currentProject?.name ?? "전체"}
            </span>
            <ChevronDown size={16} aria-hidden className="shrink-0 text-[var(--t3)]" />
          </button>
          <Chip
            selected={lateOnly}
            icon={<CircleAlert size={16} aria-hidden />}
            onClick={() => setLateOnly((value) => !value)}
          >
            마감 지남만
          </Chip>
          {view === "calendar" ? (
            <div className="ml-2 flex items-center gap-2">
              <strong className="text-base">
                {Number(month.slice(0, 4))}년 {Number(month.slice(5))}월
              </strong>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label="이전 달"
                onClick={() => setMonth(shiftMonth(month, -1))}
              >
                <ChevronLeft size={16} aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                iconOnly
                aria-label="다음 달"
                onClick={() => setMonth(shiftMonth(month, 1))}
              >
                <ChevronRight size={16} aria-hidden />
              </Button>
              <Button size="xs" onClick={() => setMonth(today.slice(0, 7))}>
                오늘
              </Button>
            </div>
          ) : null}
          <span className="flex-1" />
          {view === "list" ? (
            <Button
              ref={groupRef}
              variant="ghost"
              size="sm"
              aria-haspopup="listbox"
              aria-expanded={panel === "group"}
              onClick={() => setPanel(panel === "group" ? null : "group")}
            >
              <ListFilter size={16} aria-hidden />
              묶기: {GROUP_LABEL[groupBy]}
            </Button>
          ) : null}
          <Button
            ref={filterRef}
            size="sm"
            aria-haspopup="dialog"
            aria-expanded={panel === "filter"}
            onClick={() => setPanel(panel === "filter" ? null : "filter")}
            className={cn(filterCount > 0 && "border-[var(--primary)]")}
          >
            <Funnel size={16} aria-hidden />
            필터{filterCount ? ` ${filterCount}` : ""}
          </Button>
        </div>

        {/* 빠른 입력: 웹은 목록 보기에서만, 태블릿 · 모바일은 늘 (보드 10 · T · M 10) */}
        <Card
          className={cn(
            "flex items-center py-2 pr-2 pl-3.5 lg:pl-4",
            view !== "list" && "lg:hidden",
          )}
        >
          <QuickAddInput
            variant="row"
            size="sm"
            placeholder={QUICK_ADD_PLACEHOLDER.task}
            ariaLabel="태스크 빠르게 추가"
            onSubmit={quickAdd}
          />
        </Card>

        {/* 태블릿 · 모바일은 늘 목록 (보드 T · M 10) */}
        <div className={cn(view !== "list" && "lg:hidden")}>
          <TaskListView
            tasks={visible}
            goals={goals}
            today={today}
            projects={projects}
            showProject
            groupBy={groupBy}
            {...handlers}
          />
        </div>
        {view === "board" ? (
          <div className="max-lg:hidden">
            <TaskBoardView tasks={visible} goals={goals} today={today} {...handlers} />
          </div>
        ) : null}
        {view === "calendar" ? (
          <div className="max-lg:hidden">
            <TaskCalendarView
              tasks={visible}
              goals={goals}
              today={today}
              month={month}
              {...handlers}
            />
          </div>
        ) : null}

        <Popover
          isOpen={panel === "project"}
          onClose={() => setPanel(null)}
          anchorRef={projectRef}
          title="프로젝트"
          width={300}
          role="listbox"
        >
          <div className="p-1">
            <SearchField
              value={projectQuery}
              onChange={setProjectQuery}
              placeholder="프로젝트 검색"
              ariaLabel="프로젝트 검색"
            />
          </div>
          <div className="flex max-h-80 flex-col overflow-y-auto [&>*]:shrink-0">
            <PickRow
              selected={projectFilter === "all"}
              onSelect={() => {
                setProjectFilter("all");
                setPanel(null);
              }}
            >
              전체
            </PickRow>
            {projects
              .filter((project) => project.name.includes(projectQuery.trim()))
              .map((project) => (
                <PickRow
                  key={project.id}
                  selected={projectFilter === project.id}
                  onSelect={() => {
                    setProjectFilter(project.id);
                    setPanel(null);
                  }}
                  leading={
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ background: projectColorVar(project.color) }}
                    />
                  }
                >
                  {project.name}
                </PickRow>
              ))}
          </div>
        </Popover>

        <Popover
          isOpen={panel === "group"}
          onClose={() => setPanel(null)}
          anchorRef={groupRef}
          title="묶기"
          width={200}
          align="end"
          role="listbox"
        >
          {(["due", "project"] as TaskGroupBy[]).map((key) => (
            <PickRow
              key={key}
              selected={groupBy === key}
              onSelect={() => {
                setGroupBy(key);
                setPanel(null);
              }}
            >
              {GROUP_LABEL[key]}
            </PickRow>
          ))}
        </Popover>

        <Popover
          isOpen={panel === "filter"}
          onClose={() => setPanel(null)}
          anchorRef={filterRef}
          title="필터"
          width={280}
          align="end"
        >
          <MenuHeader>상태</MenuHeader>
          {TASK_STATUS_ORDER.map((status) => (
            <FilterRow
              key={status}
              label={TASK_STATUS_LABEL[status]}
              count={tasks.filter((task) => task.status === status).length}
              checked={statuses.includes(status)}
              onToggle={() => setStatuses(toggle(statuses, status))}
            />
          ))}
          <MenuSeparator />
          <MenuHeader>우선순위</MenuHeader>
          {TASK_PRIORITY_ORDER.map((priority) => (
            <FilterRow
              key={priority}
              label={TASK_PRIORITY_LABEL[priority]}
              count={tasks.filter((task) => task.priority === priority).length}
              checked={priorities.includes(priority)}
              onToggle={() => setPriorities(toggle(priorities, priority))}
            />
          ))}
          <MenuSeparator />
          <div className="flex items-center gap-2 px-1.5 py-1">
            <span className="flex-1 text-xs text-[var(--t3)]">결과 {visible.length}개</span>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => {
                setStatuses([]);
                setPriorities([]);
              }}
            >
              초기화
            </Button>
          </div>
        </Popover>

        <TaskAddDrawer
          projectId={null}
          goals={goals}
          preset={addPreset}
          onClose={() => {
            setAddPreset(null);
            clearQuery();
          }}
          count={tasks.length}
        />
        <TaskDetailDrawer
          task={openTask}
          projectName={
            projects.find((project) => project.id === openTask?.projectId)?.name ?? "프로젝트 없음"
          }
          goals={goals.filter((goal) => goal.projectId === openTask?.projectId)}
          onClose={() => {
            setOpenTaskId(null);
            clearQuery();
          }}
          onToggleDone={handlers.onToggleDone}
          onDelete={handlers.onDelete}
        />
      </div>
    </div>
  );
}

function FilterRow({
  label,
  count,
  checked,
  onToggle,
}: {
  label: string;
  count: number;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2 text-sm transition-colors duration-120 hover:bg-[var(--s3)] max-md:min-h-13">
      <Checkbox checked={checked} onChange={onToggle} label={label} />
      <span className="flex-1">{label}</span>
      <span className="text-xs text-[var(--t3)] tabular-nums">{count}</span>
    </label>
  );
}
