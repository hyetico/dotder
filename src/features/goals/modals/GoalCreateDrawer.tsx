"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import Drawer from "@/components/ui/drawer/Drawer";
import FieldNotice from "@/components/ui/FieldNotice";
import { AppIcon, Calendar, Info, Link2 } from "@/components/ui/icon";
import { useAlert } from "@/components/ui/modal/AlertModal";
import Modal from "@/components/ui/modal/Modal";
import ProfileSummary from "@/components/ui/ProfileSummary";

import { createGoal } from "@/features/goals/api/goals";
import GoalDrawerDescriptionField from "@/features/goals/components/GoalDrawerDescriptionField";
import GoalStatusIcon from "@/features/goals/components/GoalStatusIcon";
import GoalStatusLabel from "@/features/goals/components/GoalStatusLabel";
import GoalTag from "@/features/goals/components/GoalTag";
import {
  useGoalDrawerOffset,
  useGoalDrawerPushesPage,
} from "@/features/goals/modals/goalDrawerOffset";
import GoalProjectSelectModal from "@/features/goals/modals/GoalProjectSelectModal";
import { getTodayDateValue } from "@/features/goals/utils/goalDates";
import { getGoalStatusLabel } from "@/features/goals/utils/goalUtils";
import { FieldError } from "@/features/projects/components/ProjectForm/FormParts";

import { currentUser } from "@/lib/mock/users";
import { goalQueryKeys } from "@/lib/queryKeys";

import type { GoalIcon, GoalStatus } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";

const GOAL_TITLE_LIMIT = 50;
const GOAL_DESCRIPTION_LIMIT = 500;
const GOAL_TAG_LIMIT = 2;
const GOAL_CREATE_ICON: GoalIcon = "layout";
const SLIDE_MS = 400;

const goalIconPreviewClassName =
  "flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-[var(--color-hover-soft)] text-2xl leading-none";
const goalTitleAreaClassName =
  "text-2xl! leading-[32px]! font-[700]! text-[var(--color-text)]! placeholder:text-2xl placeholder:leading-[32px] placeholder:font-[700] placeholder:text-[var(--color-text-placeholder)]! focus:placeholder:text-[var(--color-text-placeholder)]!";
const goalDescriptionAreaClassName =
  "placeholder:text-[var(--color-text-placeholder)]! focus:placeholder:text-[var(--color-text-placeholder)]!";
const goalTitleBlockClassName = "flex w-full min-w-0 flex-col items-stretch gap-[16px]";
const drawerBodyClassName = "!px-[62px]";
const drawerRowClassName = "flex min-w-0 items-center gap-[12px] py-4";
const drawerRowTopClassName = "mt-[32px] flex min-w-0 items-start gap-[12px] pb-4";
const drawerRowLabelClassName =
  "w-[80px] shrink-0 text-sm leading-[20px] font-[500] text-[var(--color-text-muted)]";
const drawerAsideClassName =
  "ml-auto inline-flex shrink-0 items-center gap-1 text-xs leading-[18px] font-[400] whitespace-nowrap text-[var(--color-text-muted)]";
const projectNameClassName =
  "min-w-0 flex-1 truncate text-sm leading-[20px] font-[400] text-[var(--color-text)]";
const periodTextClassName =
  "min-w-0 flex-1 truncate text-sm leading-[20px] font-[400] text-[var(--color-text)]";
const periodLinkClassName =
  "ml-auto inline-flex shrink-0 items-center gap-1 text-xs leading-[18px] font-[400] whitespace-nowrap text-[var(--color-text-muted)]";
const tagLimitClassName =
  "text-xs leading-[20px] font-[400] text-[var(--color-text-muted)] tabular-nums";
const tagListClassName = "mt-[8px] flex min-w-0 flex-wrap items-center gap-1.5";
const tagEmptyClassName =
  "mt-[8px] text-sm leading-[20px] font-[400] text-[var(--color-text-muted)]";
const goalTagSectionClassName = "py-4";
const tagButtonClassName =
  "max-w-full min-w-0 cursor-pointer rounded-[9px] disabled:cursor-not-allowed";
const tagSelectedClassName = "outline outline-1 outline-[var(--color-text)]";
const assigneeSummaryClassName =
  "h-auto! w-auto! shrink-0 border-transparent! bg-transparent! px-0! py-0! md:px-0! [&_.truncate]:text-sm! [&_.truncate]:leading-[20px]! [&_.truncate]:font-[400]! [&_.truncate]:text-[var(--color-text)]!";
const statusTextClassName =
  "inline-flex min-w-0 items-center gap-1.5 text-sm leading-[20px] font-[400] text-[var(--color-text)]";
const dateButtonEmptyClassName =
  "w-full justify-start text-sm! leading-[20px]! font-[400]! text-[var(--color-text-muted)]! [&_span]:text-sm! [&_span]:leading-[20px]! [&_span]:font-[400]! [&_span]:text-[var(--color-text-muted)]!";
const dateButtonValueClassName =
  "w-full justify-start text-sm! leading-[20px]! font-[400]! text-[var(--color-text)]! [&_span]:text-sm! [&_span]:leading-[20px]! [&_span]:font-[400]! [&_span]:text-[var(--color-text)]!";

const goalStatusAutoRules: { condition: string; status: GoalStatus }[] = [
  { condition: "태스크 없음 또는 모두 미시작", status: "NOT_STARTED" },
  { condition: "진행 중이 있거나 일부 완료", status: "IN_PROGRESS" },
  { condition: "1개 이상 연결되며 모두 완료", status: "COMPLETED" },
];
const goalStatusAutoInfoButtonClassName =
  "inline-flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-full p-0 leading-none text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]";
const goalStatusAutoRuleClassName =
  "flex min-w-0 items-center justify-between gap-3 border-b border-[var(--color-border)] py-3 last:border-b-0";

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
 * formatGoalPeriodDate
 *
 * 목표 기간 칸에 보여줄 날짜를 만듭니다.
 *
 * @param value - YYYY-MM-DD 날짜
 * @returns `2026.11.09` 형태의 날짜. 값이 없으면 빈 문자열
 */
function formatGoalPeriodDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${year}.${month}.${day}`;
}

/**
 * GoalStatusAutoInfo
 *
 * 목표 상태가 연결된 태스크에 따라 계산되는 규칙을 모달로 보여 줍니다.
 */
function GoalStatusAutoInfo() {
  const titleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <>
      <button
        type="button"
        aria-label="목표 상태 자동 계산"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
        className={goalStatusAutoInfoButtonClassName}
      >
        <AppIcon icon={Info} size="sm" />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        labelledBy={titleId}
        zIndexClassName="z-[180]"
        maxWidthClassName="max-w-[440px]"
      >
        <Modal.Header
          id={titleId}
          title="목표 상태 자동 계산"
          onClose={close}
          closeLabel="목표 상태 자동 계산 닫기"
        />

        <Modal.Body>
          <ul>
            {goalStatusAutoRules.map((rule) => (
              <li key={rule.status} className={goalStatusAutoRuleClassName}>
                <span className="text-caption min-w-0 text-[var(--color-text-secondary)]">
                  {rule.condition}
                </span>
                <GoalStatusLabel status={rule.status} />
              </li>
            ))}
          </ul>

          <FieldNotice className="mt-3!">
            마감 초과 여부는 적용된 마감일을 기준으로 별도 표시됩니다.
          </FieldNotice>
        </Modal.Body>

        <Modal.Footer>
          <PrimaryButton size="modal" onClick={close}>
            확인
          </PrimaryButton>
        </Modal.Footer>
      </Modal>
    </>
  );
}

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
  const titleRef = useRef<HTMLTextAreaElement>(null);
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
  const [isProjectSelectOpen, setIsProjectSelectOpen] = useState(false);
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
  const linkedPeriodText = [formatGoalPeriodDate(projectStart), formatGoalPeriodDate(projectEnd)]
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
  const closeDrawer = () => {
    void persistGoal().then((saved) => {
      if (saved) {
        onClose();
      }
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    closeDrawer();
  };

  return (
    <>
      <Drawer
        isEntered={isActive}
        title=""
        titleId={titleId}
        onClose={closeDrawer}
        closeLabel="새 목표 닫기"
        overlay={!pushesPage}
        lockScroll={!pushesPage}
        panelRef={panelRef}
      >
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
          <Drawer.Body className={drawerBodyClassName}>
            <div>
              <div>
                <div className={goalTitleBlockClassName}>
                  <span aria-hidden className={goalIconPreviewClassName}>
                    🎨
                  </span>

                  <GoalDrawerDescriptionField
                    id={titleFieldId}
                    inputRef={titleRef}
                    value={title}
                    maxLength={GOAL_TITLE_LIMIT}
                    placeholder="새 목표"
                    ariaLabel="목표 이름"
                    plain
                    invalid={Boolean(errors.title)}
                    areaClassName={goalTitleAreaClassName}
                    onChange={(event) => {
                      setTitle(event.target.value);
                      setErrors((current) => ({ ...current, title: "" }));
                    }}
                  />
                </div>

                <FieldError message={errors.title} />
              </div>

              <div className={drawerRowTopClassName}>
                <label htmlFor={descriptionFieldId} className={drawerRowLabelClassName}>
                  설명
                </label>

                <div className="min-w-0 flex-1">
                  <GoalDrawerDescriptionField
                    id={descriptionFieldId}
                    value={description}
                    maxLength={GOAL_DESCRIPTION_LIMIT}
                    placeholder="목표에 대한 설명을 입력하세요"
                    areaClassName={goalDescriptionAreaClassName}
                    invalid={Boolean(errors.description)}
                    onChange={(event) => {
                      setDescription(event.target.value);
                      setErrors((current) => ({ ...current, description: "" }));
                    }}
                  />

                  <FieldError message={errors.description} />
                </div>
              </div>

              <div className={drawerRowClassName}>
                <span className={drawerRowLabelClassName}>프로젝트</span>
                <span className={projectNameClassName}>{project ? project.name : ""}</span>
                <SecondaryButton
                  type="button"
                  icon={project ? undefined : <AppIcon icon={Link2} size="sm" />}
                  onClick={() => setIsProjectSelectOpen(true)}
                  className="ml-auto"
                >
                  {project ? "변경" : "연결"}
                </SecondaryButton>
              </div>

              {project ? (
                <div className={goalTagSectionClassName}>
                  <div className="flex min-w-0 items-start gap-[12px]">
                    <span className={drawerRowLabelClassName}>태그 선택</span>

                    <div className="min-w-0 flex-1">
                      <span className={tagLimitClassName}>
                        {tags.length}/{GOAL_TAG_LIMIT}
                      </span>

                      {tagOptions.length > 0 ? (
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
                      )}

                      {isTagLimitReached ? (
                        <p className="text-caption mt-1.5 text-[var(--color-text-muted)]">
                          태그는 2개까지만 선택할 수 있습니다.
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              <div className={drawerRowClassName}>
                <span className={drawerRowLabelClassName}>기간</span>

                {periodLocked ? (
                  <span className={periodTextClassName}>{linkedPeriodText || "기간 없음"}</span>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <DatePicker
                      variant="button"
                      buttonIcon={Calendar}
                      buttonLabel="시작일 선택"
                      buttonClassName={
                        startDate ? dateButtonValueClassName : dateButtonEmptyClassName
                      }
                      className="min-w-0 flex-1"
                      value={startDate}
                      onChange={(value) => {
                        setStartDate(value);

                        if (endDate && value && endDate < value) {
                          setEndDate("");
                        }

                        setErrors((current) => ({ ...current, startDate: "", endDate: "" }));
                      }}
                      formatValue={formatGoalPeriodDate}
                      min={startDateMin}
                      max={startDateMax}
                      invalid={Boolean(errors.startDate)}
                      zIndexClassName="z-[180]"
                    />

                    <DatePicker
                      variant="button"
                      buttonIcon={Calendar}
                      buttonLabel="마감일 선택"
                      buttonClassName={
                        endDate ? dateButtonValueClassName : dateButtonEmptyClassName
                      }
                      className="min-w-0 flex-1"
                      value={endDate}
                      onChange={(value) => {
                        setEndDate(value);
                        setErrors((current) => ({ ...current, endDate: "" }));
                      }}
                      formatValue={formatGoalPeriodDate}
                      min={endDateMin}
                      max={endDateMax}
                      invalid={Boolean(errors.endDate)}
                      zIndexClassName="z-[180]"
                    />
                  </div>
                )}

                {periodLocked ? (
                  <span className={periodLinkClassName}>
                    <AppIcon icon={Link2} size="sm" />
                    프로젝트 기간 연동
                  </span>
                ) : null}
              </div>

              <FieldError message={errors.startDate} />
              <FieldError message={errors.endDate} />

              <div className={drawerRowClassName}>
                <span className={drawerRowLabelClassName}>담당자</span>
                <ProfileSummary
                  name={currentUser.name}
                  image={currentUser.image}
                  className={assigneeSummaryClassName}
                />
              </div>

              <div className={drawerRowClassName}>
                <span className={drawerRowLabelClassName}>목표 상태</span>
                <span className={statusTextClassName}>
                  <GoalStatusIcon
                    status="NOT_STARTED"
                    size={16}
                    className="text-[var(--color-text-muted)]"
                  />
                  {getGoalStatusLabel("NOT_STARTED")}
                </span>
                <span className={drawerAsideClassName}>
                  자동 계산
                  <GoalStatusAutoInfo />
                </span>
              </div>
            </div>
          </Drawer.Body>

          <Drawer.Footer>
            <SecondaryButton
              size="modal"
              onClick={closeDrawer}
              disabled={isCreating}
              className="min-w-[80px] justify-center"
            >
              취소
            </SecondaryButton>

            <PrimaryButton
              type="submit"
              size="modal"
              disabled={isCreating}
              className="min-w-[96px] justify-center"
            >
              {isCreating ? "추가 중..." : "목표 추가"}
            </PrimaryButton>
          </Drawer.Footer>
        </form>
      </Drawer>

      <GoalProjectSelectModal
        isOpen={isProjectSelectOpen}
        projects={projects}
        selectedId={projectId}
        onApply={(nextProjectId) => {
          if (nextProjectId == null) {
            clearProject();
            return;
          }

          changeProject(nextProjectId);
        }}
        onClose={() => setIsProjectSelectOpen(false)}
      />
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
