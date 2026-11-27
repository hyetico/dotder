"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { badgeDotClassName } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import ColorSwatches from "@/components/ui/ColorSwatches";
import { DeleteConfirmDialog, DiscardConfirmDialog } from "@/components/ui/ConfirmDialog";
import DateField from "@/components/ui/DateField";
import Drawer from "@/components/ui/Drawer";
import Field from "@/components/ui/Field";
import { CircleAlert, Trash2 } from "@/components/ui/icon";
import Segmented from "@/components/ui/Segmented";
import TagField from "@/components/ui/TagField";
import { GrowingInput, TextArea } from "@/components/ui/TextInput";
import { useToast } from "@/components/ui/Toast";

import { BUTTON_LABEL, TOAST_TEXT } from "@/content/ui";
import { useGoalMutations } from "@/features/goals/hooks/useGoalMutations";
import { recordShiftedItems } from "@/features/projects/api/projects";
import {
  getShiftItems,
  mergeGoalShifts,
  ShiftNotice,
} from "@/features/projects/detail/projectShift";
import { useProjectMutations } from "@/features/projects/hooks/useProjectMutations";
import { PROJECT_STATUS_TONE } from "@/features/projects/list/ProjectCard";
import { getProjectStatusLabel } from "@/features/projects/utils/projectUtils";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";

import { cn } from "@/lib/cn";
import { getDayDelta, toDateKey } from "@/lib/date";

import type { Goal } from "@/features/goals/types/goal";
import type { Project, ProjectListItem, ProjectStatus } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

const NAME_MAX = 50;

type FormState = Pick<
  Project,
  "name" | "color" | "status" | "startDate" | "endDate" | "description" | "tags"
>;

const STATUS_ORDER: ProjectStatus[] = ["PLANNED", "IN_PROGRESS", "ON_HOLD", "DONE"];

const toForm = (project: Project): FormState => ({
  name: project.name,
  color: project.color,
  status: project.status,
  startDate: project.startDate,
  endDate: project.endDate,
  description: project.description,
  tags: [...project.tags],
});

type ProjectEditDrawerProps = {
  project: ProjectListItem;
  /** 기간을 줄일 때 같이 옮길 목표 · 태스크를 찾는다 (DOC1 날짜 범위) */
  goals: Goal[];
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
  /** 삭제 확인 뒤 (상세에서 목록으로 옮긴다) */
  onDelete: () => void;
};

/**
 * 프로젝트 수정 드로어 (보드 03-a ~ 03-d · 프로토타입 projectForm · REBUILD 5-3).
 * 머리는 「프로젝트 수정」만(REBUILD 6) → 이름 *(넘치면 높이가 늘어남 · 50자) · 색상 · 상태(4칸 + 안내) · 시작일 | 마감일(지났으면 「N일 지났어요」) ·
 * 설명 · 태그 → 구분선 + 삭제. [취소][저장], 바꾼 것이 없으면 [저장]은 못 누른다. ⌘/Ctrl+Enter로도 저장.
 * 바꾼 채로 닫으면 「저장하지 않고 닫을까요?」. 상태를 고르면 그 상태로 고정(`isStatusManual`).
 */
export default function ProjectEditDrawer({
  project,
  goals,
  tasks,
  isOpen,
  onClose,
  onDelete,
}: ProjectEditDrawerProps) {
  const toast = useToast();
  const nameId = useId();
  const descriptionId = useId();
  const colorLabelId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [initial, setInitial] = useState<FormState>(() => toForm(project));
  const [form, setForm] = useState<FormState>(initial);
  const [statusTouched, setStatusTouched] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [confirm, setConfirm] = useState<"discard" | "delete" | null>(null);
  const [openedFor, setOpenedFor] = useState(isOpen);
  const { updateProjectAsync, isUpdating } = useProjectMutations();
  const { updateGoalAsync } = useGoalMutations();
  const { updateTaskMutation } = useTaskMutations(project.id);
  const today = toDateKey(new Date());
  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);
  const [moveAlong, setMoveAlong] = useState(true);
  // 시작을 늦추거나 마감을 당기면 벗어나는 목표 · 태스크를 같이 옮겨야 저장할 수 있다 (DOC1 날짜 범위)
  const shiftRange = {
    start: form.startDate && form.startDate > initial.startDate ? form.startDate : "",
    end: form.endDate && initial.endDate && form.endDate < initial.endDate ? form.endDate : "",
  };
  const shiftItems =
    shiftRange.start || shiftRange.end ? getShiftItems(goals, tasks, shiftRange) : [];
  const shiftReason =
    shiftRange.start && shiftRange.end ? "both" : shiftRange.start ? "start" : "end";
  const isShiftBlocked = shiftItems.length > 0 && !moveAlong;

  // 열 때마다 지금 프로젝트 값으로 다시 채운다
  if (isOpen !== openedFor) {
    setOpenedFor(isOpen);
    if (isOpen) {
      const next = toForm(project);
      setInitial(next);
      setForm(next);
      setStatusTouched(false);
      setShowNameError(false);
      setMoveAlong(true);
    }
  }

  const update = (next: Partial<FormState>) => setForm((current) => ({ ...current, ...next }));
  const requestClose = () => (isDirty ? setConfirm("discard") : onClose());
  const lateDays =
    form.endDate && form.endDate < today && form.status !== "DONE"
      ? getDayDelta(form.endDate, today)
      : null;

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const name = form.name.trim();

    if (!name) {
      setShowNameError(true);
      return;
    }

    if (!isDirty || isShiftBlocked) {
      return;
    }

    try {
      await updateProjectAsync({
        project: {
          ...project,
          ...form,
          name,
          description: form.description.trim(),
          isStatusManual: project.isStatusManual || statusTouched,
          completedAt:
            form.status === "DONE" ? (project.completedAt ?? today) : project.completedAt,
        },
      });
      if (shiftItems.length) {
        await recordShiftedItems(
          project.id,
          shiftItems.map((item) => ({
            target: item.kind,
            id: item.kind === "task" ? item.task.id : item.goal.id,
            field: item.field,
            name: item.name,
            from: item.from,
            to: item.to,
          })),
        );
        await Promise.all([
          ...mergeGoalShifts(shiftItems).map((goal) =>
            updateGoalAsync({ ...goal, teamId: project.teamId }),
          ),
          ...shiftItems.flatMap((item) =>
            item.kind === "task"
              ? [updateTaskMutation.mutateAsync({ ...item.task, dueDate: item.to })]
              : [],
          ),
        ]);
      }
      toast(TOAST_TEXT.saved);
      onClose();
    } catch {
      toast(TOAST_TEXT.saveFailed, { retry: () => void submit() });
    }
  };

  const wrap = (children: ReactNode) => (
    <form
      noValidate
      onSubmit={submit}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          void submit();
        }
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      {children}
    </form>
  );

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={requestClose}
        title="프로젝트 수정"
        panelRef={panelRef}
        wrap={wrap}
        footer={
          <>
            <Button onClick={requestClose} disabled={isUpdating}>
              {BUTTON_LABEL.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isUpdating || !isDirty || !form.name.trim() || isShiftBlocked}
            >
              {BUTTON_LABEL.save}
            </Button>
          </>
        }
      >
        <Field
          label="이름"
          htmlFor={nameId}
          required
          error={showNameError ? "이름을 입력해 주세요." : undefined}
        >
          <GrowingInput
            id={nameId}
            value={form.name}
            maxLength={NAME_MAX}
            placeholder="프로젝트 이름 입력"
            invalid={showNameError}
            aria-required="true"
            onChange={(event) => {
              update({ name: event.target.value });
              setShowNameError(false);
            }}
          />
        </Field>
        <Field label="색상" labelId={colorLabelId}>
          <ColorSwatches
            value={form.color}
            onChange={(color) => update({ color })}
            labelledBy={colorLabelId}
          />
        </Field>
        <Field
          label="상태"
          help="태스크 진행 상황에 따라 자동으로 변경돼요. 직접 선택하면 그 상태로 유지돼요."
        >
          <Segmented
            label="상태"
            fill
            value={form.status}
            onChange={(status) => {
              update({ status });
              setStatusTouched(true);
            }}
            items={STATUS_ORDER.map((status) => ({
              value: status,
              label: (
                <>
                  <span
                    aria-hidden
                    className={cn(
                      "mr-0.5 size-1.5 rounded-full",
                      badgeDotClassName[PROJECT_STATUS_TONE[status]],
                    )}
                  />
                  {getProjectStatusLabel(status)}
                </>
              ),
            }))}
          />
        </Field>
        <div className="grid grid-cols-2 items-start gap-3">
          <Field label="시작일">
            <DateField
              label="시작일"
              value={form.startDate}
              // 지난 날은 고를 수 없다. 이미 지난 시작일은 그대로 둘 수 있다 (REBUILD 5-3)
              min={initial.startDate && initial.startDate < today ? initial.startDate : today}
              onChange={(startDate) =>
                update({
                  startDate,
                  endDate:
                    form.endDate && startDate && form.endDate < startDate ? "" : form.endDate,
                })
              }
            />
          </Field>
          <Field label="마감일">
            <DateField
              label="마감일"
              value={form.endDate}
              min={form.startDate || undefined}
              onChange={(endDate) => update({ endDate })}
            />
            {lateDays != null ? (
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-[var(--bad)]">
                <CircleAlert size={12} aria-hidden />
                {lateDays}일 지났어요
              </span>
            ) : null}
          </Field>
        </div>
        <ShiftNotice
          items={shiftItems}
          reason={shiftReason}
          checked={moveAlong}
          onChange={setMoveAlong}
        />
        <Field label="설명" htmlFor={descriptionId}>
          <TextArea
            id={descriptionId}
            value={form.description}
            maxLength={500}
            placeholder="설명 입력"
            onChange={(event) => update({ description: event.target.value })}
          />
        </Field>
        <TagField tags={form.tags} onChange={(tags) => update({ tags })} />
        <div className="border-t border-[var(--divider)] pt-2">
          <button
            type="button"
            onClick={() => setConfirm("delete")}
            className="kit-focus inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-[var(--radius-xs)] text-sm text-[var(--bad)]"
          >
            <Trash2 size={16} aria-hidden />
            {BUTTON_LABEL.delete}
          </button>
        </div>
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
        target="프로젝트"
        isOpen={confirm === "delete"}
        withinRef={panelRef}
        onClose={() => setConfirm(null)}
        onConfirm={() => {
          setConfirm(null);
          onDelete();
        }}
      />
    </>
  );
}
