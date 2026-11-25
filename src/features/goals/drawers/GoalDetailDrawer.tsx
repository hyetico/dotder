"use client";

import { useId, useRef, useState, type ReactNode } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import Badge from "@/components/kit/Badge";
import Button from "@/components/kit/Button";
import Checkbox from "@/components/kit/Checkbox";
import { DeleteConfirmDialog, DiscardConfirmDialog } from "@/components/kit/ConfirmDialog";
import DateField from "@/components/kit/DateField";
import Drawer from "@/components/kit/Drawer";
import Field from "@/components/kit/Field";
import { MenuItem, MenuSeparator, MoreMenu } from "@/components/kit/Menu";
import Popover from "@/components/kit/Popover";
import QuickAddInput from "@/components/kit/QuickAddInput";
import Segmented from "@/components/kit/Segmented";
import TagPicker from "@/components/kit/TagPicker";
import { TextArea } from "@/components/kit/TextInput";
import { useToast } from "@/components/kit/Toast";
import { Calendar, Check, Maximize2, Minimize2, Trash2 } from "@/components/ui/icon";

import { BUTTON_LABEL, GOAL_TAG_TEXT, QUICK_ADD_PLACEHOLDER, TOAST_TEXT } from "@/content/ui";
import { useGoalMutations } from "@/features/goals/hooks/useGoalMutations";
import { getGoalStats } from "@/features/goals/list/goalListModel";
import { getProjects } from "@/features/projects/api/projects";
import { getTaskLateDays } from "@/features/projects/detail/projectOverviewModel";
import ProjectPicker from "@/features/projects/pick/ProjectPicker";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";

import { cn } from "@/lib/cn";
import { formatDate, getDayDelta, toDateKey } from "@/lib/date";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Goal, GoalStatus } from "@/features/goals/types/goal";
import type { Task } from "@/features/tasks/types/task";

type Draft = Pick<Goal, "status" | "projectId" | "startDate" | "endDate" | "tags" | "description">;

const toDraft = (goal: Goal): Draft => ({
  status: goal.status,
  projectId: goal.projectId,
  startDate: goal.startDate,
  endDate: goal.endDate,
  tags: [...goal.tags],
  description: goal.description,
});

// 새 태스크 id (옛 화면 CreateTaskButton과 같은 방식, 목업 저장)
const createTaskId = () => Date.now();

const STATUS_ITEMS: { value: GoalStatus; label: string }[] = [
  { value: "NOT_STARTED", label: "계획" },
  { value: "IN_PROGRESS", label: "진행 중" },
  { value: "COMPLETED", label: "완료" },
];

type GoalDetailDrawerProps = {
  goal: Goal | null;
  /** 그 목표의 프로젝트 태스크 (목표에 묶인 것만 골라 보인다) */
  tasks: Task[];
  onClose: () => void;
};

/**
 * 목표 상세 드로어 (보드 04-b · 프로토타입 goalDetail). 위 작은 글 「목표 · 프로젝트」 + 이름 20,
 * 머리에 ⋯ · 넓게 보기 · 닫기. 상태 3칸 + 지연 배지 → 진행률 → 프로젝트 · 기간 속성 줄 → 태그(2개까지) →
 * 설명 → 태스크 목록(체크하면 바로 완료) + 「+ 태스크 추가」. [저장]은 바꾼 것이 있을 때만 (자동 저장 없음).
 */
export default function GoalDetailDrawer({ goal, tasks, onClose }: GoalDetailDrawerProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const periodRef = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState<Draft | null>(goal ? toDraft(goal) : null);
  const [openedFor, setOpenedFor] = useState<number | null>(goal?.id ?? null);
  const [isWide, setIsWide] = useState(false);
  const [isPeriodOpen, setIsPeriodOpen] = useState(false);
  const [confirm, setConfirm] = useState<"discard" | "delete" | null>(null);
  const { updateGoalAsync, isUpdating, deleteGoalAsync, restoreGoalAsync } = useGoalMutations();
  const { updateTaskMutation, createTaskMutation } = useTaskMutations(goal?.projectId ?? "all");
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  if ((goal?.id ?? null) !== openedFor) {
    setOpenedFor(goal?.id ?? null);
    setDraft(goal ? toDraft(goal) : null);
    setIsWide(false);
  }

  const today = toDateKey(new Date());
  const current = goal && draft ? { ...goal, ...draft } : null;
  const project = projects.find((item) => item.id === draft?.projectId) ?? null;
  const stats = current ? getGoalStats(current, tasks, today) : null;
  const ownTasks = goal ? tasks.filter((task) => task.goalId === goal.id) : [];
  const isDirty = goal && draft ? JSON.stringify(draft) !== JSON.stringify(toDraft(goal)) : false;
  const update = (next: Partial<Draft>) =>
    setDraft((value) => (value ? { ...value, ...next } : value));
  const requestClose = () => (isDirty ? setConfirm("discard") : onClose());
  const refreshProjects = () => queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });

  const save = async () => {
    if (!goal || !draft || !isDirty) {
      return;
    }

    try {
      await updateGoalAsync({ ...goal, ...draft, teamId: project?.teamId ?? null });
      await refreshProjects();
      toast(TOAST_TEXT.saved);
      onClose();
    } catch (error) {
      toast(error instanceof Error && error.message ? error.message : TOAST_TEXT.saveFailed, {
        retry: () => void save(),
      });
    }
  };

  const toggleTask = async (task: Task) => {
    await updateTaskMutation.mutateAsync({
      ...task,
      status: task.status === "DONE" ? "TODO" : "DONE",
    });
    await refreshProjects();
  };

  const addTask = async (title: string) => {
    if (!goal) {
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        id: createTaskId(),
        projectId: goal.projectId ?? 0,
        goalId: goal.id,
        title,
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        createdBy: 0,
        order: ownTasks.length,
      });
      await refreshProjects();
    } catch (error) {
      toast(error instanceof Error && error.message ? error.message : TOAST_TEXT.saveFailed);
    }
  };

  const complete = async () => {
    if (!goal) {
      return;
    }

    await updateGoalAsync({ ...goal, status: "COMPLETED", teamId: project?.teamId ?? null });
    toast(TOAST_TEXT.goalCompleted, {
      undo: () => void updateGoalAsync({ ...goal, teamId: project?.teamId ?? null }),
    });
    onClose();
  };

  const remove = async () => {
    if (!goal) {
      return;
    }

    const removed = await deleteGoalAsync(goal.id);
    toast(TOAST_TEXT.deleted, { undo: () => void restoreGoalAsync(removed) });
    onClose();
  };

  return (
    <>
      <Drawer
        isOpen={Boolean(goal)}
        onClose={requestClose}
        title={goal?.title ?? ""}
        titleSize="xl"
        kicker={`목표 · ${project?.name ?? "프로젝트 없음"}`}
        panelRef={panelRef}
        // 상세는 읽으러 여는 것이라 첫 칸에 초점을 주지 않는다
        initialFocusRef={panelRef}
        wide={isWide}
        headerActions={
          <>
            <MoreMenu label="목표 메뉴" title="목표" size="sm">
              {(close) => (
                <>
                  <MenuItem
                    icon={<Check />}
                    disabled={goal?.status === "COMPLETED"}
                    onSelect={() => {
                      close();
                      void complete();
                    }}
                  >
                    완료
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem
                    danger
                    icon={<Trash2 />}
                    onSelect={() => {
                      close();
                      setConfirm("delete");
                    }}
                  >
                    {BUTTON_LABEL.delete}
                  </MenuItem>
                </>
              )}
            </MoreMenu>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label={isWide ? "좁게 보기" : "넓게 보기"}
              aria-pressed={isWide}
              onClick={() => setIsWide((wide) => !wide)}
              className="max-md:hidden"
            >
              {isWide ? <Minimize2 size={16} aria-hidden /> : <Maximize2 size={16} aria-hidden />}
            </Button>
          </>
        }
        footer={
          <Button variant="primary" disabled={!isDirty || isUpdating} onClick={() => void save()}>
            {BUTTON_LABEL.save}
          </Button>
        }
      >
        {current && draft && stats ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                label="목표 상태"
                value={draft.status}
                onChange={(status) => update({ status })}
                items={STATUS_ITEMS}
              />
              {stats.lateDays != null ? <Badge tone="bad">{stats.lateDays}일 지연</Badge> : null}
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center text-xs">
                <span className="flex-1 text-[var(--t2)]">
                  진행률 · 태스크 {stats.done} / {stats.total}
                </span>
                <strong className="font-bold tabular-nums">{stats.percent}%</strong>
              </div>
              <span className="block h-1.5 overflow-hidden rounded-full bg-[var(--track)]">
                <i
                  className="block h-full rounded-full bg-[var(--badge-info-dot)]"
                  style={{ width: `${stats.percent}%` }}
                />
              </span>
            </div>

            <PropertyRow label="프로젝트">
              <ProjectPicker
                variant="row"
                value={draft.projectId}
                onChange={(projectId) => update({ projectId, tags: [] })}
              />
            </PropertyRow>

            <PropertyRow label="기간">
              <button
                ref={periodRef}
                type="button"
                aria-haspopup="dialog"
                aria-expanded={isPeriodOpen}
                onClick={() => setIsPeriodOpen((open) => !open)}
                className="kit-focus -ml-2.5 flex min-h-9 w-full min-w-0 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] pl-2.5 text-left text-sm hover:bg-[var(--s3)]"
              >
                <Calendar size={16} aria-hidden className="shrink-0 text-[var(--t3)]" />
                <span
                  className={cn(
                    "whitespace-nowrap",
                    !draft.startDate && !draft.endDate && "text-[var(--t3)]",
                  )}
                >
                  {draft.startDate || draft.endDate
                    ? `${formatDate(draft.startDate)} ~ ${formatDate(draft.endDate)}`
                    : "기간 없음"}
                </span>
                {stats.lateDays != null ? (
                  <span className="ml-auto text-xs whitespace-nowrap text-[var(--bad)]">
                    {getDayDelta(draft.endDate, today)}일 지남
                  </span>
                ) : null}
              </button>
              <Popover
                isOpen={isPeriodOpen}
                onClose={() => setIsPeriodOpen(false)}
                anchorRef={periodRef}
                title="기간"
                width={320}
              >
                <div className="grid grid-cols-2 gap-3 p-2">
                  <Field label="시작일">
                    <DateField
                      label="시작일"
                      value={draft.startDate}
                      onChange={(startDate) =>
                        update({
                          startDate,
                          endDate:
                            draft.endDate && startDate && draft.endDate < startDate
                              ? ""
                              : draft.endDate,
                        })
                      }
                    />
                  </Field>
                  <Field label="마감일">
                    <DateField
                      label="마감일"
                      value={draft.endDate}
                      min={draft.startDate || undefined}
                      onChange={(endDate) => update({ endDate })}
                    />
                  </Field>
                </div>
              </Popover>
            </PropertyRow>

            <TagPicker
              // 프로젝트 태그에 없는 기존 태그도 보이게 한다 (빼려면 눌러야 하므로)
              options={[...new Set([...(project?.tags ?? []), ...draft.tags])]}
              value={draft.tags}
              onChange={(tags) => update({ tags })}
              emptyText={project ? GOAL_TAG_TEXT.noTags : GOAL_TAG_TEXT.noProject}
            />

            <Field label="설명" htmlFor={descriptionId}>
              <TextArea
                id={descriptionId}
                value={draft.description}
                maxLength={500}
                placeholder="설명 입력"
                minSize="sm"
                onChange={(event) => update({ description: event.target.value })}
              />
            </Field>

            <div className="flex flex-col gap-1">
              <strong className="text-sm">태스크 {ownTasks.length}</strong>
              <ul>
                {ownTasks.map((task) => {
                  const late = getTaskLateDays(task, today);
                  const isDone = task.status === "DONE";

                  return (
                    <li
                      key={task.id}
                      className="flex min-h-10 items-center gap-2.5 border-t border-[var(--divider)] text-sm"
                    >
                      <Checkbox
                        checked={isDone}
                        onChange={() => void toggleTask(task)}
                        label={`‘${task.title}’ 완료`}
                      />
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate",
                          isDone && "text-[var(--t3)] line-through",
                        )}
                      >
                        {task.title}
                      </span>
                      {late != null ? <Badge tone="bad">{late}일 지연</Badge> : null}
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-[var(--divider)]">
                <QuickAddInput
                  variant="row"
                  placeholder={QUICK_ADD_PLACEHOLDER.task}
                  ariaLabel="이 목표에 태스크 추가"
                  onSubmit={(title) => void addTask(title)}
                />
              </div>
            </div>
          </div>
        ) : null}
      </Drawer>
      <DiscardConfirmDialog
        isOpen={confirm === "discard"}
        withinRef={panelRef}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          onClose();
        }}
      />
      <DeleteConfirmDialog
        target="목표"
        isOpen={confirm === "delete"}
        withinRef={panelRef}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          void remove();
        }}
      />
    </>
  );
}

/** 상세 드로어 속성 줄 (보드 04-b): 라벨 72 · 14 --t2 | 값은 줄 끝까지 (REBUILD 4-3) */
function PropertyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-10 items-center gap-3">
      <span className="w-18 shrink-0 text-sm text-[var(--t2)]">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
