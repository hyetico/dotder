"use client";

import { useId, useRef, useState, type ReactNode } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import Badge from "@/components/kit/Badge";
import Button from "@/components/kit/Button";
import { DiscardConfirmDialog } from "@/components/kit/ConfirmDialog";
import DateField from "@/components/kit/DateField";
import Drawer from "@/components/kit/Drawer";
import Field from "@/components/kit/Field";
import { MenuItem, MenuSeparator, MoreMenu, PickRow } from "@/components/kit/Menu";
import Popover from "@/components/kit/Popover";
import Segmented from "@/components/kit/Segmented";
import { TextArea } from "@/components/kit/TextInput";
import { useToast } from "@/components/kit/Toast";
import { Check, ChevronDown, Maximize2, Minimize2, Trash2 } from "@/components/ui/icon";

import { BUTTON_LABEL, TOAST_TEXT } from "@/content/ui";
import GoalPicker from "@/features/goals/pick/GoalPicker";
import { getProjects } from "@/features/projects/api/projects";
import { getTaskLateDays } from "@/features/projects/detail/projectOverviewModel";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
} from "@/features/tasks/taskModel";

import { toDateKey } from "@/lib/date";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Goal } from "@/features/goals/types/goal";
import type { Task } from "@/features/tasks/types/task";

type Draft = Pick<Task, "status" | "goalId" | "dueDate" | "priority" | "description">;

const toDraft = (task: Task): Draft => ({
  status: task.status,
  goalId: task.goalId,
  dueDate: task.dueDate,
  priority: task.priority,
  description: task.description,
});

type TaskDetailDrawerProps = {
  task: Task | null;
  projectName: string;
  goals: Goal[];
  onClose: () => void;
  onToggleDone: (task: Task) => void;
  onDelete: (task: Task) => void;
};

/**
 * 태스크 상세 드로어 (보드 05-b · 프로토타입 taskDetail). 위 작은 글 「태스크 · 프로젝트」 + 이름 20,
 * 머리 ⋯ · 넓게 보기 · 닫기. 상태 3칸 + 지연 배지 → 목표 · 마감일(요일 · 「N일 지남」) · 우선순위 속성 줄(라벨 88) → 설명.
 * [저장]은 바꾼 것이 있을 때만.
 */
export default function TaskDetailDrawer({
  task,
  projectName,
  goals,
  onClose,
  onToggleDone,
  onDelete,
}: TaskDetailDrawerProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const priorityRef = useRef<HTMLButtonElement>(null);
  const [draft, setDraft] = useState<Draft | null>(task ? toDraft(task) : null);
  const [openedFor, setOpenedFor] = useState<number | null>(task?.id ?? null);
  const [isWide, setIsWide] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { updateTaskMutation } = useTaskMutations(task?.projectId ?? "all");

  if ((task?.id ?? null) !== openedFor) {
    setOpenedFor(task?.id ?? null);
    setDraft(task ? toDraft(task) : null);
    setIsWide(false);
  }

  const today = toDateKey(new Date());
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
  const dueLimit =
    goals.find((goal) => goal.id === draft?.goalId)?.endDate ||
    projects.find((project) => project.id === task?.projectId)?.endDate ||
    undefined;
  const isDirty = task && draft ? JSON.stringify(draft) !== JSON.stringify(toDraft(task)) : false;
  const late = draft ? getTaskLateDays(draft, today) : null;
  const update = (next: Partial<Draft>) =>
    setDraft((value) => (value ? { ...value, ...next } : value));
  const requestClose = () => (isDirty ? setIsConfirmOpen(true) : onClose());

  const save = async () => {
    if (!task || !draft || !isDirty) {
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({ ...task, ...draft });
      await queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
      toast(TOAST_TEXT.saved);
      onClose();
    } catch {
      toast(TOAST_TEXT.saveFailed, { retry: () => void save() });
    }
  };

  return (
    <>
      <Drawer
        isOpen={Boolean(task)}
        onClose={requestClose}
        title={task?.title ?? ""}
        titleSize="xl"
        kicker={`태스크 · ${projectName}`}
        panelRef={panelRef}
        initialFocusRef={panelRef}
        wide={isWide}
        headerActions={
          task ? (
            <>
              <MoreMenu label="태스크 메뉴" title="태스크" size="sm">
                {(close) => (
                  <>
                    <MenuItem
                      icon={<Check />}
                      onSelect={() => {
                        close();
                        onToggleDone(task);
                        onClose();
                      }}
                    >
                      {task.status === "DONE" ? "완료 취소" : "완료"}
                    </MenuItem>
                    <MenuSeparator />
                    <MenuItem
                      danger
                      icon={<Trash2 />}
                      onSelect={() => {
                        close();
                        onDelete(task);
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
          ) : null
        }
        footer={
          <Button
            variant="primary"
            disabled={!isDirty || updateTaskMutation.isPending}
            onClick={() => void save()}
          >
            {BUTTON_LABEL.save}
          </Button>
        }
      >
        {draft ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                label="태스크 상태"
                value={draft.status}
                onChange={(status) => update({ status })}
                items={TASK_STATUS_ORDER.map((status) => ({
                  value: status,
                  label: TASK_STATUS_LABEL[status],
                }))}
              />
              {late != null ? <Badge tone="bad">{late}일 지남</Badge> : null}
            </div>
            <PropertyRow label="목표">
              <GoalPicker
                variant="row"
                goals={goals}
                value={draft.goalId ?? null}
                onChange={(goalId) => update({ goalId: goalId ?? undefined })}
              />
            </PropertyRow>
            <PropertyRow label="마감일">
              <DateField
                variant="row"
                label="마감일"
                value={draft.dueDate}
                // 태스크 마감 ≤ 목표 마감 ≤ 프로젝트 마감 (REBUILD 6 날짜 범위)
                max={dueLimit}
                onChange={(dueDate) => update({ dueDate })}
                trailing={
                  late != null ? <span className="text-[var(--bad)]">{late}일 지남</span> : null
                }
              />
            </PropertyRow>
            <PropertyRow label="우선순위">
              <button
                ref={priorityRef}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isPriorityOpen}
                onClick={() => setIsPriorityOpen((open) => !open)}
                className="kit-focus -ml-2.5 flex min-h-9 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2.5 text-sm hover:bg-[var(--s3)]"
              >
                {TASK_PRIORITY_LABEL[draft.priority]}
                <ChevronDown size={16} aria-hidden className="text-[var(--t3)]" />
              </button>
              <Popover
                isOpen={isPriorityOpen}
                onClose={() => setIsPriorityOpen(false)}
                anchorRef={priorityRef}
                title="우선순위"
                width={200}
                role="listbox"
              >
                {TASK_PRIORITY_ORDER.map((priority) => (
                  <PickRow
                    key={priority}
                    selected={draft.priority === priority}
                    onSelect={() => {
                      update({ priority });
                      setIsPriorityOpen(false);
                    }}
                  >
                    {TASK_PRIORITY_LABEL[priority]}
                  </PickRow>
                ))}
              </Popover>
            </PropertyRow>
            <Field label="설명" htmlFor={descriptionId}>
              <TextArea
                id={descriptionId}
                value={draft.description}
                maxLength={500}
                placeholder="설명 입력"
                minSize="detail"
                onChange={(event) => update({ description: event.target.value })}
              />
            </Field>
          </div>
        ) : null}
      </Drawer>
      <DiscardConfirmDialog
        isOpen={isConfirmOpen}
        withinRef={panelRef}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          onClose();
        }}
      />
    </>
  );
}

/** 상세 드로어 속성 줄 (보드 05-b): 라벨 88 · 14 --t2 | 값 */
function PropertyRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-10 items-center gap-3">
      <span className="w-22 shrink-0 text-sm text-[var(--t2)]">{label}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
