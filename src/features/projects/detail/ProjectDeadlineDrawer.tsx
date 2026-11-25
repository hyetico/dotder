"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import { DiscardConfirmDialog } from "@/components/kit/ConfirmDialog";
import DateField from "@/components/kit/DateField";
import Drawer from "@/components/kit/Drawer";
import Field from "@/components/kit/Field";
import { TextArea } from "@/components/kit/TextInput";
import { useToast } from "@/components/kit/Toast";

import { BUTTON_LABEL, TOAST_TEXT } from "@/content/ui";
import { useGoalMutations } from "@/features/goals/hooks/useGoalMutations";
import { recordShiftedItems } from "@/features/projects/api/projects";
import {
  getShiftItems,
  mergeGoalShifts,
  ShiftNotice,
} from "@/features/projects/detail/projectShift";
import { useProjectMutations } from "@/features/projects/hooks/useProjectMutations";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";

import { getDayDelta } from "@/lib/date";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Goal } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

type ProjectDeadlineDrawerProps = {
  project: Project;
  goals: Goal[];
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
};

/**
 * 마감일 변경 드로어 (보드 03-g · 프로토타입 dueChange). 「마감일 변경」 + 아래 프로젝트 이름.
 * 지금 마감일(못 바꿈) | 새 마감일 *(「N일 늦어져요 · 당겨져요」) → 당길 때만 새 마감보다 늦은 목표 · 태스크 목록 +
 * 「새 마감으로 같이 옮기기」(기본 켬 · 끄면 저장 불가 · DOC1 날짜 범위) → 바꾸는 이유 *(「기록 탭에 남아요」).
 * 새 마감일과 이유가 있어야 [저장]. 옮긴 날짜는 기록에 남는다.
 */
export default function ProjectDeadlineDrawer({
  project,
  goals,
  tasks,
  isOpen,
  onClose,
}: ProjectDeadlineDrawerProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const reasonId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [nextDate, setNextDate] = useState("");
  const [reason, setReason] = useState("");
  const [moveAlong, setMoveAlong] = useState(true);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(isOpen);
  const { updateProjectAsync, isUpdating } = useProjectMutations();
  const { updateGoalAsync } = useGoalMutations();
  const { updateTaskMutation } = useTaskMutations(project.id);

  if (isOpen !== openedFor) {
    setOpenedFor(isOpen);
    if (isOpen) {
      setNextDate("");
      setReason("");
      setMoveAlong(true);
    }
  }

  // 마감을 당기면 새 마감보다 늦은 목표 · 태스크를 같이 옮겨야 저장할 수 있다 (DOC1 날짜 범위)
  const shiftItems = nextDate ? getShiftItems(goals, tasks, { start: "", end: nextDate }) : [];
  const isDirty = Boolean(nextDate || reason.trim());
  const canSave =
    Boolean(nextDate && reason.trim()) &&
    nextDate !== project.endDate &&
    (shiftItems.length === 0 || moveAlong);
  const diff = nextDate && project.endDate ? getDayDelta(project.endDate, nextDate) : 0;
  const requestClose = () => (isDirty ? setIsConfirmOpen(true) : onClose());

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();

    if (!canSave) {
      return;
    }

    try {
      await updateProjectAsync({
        project: { ...project, endDate: nextDate },
        deadlineChangeReason: reason.trim(),
      });
      if (shiftItems.length) {
        await recordShiftedItems(
          project.id,
          shiftItems.map((item) => ({
            target: item.kind,
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
      await queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
      toast(TOAST_TEXT.deadlineChanged);
      onClose();
    } catch (error) {
      toast(error instanceof Error && error.message ? error.message : TOAST_TEXT.saveFailed, {
        retry: () => void submit(),
      });
    }
  };

  const wrap = (children: ReactNode) => (
    <form noValidate onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
      {children}
    </form>
  );

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={requestClose}
        title="마감일 변경"
        subtitle={project.name}
        panelRef={panelRef}
        wrap={wrap}
        footer={
          <>
            <Button onClick={requestClose} disabled={isUpdating}>
              {BUTTON_LABEL.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isUpdating || !canSave}>
              {BUTTON_LABEL.save}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 items-start gap-4">
          <Field label="지금 마감일">
            <DateField label="지금 마감일" value={project.endDate} onChange={() => {}} disabled />
          </Field>
          <Field
            label="새 마감일"
            required
            help={diff > 0 ? `${diff}일 늦어져요` : diff < 0 ? `${-diff}일 당겨져요` : undefined}
          >
            <DateField
              label="새 마감일"
              value={nextDate}
              min={project.startDate || undefined}
              onChange={setNextDate}
            />
          </Field>
        </div>

        <ShiftNotice items={shiftItems} reason="end" checked={moveAlong} onChange={setMoveAlong} />

        <Field label="바꾸는 이유" htmlFor={reasonId} required help="기록 탭에 남아요">
          <TextArea
            id={reasonId}
            value={reason}
            maxLength={200}
            placeholder="변경 사유 입력"
            minSize="md"
            onChange={(event) => setReason(event.target.value)}
          />
        </Field>
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
