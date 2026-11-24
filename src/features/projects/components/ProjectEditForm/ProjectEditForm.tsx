"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Control, type FieldErrors } from "react-hook-form";

import BottomAppBar from "@/components/layout/pages/CreatePage/BottomAppBar";
import PageHeading from "@/components/layout/pages/Page/PageHeading";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import FieldNotice from "@/components/ui/FieldNotice";
import { AppIcon, CalendarSync, CircleAlert, CircleCheck, History } from "@/components/ui/icon";
import StatusChoiceButton from "@/components/ui/StatusChoiceButton";
import Toast from "@/components/ui/Toast";

import { useSyncProjectAccent } from "@/features/projects/components/ProjectAccent";
import { EditBasicInfoStep } from "@/features/projects/components/ProjectEditForm/steps/EditBasicInfoStep";
import {
  StatusRadioMark,
  wizardStatusButtonClassName,
} from "@/features/projects/components/ProjectEditForm/steps/EditScheduleStep";
import { EditSettingsStep } from "@/features/projects/components/ProjectEditForm/steps/EditSettingsStep";
import AdminSelect from "@/features/projects/components/ProjectForm/AdminSelect";
import { FieldError, FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import {
  deadlineChangeLabel,
  defaultFormValues,
  projectFormDomId,
  teamOptions,
} from "@/features/projects/constants/projectFormDefaults";
import {
  getProjectPeriodGuideItems,
  getProjectStatusGuideItems,
} from "@/features/projects/constants/projectFormGuides";
import { projectWizardSteps } from "@/features/projects/constants/projectWizardSteps";
import {
  useProjectDeadlineChange,
  type ProjectDeadlineState,
} from "@/features/projects/hooks/useProjectDeadlineChange";
import ChangeProjectDeadlineModal from "@/features/projects/modals/ChangeProjectDeadlineModal";
import {
  createProjectSchema,
  type ProjectFormData,
} from "@/features/projects/schemas/projectSchema";
import { PROJECT_STATUSES, type Project } from "@/features/projects/types/project";
import { getProjectAccentColor } from "@/features/projects/utils/projectColors";
import { scrollToProjectFormError } from "@/features/projects/utils/projectFormUtils";
import {
  parseProjectTeamSelection,
  PROJECT_TEAM_NONE,
} from "@/features/projects/utils/projectTeam";
import {
  getProjectSpanDays,
  getProjectStatusLabel,
  isProjectDelayed,
} from "@/features/projects/utils/projectUtils";

import { getTeamMembers } from "@/lib/mock/teamMembers";
import { currentUser } from "@/lib/mock/users";
import { getProjectDetailPath } from "@/lib/projectRoutes";

type ProjectEditTab = "basic" | "schedule" | "team";

const projectEditTabs: {
  id: ProjectEditTab;
  label: string;
  title: string;
  description: string;
  statusLabel: string;
}[] = [
  {
    id: "basic",
    label: "기본 정보",
    title: "기본 정보",
    description: "프로젝트의 이름과 설명, 컬러와 목표 태그를 수정해요.",
    statusLabel: "기본 정보 수정 중",
  },
  {
    id: "schedule",
    label: "일정 및 상태",
    title: "일정 및 상태",
    description: "프로젝트 상태와 마감일을 확인하고 변경해요.",
    statusLabel: "일정 및 상태 수정 중",
  },
  {
    id: "team",
    label: "설정",
    title: "설정",
    description: "목표 태그와 메인 프로젝트 설정을 변경해요.",
    statusLabel: "설정 수정 중",
  },
];

const editShellClassName =
  "mx-auto flex w-full max-w-[880px] flex-col gap-5 px-[var(--page-padding-x)] pt-3 pb-6 md:pt-5";
const editCardClassName =
  "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:px-6 md:py-5";
const editPanelClassName = "flex flex-col gap-4";
const editDividerClassName = "border-t border-[var(--color-border)] pt-4";
const editFooterClassName = "mt-5 border-t border-[var(--color-border)] pt-4";
const editTabListClassName =
  "flex items-center justify-center gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
const barButtonClassName =
  "min-w-0! flex-1! basis-0! shrink! justify-center md:w-auto md:flex-none! md:basis-auto! md:shrink-0!";

const editTabByStep: Record<number, ProjectEditTab> = {
  1: "basic",
  2: "schedule",
  3: "team",
};

/**
 * getInitialEditTab
 *
 * 주소의 구역 값으로 처음에 열 탭을 정합니다.
 * 마감일 변경으로 들어오면 일정 및 상태 탭을 엽니다.
 *
 * @param section - 주소의 구역 값
 * @returns 처음에 보여줄 탭
 */
function getInitialEditTab(section: "basic" | "settings") {
  return section === "settings" ? "schedule" : "basic";
}

/**
 * getInvalidEditTab
 *
 * 저장에 실패한 입력이 있는 탭을 찾습니다.
 * 기본 정보가 먼저이고, 지연 중이면 일정 및 상태 탭으로 이동합니다.
 *
 * @param errors - 폼 검증 에러
 * @param isDelayed - 마감일이 지나 지연 중인지 여부
 * @returns 보여줄 탭. 에러가 없으면 null
 */
function getInvalidEditTab(errors: FieldErrors<ProjectFormData>, isDelayed: boolean) {
  const step = projectWizardSteps.find((item) => item.fields.some((field) => errors[field]));

  if (step?.id === 1) {
    return editTabByStep[1];
  }

  if (step?.id === 2 || isDelayed) {
    return editTabByStep[2];
  }

  if (step?.id === 3) {
    return editTabByStep[3];
  }

  return null;
}

/**
 * EditSchedulePanel
 *
 * 일정 및 상태 탭입니다. 추가 화면의 상태 카드와 기간 칸을 쓰고,
 * 시작일은 잠근 채 마감일 칸에서 변경 창을 엽니다.
 *
 * @param props - EditSchedulePanel 컴포넌트 Props
 * @param props.control - 폼 컨트롤
 * @param props.errors - 폼 검증 에러
 * @param props.statusValue - 선택한 프로젝트 상태
 * @param props.plannedLocked - 계획 상태로 되돌릴 수 없는지 여부
 * @param props.accentColor - 프로젝트 강조 색
 * @param props.startDateValue - 저장된 시작일
 * @param props.projectId - 수정 중인 프로젝트 id
 * @param props.deadline - 마감일 변경 상태와 동작
 */
function EditSchedulePanel({
  control,
  errors,
  statusValue,
  plannedLocked,
  accentColor,
  startDateValue,
  projectId,
  deadline,
}: {
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  statusValue: ProjectFormData["status"];
  plannedLocked: boolean;
  accentColor: string;
  startDateValue: string;
  projectId: number | undefined;
  deadline: ProjectDeadlineState;
}) {
  const router = useRouter();

  const {
    isDelayed,
    delayDays,
    recoveredFromDelay,
    statusNotice,
    canChangeDeadline,
    savedEndDate,
    displayedChangedDeadline,
    confirmedDeadline,
    deadlineSaveError,
    setIsDeadlineModalOpen,
  } = deadline;

  const endDateDisplay = displayedChangedDeadline || savedEndDate;

  const periodTotalLabel =
    startDateValue && endDateDisplay && endDateDisplay >= startDateValue
      ? `총 ${getProjectSpanDays(startDateValue, endDateDisplay)}일`
      : undefined;

  const endDateInvalid = Boolean(deadlineSaveError || errors.endDate);

  return (
    <div className={editPanelClassName}>
      <div>
        <FormLabel
          label="프로젝트 상태"
          required
          guideItems={getProjectStatusGuideItems(false, statusValue, plannedLocked, isDelayed)}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {PROJECT_STATUSES.map((status) => {
                const isDisabled = isDelayed || (plannedLocked && status === "PLANNED");

                const showAsDelayed = isDelayed && status === "IN_PROGRESS";

                const isSelected = field.value === status || showAsDelayed;

                const appearance = showAsDelayed ? "DELAYED" : status;

                return (
                  <StatusChoiceButton
                    key={status}
                    statusId={appearance}
                    palette="status"
                    className={wizardStatusButtonClassName}
                    showIconAlways
                    selected={isSelected}
                    disabled={isDisabled}
                    dimmed={isDisabled && !showAsDelayed}
                    onClick={() => field.onChange(status)}
                    icon={<StatusRadioMark selected={isSelected} />}
                  >
                    {getProjectStatusLabel(appearance)}
                  </StatusChoiceButton>
                );
              })}
            </div>
          )}
        />

        {isDelayed ? (
          <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--color-danger)]/40 bg-[var(--color-danger-soft)] px-3 py-3">
            <AppIcon
              icon={CircleAlert}
              size="sm"
              className="mt-0.5 shrink-0 text-[var(--color-danger-text)]"
            />

            <div className="min-w-0">
              <p className="text-caption font-medium text-[var(--color-danger-text)]">
                <span className="md:hidden">{delayDays}일 지연되었습니다.</span>
                <span className="hidden md:inline">프로젝트가 {delayDays}일 지연되었습니다.</span>
              </p>

              <p className="text-caption mt-1 text-[var(--color-danger-text)]">
                지연 중에는 상태를 변경할 수 없습니다. 마감일을 변경해야 저장할 수 있습니다.
              </p>
            </div>
          </div>
        ) : recoveredFromDelay ? (
          <div className="mt-3 flex items-start gap-2 rounded-[var(--radius-sm)] border border-[var(--color-info)]/40 bg-[var(--color-info-soft)] px-3 py-3">
            <AppIcon
              icon={CircleCheck}
              size="sm"
              className="mt-0.5 shrink-0 text-[var(--color-info-text)]"
            />

            <p className="text-caption text-[var(--color-info-text)]">
              마감일이 변경되어 프로젝트가 진행 중으로 전환되었습니다. 필요에 따라 다른 정보를
              수정할 수 있습니다.
            </p>
          </div>
        ) : statusNotice ? (
          <FieldNotice className="!mt-3">{statusNotice}</FieldNotice>
        ) : null}

        <FieldError message={errors.status?.message} />
      </div>

      <div className={editDividerClassName}>
        <FormLabel
          label="프로젝트 기간"
          required
          counter={periodTotalLabel}
          guideItems={getProjectPeriodGuideItems(accentColor)}
          action={
            confirmedDeadline && projectId ? (
              <SecondaryButton
                onClick={() => {
                  router.push(`${getProjectDetailPath(projectId)}#project-deadline-history`);
                }}
                hideIconOnMobile
                icon={<AppIcon icon={History} size="sm" />}
              >
                변경 이력 보기
              </SecondaryButton>
            ) : null
          }
        />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="min-w-0">
            <p className="text-caption mb-1.5 text-[var(--color-text)]">시작일</p>

            <DatePicker
              value={startDateValue}
              onChange={() => undefined}
              disabled
              title="시작일"
              iconPosition="start"
            />

            <FieldError message={errors.startDate?.message} />
          </div>

          <div className="min-w-0">
            <p className="text-caption mb-1.5 text-[var(--color-text)]">마감일</p>

            <DatePicker
              value={endDateDisplay}
              onChange={() => undefined}
              disabled={!canChangeDeadline}
              invalid={endDateInvalid}
              title="마감일"
              iconPosition="start"
              onRequestOpen={() => setIsDeadlineModalOpen(true)}
            />

            <FieldError message={deadlineSaveError ?? errors.endDate?.message} />
          </div>
        </div>
      </div>
    </div>
  );
}

type ProjectEditFormProps = {
  defaultValues?: Partial<ProjectFormData>;
  adminName?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  currentMainProject?: Project | null;
  scheduleEndDate?: string;
  originalEndDate?: string;
  projectId?: number;
  initialSection?: "basic" | "settings";
  columnFooter?: ReactNode;
  onSubmit: (data: ProjectFormData, deadlineChangeReason?: string) => void;
  onCancel: () => void;
};

/**
 * ProjectEditTabs
 *
 * 프로젝트 수정 화면의 기본 정보, 일정 및 상태, 팀 및 설정 탭입니다.
 *
 * @param props - ProjectEditTabs 컴포넌트 Props
 * @param props.value - 지금 보고 있는 탭
 * @param props.onChange - 탭을 바꿀 때 실행되는 함수
 */
function ProjectEditTabs({
  value,
  onChange,
}: {
  value: ProjectEditTab;
  onChange: (tab: ProjectEditTab) => void;
}) {
  return (
    <div role="tablist" aria-label="프로젝트 수정 구역" className={editTabListClassName}>
      {projectEditTabs.map((tab) => {
        const selected = value === tab.id;

        const tabClassName = [
          "relative inline-flex h-[var(--tab-height)] shrink-0 items-center px-3 text-body",
          selected
            ? "font-semibold text-[var(--color-text)]"
            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
        ].join(" ");

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={tabClassName}
          >
            {tab.label}

            {selected ? (
              <span
                aria-hidden
                className="bg-primary-gradient pointer-events-none absolute inset-x-0 -bottom-px h-0.5"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * ProjectEditForm
 *
 * 프로젝트 수정 화면입니다. 기존 입력과 저장, 마감일 변경, 삭제를 유지하고
 * 기본 정보, 일정 및 상태, 팀 및 설정 탭과 카드로 배치합니다.
 * 탭을 옮겨도 입력한 값은 유지되고, 어느 탭에서든 저장할 수 있습니다.
 *
 * @param props - ProjectEditForm 컴포넌트 Props
 * @param props.defaultValues - 수정 전에 채워 둘 프로젝트 값
 * @param props.adminName - 프로젝트 관리자 이름
 * @param props.submitLabel - 저장 버튼 문구
 * @param props.isSubmitting - 저장 중인지 여부
 * @param props.currentMainProject - 현재 메인 프로젝트
 * @param props.scheduleEndDate - 저장된 마감일
 * @param props.originalEndDate - 처음 등록된 마감일
 * @param props.projectId - 수정 중인 프로젝트 id
 * @param props.initialSection - 처음에 열 구역. settings면 일정 및 상태 탭
 * @param props.columnFooter - 팀 및 설정 탭 아래에 붙일 내용
 * @param props.onSubmit - 저장할 때 실행되는 함수
 * @param props.onCancel - 취소할 때 실행되는 함수
 */
export default function ProjectEditForm({
  defaultValues,
  adminName = currentUser.name,
  submitLabel = "변경사항 저장",
  isSubmitting = false,
  currentMainProject = null,
  scheduleEndDate,
  originalEndDate,
  projectId,
  initialSection = "basic",
  columnFooter,
  onSubmit,
  onCancel,
}: ProjectEditFormProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<ProjectEditTab>(getInitialEditTab(initialSection));

  const [scrollToken, setScrollToken] = useState(0);

  const [selectedAdminName, setSelectedAdminName] = useState(adminName);

  const initialStatus = defaultValues?.status;

  const plannedLocked = initialStatus === "IN_PROGRESS" || initialStatus === "ON_HOLD";

  const schema = useMemo(
    () => createProjectSchema(undefined, false, initialStatus),
    [initialStatus],
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...defaultFormValues,
      ...defaultValues,
    },
  });

  const nameValue = watch("name") ?? "";

  const descriptionValue = watch("description") ?? "";

  const colorValue = watch("color") || null;

  const statusValue = watch("status") ?? "PLANNED";

  const startDateValue = watch("startDate") ?? "";

  const endDateValue = watch("endDate") ?? "";

  const teamIdValue = watch("teamId") ?? PROJECT_TEAM_NONE;

  const isMainValue = watch("isMain") ?? false;

  useSyncProjectAccent(colorValue);

  const accentColor = getProjectAccentColor(colorValue);

  const deadline = useProjectDeadlineChange({
    statusValue,
    startDateValue,
    endDateValue,
    scheduleEndDate,
    originalEndDate,
    isCreating: false,
    datesLocked: true,
    setValue,
  });

  const {
    isDelayed,
    delayDays,
    deadlineChangeReason,
    setDeadlineSaveError,
    isDeadlineModalOpen,
    setIsDeadlineModalOpen,
    deadlineToast,
    setDeadlineToast,
    applyPendingDeadline,
    savedEndDate,
    nextDeadlineMin,
  } = deadline;

  const currentTab = projectEditTabs.find((item) => item.id === tab) ?? projectEditTabs[0];

  const selectedMemberId = getTeamMembers(parseProjectTeamSelection(teamIdValue).teamId).find(
    (member) => member.name === selectedAdminName,
  )?.id;

  useEffect(() => {
    if (scrollToken === 0) {
      return;
    }

    scrollToProjectFormError(projectFormDomId);
  }, [scrollToken, tab]);

  /**
   * showTab
   *
   * 고른 탭을 열고 카드 맨 위로 스크롤합니다.
   *
   * @param next - 보여줄 탭
   */
  const showTab = (next: ProjectEditTab) => {
    setTab(next);
    scrollRef.current?.scrollTo({ top: 0 });
  };

  /**
   * revealInvalidTab
   *
   * 저장에 실패한 입력이 있는 탭을 열고, 지연 중이면 마감일 안내를 띄웁니다.
   *
   * @param fieldErrors - 폼 검증 에러
   * @param delayed - 마감일이 지나 지연 중인지 여부
   */
  const revealInvalidTab = (fieldErrors: FieldErrors<ProjectFormData>, delayed: boolean) => {
    const nextTab = getInvalidEditTab(fieldErrors, delayed);

    if (nextTab) {
      setTab(nextTab);
    }

    if (delayed) {
      setDeadlineSaveError("프로젝트를 저장하려면 마감일을 변경해주세요.");
    }

    setScrollToken((value) => value + 1);
  };

  return (
    <form
      id={projectFormDomId}
      noValidate
      onSubmit={handleSubmit(
        (data) => {
          const stillDelayed = isProjectDelayed({
            status: data.status,
            endDate: data.endDate,
          });

          if (stillDelayed) {
            revealInvalidTab({}, true);
            return;
          }

          setDeadlineSaveError(null);
          onSubmit(data, deadlineChangeReason || undefined);
        },
        (fieldErrors) => {
          revealInvalidTab(fieldErrors, isDelayed);
        },
      )}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col md:overflow-y-auto">
        <div className={editShellClassName}>
          <PageHeading
            variant="form"
            align="center"
            title="프로젝트 수정"
            description="기존 프로젝트 정보를 확인하고 변경하세요."
          />

          <ProjectEditTabs value={tab} onChange={showTab} />

          <div className={editCardClassName}>
            <div className="mb-4">
              <h2 className="text-section-title text-[var(--color-text)]">{currentTab.title}</h2>

              <p className="text-body mt-1 text-[var(--color-text-secondary)]">
                {currentTab.description}
              </p>
            </div>

            <div className={tab === "basic" ? undefined : "hidden"}>
              <EditBasicInfoStep
                control={control}
                register={register}
                errors={errors}
                nameValue={nameValue}
                descriptionValue={descriptionValue}
                accentColor={accentColor}
                onDescriptionChange={(value) =>
                  setValue("description", value, { shouldDirty: true, shouldValidate: true })
                }
              />
            </div>

            <div className={tab === "schedule" ? undefined : "hidden"}>
              <EditSchedulePanel
                control={control}
                errors={errors}
                statusValue={statusValue}
                plannedLocked={plannedLocked}
                accentColor={accentColor}
                startDateValue={startDateValue}
                projectId={projectId}
                deadline={deadline}
              />
            </div>

            <div className={tab === "team" ? undefined : "hidden"}>
              <EditSettingsStep
                hideIntro
                control={control}
                accentColor={accentColor}
                nameValue={nameValue}
                teamIdValue={teamIdValue}
                isMainValue={isMainValue}
                currentMainProject={currentMainProject}
                adminName={selectedAdminName}
                onTeamChange={() => undefined}
                adminAction={
                  <AdminSelect
                    teamValue={teamIdValue}
                    options={teamOptions}
                    selectedMemberId={selectedMemberId}
                    showIconOnMobile
                    onChange={(member) => setSelectedAdminName(member.name)}
                  />
                }
                footer={
                  columnFooter ? <div className={editFooterClassName}>{columnFooter}</div> : null
                }
              />
            </div>
          </div>
        </div>
      </div>

      <BottomAppBar
        leading={
          <div className="hidden min-w-0 md:block">
            <p className="text-body leading-5 font-semibold text-[var(--color-text)]">
              {currentTab.statusLabel}
            </p>

            <p className="text-caption leading-4 text-[var(--color-text-muted)]">
              탭을 이동해도 수정한 내용은 유지돼요.
            </p>
          </div>
        }
      >
        <SecondaryButton
          size="md"
          onClick={onCancel}
          disabled={isSubmitting}
          className={barButtonClassName}
        >
          취소
        </SecondaryButton>

        <PrimaryButton
          type="submit"
          size="md"
          disabled={isSubmitting}
          className={barButtonClassName}
        >
          {isSubmitting ? "저장 중..." : submitLabel}
        </PrimaryButton>
      </BottomAppBar>

      <ChangeProjectDeadlineModal
        isOpen={isDeadlineModalOpen}
        title={deadlineChangeLabel}
        icon={CalendarSync}
        projectId={projectId}
        currentDate={savedEndDate}
        minDate={nextDeadlineMin}
        delayDays={delayDays}
        onClose={() => {
          setIsDeadlineModalOpen(false);
        }}
        onSubmit={applyPendingDeadline}
      />

      {deadlineToast ? (
        <Toast
          tone="success"
          message="마감일이 변경되었습니다."
          description={deadlineToast.description}
          onClose={() => setDeadlineToast(null)}
        />
      ) : null}
    </form>
  );
}
