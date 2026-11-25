"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import { DiscardConfirmDialog } from "@/components/kit/ConfirmDialog";
import DateField from "@/components/kit/DateField";
import Drawer from "@/components/kit/Drawer";
import Field from "@/components/kit/Field";
import Segmented from "@/components/kit/Segmented";
import { TextArea, TextInput } from "@/components/kit/TextInput";
import { useToast } from "@/components/kit/Toast";
import { ChevronDown } from "@/components/ui/icon";

import { BUTTON_LABEL, TOAST_TEXT } from "@/content/ui";
import GoalPicker from "@/features/goals/pick/GoalPicker";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";
import {
  TASK_PRIORITY_LABEL,
  TASK_PRIORITY_ORDER,
  TASK_STATUS_LABEL,
  TASK_STATUS_ORDER,
} from "@/features/tasks/taskModel";

import { cn } from "@/lib/cn";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Goal } from "@/features/goals/types/goal";
import type { Task, TaskPriority, TaskStatus } from "@/features/tasks/types/task";

type FormState = {
  title: string;
  status: TaskStatus;
  goalId: number | null;
  dueDate: string;
  priority: TaskPriority;
  description: string;
};

type TaskAddDrawerProps = {
  projectId: number;
  goals: Goal[];
  /** 열 때 미리 고른 값 (칸의 + · 캘린더 「이 날 추가」) */
  preset: { status?: TaskStatus; dueDate?: string } | null;
  onClose: () => void;
  /** 지금 목록 수 (순서 값) */
  count: number;
};

// 새 태스크 id (옛 화면 CreateTaskButton과 같은 방식, 목업 저장)
const createTaskId = () => Date.now();

/**
 * 태스크 추가 드로어 (보드 05-a · 프로토타입 taskForm). 이름 * → 상태 3칸 → 목표 | 마감일 →
 * 「추가 설정 · 우선순위, 설명」. 이름 칸 Enter는 「추가하고 하나 더」, [만들기]는 추가하고 닫는다.
 */
export default function TaskAddDrawer({
  projectId,
  goals,
  preset,
  onClose,
  count,
}: TaskAddDrawerProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const nameId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const isOpen = preset != null;
  const initial = (): FormState => ({
    title: "",
    status: preset?.status ?? "TODO",
    goalId: null,
    dueDate: preset?.dueDate ?? "",
    priority: "MEDIUM",
    description: "",
  });
  const [form, setForm] = useState<FormState>(initial);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(preset);
  const { createTaskMutation } = useTaskMutations(projectId);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initial());

  if (preset !== openedFor) {
    setOpenedFor(preset);
    if (preset) {
      setForm(initial());
      setIsMoreOpen(false);
    }
  }

  const update = (next: Partial<FormState>) => setForm((current) => ({ ...current, ...next }));
  const requestClose = () => (isDirty ? setIsConfirmOpen(true) : onClose());

  const add = async (again: boolean) => {
    const title = form.title.trim();

    if (!title) {
      return;
    }

    const task: Task = {
      id: createTaskId(),
      projectId,
      goalId: form.goalId ?? undefined,
      title,
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate,
      createdBy: 0,
      order: count,
    };

    try {
      await createTaskMutation.mutateAsync(task);
      await queryClient.invalidateQueries({ queryKey: projectQueryKeys.all });
      toast(TOAST_TEXT.saved);
      if (again) {
        update({ title: "" });
        nameRef.current?.focus();
      } else {
        onClose();
      }
    } catch (error) {
      toast(error instanceof Error && error.message ? error.message : TOAST_TEXT.saveFailed, {
        retry: () => void add(again),
      });
    }
  };

  const wrap = (children: ReactNode) => (
    <form
      noValidate
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        void add(false);
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
        title="태스크 추가"
        panelRef={panelRef}
        wrap={wrap}
        footerNote="Enter로 추가하고 하나 더"
        footer={
          <>
            <Button onClick={requestClose} disabled={createTaskMutation.isPending}>
              {BUTTON_LABEL.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={createTaskMutation.isPending || !form.title.trim()}
            >
              {BUTTON_LABEL.create}
            </Button>
          </>
        }
      >
        <Field label="이름" htmlFor={nameId} required>
          <TextInput
            id={nameId}
            ref={nameRef}
            value={form.title}
            maxLength={100}
            placeholder="태스크 이름 입력"
            aria-required="true"
            onChange={(event) => update({ title: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                event.preventDefault();
                void add(true);
              }
            }}
          />
        </Field>
        <Field label="상태">
          <Segmented
            label="상태"
            value={form.status}
            onChange={(status) => update({ status })}
            items={TASK_STATUS_ORDER.map((status) => ({
              value: status,
              label: TASK_STATUS_LABEL[status],
            }))}
            className="self-start"
          />
        </Field>
        <div className="grid grid-cols-2 items-start gap-4">
          <Field label="목표">
            <GoalPicker
              goals={goals}
              value={form.goalId}
              onChange={(goalId) => update({ goalId })}
            />
          </Field>
          <Field label="마감일">
            <DateField
              label="마감일"
              value={form.dueDate}
              onChange={(dueDate) => update({ dueDate })}
            />
          </Field>
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={isMoreOpen}
          onClick={() => setIsMoreOpen((open) => !open)}
          className="-ml-2 self-start"
        >
          {/* 펼쳐도 버튼은 남고 화살표만 위로 (REBUILD 6) */}
          <ChevronDown
            size={16}
            aria-hidden
            className={cn("transition-transform duration-150", isMoreOpen && "rotate-180")}
          />
          추가 설정
          <span className="font-normal text-[var(--t3)]">· 우선순위, 설명</span>
        </Button>
        {isMoreOpen ? (
          <>
            <Field label="우선순위">
              <Segmented
                label="우선순위"
                value={form.priority}
                onChange={(priority) => update({ priority })}
                items={TASK_PRIORITY_ORDER.map((priority) => ({
                  value: priority,
                  label: TASK_PRIORITY_LABEL[priority],
                }))}
                className="self-start"
              />
            </Field>
            <Field label="설명" htmlFor={descriptionId}>
              <TextArea
                id={descriptionId}
                value={form.description}
                maxLength={500}
                placeholder="설명 입력"
                onChange={(event) => update({ description: event.target.value })}
              />
            </Field>
          </>
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
