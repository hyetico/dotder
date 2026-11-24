"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import BottomAppBar from "@/components/layout/pages/CreatePage/BottomAppBar";
import { formPaneClassName } from "@/components/layout/pages/CreatePage/formSpacing";
import PageHeading from "@/components/layout/pages/Page/PageHeading";
import Badge from "@/components/ui/badge/Badge";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import { fieldPaddingClassName } from "@/components/ui/fieldControl";
import FieldNotice from "@/components/ui/FieldNotice";
import {
  iconSize,
  AppIcon,
  CalendarDays,
  CalendarRange,
  Check,
  ListTodo,
  Folder,
  Info,
  Lock,
  RefreshCw,
  Pencil,
  X,
} from "@/components/ui/icon";
import IconTitle from "@/components/ui/IconTitle";
import InfoTooltip, { type InfoTooltipItem } from "@/components/ui/InfoTooltip";
import Textarea from "@/components/ui/input/Textarea";
import ProfileSummary from "@/components/ui/ProfileSummary";
import StatusChoiceButton from "@/components/ui/StatusChoiceButton";
import LineTabMenu from "@/components/ui/tab/LineTabMenu";

import GoalBadge from "@/features/goals/components/GoalBadge";
import FormTitlePreviewFrame from "@/features/goals/components/GoalForm/FormTitlePreviewFrame";
import GoalTitlePreview from "@/features/goals/components/GoalForm/GoalTitlePreview";
import GoalStatusBadge from "@/features/goals/components/GoalStatusBadge";
import GoalStatusIcon from "@/features/goals/components/GoalStatusIcon";
import GoalTag from "@/features/goals/components/GoalTag";
import GoalPreviewModal from "@/features/goals/modals/GoalPreviewModal";
import LinkedProjectInfoModal from "@/features/goals/modals/LinkedProjectInfoModal";
import { createGoalSchema, type GoalFormData } from "@/features/goals/schemas/goalSchema";
import { GOAL_STATUSES, type GoalStatus } from "@/features/goals/types/goal";
import { getTodayDateValue } from "@/features/goals/utils/goalDates";
import {
  getGoalStatusLabel,
  getGoalStatusMetricColors,
  isGoalDelayed,
} from "@/features/goals/utils/goalUtils";
import {
  getProjectAccentColor,
  PROJECT_COLOR_OPTIONS,
} from "@/features/projects/utils/projectColors";
import { isProjectDelayed } from "@/features/projects/utils/projectUtils";

import { currentUser } from "@/lib/mock/users";

import type { ProjectStatus } from "@/features/projects/types/project";

const noProjectGuideItems: InfoTooltipItem[] = [
  {
    label: "프로젝트 없음",
    description:
      "등록된 프로젝트가 없습니다. 프로젝트를 추가하면 목표를 그 프로젝트에 연결할 수 있습니다.",
  },
  {
    label: "프로젝트 추가",
    description: "프로젝트 추가하러가기를 누르면 새 프로젝트를 만들 수 있습니다.",
  },
  {
    label: "선택 사항",
    description: "프로젝트 설정은 필수가 아닙니다. 프로젝트 없이도 목표를 만들 수 있습니다.",
  },
];

const projectSettingGuideItems: InfoTooltipItem[] = [
  {
    label: "프로젝트 연결",
    description:
      "설정한 프로젝트로 목표가 만들어집니다. 그 프로젝트의 기간과 태그를 사용할 수 있습니다.",
  },
  {
    label: "선택 사항",
    description: "프로젝트를 설정하지 않아도 목표를 만들 수 있습니다.",
  },
];

const GOAL_TAG_LIMIT = 2;

const goalTagGuideItems: InfoTooltipItem[] = [
  {
    label: "프로젝트 선택",
    description: "프로젝트가 선택된 상태에서만 그 프로젝트의 태그가 표시됩니다.",
  },
  {
    label: "프로젝트 태그",
    description: "표시되는 태그는 해당 프로젝트를 추가할 때 설정한 태그입니다.",
  },
  {
    label: "선택 개수",
    description: "태그는 2개까지 선택할 수 있습니다.",
  },
];

type GoalProjectSummary = {
  id: number;
  name: string;
  description: string;
  tags: string[];
  startDate: string;
  endDate: string;
  color: string | null;
  isMain: boolean;
  status: ProjectStatus;
  teamId: number | null;
  isPersonal: boolean;
  creatorId: number;
};

type GoalFormProps = {
  project: GoalProjectSummary | null;
  hasProjects: boolean;
  onConfigureProject?: () => void;
  onClearProject: () => void;
  defaultValues?: Partial<GoalFormData>;
  showDelayedPreview?: boolean;
  submitLabel?: string;
  isSubmitting?: boolean;
  formId?: string;
  showActions?: boolean;
  showActionBar?: boolean;
  showTitlePreview?: boolean;
  pageLayout?: "plain" | "split";
  fillViewport?: boolean;
  pageTitle?: string;
  pageDescription?: string;
  onSubmit: (data: GoalFormData) => void;
  onCancel: () => void;
};

export const goalFormDomId = "goal-form";

const defaultFormValues: GoalFormData = {
  title: "",
  description: "",
  color: null,
  startDate: "",
  endDate: "",
  status: "NOT_STARTED",
  tags: [],
};

const goalStatusChoices: GoalStatus[] = ["NOT_STARTED", "IN_PROGRESS"];

const tooltipWidthClassName = "max-w-[480px]";

const guideIconProps = {
  size: iconSize.sm,
} as const;

/**
 * GuideIcon
 *
 * 안내 항목 옆에 강조색 아이콘을 놓습니다.
 *
 * @param props - GuideIcon 컴포넌트 Props
 * @param props.color - 아이콘 색
 * @param props.children - 표시할 아이콘
 */
function GuideIcon({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center"
      style={{ color }}
    >
      {children}
    </span>
  );
}

/**
 * getGoalStatusGuideItems
 *
 * 목표 상태 안내에 보여줄 항목을 만듭니다.
 *
 * @param status - 현재 선택된 목표 상태
 * @returns 상태 선택과 기간 종료 후 동작 안내
 */
function getGoalStatusGuideItems(status: GoalStatus): InfoTooltipItem[] {
  const statusColor = (value: GoalStatus, delayed = false) =>
    getGoalStatusMetricColors(value, { delayed }).progress;

  return [
    {
      label: "미시작",
      description: "아직 시작하지 않은 목표입니다.",
      current: status === "NOT_STARTED",
      icon: (
        <GuideIcon color={statusColor("NOT_STARTED")}>
          <GoalStatusIcon status="NOT_STARTED" {...guideIconProps} />
        </GuideIcon>
      ),
    },
    {
      label: "진행 중",
      description: "진행 중으로 만들면 이후 미시작으로 되돌릴 수 없습니다.",
      current: status === "IN_PROGRESS",
      icon: (
        <GuideIcon color={statusColor("IN_PROGRESS")}>
          <GoalStatusIcon status="IN_PROGRESS" {...guideIconProps} />
        </GuideIcon>
      ),
    },
    {
      label: "완료",
      description: "목표 기간이 끝나면 완료로 설정됩니다.",
      current: status === "COMPLETED",
      icon: (
        <GuideIcon color={statusColor("COMPLETED")}>
          <GoalStatusIcon status="COMPLETED" {...guideIconProps} />
        </GuideIcon>
      ),
    },
    {
      label: "지연",
      description:
        "기간 안에 완료되지 않은 태스크는 지연으로 바뀝니다. 계속 사용하려면 프로젝트 기간을 변경해야 합니다.",
    },
  ];
}

/**
 * getGoalPeriodGuideItems
 *
 * 목표 기간 안내에 보여줄 항목을 만듭니다.
 *
 * @param color - 안내 아이콘에 쓸 목표 색
 * @param linked - 프로젝트 기간을 따르고 있는지 여부
 * @returns 프로젝트 기간 연동과 종료 후 동작 안내
 */
function getGoalPeriodGuideItems(color: string, linked: boolean): InfoTooltipItem[] {
  if (!linked) {
    return [
      {
        label: "시작일",
        description: "프로젝트를 설정하지 않으면 시작일은 오늘부터 적용됩니다.",
        icon: (
          <GuideIcon color={color}>
            <CalendarDays {...guideIconProps} />
          </GuideIcon>
        ),
      },
      {
        label: "마감일",
        description: "마감일은 선택한 시작일부터 선택할 수 있습니다.",
        icon: (
          <GuideIcon color={color}>
            <CalendarRange {...guideIconProps} />
          </GuideIcon>
        ),
      },
    ];
  }

  return [
    {
      label: "자동 적용",
      description: "프로젝트를 연결하면 목표 기간은 그 프로젝트의 시작일과 마감일을 따릅니다.",
      current: linked,
      icon: (
        <GuideIcon color={color}>
          <CalendarRange {...guideIconProps} />
        </GuideIcon>
      ),
    },
    {
      label: "기간 반영",
      description: "연결된 프로젝트의 기간이 변경되면 목표 기간도 자동 반영됩니다.",
      icon: (
        <GuideIcon color={color}>
          <CalendarDays {...guideIconProps} />
        </GuideIcon>
      ),
    },
  ];
}

const goalStatusAutoRules = [
  {
    condition: "태스크 없음 / 모두 미시작",
    status: "NOT_STARTED",
  },
  {
    condition: "진행 중이 있거나 일부 완료",
    status: "IN_PROGRESS",
  },
  {
    condition: "1개 이상 연결 · 모두 완료",
    status: "COMPLETED",
  },
] as const;

/**
 * GoalStatusAutoCard
 *
 * 새 목표의 진행 상태가 연결된 태스크에 따라 바뀌는 방식을 보여 줍니다.
 */
function GoalStatusAutoCard() {
  return (
    <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-[10px] md:p-3 xl:p-4">
      <div className="flex items-start gap-2">
        <AppIcon icon={RefreshCw} size="sm" className="mt-0.5 shrink-0 text-[var(--color-text)]" />

        <div className="min-w-0">
          <h3 className="text-body font-medium text-[var(--color-text)]">자동 계산</h3>

          <p className="text-caption mt-0.5 text-[var(--color-text-secondary)]">
            연결된 태스크의 상태에 따라 자동으로 변경됩니다.
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-[var(--radius-sm)] bg-[var(--color-hover-soft)] px-3 py-2.5">
        <span className="text-caption text-[var(--color-text-secondary)]">생성 시</span>

        <GoalStatusBadge status="NOT_STARTED" />

        <Badge className="!h-6 bg-[var(--color-hover)] text-[var(--color-text-secondary)]">
          <AppIcon icon={ListTodo} size="xs" className="max-md:hidden" />
          <span className="md:hidden">태스크 없음</span>
          <span className="max-md:hidden">없음</span>
        </Badge>
      </div>

      <ol className="mt-3 mb-3 flex flex-col gap-2">
        {goalStatusAutoRules.map((rule, index) => (
          <li key={rule.condition} className="flex min-w-0 items-center gap-2">
            <span
              aria-hidden
              className="text-caption flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-hover)] font-medium text-[var(--color-text-secondary)]"
            >
              {index + 1}
            </span>

            <span className="text-caption min-w-0 flex-1 text-[var(--color-text-secondary)]">
              {rule.condition}
            </span>

            <GoalStatusBadge status={rule.status} />
          </li>
        ))}
      </ol>

      <div className="-mx-[10px] border-t border-[var(--color-border)] px-[10px] pt-3 md:-mx-3 md:px-3 xl:-mx-4 xl:px-4">
        <FieldNotice className="mt-0!">
          마감 초과 여부는 적용된 마감일을 기준으로 별도 표시됩니다.
        </FieldNotice>
      </div>
    </section>
  );
}

function FormLabel({
  htmlFor,
  label,
  required = false,
  counter,
  accessory,
  guideItems,
  action,
}: {
  htmlFor?: string;
  label: string;
  required?: boolean;
  counter?: string;
  accessory?: ReactNode;
  guideItems?: InfoTooltipItem[];
  action?: ReactNode;
}) {
  const labelAccessory = guideItems ? (
    <InfoTooltip title={label} items={guideItems} maxWidthClassName={tooltipWidthClassName} />
  ) : (
    accessory
  );

  return (
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1">
        <label htmlFor={htmlFor} className="text-body !font-semibold text-[var(--color-text)]">
          {label}

          {required ? <span className="ml-0.5 text-[var(--color-field-error)]">*</span> : null}
        </label>

        {labelAccessory}
      </div>

      {action ? (
        <div className="shrink-0">{action}</div>
      ) : counter ? (
        <span className="text-caption shrink-0 text-[var(--color-text-muted)]">{counter}</span>
      ) : null}
    </div>
  );
}

const actionBarButtonClassName = `
  min-w-0!
  flex-1!
  basis-0!
  shrink!
  justify-center

  md:w-auto
  md:flex-none!
  md:basis-auto!
  md:shrink-0!
`;

/**
 * FormPageTitle
 *
 * 나뉜 폼 위에 화면 전체 제목과 설명을 표시합니다.
 *
 * @param props - FormPageTitle 컴포넌트 Props
 * @param props.title - 화면 제목
 * @param props.description - 제목 아래 설명
 */
function FormPageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <PageHeading
      variant="form"
      title={title}
      description={description}
      className="hidden shrink-0 pt-6 pb-4 md:block"
    />
  );
}

/**
 * FormSectionIntro
 *
 * 나뉜 폼에서 구역 제목과 설명을 보여 줍니다.
 * 좁은 화면에서는 제목을 더 크게 두고, 넓은 화면 설명과 다른 문구를 쓸 수 있습니다.
 *
 * @param props - FormSectionIntro 컴포넌트 Props
 * @param props.title - 구역 제목
 * @param props.description - 넓은 화면 구역 설명
 * @param props.mobileDescription - 좁은 화면 구역 설명. 없으면 description을 씁니다
 */
function FormSectionIntro({
  title,
  description,
  mobileDescription,
}: {
  title: string;
  description: string;
  mobileDescription?: string;
}) {
  return (
    <div className="shrink-0">
      <h2>
        <span className="text-page-title text-[var(--color-text)] md:hidden">{title}</span>

        <span className="text-card-title hidden text-[var(--color-text)] md:inline">{title}</span>
      </h2>

      <p className="text-caption mt-1 text-[var(--color-text-secondary)] md:mt-0.5">
        <span className="md:hidden">{mobileDescription ?? description}</span>

        <span className="hidden md:inline">{description}</span>
      </p>
    </div>
  );
}

/**
 * GoalColorSwatch
 *
 * 목표 색상 칩을 그리고, 선택된 칩에는 검정 테두리와 오른쪽 위 체크를 둡니다.
 *
 * @param props - GoalColorSwatch 컴포넌트 Props
 * @param props.selected - 이 색이 선택된 상태인지 여부
 * @param props.label - 버튼 접근 이름
 * @param props.onClick - 색을 고를 때 실행되는 함수
 * @param props.children - 안에 둘 색상 뱃지
 */
function GoalColorSwatch({
  selected,
  label,
  onClick,
  children,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className="relative inline-flex w-fit shrink-0 p-0 transition-transform hover:scale-105"
    >
      <span
        className={`relative inline-flex rounded-[var(--radius-sm)] ${
          selected ? "ring-2 ring-[var(--color-primary)]" : ""
        } `}
      >
        {children}

        {selected ? (
          <span
            aria-hidden
            className="pointer-events-none absolute -top-1 -right-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)] text-[var(--color-text-inverse)] ring-2 ring-white"
          >
            <Check size={10} strokeWidth={3} />
          </span>
        ) : null}
      </span>
    </button>
  );
}

/**
 * scrollToGoalFormError
 *
 * 목표 폼에서 처음 나온 입력 오류가 화면에 보이게 스크롤합니다.
 *
 * @param formId - 스크롤할 폼 id
 */
function scrollToGoalFormError(formId?: string) {
  window.setTimeout(() => {
    document
      .getElementById(formId ?? goalFormDomId)
      ?.querySelector("[data-field-error]")
      ?.scrollIntoView({
        block: "center",
      });
  }, 0);
}

export default function GoalForm({
  project,
  hasProjects,
  onConfigureProject,
  onClearProject,
  defaultValues,
  showDelayedPreview = true,
  submitLabel = "목표 생성하기",
  isSubmitting = false,
  formId,
  showActions = true,
  showActionBar = false,
  showTitlePreview = true,
  pageLayout = "plain",
  fillViewport = true,
  pageTitle,
  pageDescription,
  onSubmit,
  onCancel,
}: GoalFormProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [isProjectInfoOpen, setIsProjectInfoOpen] = useState(false);

  const [mobileSection, setMobileSection] = useState<"basic" | "settings">("basic");

  const splitLayout = pageLayout === "split";

  const projectPeriod =
    project?.startDate && project.endDate
      ? {
          startDate: project.startDate,
          endDate: project.endDate,
        }
      : undefined;

  const projectStartDate = projectPeriod?.startDate;

  const projectEndDate = projectPeriod?.endDate;

  // projectPeriod는 렌더마다 새 객체라서, 날짜 값이 바뀔 때만 스키마를 다시 만든다.
  const schema = useMemo(
    () =>
      createGoalSchema(
        projectStartDate && projectEndDate
          ? { startDate: projectStartDate, endDate: projectEndDate }
          : undefined,
      ),
    [projectStartDate, projectEndDate],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultFormValues,
      ...defaultValues,
    },
  });

  const titleValue = watch("title") ?? "";

  const descriptionValue = watch("description") ?? "";

  const colorValue = watch("color") || null;

  const statusValue = watch("status") ?? "NOT_STARTED";

  const startDateValue = watch("startDate") ?? "";

  const endDateValue = watch("endDate") ?? "";

  const periodLocked = Boolean(projectPeriod);

  useEffect(() => {
    if (!project?.startDate || !project.endDate) {
      return;
    }

    if (startDateValue !== project.startDate) {
      setValue("startDate", project.startDate, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (endDateValue !== project.endDate) {
      setValue("endDate", project.endDate, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  }, [project?.startDate, project?.endDate, startDateValue, endDateValue, setValue]);

  useEffect(() => {
    if (project?.startDate && project.endDate) {
      return;
    }

    const today = getTodayDateValue();

    const nextStart = !startDateValue || startDateValue < today ? today : startDateValue;

    if (nextStart !== startDateValue) {
      setValue("startDate", nextStart, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (endDateValue && endDateValue < nextStart) {
      setValue("endDate", "", {
        shouldDirty: true,
      });
      clearErrors("endDate");
    }
  }, [project?.startDate, project?.endDate, startDateValue, endDateValue, setValue, clearErrors]);

  const todayDate = getTodayDateValue();

  const startDateMin = projectPeriod?.startDate ?? todayDate;

  const startDateMax = projectPeriod
    ? endDateValue && endDateValue < projectPeriod.endDate
      ? endDateValue
      : projectPeriod.endDate
    : undefined;

  const endDateMin = projectPeriod
    ? startDateValue && startDateValue > projectPeriod.startDate
      ? startDateValue
      : projectPeriod.startDate
    : startDateValue || todayDate;

  const endDateMax = projectPeriod?.endDate;

  const watchedTags = watch("tags");

  const selectedTags = useMemo(() => watchedTags ?? [], [watchedTags]);

  const projectTags = project?.tags ?? [];

  const projectTagKey = projectTags.join("\u0000");

  useEffect(() => {
    const allowed = new Set(projectTagKey ? projectTagKey.split("\u0000") : []);

    const nextTags = selectedTags.filter((tag) => allowed.has(tag));

    if (nextTags.length === selectedTags.length) {
      return;
    }

    setValue("tags", nextTags, {
      shouldValidate: true,
    });
  }, [projectTagKey, selectedTags, setValue]);

  const isTagLimitReached = selectedTags.length >= GOAL_TAG_LIMIT;

  const toggleTag = (tag: string) => {
    const isSelected = selectedTags.includes(tag);

    if (!isSelected && isTagLimitReached) {
      return;
    }

    const nextTags = isSelected
      ? selectedTags.filter((item) => item !== tag)
      : [...selectedTags, tag];

    setValue("tags", nextTags, {
      shouldValidate: true,
    });
  };

  const periodField = (
    <div className="shrink-0">
      <FormLabel
        label="목표 기간"
        required
        guideItems={getGoalPeriodGuideItems(getProjectAccentColor(colorValue), periodLocked)}
        action={
          periodLocked ? (
            <span className="text-caption inline-flex shrink-0 items-center gap-1 whitespace-nowrap text-[var(--color-text-muted)]">
              <AppIcon icon={Lock} size="xs" />
              프로젝트 기간 자동 적용
            </span>
          ) : null
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="min-w-0">
          <p className="text-caption mb-1.5 text-[var(--color-text-muted)]">시작일</p>

          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={field.onChange}
                min={startDateMin}
                max={startDateMax}
                readOnly={periodLocked}
                invalid={Boolean(errors.startDate)}
                title="시작일"
              />
            )}
          />

          {errors.startDate ? (
            <p data-field-error className="text-caption mt-1.5 text-[var(--color-field-error)]">
              {errors.startDate.message}
            </p>
          ) : null}
        </div>

        <div className="min-w-0">
          <p className="text-caption mb-1.5 text-[var(--color-text-muted)]">마감일</p>

          <Controller
            name="endDate"
            control={control}
            render={({ field }) => (
              <DatePicker
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);

                  if (value) {
                    clearErrors("endDate");
                  }
                }}
                min={endDateMin}
                max={endDateMax}
                readOnly={periodLocked}
                invalid={Boolean(errors.endDate)}
                title="마감일"
              />
            )}
          />

          {errors.endDate ? (
            <p data-field-error className="text-caption mt-1.5 text-[var(--color-field-error)]">
              {errors.endDate.message}
            </p>
          ) : null}
        </div>
      </div>

      {periodLocked ? (
        <FieldNotice>연결된 프로젝트의 기간이 변경되면 목표 기간도 자동 반영됩니다.</FieldNotice>
      ) : splitLayout && !project ? (
        <FieldNotice>프로젝트를 연결하지 않으면 목표 기간을 직접 입력합니다.</FieldNotice>
      ) : null}
    </div>
  );

  const settingsFields = (
    <>
      <div className="shrink-0">
        {splitLayout ? (
          <>
            <input type="hidden" {...register("status")} />
            <FormLabel label="목표 진행 상태" />
            <GoalStatusAutoCard />
          </>
        ) : (
          <>
            <FormLabel
              label="목표 상태"
              required
              guideItems={getGoalStatusGuideItems(statusValue)}
            />

            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="grid min-w-0 grid-cols-2 gap-3">
                  {(field.value === "COMPLETED" ? GOAL_STATUSES : goalStatusChoices).map(
                    (status) => {
                      const isSelected = field.value === status;

                      const statusLabel = getGoalStatusLabel(status as GoalStatus);

                      return (
                        <StatusChoiceButton
                          key={status}
                          statusId={status}
                          selected={isSelected}
                          onClick={() => field.onChange(status)}
                          icon={<GoalStatusIcon status={status} size={16} />}
                        >
                          {statusLabel}
                        </StatusChoiceButton>
                      );
                    },
                  )}
                </div>
              )}
            />

            {statusValue === "COMPLETED" ? null : (
              <FieldNotice>
                {statusValue === "IN_PROGRESS"
                  ? "진행 중으로 만들면 이후 미시작 상태로 되돌릴 수 없습니다."
                  : "완료는 목표를 만든 뒤에 설정할 수 있습니다."}
              </FieldNotice>
            )}
          </>
        )}
      </div>

      <div className="shrink-0">
        {hasProjects ? (
          <>
            <FormLabel
              label={splitLayout ? "연결 프로젝트" : "프로젝트 설정"}
              accessory={
                splitLayout ? (
                  <button
                    type="button"
                    aria-label="연결 프로젝트 정보"
                    aria-haspopup="dialog"
                    aria-expanded={isProjectInfoOpen}
                    onClick={() => setIsProjectInfoOpen(true)}
                    className="inline-flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-full p-0 leading-none text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]"
                  >
                    <AppIcon icon={Info} size="sm" />
                  </button>
                ) : (
                  <InfoTooltip
                    title="프로젝트 설정"
                    items={projectSettingGuideItems}
                    maxWidthClassName="max-w-[560px]"
                  />
                )
              }
            />

            <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-field-border)] bg-[var(--color-field)]">
              <div className={`flex min-w-0 items-center gap-3 py-3 ${fieldPaddingClassName} `}>
                <IconTitle
                  size="md"
                  className="min-w-0 flex-1"
                  icon={
                    project ? (
                      <AppIcon
                        icon={Folder}
                        size="sm"
                        className="shrink-0 text-[var(--color-text-secondary)]"
                      />
                    ) : null
                  }
                >
                  <span
                    className={`min-w-0 flex-1 truncate font-medium ${
                      project ? "text-[var(--color-text)]" : "text-[var(--color-text-secondary)]"
                    } `}
                  >
                    {project
                      ? project.name
                      : splitLayout
                        ? "없음"
                        : "프로젝트를 설정하지 않았습니다"}
                  </span>
                </IconTitle>

                {project || onConfigureProject ? (
                  <SecondaryButton
                    onClick={() => {
                      if (project) {
                        onClearProject();
                        return;
                      }

                      onConfigureProject?.();
                    }}
                    hideIconOnMobile
                    icon={
                      splitLayout ? undefined : project ? (
                        <AppIcon icon={X} size="sm" />
                      ) : (
                        <AppIcon icon={Pencil} size="sm" />
                      )
                    }
                  >
                    {project ? "해제하기" : "설정하기"}
                  </SecondaryButton>
                ) : null}
              </div>
            </div>
          </>
        ) : (
          <>
            <FormLabel
              label={splitLayout ? "연결 프로젝트" : "프로젝트 설정"}
              accessory={
                <InfoTooltip
                  title={splitLayout ? "연결 프로젝트" : "프로젝트 설정"}
                  items={noProjectGuideItems}
                  maxWidthClassName="max-w-[560px]"
                />
              }
            />

            <div
              className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-hover-soft)] py-3.5 ${fieldPaddingClassName} text-body text-[var(--color-text-secondary)]`}
            >
              <span>프로젝트가 없습니다.</span>

              <Link
                href="/projects/new"
                className="font-medium text-[var(--color-primary)] underline-offset-2 hover:underline"
              >
                프로젝트 추가하러가기
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );

  const formPanelClassName = `
    flex
    flex-col
    gap-4
  `;

  const splitCardClassName = `
    flex
    min-w-0
    flex-col

    rounded-[var(--radius-lg)]

    border
    border-[var(--color-border)]

    bg-[var(--color-surface)]

    px-3
    py-3

    md:h-full
    md:min-h-0
    md:overflow-y-auto
    md:px-5
    md:py-6

    [scrollbar-width:none]
    [-ms-overflow-style:none]
    [&::-webkit-scrollbar]:hidden
  `;

  const splitFillsViewport = splitLayout && fillViewport;
  const goalFormShellClassName = "flex min-h-0 min-w-0 flex-1 flex-col px-[var(--page-padding-x)]";
  const goalFormFrameClassName = "page-frame flex min-h-0 min-w-0 flex-1 flex-col";

  return (
    <div
      className={
        splitFillsViewport
          ? `flex min-h-full flex-1 flex-col md:min-h-0`
          : fillViewport
            ? `flex flex-col md:min-h-0 md:flex-1`
            : "flex flex-col"
      }
    >
      <form
        id={formId ?? goalFormDomId}
        onSubmit={handleSubmit(onSubmit, (fieldErrors) => {
          const basicInvalid = Boolean(
            fieldErrors.title ||
            fieldErrors.description ||
            fieldErrors.color ||
            fieldErrors.startDate ||
            fieldErrors.endDate,
          );

          const settingsInvalid = Boolean(fieldErrors.status || fieldErrors.tags);

          if (splitLayout) {
            if (settingsInvalid && !basicInvalid) {
              setMobileSection("settings");
            } else if (basicInvalid) {
              setMobileSection("basic");
            }
          }

          if (basicInvalid || settingsInvalid) {
            scrollToGoalFormError(formId);
          }
        })}
        className={` ${splitLayout ? "max-md:[--button-height:36px]" : ""} ${
          splitFillsViewport
            ? `flex flex-1 flex-col md:min-h-0 md:overflow-hidden`
            : fillViewport
              ? `flex flex-col md:min-h-0 md:flex-1 md:overflow-hidden`
              : "flex flex-col"
        } `}
      >
        {splitLayout ? (
          <div className="sticky top-[var(--header-height)] z-20 bg-[var(--color-page)] px-[var(--page-padding-x)] pt-2 md:hidden">
            <LineTabMenu
              ariaLabel="목표 관리 구역"
              value={mobileSection}
              items={[
                {
                  id: "basic",
                  label: "기본 정보",
                },
                {
                  id: "settings",
                  label: "목표 설정",
                },
              ]}
              onChange={setMobileSection}
            />
          </div>
        ) : null}

        <div className={splitLayout ? goalFormShellClassName : "contents"}>
          <div className={splitLayout ? goalFormFrameClassName : "contents"}>
            {splitLayout && pageTitle ? (
              <FormPageTitle title={pageTitle} description={pageDescription} />
            ) : null}

            {showTitlePreview && !splitLayout ? (
              <FormTitlePreviewFrame>
                <GoalTitlePreview
                  title={titleValue}
                  description={descriptionValue}
                  color={colorValue}
                  status={statusValue}
                  projectDelayed={showDelayedPreview && project ? isProjectDelayed(project) : false}
                />
              </FormTitlePreviewFrame>
            ) : null}

            <div
              className={
                splitFillsViewport
                  ? `relative grid min-h-full flex-1 grid-cols-1 grid-rows-[minmax(min-content,1fr)] gap-4 pt-3 pb-4 md:min-h-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)] md:gap-5 md:pt-0 md:pb-5`
                  : fillViewport
                    ? `relative grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]`
                    : `relative grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]`
              }
            >
              {splitLayout ? null : (
                <div
                  aria-hidden
                  className="pointer-events-none absolute top-6 bottom-6 left-1/2 hidden w-px -translate-x-1/2 bg-[var(--color-border)] md:block"
                />
              )}

              <div
                className={` ${splitLayout ? splitCardClassName : formPaneClassName} ${
                  splitLayout ? "" : "md:pr-5"
                } ${splitLayout && mobileSection === "settings" ? "max-md:hidden" : ""} `}
              >
                <div className={formPanelClassName}>
                  {splitLayout ? (
                    <FormSectionIntro
                      title="기본 정보"
                      description="목표의 기본 정보를 설정합니다."
                      mobileDescription="목표의 이름과 기간을 설정해주세요."
                    />
                  ) : null}

                  <div className="shrink-0">
                    <FormLabel label="목표 색상" />

                    <Controller
                      name="color"
                      control={control}
                      render={({ field }) => {
                        const isNoneSelected = !field.value;

                        return (
                          <div className="flex flex-wrap items-center gap-3">
                            {splitLayout ? (
                              <GoalColorSwatch
                                selected={isNoneSelected}
                                label="색상 없음"
                                onClick={() => field.onChange(null)}
                              >
                                <GoalBadge color={null} />
                              </GoalColorSwatch>
                            ) : (
                              <button
                                type="button"
                                aria-label="색상 없음"
                                aria-pressed={isNoneSelected}
                                onClick={() => field.onChange(null)}
                                className={`rounded-[var(--radius-sm)] transition-transform hover:scale-105 ${
                                  isNoneSelected
                                    ? "ring-2 ring-[var(--color-primary)] ring-offset-2"
                                    : ""
                                } `}
                              >
                                <GoalBadge color={null} />
                              </button>
                            )}

                            {PROJECT_COLOR_OPTIONS.map((option) => {
                              const isSelected = field.value === option.value;

                              return splitLayout ? (
                                <GoalColorSwatch
                                  key={option.value}
                                  selected={isSelected}
                                  label={`${option.label} 색상 선택`}
                                  onClick={() => field.onChange(isSelected ? null : option.value)}
                                >
                                  <GoalBadge color={option.value} />
                                </GoalColorSwatch>
                              ) : (
                                <button
                                  key={option.value}
                                  type="button"
                                  aria-label={`${option.label} 색상 선택`}
                                  aria-pressed={isSelected}
                                  onClick={() => field.onChange(isSelected ? null : option.value)}
                                  className={`rounded-[var(--radius-sm)] transition-transform hover:scale-105 ${
                                    isSelected
                                      ? "ring-2 ring-[var(--color-primary)] ring-offset-2"
                                      : ""
                                  } `}
                                >
                                  <GoalBadge color={option.value} />
                                </button>
                              );
                            })}
                          </div>
                        );
                      }}
                    />
                  </div>

                  <div className="shrink-0">
                    <FormLabel
                      htmlFor="goal-title"
                      label="목표 이름"
                      required
                      counter={`${titleValue.length}/50`}
                    />

                    <Textarea
                      id="goal-title"
                      {...register("title")}
                      maxLength={50}
                      rows={splitLayout ? 4 : 3}
                      aria-invalid={Boolean(errors.title) || undefined}
                      placeholder="목표 이름을 입력하세요"
                      className={splitLayout ? "h-32" : "h-24"}
                    />

                    {errors.title ? (
                      <p
                        data-field-error
                        className="text-caption mt-1.5 text-[var(--color-field-error)]"
                      >
                        {errors.title.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0">
                    <FormLabel
                      htmlFor="goal-description"
                      label="목표 설명"
                      counter={`${descriptionValue.length}/100`}
                    />

                    <Textarea
                      id="goal-description"
                      {...register("description")}
                      maxLength={100}
                      rows={splitLayout ? 4 : 3}
                      aria-invalid={Boolean(errors.description) || undefined}
                      placeholder="목표에 대한 설명을 입력하세요"
                      className={splitLayout ? "h-32" : "h-24"}
                    />

                    {errors.description ? (
                      <p
                        data-field-error
                        className="text-caption mt-1.5 text-[var(--color-field-error)]"
                      >
                        {errors.description.message}
                      </p>
                    ) : null}
                  </div>

                  {splitLayout ? periodField : settingsFields}
                </div>
              </div>

              <div
                className={` ${splitLayout ? splitCardClassName : formPaneClassName} @container ${
                  splitLayout ? "" : "md:pl-5"
                } ${splitLayout && mobileSection === "basic" ? "max-md:hidden" : ""} `}
              >
                <div className={formPanelClassName}>
                  {splitLayout ? (
                    <FormSectionIntro
                      title="목표 설정"
                      description="연결 프로젝트와 태그를 설정합니다."
                      mobileDescription="연결할 프로젝트와 태그를 설정해주세요."
                    />
                  ) : null}

                  {splitLayout ? settingsFields : periodField}

                  {splitLayout && !project ? null : (
                    <div className="shrink-0">
                      <FormLabel
                        label={splitLayout ? "목표 태그 선택" : "태그 선택"}
                        counter={`${selectedTags.length}/${GOAL_TAG_LIMIT}`}
                        accessory={
                          <InfoTooltip
                            title={splitLayout ? "목표 태그 선택" : "태그 선택"}
                            items={goalTagGuideItems}
                            maxWidthClassName="max-w-[560px]"
                          />
                        }
                      />

                      <div className="min-w-0 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-field-border)] bg-[var(--color-field)]">
                        <div
                          className={`flex min-w-0 flex-wrap items-center gap-1 py-3 ${fieldPaddingClassName} `}
                        >
                          {projectTags.length > 0 ? (
                            projectTags.map((tag) => {
                              const isSelected = selectedTags.includes(tag);

                              const isDisabled = !isSelected && isTagLimitReached;

                              return (
                                <button
                                  key={tag}
                                  type="button"
                                  aria-pressed={isSelected}
                                  disabled={isDisabled}
                                  onClick={() => toggleTag(tag)}
                                  className={`max-w-full min-w-0 ${
                                    isDisabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                                  } `}
                                >
                                  <GoalTag
                                    tag={tag}
                                    className={isSelected || isDisabled ? "" : "opacity-40"}
                                  />
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-caption text-[var(--color-text-muted)]">
                              {project
                                ? "이 프로젝트에 설정된 태그가 없습니다."
                                : hasProjects
                                  ? "프로젝트를 설정하면 태그를 선택할 수 있습니다."
                                  : "프로젝트가 없어 선택할 태그가 없습니다."}
                            </p>
                          )}
                        </div>
                      </div>

                      {splitLayout ? (
                        <FieldNotice>
                          연결 프로젝트의 태그를 최대 2개 선택할 수 있습니다.
                        </FieldNotice>
                      ) : projectTags.length > 0 && isTagLimitReached ? (
                        <FieldNotice>태그는 2개까지만 선택가능합니다.</FieldNotice>
                      ) : null}
                    </div>
                  )}

                  <div
                    className={
                      splitLayout ? "shrink-0" : `grid shrink-0 gap-3 @min-[17.5rem]:grid-cols-2`
                    }
                  >
                    <div>
                      <FormLabel label={splitLayout ? "담당자" : "작성자"} />

                      <ProfileSummary
                        name={currentUser.name}
                        role={currentUser.role}
                        image={currentUser.image}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {showActions ? (
              <div className="mt-3 flex shrink-0 items-center justify-end gap-2.5 md:mt-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="text-body inline-flex h-[var(--button-height-action)] min-w-[96px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--button-px-action)] font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  취소
                </button>

                <PrimaryButton type="submit" size="md" disabled={isSubmitting}>
                  {isSubmitting ? "저장 중..." : submitLabel}
                </PrimaryButton>
              </div>
            ) : null}
          </div>
        </div>
      </form>

      {splitLayout ? (
        <LinkedProjectInfoModal
          isOpen={isProjectInfoOpen}
          onClose={() => setIsProjectInfoOpen(false)}
          project={project}
        />
      ) : null}

      <GoalPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={titleValue}
        description={descriptionValue}
        color={colorValue}
        status={statusValue}
        delayed={
          showDelayedPreview &&
          isGoalDelayed(
            {
              status: statusValue,
            },
            project ? isProjectDelayed(project) : false,
          )
        }
        startDate={startDateValue}
        endDate={endDateValue}
        projectName={project?.name ?? ""}
        projectEmptyLabel={hasProjects ? "프로젝트를 설정하지 않았습니다" : "프로젝트가 없습니다."}
        projectColor={project?.color ?? null}
        projectIsMain={project?.isMain ?? false}
        authorName={currentUser.name}
        tags={selectedTags}
      />

      {showActionBar ? (
        <BottomAppBar>
          <SecondaryButton
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
            className={actionBarButtonClassName}
          >
            취소
          </SecondaryButton>

          <SecondaryButton
            size="md"
            onClick={() => setIsPreviewOpen(true)}
            disabled={isSubmitting}
            className={actionBarButtonClassName}
          >
            미리보기
          </SecondaryButton>

          <PrimaryButton
            type="submit"
            form={formId ?? goalFormDomId}
            size="md"
            disabled={isSubmitting}
            className={actionBarButtonClassName}
          >
            {isSubmitting ? "저장 중..." : submitLabel}
          </PrimaryButton>
        </BottomAppBar>
      ) : null}
    </div>
  );
}
