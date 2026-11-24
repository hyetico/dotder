"use client";

import { useEffect, useId, useRef, useState, type RefObject } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import Drawer from "@/components/ui/drawer/Drawer";
import FieldNotice from "@/components/ui/FieldNotice";
import FormField from "@/components/ui/form/FormField";
import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/input/Textarea";
import AlertModal from "@/components/ui/modal/AlertModal";
import Select from "@/components/ui/select/Select";

import { createGoal } from "@/features/goals/api/goals";
import { getTodayDateValue } from "@/features/goals/utils/goalDates";
import { registerMemo } from "@/features/memos/api/memos";
import { createTask, getTasks } from "@/features/tasks/api/tasks";

import { useDrawerPresence } from "@/hooks/useDrawerPresence";
import { currentUser } from "@/lib/mock/users";
import { DEFAULT_PROJECT_COLOR } from "@/lib/projectPalette";
import { goalQueryKeys, memoQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

import type { Memo, MemoRegistrationKind } from "@/features/memos/types/memo";
import type { Project } from "@/features/projects/types/project";

const choiceRowClassName = "flex gap-2";
const choiceButtonClassName =
  "flex h-10 flex-1 items-center justify-center rounded-[var(--radius-sm)] border text-sm font-medium transition-colors";
const choiceOnClassName =
  "border-[var(--color-primary)] bg-[var(--color-primary-soft)] text-[var(--color-primary)]";
const choiceOffClassName =
  "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-hover-soft)]";

type MemoRegisterDrawerProps = {
  memo: Memo | null;
  isOpen: boolean;
  projects: Project[];
  onClose: () => void;
};

/**
 * shiftDate
 *
 * 날짜 문자열에 일수를 더합니다.
 *
 * @param value - 시작 날짜. YYYY-MM-DD
 * @param days - 더할 일수
 * @returns 더한 날짜. YYYY-MM-DD
 */
function shiftDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00`);

  date.setDate(date.getDate() + days);

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * MemoRegisterForm
 *
 * 메모를 목표나 태스크로 등록하는 입력입니다.
 * 등록이 끝나도 메모 원문은 바꾸지 않습니다.
 *
 * @param props - MemoRegisterForm 컴포넌트 Props
 * @param props.memo - 등록할 메모
 * @param props.projects - 연결할 수 있는 프로젝트
 * @param props.onClose - 등록을 마치거나 취소할 때 실행되는 함수
 */
function MemoRegisterForm({
  memo,
  projects,
  onClose,
  closeRequestRef,
}: {
  memo: Memo;
  projects: Project[];
  onClose: () => void;
  /** 드로어의 X · Esc · 오버레이가 부를 닫기 요청. 바꾼 내용이 있으면 확인창을 띄운다. */
  closeRequestRef: RefObject<() => void>;
}) {
  const titleId = useId();
  const queryClient = useQueryClient();
  const selectableProjects = projects.filter((project) => project.status !== "ON_HOLD");
  const initialProjectId = selectableProjects.some((project) => project.id === memo.projectId)
    ? memo.projectId
    : null;
  const [kind, setKind] = useState<MemoRegistrationKind>("task");
  const [projectId, setProjectId] = useState<number | null>(initialProjectId);
  const [title, setTitle] = useState(memo.title);
  const [body, setBody] = useState(memo.body);
  const [error, setError] = useState("");
  const [titleError, setTitleError] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const isDirty =
    kind !== "task" || projectId !== initialProjectId || title !== memo.title || body !== memo.body;

  const requestClose = () => {
    if (isDirty) {
      setIsConfirmOpen(true);
      return;
    }

    onClose();
  };

  useEffect(() => {
    closeRequestRef.current = requestClose;
  });
  const projectOptions = [
    { value: "none", label: kind === "task" ? "프로젝트 선택" : "프로젝트 없음" },
    ...selectableProjects.map((project) => ({
      value: String(project.id),
      label: project.name,
    })),
  ];

  const register = useMutation({
    mutationFn: async () => {
      const trimmedTitle = title.trim();

      if (kind === "task" && projectId == null) {
        throw new Error("태스크를 등록할 프로젝트를 선택하세요.");
      }

      const project = selectableProjects.find((item) => item.id === projectId) ?? null;
      const today = getTodayDateValue();
      const projectEnd = project?.endDate ?? "";
      const endDate = projectEnd >= today ? projectEnd : shiftDate(today, 30);

      if (kind === "goal") {
        const goal = await createGoal({
          projectId,
          title: trimmedTitle,
          description: body.trim(),
          status: "NOT_STARTED",
          color: project?.color ?? DEFAULT_PROJECT_COLOR,
          icon: "layout",
          tags: [],
          startDate: today,
          endDate,
          teamId: project?.teamId ?? null,
        });

        return registerMemo(memo.id, {
          kind: "goal",
          targetId: goal.id,
          projectId,
        });
      }

      const tasks = await getTasks("all");
      const nextId = tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;

      const task = await createTask({
        id: nextId,
        projectId: projectId ?? 0,
        title: trimmedTitle,
        description: body.trim(),
        status: "TODO",
        priority: "MEDIUM",
        dueDate: today,
        createdBy: currentUser.id,
        order: 0,
      });

      return registerMemo(memo.id, {
        kind: "task",
        targetId: task.id,
        projectId,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: memoQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: goalQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: taskQueryKeys.all }),
      ]);
      onClose();
    },
    onError: (registerError: Error) => {
      setError(registerError.message || "등록하지 못했습니다. 메모는 그대로 둡니다.");
    },
  });

  return (
    <>
      <Drawer.Body>
        <p className="text-caption text-[var(--color-text-secondary)]">
          등록한 목표와 태스크는 이 메모와 따로 관리됩니다. 취소하면 메모는 그대로 남습니다.
        </p>
        <FormField label="등록 대상">
          <div className={choiceRowClassName}>
            <button
              type="button"
              className={`${choiceButtonClassName} ${kind === "task" ? choiceOnClassName : choiceOffClassName}`}
              aria-pressed={kind === "task"}
              onClick={() => {
                setKind("task");
                setError("");
              }}
            >
              태스크
            </button>
            <button
              type="button"
              className={`${choiceButtonClassName} ${kind === "goal" ? choiceOnClassName : choiceOffClassName}`}
              aria-pressed={kind === "goal"}
              onClick={() => {
                setKind("goal");
                setError("");
              }}
            >
              목표
            </button>
          </div>
        </FormField>
        <FormField label="프로젝트">
          <Select
            value={projectId == null ? "none" : String(projectId)}
            options={projectOptions}
            onChange={(value) => {
              setProjectId(value === "none" ? null : Number(value));
              setError("");
            }}
          />
        </FormField>
        <FormField label="이름" htmlFor={`${titleId}-title`} required error={titleError}>
          <Input
            id={`${titleId}-title`}
            value={title}
            aria-required="true"
            aria-invalid={titleError ? true : undefined}
            onChange={(event) => {
              setTitle(event.target.value);
              setTitleError("");
              setError("");
            }}
          />
        </FormField>
        <FormField label="설명" htmlFor={`${titleId}-body`}>
          <Textarea
            id={`${titleId}-body`}
            value={body}
            rows={5}
            onChange={(event) => {
              setBody(event.target.value);
              setError("");
            }}
          />
        </FormField>
        {error ? <FieldNotice tone="danger">{error}</FieldNotice> : null}
      </Drawer.Body>
      <Drawer.Footer>
        <SecondaryButton onClick={requestClose} disabled={register.isPending}>
          취소
        </SecondaryButton>
        <PrimaryButton
          onClick={() => {
            // 이름은 칸 아래에 오류를 보인다 (design-guide 7-3)
            if (!title.trim()) {
              setTitleError("이름을 입력하세요.");
              return;
            }

            register.mutate();
          }}
          disabled={register.isPending}
        >
          등록
        </PrimaryButton>
      </Drawer.Footer>

      <AlertModal
        isOpen={isConfirmOpen}
        title="수정을 취소할까요?"
        confirmLabel="취소하기"
        cancelLabel="계속 수정"
        tone="danger"
        onConfirm={() => {
          setIsConfirmOpen(false);
          onClose();
        }}
        onClose={() => setIsConfirmOpen(false)}
      />
    </>
  );
}

/**
 * MemoRegisterDrawer
 *
 * 메모를 목표나 태스크로 등록하는 오른쪽 드로어입니다.
 * 등록에 성공하면 메모는 기본 목록에서 숨깁니다.
 *
 * @param props - MemoRegisterDrawer 컴포넌트 Props
 * @param props.memo - 등록할 메모. 닫혀 있으면 null
 * @param props.isOpen - 드로어를 열지 여부
 * @param props.projects - 연결할 수 있는 프로젝트
 * @param props.onClose - 드로어를 닫을 때 실행되는 함수
 */
export default function MemoRegisterDrawer({
  memo,
  isOpen,
  projects,
  onClose,
}: MemoRegisterDrawerProps) {
  const titleId = useId();
  const { isPresent, isEntered } = useDrawerPresence(isOpen);
  const [activeMemo, setActiveMemo] = useState(memo);
  const closeRequestRef = useRef<() => void>(onClose);

  if (memo && memo.id !== activeMemo?.id) {
    setActiveMemo(memo);
  }

  if (!isPresent || !activeMemo) {
    return null;
  }

  return (
    <Drawer
      isEntered={isEntered}
      title="메모 등록"
      titleId={titleId}
      onClose={() => closeRequestRef.current()}
    >
      <MemoRegisterForm
        key={activeMemo.id}
        memo={activeMemo}
        projects={projects}
        onClose={onClose}
        closeRequestRef={closeRequestRef}
      />
    </Drawer>
  );
}
