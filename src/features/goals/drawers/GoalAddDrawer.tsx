"use client";

import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";

import Button from "@/components/ui/Button";
import { DiscardConfirmDialog } from "@/components/ui/ConfirmDialog";
import DateField from "@/components/ui/DateField";
import Drawer from "@/components/ui/Drawer";
import Field from "@/components/ui/Field";
import { ChevronDown } from "@/components/ui/icon";
import TagPicker from "@/components/ui/TagPicker";
import { TextArea, TextInput } from "@/components/ui/TextInput";
import { useToast } from "@/components/ui/Toast";

import { BUTTON_LABEL, GOAL_TAG_TEXT, TOAST_TEXT } from "@/content/ui";
import { useGoalMutations } from "@/features/goals/hooks/useGoalMutations";
import { getProjects } from "@/features/projects/api/projects";
import ProjectPicker from "@/features/projects/pick/ProjectPicker";

import { cn } from "@/lib/cn";
import { toDateKey } from "@/lib/date";
import { projectQueryKeys } from "@/lib/queryKeys";

type FormState = {
  name: string;
  projectId: number | null;
  tags: string[];
  startDate: string;
  endDate: string;
  description: string;
};

type GoalAddDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  /** 처음 고른 프로젝트 (상세 목표 탭이면 그 프로젝트) */
  projectId: number | null;
};

/**
 * 목표 추가 드로어 (보드 04-a · 프로토타입 goalForm). 이름 * → 프로젝트 → 태그(프로젝트 태그 중 2개까지) →
 * 「추가 설정 · 기간, 설명」. [취소][만들기], 이름이 비면 [만들기]는 못 누른다. 바꾼 채로 닫으면 확인창.
 */
export default function GoalAddDrawer({ isOpen, onClose, projectId }: GoalAddDrawerProps) {
  const toast = useToast();
  const nameId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const initial = (): FormState => ({
    name: "",
    projectId,
    tags: [],
    startDate: "",
    endDate: "",
    description: "",
  });
  const [form, setForm] = useState<FormState>(initial);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(isOpen);
  const { addGoalAsync, isAdding } = useGoalMutations();
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
  const project = projects.find((item) => item.id === form.projectId) ?? null;
  const today = toDateKey(new Date());
  const isDirty = JSON.stringify(form) !== JSON.stringify(initial());

  if (isOpen !== openedFor) {
    setOpenedFor(isOpen);
    if (isOpen) {
      setForm(initial());
      setIsMoreOpen(false);
    }
  }

  const update = (next: Partial<FormState>) => setForm((current) => ({ ...current, ...next }));
  const requestClose = () => (isDirty ? setIsConfirmOpen(true) : onClose());

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const name = form.name.trim();

    if (!name) {
      return;
    }

    try {
      await addGoalAsync({
        projectId: form.projectId,
        teamId: project?.teamId ?? null,
        title: name,
        description: form.description.trim(),
        status: "NOT_STARTED",
        color: project?.color ?? null,
        icon: "layout",
        tags: form.tags,
        startDate: form.startDate,
        endDate: form.endDate,
      });
      toast(TOAST_TEXT.saved);
      onClose();
    } catch (error) {
      toast(error instanceof Error && error.message ? error.message : TOAST_TEXT.saveFailed, {
        retry: () => void submit(),
      });
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
        title="목표 추가"
        panelRef={panelRef}
        wrap={wrap}
        footer={
          <>
            <Button onClick={requestClose} disabled={isAdding}>
              {BUTTON_LABEL.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isAdding || !form.name.trim()}>
              {BUTTON_LABEL.create}
            </Button>
          </>
        }
      >
        <Field label="이름" htmlFor={nameId} required>
          <TextInput
            id={nameId}
            value={form.name}
            maxLength={50}
            placeholder="목표 이름 입력"
            aria-required="true"
            onChange={(event) => update({ name: event.target.value })}
          />
        </Field>
        <Field label="프로젝트">
          <ProjectPicker
            value={form.projectId}
            onChange={(next) => update({ projectId: next, tags: [] })}
          />
        </Field>
        <TagPicker
          options={project?.tags ?? []}
          value={form.tags}
          onChange={(tags) => update({ tags })}
          emptyText={project ? GOAL_TAG_TEXT.noTags : GOAL_TAG_TEXT.noProject}
        />
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
          <span className="font-normal text-[var(--t3)]">· 기간, 설명</span>
        </Button>
        {isMoreOpen ? (
          <>
            <div className="grid grid-cols-2 items-start gap-3">
              <Field label="시작일">
                <DateField
                  label="시작일"
                  value={form.startDate}
                  // 목표 시작은 프로젝트 시작 ~ 목표 마감 사이 · 새로 만들 때는 오늘부터 (REBUILD 6 날짜 범위)
                  min={[today, project?.startDate ?? ""].sort().at(-1)}
                  max={form.endDate || project?.endDate || undefined}
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
                  min={form.startDate || today}
                  // 목표 마감은 프로젝트 마감을 넘지 않는다 (REBUILD 6 날짜 범위)
                  max={project?.endDate || undefined}
                  onChange={(endDate) => update({ endDate })}
                />
              </Field>
            </div>
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
