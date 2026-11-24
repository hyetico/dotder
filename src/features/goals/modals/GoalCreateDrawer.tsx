"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import Drawer from "@/components/ui/drawer/Drawer";
import FormField from "@/components/ui/form/FormField";
import { AppIcon, ChevronDown, Link2 } from "@/components/ui/icon";
import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/input/Textarea";
import AlertModal, { useAlert } from "@/components/ui/modal/AlertModal";

import { createGoal } from "@/features/goals/api/goals";
import GoalTag from "@/features/goals/components/GoalTag";
import {
  useGoalDrawerOffset,
  useGoalDrawerPushesPage,
} from "@/features/goals/modals/goalDrawerOffset";
import { getTodayDateValue } from "@/features/goals/utils/goalDates";
import ProjectPickField from "@/features/projects/components/ProjectPickField";

import { formatDate } from "@/lib/date";
import { goalQueryKeys } from "@/lib/queryKeys";

import type { GoalIcon } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";

const GOAL_TITLE_LIMIT = 50;
const GOAL_DESCRIPTION_LIMIT = 500;
const GOAL_TAG_LIMIT = 2;
const GOAL_CREATE_ICON: GoalIcon = "layout";
const SLIDE_MS = 400;

const moreToggleClassName =
  "text-body -mx-2 flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-2 font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover)]";
const periodTextClassName =
  "min-w-0 flex-1 truncate text-sm leading-[20px] font-[400] text-[var(--color-text)]";
const periodLinkClassName =
  "ml-auto inline-flex shrink-0 items-center gap-1 text-xs leading-[18px] font-[400] whitespace-nowrap text-[var(--color-text-muted)]";
const tagLimitClassName =
  "text-xs leading-[20px] font-[400] text-[var(--color-text-muted)] tabular-nums";
const tagListClassName = "mt-[8px] flex min-w-0 flex-wrap items-center gap-1.5";
const tagEmptyClassName =
  "mt-[8px] text-sm leading-[20px] font-[400] text-[var(--color-text-muted)]";
const tagButtonClassName =
  "max-w-full min-w-0 cursor-pointer rounded-[var(--radius-sm)] disabled:cursor-not-allowed";
const tagSelectedClassName = "outline outline-1 outline-[var(--color-text)]";

type GoalCreateErrors = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
};

export type GoalCreateDraft = {
  title: string;
  projectId: number | null;
  tags: string[];
};

type GoalCreateDrawerProps = {
  isOpen: boolean;
  projects: Project[];
  defaultProjectId: number | null;
  onClose: () => void;
  onCreated: (projectId: number | null) => void;
  onDraftChange?: (draft: GoalCreateDraft) => void;
};

const emptyErrors: GoalCreateErrors = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
};

/**
 * GoalCreateDrawerPanel
 *
 * 새 목표를 작성하는 오른쪽 드로어 본문입니다.
 * 전체 화면을 누르면 화면 전체를 덮고, 안의 내용은 페이지 최대 너비에 맞춥니다. >> 를 누르면 오른쪽 너비로 돌아가거나 닫습니다.
 *
 * @param props - GoalCreateDrawerPanel 컴포넌트 Props
 * @param props.isEntered - 드로어가 화면 안에 들어와 있는지 여부
 * @param props.projects - 연결할 수 있는 프로젝트
 * @param props.defaultProjectId - 드로어를 열 때 미리 연결할 프로젝트
 * @param props.onClose - 드로어를 닫을 때 실행되는 함수
 * @param props.onCreated - 목표를 추가한 뒤 실행되는 함수
 * @param props.onDraftChange - 작성 중인 목표 내용이 바뀔 때 실행되는 함수
 */
function GoalCreateDrawerPanel({
  isEntered,
  projects,
  defaultProjectId,
  onClose,
  onCreated,
  onDraftChange,
}: Omit<GoalCreateDrawerProps, "isOpen"> & { isEntered: boolean }) {
  const titleId = useId();
  const titleFieldId = useId();
  const descriptionFieldId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const { alert } = useAlert();
  const queryClient = useQueryClient();
  const createGoalMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: goalQueryKeys.all });
    },
  });
  const isCreating = createGoalMutation.isPending;
  const initialProject = projects.find((project) => project.id === defaultProjectId) ?? null;
  const [projectId, setProjectId] = useState<number | null>(initialProject?.id ?? null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagOptions, setTagOptions] = useState<string[]>(initialProject?.tags ?? []);
  const [startDate, setStartDate] = useState(initialProject?.startDate ?? "");
  const [endDate, setEndDate] = useState(initialProject?.endDate ?? "");
  const [errors, setErrors] = useState<GoalCreateErrors>(emptyErrors);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const pushesPage = useGoalDrawerPushesPage();
  const project = projects.find((item) => item.id === projectId) ?? null;
  const isActive = isEntered;

  useEffect(() => {
    onDraftChange?.({
      title,
      projectId,
      tags,
    });
  }, [onDraftChange, projectId, tags, title]);
  const today = getTodayDateValue();
  const projectStart = project?.startDate ?? "";
  const projectEnd = project?.endDate ?? "";
  const hasProjectPeriod = Boolean(projectStart && projectEnd);
  const startDateMin = hasProjectPeriod ? projectStart : today;
  const startDateMax = hasProjectPeriod
    ? endDate && endDate < projectEnd
      ? endDate
      : projectEnd
    : endDate || undefined;
  const endDateMin = hasProjectPeriod
    ? startDate && startDate > projectStart
      ? startDate
      : projectStart
    : startDate || today;
  const endDateMax = hasProjectPeriod ? projectEnd : undefined;
  const periodLocked = project != null;
  const linkedPeriodText = [formatDate(projectStart), formatDate(projectEnd)]
    .filter(Boolean)
    .join(" ~ ");
  const isTagLimitReached = tags.length >= GOAL_TAG_LIMIT;

  useGoalDrawerOffset(isEntered && pushesPage);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    titleRef.current?.focus({ preventScroll: true });
  }, [isActive]);

  const scrollToError = () => {
    window.setTimeout(() => {
      panelRef.current?.querySelector("[data-field-error]")?.scrollIntoView({ block: "center" });
    }, 0);
  };

  const validate = () => {
    const next = { ...emptyErrors };
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      next.title = "목표 이름을 입력해주세요.";
    }

    if (trimmedTitle.length > GOAL_TITLE_LIMIT) {
      next.title = `목표 이름은 ${GOAL_TITLE_LIMIT}자 이하로 입력해 주세요.`;
    }

    if (description.length > GOAL_DESCRIPTION_LIMIT) {
      next.description = `목표 설명은 ${GOAL_DESCRIPTION_LIMIT}자 이하로 입력해 주세요.`;
    }

    if (!periodLocked && startDate && startDate < today) {
      next.startDate = "시작일은 오늘부터 선택해 주세요.";
    }

    if (!periodLocked && startDate && endDate && endDate < startDate) {
      next.endDate = "마감일은 시작일 이후여야 합니다.";
    }

    setErrors(next);

    return !Object.values(next).some(Boolean);
  };

  const changeProject = (nextProjectId: number) => {
    const nextProject = projects.find((item) => item.id === nextProjectId);

    if (!nextProject) {
      return;
    }

    setProjectId(nextProject.id);
    setTagOptions(nextProject.tags);
    setTags((current) =>
      current.filter((tag) => nextProject.tags.includes(tag)).slice(0, GOAL_TAG_LIMIT),
    );
    setStartDate(nextProject.startDate);
    setEndDate(nextProject.endDate);
    setErrors((current) => ({
      ...current,
      startDate: "",
      endDate: "",
    }));
  };

  /**
   * clearProject
   *
   * 연결된 프로젝트를 지우고 목표 기간을 직접 고를 수 있게 합니다.
   */
  const clearProject = () => {
    setProjectId(null);
    setTags([]);
    setStartDate("");
    setEndDate("");
    setErrors((current) => ({
      ...current,
      startDate: "",
      endDate: "",
    }));
  };

  const toggleTag = (tag: string) => {
    const isSelected = tags.includes(tag);

    if (!isSelected && isTagLimitReached) {
      return;
    }

    setTags((current) => (isSelected ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const saveStateRef = useRef<"idle" | "saving" | "saved">("idle");

  /**
   * persistGoal
   *
   * 작성 중인 목표를 목록에 저장합니다. 이미 저장했으면 다시 만들지 않습니다.
   *
   * @returns 저장되었거나 이미 저장된 상태면 true
   */
  const persistGoal = async () => {
    if (saveStateRef.current === "saved") {
      return true;
    }

    if (saveStateRef.current === "saving") {
      return false;
    }

    if (!validate()) {
      scrollToError();
      return false;
    }

    const resolvedStartDate = periodLocked && hasProjectPeriod ? projectStart : startDate;
    const resolvedEndDate = periodLocked && hasProjectPeriod ? projectEnd : endDate;

    saveStateRef.current = "saving";

    try {
      await createGoalMutation.mutateAsync({
        projectId: project?.id ?? null,
        title: title.trim(),
        description: description.trim(),
        status: "NOT_STARTED",
        color: project?.color ?? null,
        icon: GOAL_CREATE_ICON,
        tags: project ? tags : [],
        startDate: resolvedStartDate,
        endDate: resolvedEndDate,
        teamId: project?.teamId ?? null,
      });
      saveStateRef.current = "saved";
      onCreated(project?.id ?? null);
      return true;
    } catch (error) {
      saveStateRef.current = "idle";
      await alert({
        title: "목표를 추가하지 못했습니다",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.",
      });
      return false;
    }
  };

  /**
   * closeDrawer
   *
   * 작성 중인 목표를 저장한 뒤 드로어를 닫습니다.
   */
  const submitDrawer = () => {
    void persistGoal().then((saved) => {
      if (saved) {
        onClose();
      }
    });
  };

  // 바꾼 내용이 있으면 드로어 가운데 확인창을 띄운다 (Layout Spec 05)
  const isDirty =
    title.trim() !== "" ||
    description.trim() !== "" ||
    tags.length > 0 ||
    projectId !== (initialProject?.id ?? null) ||
    (!periodLocked && (startDate !== "" || endDate !== ""));

  const requestClose = () => {
    if (isDirty) {
      setIsConfirmOpen(true);
      return;
    }

    onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitDrawer();
  };

  return (
    <>
      <Drawer
        isEntered={isActive}
        title="목표 추가"
        titleId={titleId}
        onClose={requestClose}
        closeLabel="목표 추가 닫기"
        overlay={!pushesPage}
        lockScroll={!pushesPage}
        panelRef={panelRef}
      >
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <Drawer.Body>
            <FormField label="이름" htmlFor={titleFieldId} required error={errors.title}>
              <Input
                id={titleFieldId}
                ref={titleRef}
                value={title}
                maxLength={GOAL_TITLE_LIMIT}
                placeholder="목표 이름을 입력하세요"
                aria-required="true"
                aria-invalid={errors.title ? true : undefined}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setErrors((current) => ({ ...current, title: "" }));
                }}
              />
            </FormField>

            <FormField label="프로젝트">
              <ProjectPickField
                projects={projects}
                value={projectId}
                allowNone
                onChange={(nextProjectId) => {
                  if (nextProjectId == null) {
                    clearProject();
                    return;
                  }

                  changeProject(nextProjectId);
                }}
              />
            </FormField>

            <FormField
              label="태그"
              aside={
                project ? (
                  <span className={tagLimitClassName}>
                    {tags.length}/{GOAL_TAG_LIMIT}
                  </span>
                ) : null
              }
              hint={
                project
                  ? isTagLimitReached
                    ? "태그는 2개까지만 선택할 수 있습니다."
                    : undefined
                  : "프로젝트를 고르면 그 프로젝트의 태그를 쓸 수 있어요"
              }
            >
              {project ? (
                tagOptions.length > 0 ? (
                  <div className={tagListClassName}>
                    {tagOptions.map((tag) => {
                      const isSelected = tags.includes(tag);
                      const isDisabled = !isSelected && isTagLimitReached;
                      const tagClassName = [
                        tagButtonClassName,
                        isSelected ? tagSelectedClassName : "",
                        isDisabled ? "opacity-40" : "",
                      ]
                        .filter(Boolean)
                        .join(" ");

                      return (
                        <button
                          key={tag}
                          type="button"
                          aria-pressed={isSelected}
                          disabled={isDisabled}
                          onClick={() => toggleTag(tag)}
                          className={tagClassName}
                        >
                          <GoalTag tag={tag} />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className={tagEmptyClassName}>이 프로젝트에 설정된 태그가 없습니다.</p>
                )
              ) : null}
            </FormField>

            <button
              type="button"
              aria-expanded={isMoreOpen}
              onClick={() => setIsMoreOpen((open) => !open)}
              className={moreToggleClassName}
            >
              <AppIcon
                icon={ChevronDown}
                size="sm"
                className={`transition-transform ${isMoreOpen ? "" : "-rotate-90"}`}
              />
              더 설정하기
              <span className="font-normal text-[var(--color-text-secondary)]">· 기간, 설명</span>
            </button>

            {isMoreOpen ? (
              <>
                {periodLocked ? (
                  <FormField label="기간">
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <span className={periodTextClassName}>{linkedPeriodText || "기간 없음"}</span>
                      <span className={periodLinkClassName}>
                        <AppIcon icon={Link2} size="sm" />
                        프로젝트 기간 연동
                      </span>
                    </div>
                  </FormField>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="시작일" error={errors.startDate}>
                      <DatePicker
                        title="시작일"
                        value={startDate}
                        onChange={(value) => {
                          setStartDate(value);

                          if (endDate && value && endDate < value) {
                            setEndDate("");
                          }

                          setErrors((current) => ({ ...current, startDate: "", endDate: "" }));
                        }}
                        min={startDateMin}
                        max={startDateMax}
                        invalid={Boolean(errors.startDate)}
                      />
                    </FormField>
                    <FormField label="마감일" error={errors.endDate}>
                      <DatePicker
                        title="마감일"
                        value={endDate}
                        onChange={(value) => {
                          setEndDate(value);
                          setErrors((current) => ({ ...current, endDate: "" }));
                        }}
                        min={endDateMin}
                        max={endDateMax}
                        invalid={Boolean(errors.endDate)}
                      />
                    </FormField>
                  </div>
                )}

                <FormField label="설명" htmlFor={descriptionFieldId} error={errors.description}>
                  <Textarea
                    id={descriptionFieldId}
                    value={description}
                    maxLength={GOAL_DESCRIPTION_LIMIT}
                    placeholder="목표에 대한 설명을 입력하세요"
                    onChange={(event) => {
                      setDescription(event.target.value);
                      setErrors((current) => ({ ...current, description: "" }));
                    }}
                  />
                </FormField>
              </>
            ) : null}
          </Drawer.Body>

          <Drawer.Footer>
            <SecondaryButton onClick={requestClose} disabled={isCreating}>
              취소
            </SecondaryButton>

            <PrimaryButton type="submit" disabled={isCreating}>
              추가
            </PrimaryButton>
          </Drawer.Footer>
        </form>

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
      </Drawer>
    </>
  );
}

/**
 * GoalCreateDrawer
 *
 * 새 목표를 추가하는 오른쪽 드로어입니다.
 * 넓은 화면에서는 드로어 너비만큼 왼쪽 화면이 줄고, 전체 화면으로 넓힐 수 있습니다. 닫거나 목표 추가를 누르면 목록에 저장한 뒤 닫힙니다.
 *
 * @param props - GoalCreateDrawer 컴포넌트 Props
 * @param props.isOpen - 드로어가 열려 있는지 여부
 * @param props.projects - 연결할 수 있는 프로젝트
 * @param props.defaultProjectId - 드로어를 열 때 미리 연결할 프로젝트
 * @param props.onClose - 드로어를 닫을 때 실행되는 함수
 * @param props.onCreated - 목표를 추가한 뒤 실행되는 함수
 * @param props.onDraftChange - 작성 중인 목표 내용이 바뀔 때 실행되는 함수
 */
export default function GoalCreateDrawer({
  isOpen,
  projects,
  defaultProjectId,
  onClose,
  onCreated,
  onDraftChange,
}: GoalCreateDrawerProps) {
  const [isPresent, setIsPresent] = useState(isOpen);
  const [phase, setPhase] = useState<"enter" | "open" | "leave">(isOpen ? "enter" : "leave");

  if (isOpen && (!isPresent || phase === "leave")) {
    setIsPresent(true);
    setPhase("enter");
  } else if (!isOpen && isPresent && phase !== "leave") {
    setPhase("leave");
  }

  useEffect(() => {
    if (!isPresent || phase === "open") {
      return;
    }

    if (phase === "enter") {
      let innerFrame = 0;
      const outerFrame = window.requestAnimationFrame(() => {
        innerFrame = window.requestAnimationFrame(() => {
          setPhase("open");
        });
      });

      return () => {
        window.cancelAnimationFrame(outerFrame);
        window.cancelAnimationFrame(innerFrame);
      };
    }

    const timeout = window.setTimeout(() => {
      setIsPresent(false);
    }, SLIDE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isPresent, phase]);

  if (!isPresent) {
    return null;
  }

  return (
    <GoalCreateDrawerPanel
      isEntered={phase === "open"}
      projects={projects}
      defaultProjectId={defaultProjectId}
      onClose={onClose}
      onCreated={onCreated}
      onDraftChange={onDraftChange}
    />
  );
}
