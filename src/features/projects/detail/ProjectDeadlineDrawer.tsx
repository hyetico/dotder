"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import Checkbox from "@/components/kit/Checkbox";
import { DiscardConfirmDialog } from "@/components/kit/ConfirmDialog";
import DateField from "@/components/kit/DateField";
import Drawer from "@/components/kit/Drawer";
import Field from "@/components/kit/Field";
import { TextArea } from "@/components/kit/TextInput";
import { useToast } from "@/components/kit/Toast";

import { BUTTON_LABEL, TOAST_TEXT } from "@/content/ui";
import { useGoalMutations } from "@/features/goals/hooks/useGoalMutations";
import { formatMonthDot } from "@/features/projects/detail/projectOverviewModel";
import { useProjectMutations } from "@/features/projects/hooks/useProjectMutations";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";

import { getDayDelta } from "@/lib/date";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Goal } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

type MoveItem =
  | { kind: "goal"; key: string; name: string; due: string; goal: Goal }
  | { kind: "task"; key: string; name: string; due: string; task: Task };

type ProjectDeadlineDrawerProps = {
  project: Project;
  goals: Goal[];
  tasks: Task[];
  isOpen: boolean;
  onClose: () => void;
};

/**
 * 마감일 변경 드로어 (보드 03-g · 프로토타입 dueChange). 「마감일 변경」 + 아래 프로젝트 이름.
 * 지금 마감일(못 바꿈) | 새 마감일 *(「N일 늦어져요 · 당겨져요」) → 같이 옮길 항목(끝나지 않은 목표 · 태스크,
 * 목표는 처음부터 고름 · 「모두 선택」) → 바꾸는 이유 *(「기록 탭에 남아요」). 새 마감일과 이유가 있어야 [저장].
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
  const items: MoveItem[] = [
    ...goals
      .filter((goal) => goal.status !== "COMPLETED")
      .map((goal) => ({
        kind: "goal" as const,
        key: `g${goal.id}`,
        name: goal.title,
        due: goal.endDate,
        goal,
      })),
    ...tasks
      .filter((task) => task.status !== "DONE")
      .map((task) => ({
        kind: "task" as const,
        key: `t${task.id}`,
        name: task.title,
        due: task.dueDate,
        task,
      })),
  ];
  const defaultPicked = () =>
    new Set(items.filter((item) => item.kind === "goal").map((item) => item.key));
  const [nextDate, setNextDate] = useState("");
  const [reason, setReason] = useState("");
  const [picked, setPicked] = useState<Set<string>>(defaultPicked);
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
      setPicked(defaultPicked());
    }
  }

  const isDirty = Boolean(nextDate || reason.trim());
  const canSave = Boolean(nextDate && reason.trim()) && nextDate !== project.endDate;
  const diff = nextDate && project.endDate ? getDayDelta(project.endDate, nextDate) : 0;
  const requestClose = () => (isDirty ? setIsConfirmOpen(true) : onClose());

  const toggle = (key: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });

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
      await Promise.all(
        items
          .filter((item) => picked.has(item.key))
          .map((item) =>
            item.kind === "goal"
              ? updateGoalAsync({ ...item.goal, teamId: project.teamId, endDate: nextDate })
              : updateTaskMutation.mutateAsync({ ...item.task, dueDate: nextDate }),
          ),
      );
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

        {items.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <strong className="text-sm">같이 옮길 항목</strong>
              <span className="text-xs text-[var(--t3)]">
                {items.length}개 중 {picked.size}개
              </span>
              <span className="flex-1" />
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setPicked(new Set(items.map((item) => item.key)))}
              >
                모두 선택
              </Button>
            </div>
            <ul className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-1">
              {items.map((item, index) => {
                const isPicked = picked.has(item.key);
                return (
                  <li
                    key={item.key}
                    className={
                      index > 0
                        ? "flex min-h-10 items-center gap-2.5 border-t border-[var(--divider)] text-sm"
                        : "flex min-h-10 items-center gap-2.5 text-sm"
                    }
                  >
                    <Checkbox
                      checked={isPicked}
                      onChange={() => toggle(item.key)}
                      label={`‘${item.name}’ 같이 옮기기`}
                    />
                    <span className="flex min-w-0 flex-1 flex-col py-1.5">
                      <span className="truncate">{item.name}</span>
                      <span className="text-xs text-[var(--t3)]">
                        {item.kind === "goal" ? "목표" : "태스크"}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-[var(--t3)]">
                      {isPicked && nextDate
                        ? `${formatMonthDot(item.due) || "—"} → ${formatMonthDot(nextDate)}`
                        : `${formatMonthDot(item.due) || "—"} 그대로`}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="text-xs text-[var(--t3)]">선택한 목표·태스크의 마감일도 함께 변경돼요.</p>
          </div>
        ) : null}

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
