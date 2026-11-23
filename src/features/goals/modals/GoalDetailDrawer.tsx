"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import Drawer from "@/components/ui/drawer/Drawer";
import { fieldPaddingClassName } from "@/components/ui/fieldControl";
import {
  AppIcon,
  ArrowUpRight,
  Calendar,
  Folder,
  Gauge,
  LayoutGrid,
  Link2,
  Lock,
  Pencil,
  Shield,
  Smartphone,
  Users,
  type LucideIcon,
} from "@/components/ui/icon";
import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/input/Textarea";
import { useAlert } from "@/components/ui/modal/AlertModal";
import ProfileSummary from "@/components/ui/ProfileSummary";

import { getGoal, updateGoal } from "@/features/goals/api/goals";
import GoalStatusIcon from "@/features/goals/components/GoalStatusIcon";
import GoalTag from "@/features/goals/components/GoalTag";
import {
  useGoalDrawerOffset,
  useGoalDrawerPushesPage,
} from "@/features/goals/modals/goalDrawerOffset";
import GoalProjectSelectModal from "@/features/goals/modals/GoalProjectSelectModal";
import LinkedProjectInfoModal from "@/features/goals/modals/LinkedProjectInfoModal";
import { getGoalStatusLabel } from "@/features/goals/utils/goalUtils";
import { FieldError, FormLabel } from "@/features/projects/components/ProjectForm/FormParts";

import { getTeamMember } from "@/lib/mock/teamMembers";
import { goalQueryKeys } from "@/lib/queryKeys";

import type { Goal, GoalIcon, GoalStatus } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";

const SLIDE_MS = 400;
const GOAL_TITLE_LIMIT = 100;
const GOAL_DESCRIPTION_LIMIT = 1000;
const GOAL_TAG_LIMIT = 2;

const drawerFieldClassName = `flex min-w-0 items-center gap-3 rounded-[var(--radius-sm)] bg-[var(--color-field)] py-3 ${fieldPaddingClassName}`;
const valueBoxClassName = `text-body rounded-[var(--radius-sm)] bg-[var(--color-field)] py-3 break-keep whitespace-pre-wrap ${fieldPaddingClassName}`;
const goalIconPreviewClassName =
  "flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-field)] text-[var(--color-text-secondary)]";
const periodFieldClassName = `flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--radius-sm)] bg-[var(--color-field)] py-3 ${fieldPaddingClassName}`;
const periodLinkClassName =
  "text-body-sm ml-auto inline-flex shrink-0 items-center gap-1 font-medium whitespace-nowrap text-[var(--color-text-muted)]";
const projectDetailButtonClassName =
  "inline-flex cursor-pointer items-center gap-0.5 text-[13px] leading-none font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]";
const plainControlClassName =
  "border-transparent! shadow-none! hover:border-transparent! hover:shadow-none!";
const tagButtonClassName = "max-w-full min-w-0 cursor-pointer disabled:cursor-not-allowed";
const lockedPeriodButtonClassName = `${periodLinkClassName} cursor-not-allowed`;
const editButtonPressedClassName = "border-transparent! bg-[var(--color-primary)]! text-white! hover:bg-[var(--color-primary-hover)]! hover:text-white!";

type GoalEditErrors = {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
};

const emptyEditErrors: GoalEditErrors = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
};
const statusIconClassName: Record<GoalStatus, string> = {
  COMPLETED: "text-[#16a34a]",
  IN_PROGRESS: "text-[#2563eb]",
  NOT_STARTED: "text-[var(--color-text-muted)]",
};
const goalIcons: Record<GoalIcon, LucideIcon> = {
  shield: Shield,
  layout: LayoutGrid,
  smartphone: Smartphone,
  users: Users,
  gauge: Gauge,
};

type GoalDetailDrawerProps = {
  goalId: number | null;
  projects: Project[];
  onClose: () => void;
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
 * GoalDetailEditForm
 *
 * 목표 상세에서 이름, 설명, 프로젝트, 기간, 태그를 고쳐 저장합니다.
 * 담당자와 상태는 연결된 값 그대로 보여 줍니다.
 *
 * @param props - GoalDetailEditForm 컴포넌트 Props
 * @param props.goal - 고칠 목표
 * @param props.projects - 연결할 수 있는 프로젝트
 * @param props.onCancel - 수정을 취소할 때 실행되는 함수
 * @param props.onSaved - 저장한 뒤 실행되는 함수
 */
function GoalDetailEditForm({
  goal,
  projects,
  onCancel,
  onSaved,
}: {
  goal: Goal;
  projects: Project[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const titleFieldId = useId();
  const descriptionFieldId = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const { alert } = useAlert();
  const queryClient = useQueryClient();
  const updateGoalMutation = useMutation({
    mutationFn: updateGoal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: goalQueryKeys.all });
    },
  });
  const isSaving = updateGoalMutation.isPending;
  const [projectId, setProjectId] = useState<number | null>(goal.projectId);
  const [title, setTitle] = useState(goal.title);
  const [description, setDescription] = useState(goal.description);
  const [tags, setTags] = useState<string[]>(goal.tags);
  const [startDate, setStartDate] = useState(goal.startDate);
  const [endDate, setEndDate] = useState(goal.endDate);
  const [errors, setErrors] = useState<GoalEditErrors>(emptyEditErrors);
  const [isProjectSelectOpen, setIsProjectSelectOpen] = useState(false);
  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false);
  const project = projects.find((item) => item.id === projectId) ?? null;
  const assignee =
    goal.assigneeIds.map((id) => getTeamMember(id)).find((member) => member != null) ?? null;
  const projectTags = project?.tags ?? [];
  const isTagLimitReached = tags.length >= GOAL_TAG_LIMIT;
  const periodLocked = project != null;
  const periodInvalid = Boolean(errors.startDate || errors.endDate);
  const editPeriodClassName = [
    "flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 rounded-[var(--radius-sm)] py-3",
    fieldPaddingClassName,
    periodLocked
      ? "cursor-not-allowed bg-[var(--color-field-disabled)]"
      : periodInvalid
        ? "border border-[var(--color-field-error)] bg-[var(--color-field)]"
        : "bg-[var(--color-field)]",
  ].join(" ");

  const changeProject = (nextProjectId: number) => {
    const nextProject = projects.find((item) => item.id === nextProjectId);

    if (!nextProject) {
      return;
    }

    setProjectId(nextProject.id);
    setTags((current) =>
      current.filter((tag) => nextProject.tags.includes(tag)).slice(0, GOAL_TAG_LIMIT),
    );
    setStartDate(nextProject.startDate);
    setEndDate(nextProject.endDate);
    setErrors((current) => ({ ...current, startDate: "", endDate: "" }));
  };

  const clearProject = () => {
    setProjectId(null);
    setTags([]);
    setErrors((current) => ({ ...current, startDate: "", endDate: "" }));
  };

  const toggleTag = (tag: string) => {
    const isSelected = tags.includes(tag);

    if (!isSelected && isTagLimitReached) {
      return;
    }

    setTags((current) => (isSelected ? current.filter((item) => item !== tag) : [...current, tag]));
  };

  const validate = () => {
    const next = { ...emptyEditErrors };
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      next.title = "목표 이름을 입력해 주세요.";
    } else if (trimmedTitle.length > GOAL_TITLE_LIMIT) {
      next.title = `목표 이름은 ${GOAL_TITLE_LIMIT}자 이하로 입력해 주세요.`;
    }

    if (description.length > GOAL_DESCRIPTION_LIMIT) {
      next.description = `목표 설명은 ${GOAL_DESCRIPTION_LIMIT}자 이하로 입력해 주세요.`;
    }

    if (periodLocked) {
      if (!project?.startDate || !project.endDate) {
        next.startDate = "연결된 프로젝트에 기간이 없습니다.";
      }
    } else if (!startDate) {
      next.startDate = "시작일을 선택해 주세요.";
    }

    if (!periodLocked) {
      if (!endDate) {
        next.endDate = "마감일을 선택해 주세요.";
      } else if (startDate && endDate < startDate) {
        next.endDate = "마감일은 시작일 이후여야 합니다.";
      }
    }

    setErrors(next);

    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSaving) {
      return;
    }

    if (!validate()) {
      window.setTimeout(() => {
        formRef.current?.querySelector("[data-field-error]")?.scrollIntoView({ block: "center" });
      }, 0);
      return;
    }

    try {
      await updateGoalMutation.mutateAsync({
        id: goal.id,
        projectId: project?.id ?? null,
        title: title.trim(),
        description: description.trim(),
        status: goal.status,
        color: project?.color ?? goal.color,
        icon: goal.icon,
        tags: project ? tags : [],
        startDate,
        endDate,
        teamId: project?.teamId ?? null,
      });
      onSaved();
    } catch (error) {
      await alert({
        title: "목표를 수정하지 못했습니다",
        description: error instanceof Error ? error.message : "잠시 후 다시 시도해 주세요.",
      });
    }
  };

  return (
    <>
      <form ref={formRef} className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
        <Drawer.Body>
          <div>
            <FormLabel
              label="연결 프로젝트"
              action={
                project ? (
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={isProjectInfoOpen}
                    onClick={() => setIsProjectInfoOpen(true)}
                    className={projectDetailButtonClassName}
                  >
                    상세 보기
                    <AppIcon icon={ArrowUpRight} size="xs" />
                  </button>
                ) : null
              }
            />
            <div className={drawerFieldClassName}>
              <AppIcon
                icon={Folder}
                size="sm"
                className="shrink-0 text-[var(--color-text-secondary)]"
              />
              <span
                className={`min-w-0 flex-1 truncate font-medium ${project ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}`}
              >
                {project ? project.name : "프로젝트를 선택해 주세요."}
              </span>
              <SecondaryButton
                type="button"
                icon={<AppIcon icon={Pencil} size="sm" />}
                onClick={() => setIsProjectSelectOpen(true)}
              >
                {project ? "프로젝트 변경" : "프로젝트 선택"}
              </SecondaryButton>
            </div>
          </div>

          <span aria-hidden className={goalIconPreviewClassName}>
            <AppIcon icon={goalIcons[goal.icon]} size="md" />
          </span>

          <div>
            <FormLabel
              htmlFor={titleFieldId}
              label="목표 이름"
              required
              counter={`${title.length}/${GOAL_TITLE_LIMIT}`}
            />
            <Input
              id={titleFieldId}
              value={title}
              maxLength={GOAL_TITLE_LIMIT}
              placeholder="목표 이름을 입력해 주세요."
              aria-invalid={Boolean(errors.title) || undefined}
              className={errors.title ? "" : plainControlClassName}
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((current) => ({ ...current, title: "" }));
              }}
            />
            <FieldError message={errors.title} />
          </div>

          <div>
            <FormLabel
              htmlFor={descriptionFieldId}
              label="목표 설명"
              counter={`${description.length}/${GOAL_DESCRIPTION_LIMIT}`}
            />
            <Textarea
              id={descriptionFieldId}
              value={description}
              maxLength={GOAL_DESCRIPTION_LIMIT}
              rows={4}
              placeholder="목표 설명을 입력해 주세요."
              aria-invalid={Boolean(errors.description) || undefined}
              className={errors.description ? "h-28" : `h-28 ${plainControlClassName}`}
              onChange={(event) => {
                setDescription(event.target.value);
                setErrors((current) => ({ ...current, description: "" }));
              }}
            />
            <FieldError message={errors.description} />
          </div>

          <div>
            <FormLabel label="담당자" />
            {assignee ? (
              <ProfileSummary
                name={assignee.name}
                role={assignee.role}
                className="border-transparent!"
                action={
                  <AppIcon
                    icon={Lock}
                    size="sm"
                    className="shrink-0 text-[var(--color-text-muted)]"
                  />
                }
              />
            ) : (
              <div className={`${drawerFieldClassName} text-[var(--color-text-secondary)]`}>
                담당자가 없습니다.
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-body !font-semibold text-[var(--color-text)]">목표 상태</span>
            <span className="text-body inline-flex items-center gap-1.5 text-[var(--color-text)]">
              <GoalStatusIcon
                status={goal.status}
                size={16}
                className={statusIconClassName[goal.status]}
              />
              {getGoalStatusLabel(goal.status)}
            </span>
          </div>

          <div>
            <FormLabel label="목표 기간" required />
            <div className={editPeriodClassName}>
              <AppIcon
                icon={Calendar}
                size="md"
                className={`shrink-0 ${periodLocked ? "text-[var(--color-text-muted)]" : "text-[var(--color-text-secondary)]"}`}
              />
              <div className="flex min-w-0 items-center gap-1.5">
                <DatePicker
                  variant="embedded"
                  value={startDate}
                  onChange={(value) => {
                    setStartDate(value);
                    if (endDate && value && endDate < value) {
                      setEndDate("");
                    }
                    setErrors((current) => ({ ...current, startDate: "", endDate: "" }));
                  }}
                  placeholder="시작일"
                  formatValue={formatGoalPeriodDate}
                  max={endDate || undefined}
                  disabled={periodLocked}
                  invalid={Boolean(errors.startDate)}
                  zIndexClassName="z-[180]"
                />
                <span className="shrink-0 text-[var(--color-text-muted)]">~</span>
                <DatePicker
                  variant="embedded"
                  value={endDate}
                  onChange={(value) => {
                    setEndDate(value);
                    setErrors((current) => ({ ...current, endDate: "" }));
                  }}
                  placeholder="마감일"
                  formatValue={formatGoalPeriodDate}
                  min={startDate || undefined}
                  disabled={periodLocked}
                  invalid={Boolean(errors.endDate)}
                  zIndexClassName="z-[180]"
                />
              </div>
              {periodLocked && startDate === project?.startDate && endDate === project?.endDate ? (
                <button type="button" disabled className={lockedPeriodButtonClassName}>
                  <AppIcon icon={Link2} size="sm" />
                  프로젝트 기간 연동
                </button>
              ) : null}
            </div>
            <FieldError message={errors.startDate} />
            <FieldError message={errors.endDate} />
          </div>

          <div>
            <FormLabel label="목표 태그 선택" />
            <div className="min-w-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-field)]">
              <div
                className={`flex min-w-0 flex-wrap items-center gap-1.5 py-3 ${fieldPaddingClassName}`}
              >
                {projectTags.length > 0 ? (
                  projectTags.map((tag) => {
                    const isSelected = tags.includes(tag);
                    const isDisabled = !isSelected && isTagLimitReached;

                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={isDisabled}
                        onClick={() => toggleTag(tag)}
                        className={`${tagButtonClassName} ${isDisabled ? "opacity-40" : ""}`}
                      >
                        <GoalTag tag={tag} className={isSelected ? "" : "opacity-40"} />
                      </button>
                    );
                  })
                ) : (
                  <p className="text-caption text-[var(--color-text-muted)]">
                    {project
                      ? "이 프로젝트에 설정된 태그가 없습니다."
                      : "프로젝트를 연결하면 태그를 선택할 수 있습니다."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Drawer.Body>

        <Drawer.Footer>
          <SecondaryButton
            size="modal"
            onClick={onCancel}
            disabled={isSaving}
            className="min-w-[80px] justify-center"
          >
            취소
          </SecondaryButton>
          <PrimaryButton
            type="submit"
            size="modal"
            disabled={isSaving}
            className="min-w-[96px] justify-center"
          >
            {isSaving ? "저장 중..." : "저장"}
          </PrimaryButton>
        </Drawer.Footer>
      </form>

      <LinkedProjectInfoModal
        isOpen={isProjectInfoOpen}
        onClose={() => setIsProjectInfoOpen(false)}
        project={project}
      />
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
 * GoalDetailDrawerPanel
 *
 * 고른 목표의 프로젝트, 이름, 설명, 담당자, 상태, 기간, 태그를 오른쪽 드로어에 보여 줍니다.
 *
 * @param props - GoalDetailDrawerPanel 컴포넌트 Props
 * @param props.isEntered - 드로어가 화면 안에 들어와 있는지 여부
 * @param props.goalId - 보여줄 목표 번호
 * @param props.projects - 연결 프로젝트 이름에 쓰는 프로젝트
 * @param props.onClose - 드로어를 닫을 때 실행되는 함수
 */
function GoalDetailDrawerPanel({
  isEntered,
  goalId,
  projects,
  onClose,
}: {
  isEntered: boolean;
  goalId: number;
  projects: Project[];
  onClose: () => void;
}) {
  const titleId = useId();
  const pushesPage = useGoalDrawerPushesPage();
  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
  const isEditing = editingGoalId === goalId;
  const {
    data: goal,
    isPending,
    isError,
  } = useQuery({
    queryKey: goalQueryKeys.detail(goalId),
    queryFn: () => getGoal(goalId),
  });
  const project =
    goal?.projectId == null ? null : (projects.find((item) => item.id === goal.projectId) ?? null);
  const assignee =
    goal?.assigneeIds.map((id) => getTeamMember(id)).find((member) => member != null) ?? null;
  const periodText = goal
    ? [formatGoalPeriodDate(goal.startDate), formatGoalPeriodDate(goal.endDate)]
        .filter(Boolean)
        .join(" ~ ")
    : "";
  const periodLinked =
    project != null &&
    goal != null &&
    goal.startDate === project.startDate &&
    goal.endDate === project.endDate;

  useGoalDrawerOffset(isEntered && pushesPage);

  return (
    <>
      <Drawer
        isEntered={isEntered}
        title={goal?.title ?? "목표"}
        titleId={titleId}
        onClose={onClose}
        closeLabel="목표 닫기"
        headerAction={
          goal ? (
            <SecondaryButton
              icon={<AppIcon icon={Pencil} size="sm" />}
              aria-pressed={isEditing}
              className={isEditing ? editButtonPressedClassName : ""}
              onClick={() => setEditingGoalId(isEditing ? null : goal.id)}
            >
              수정
            </SecondaryButton>
          ) : null
        }
        overlay={!pushesPage}
        lockScroll={!pushesPage}
      >
        {isEditing && goal ? (
          <GoalDetailEditForm
            key={goal.id}
            goal={goal}
            projects={projects}
            onCancel={() => setEditingGoalId(null)}
            onSaved={() => setEditingGoalId(null)}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <Drawer.Body>
              {isPending ? (
                <p className="text-body-sm py-8 text-center text-[var(--color-text-secondary)]">
                  목표를 불러오는 중...
                </p>
              ) : isError || !goal ? (
                <p className="text-body-sm py-8 text-center text-[var(--color-text-secondary)]">
                  목표를 찾을 수 없습니다.
                </p>
              ) : (
                <>
                  <div>
                    <FormLabel
                      label="연결 프로젝트"
                      action={
                        project ? (
                          <button
                            type="button"
                            aria-haspopup="dialog"
                            aria-expanded={isProjectInfoOpen}
                            onClick={() => setIsProjectInfoOpen(true)}
                            className={projectDetailButtonClassName}
                          >
                            상세 보기
                            <AppIcon icon={ArrowUpRight} size="xs" />
                          </button>
                        ) : null
                      }
                    />

                    <div className={drawerFieldClassName}>
                      <AppIcon
                        icon={Folder}
                        size="sm"
                        className="shrink-0 text-[var(--color-text-secondary)]"
                      />
                      <span
                        className={`min-w-0 flex-1 truncate font-medium ${project ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"}`}
                      >
                        {project ? project.name : "프로젝트 없음"}
                      </span>
                    </div>
                  </div>

                  <span aria-hidden className={goalIconPreviewClassName}>
                    <AppIcon icon={goalIcons[goal.icon]} size="md" />
                  </span>

                  <div>
                    <FormLabel label="목표 이름" />
                    <div className={`${valueBoxClassName} text-[var(--color-text)]`}>
                      {goal.title}
                    </div>
                  </div>

                  <div>
                    <FormLabel label="목표 설명" />
                    <div
                      className={`${valueBoxClassName} min-h-28 ${goal.description ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"}`}
                    >
                      {goal.description || "목표 설명이 없습니다."}
                    </div>
                  </div>

                  <div>
                    <FormLabel label="담당자" />
                    {assignee ? (
                      <ProfileSummary
                        name={assignee.name}
                        role={assignee.role}
                        className="border-transparent!"
                      />
                    ) : (
                      <div className={`${drawerFieldClassName} text-[var(--color-text-secondary)]`}>
                        담당자가 없습니다.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-body !font-semibold text-[var(--color-text)]">
                      목표 상태
                    </span>
                    <span className="text-body inline-flex items-center gap-1.5 text-[var(--color-text)]">
                      <GoalStatusIcon
                        status={goal.status}
                        size={16}
                        className={statusIconClassName[goal.status]}
                      />
                      {getGoalStatusLabel(goal.status)}
                    </span>
                  </div>

                  <div>
                    <FormLabel label="목표 기간" />
                    <div className={periodFieldClassName}>
                      <AppIcon
                        icon={Calendar}
                        size="md"
                        className="shrink-0 text-[var(--color-text-secondary)]"
                      />
                      <span className="text-body min-w-0 text-[var(--color-text)]">
                        {periodText || "기간 없음"}
                      </span>
                      {periodLinked ? (
                        <span className={periodLinkClassName}>
                          <AppIcon icon={Link2} size="sm" />
                          프로젝트 기간 연동
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <FormLabel label="목표 태그" />
                    <div className="min-w-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-field)]">
                      <div
                        className={`flex min-w-0 flex-wrap items-center gap-1.5 py-3 ${fieldPaddingClassName}`}
                      >
                        {goal.tags.length > 0 ? (
                          goal.tags.map((tag) => <GoalTag key={tag} tag={tag} />)
                        ) : (
                          <p className="text-caption text-[var(--color-text-muted)]">
                            설정된 태그가 없습니다.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </Drawer.Body>

            <Drawer.Footer>
              <SecondaryButton
                size="modal"
                onClick={onClose}
                className="min-w-[80px] justify-center"
              >
                닫기
              </SecondaryButton>
            </Drawer.Footer>
          </div>
        )}
      </Drawer>

      <LinkedProjectInfoModal
        isOpen={isProjectInfoOpen}
        onClose={() => setIsProjectInfoOpen(false)}
        project={project}
      />
    </>
  );
}

/**
 * GoalDetailDrawer
 *
 * 목표 카드에서 연 상세 드로어입니다.
 * 넓은 화면에서는 드로어 너비만큼 목록이 줄고, 닫으면 목록으로 돌아갑니다.
 *
 * @param props - GoalDetailDrawer 컴포넌트 Props
 * @param props.goalId - 보여줄 목표 번호. 없으면 닫힌 상태
 * @param props.projects - 연결 프로젝트 이름에 쓰는 프로젝트
 * @param props.onClose - 드로어를 닫을 때 실행되는 함수
 */
export default function GoalDetailDrawer({ goalId, projects, onClose }: GoalDetailDrawerProps) {
  const isOpen = goalId != null;
  const [shownGoalId, setShownGoalId] = useState(goalId);
  const [isPresent, setIsPresent] = useState(isOpen);
  const [phase, setPhase] = useState<"enter" | "open" | "leave">(isOpen ? "enter" : "leave");

  if (goalId != null && goalId !== shownGoalId) {
    setShownGoalId(goalId);
  }

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

  if (!isPresent || shownGoalId == null) {
    return null;
  }

  return (
    <GoalDetailDrawerPanel
      isEntered={phase === "open"}
      goalId={shownGoalId}
      projects={projects}
      onClose={onClose}
    />
  );
}
