"use client";

import { useMemo, useRef, useState, type SubmitEvent } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";

import PageHeading from "@/components/layout/pages/Page/PageHeading";

import { useSyncProjectAccent } from "@/features/projects/components/ProjectAccent";
import { WizardBasicInfoStep } from "@/features/projects/components/ProjectCreateWizard/steps/WizardBasicInfoStep";
import { WizardScheduleStep } from "@/features/projects/components/ProjectCreateWizard/steps/WizardScheduleStep";
import { WizardSettingsStep } from "@/features/projects/components/ProjectCreateWizard/steps/WizardSettingsStep";
import {
  WizardBottomBar,
  WizardCard,
} from "@/features/projects/components/ProjectCreateWizard/WizardCard";
import {
  CalendarIllustration,
  FolderIllustration,
} from "@/features/projects/components/ProjectCreateWizard/WizardIllustration";
import { WizardProgress } from "@/features/projects/components/ProjectCreateWizard/WizardProgress";
import { defaultFormValues } from "@/features/projects/constants/projectFormDefaults";
import {
  projectWizardLastStep,
  projectWizardSteps,
  type ProjectWizardStepId,
} from "@/features/projects/constants/projectWizardSteps";
import {
  createProjectSchema,
  type ProjectFormData,
} from "@/features/projects/schemas/projectSchema";
import { type Project } from "@/features/projects/types/project";
import { getProjectAccentColor } from "@/features/projects/utils/projectColors";
import { scrollToProjectFormError } from "@/features/projects/utils/projectFormUtils";
import { PROJECT_TEAM_NONE } from "@/features/projects/utils/projectTeam";
import { getProjectSpanDays } from "@/features/projects/utils/projectUtils";

import { currentUser } from "@/lib/mock/users";

import type { ZodType } from "zod";

const wizardFormDomId = "project-create-wizard";

/**
 * getFirstInvalidStep
 *
 * 검증에 실패한 입력이 있는 가장 앞 단계를 찾습니다.
 *
 * @param errors - 폼 검증 에러
 * @returns 에러가 있는 가장 앞 단계. 없으면 null
 */
function getFirstInvalidStep(errors: FieldErrors<ProjectFormData>) {
  const step = projectWizardSteps.find((item) => item.fields.some((field) => errors[field]));

  return step?.id ?? null;
}

/**
 * isWizardStepReady
 *
 * 지금 단계의 필수 입력이 검증을 통과했는지 확인합니다.
 * 마지막 단계는 앞 단계의 필수 입력까지 함께 확인합니다.
 *
 * @param schema - 프로젝트 폼 검증 스키마
 * @param values - 현재 폼 값
 * @param step - 지금 보고 있는 단계
 * @returns 다음 또는 저장으로 넘어갈 수 있으면 true
 */
function isWizardStepReady(
  schema: ZodType<ProjectFormData>,
  values: ProjectFormData,
  step: ProjectWizardStepId,
) {
  const result = schema.safeParse(values);

  if (result.success) {
    return true;
  }

  const fields =
    step === projectWizardLastStep
      ? projectWizardSteps.flatMap((item) => item.fields)
      : projectWizardSteps[step - 1].fields;

  return result.error.issues.every((issue) => {
    const field = issue.path[0];

    return typeof field !== "string" || !fields.includes(field as keyof ProjectFormData);
  });
}

type ProjectCreateWizardProps = {
  minDate: string;
  currentMainProject: Project | null;
  isSubmitting: boolean;
  onSubmit: (data: ProjectFormData, adminName: string) => void;
  onCancel: () => void;
};

/**
 * ProjectCreateWizard
 *
 * 새 프로젝트를 3단계(기본 정보, 일정 및 상태, 팀 및 설정)로 나눠 입력받는 화면입니다.
 * 다음을 누르면 그 단계의 입력만 검증하고, 마지막 단계에서 전체를 검증해 저장합니다.
 * 지금 단계의 필수 입력이 끝나기 전에는 다음 버튼을 비활성화합니다.
 * 검증에 실패한 입력이 이전 단계에 있으면 그 단계로 돌아갑니다.
 *
 * @param props - ProjectCreateWizard 컴포넌트 Props
 * @param props.minDate - 시작일과 마감일로 고를 수 있는 가장 이른 날짜
 * @param props.currentMainProject - 현재 메인 프로젝트
 * @param props.isSubmitting - 저장 중인지 여부
 * @param props.onSubmit - 마지막 단계에서 저장할 때 실행되는 함수
 * @param props.onCancel - 취소할 때 실행되는 함수
 */
export default function ProjectCreateWizard({
  minDate,
  currentMainProject,
  isSubmitting,
  onSubmit,
  onCancel,
}: ProjectCreateWizardProps) {
  const [step, setStep] = useState<ProjectWizardStepId>(1);

  const [adminName, setAdminName] = useState(currentUser.name);

  const scrollRef = useRef<HTMLDivElement>(null);

  const schema = useMemo(() => createProjectSchema(minDate, true), [minDate]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      ...defaultFormValues,
      startDate: minDate,
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

  const tagsValue = watch("tags") ?? [];

  const formValues: ProjectFormData = {
    name: nameValue,
    description: descriptionValue,
    color: colorValue,
    teamId: teamIdValue,
    startDate: startDateValue,
    endDate: endDateValue,
    status: statusValue,
    isMain: isMainValue,
    tags: tagsValue,
  };

  const canProceed = isWizardStepReady(schema, formValues, step);

  useSyncProjectAccent(colorValue);

  const accentColor = getProjectAccentColor(colorValue);

  const endDateMin = startDateValue > minDate ? startDateValue : minDate;

  const periodTotalLabel =
    startDateValue && endDateValue && endDateValue >= startDateValue
      ? `총 ${getProjectSpanDays(startDateValue, endDateValue)}일`
      : undefined;

  const moveToStep = (next: ProjectWizardStepId) => {
    setStep(next);

    scrollRef.current?.scrollTo({ top: 0 });
  };

  const goPrev = () => {
    if (step > 1) {
      moveToStep((step - 1) as ProjectWizardStepId);
    }
  };

  const goNext = async () => {
    const isValid = await trigger(projectWizardSteps[step - 1].fields);

    if (!isValid) {
      scrollToProjectFormError(wizardFormDomId);
      return;
    }

    if (step < projectWizardLastStep) {
      moveToStep((step + 1) as ProjectWizardStepId);
    }
  };

  const submit = handleSubmit(
    (data) => onSubmit(data, adminName),
    (fieldErrors) => {
      const invalidStep = getFirstInvalidStep(fieldErrors);

      if (invalidStep && invalidStep !== step) {
        moveToStep(invalidStep);
      }

      scrollToProjectFormError(wizardFormDomId);
    },
  );

  const handleFormSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canProceed || isSubmitting) {
      return;
    }

    if (step === projectWizardLastStep) {
      void submit();
      return;
    }

    void goNext();
  };

  const actionProps = {
    step,
    isSubmitting,
    canProceed,
    submitLabel: "프로젝트 추가",
    onCancel,
    onPrev: goPrev,
    onNext: () => void goNext(),
    onSubmit: () => void submit(),
  };

  return (
    <form
      id={wizardFormDomId}
      noValidate
      onSubmit={handleFormSubmit}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div ref={scrollRef} className="flex min-h-0 flex-1 flex-col md:overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[880px] flex-1 flex-col gap-5 px-[var(--page-padding-x)] pt-3 pb-6 md:gap-5 md:pt-5 md:pb-6">
          <PageHeading
            variant="form"
            align="center"
            title="새 프로젝트 추가"
            description="3단계로 새 프로젝트를 빠르고 간단하게 생성하세요."
            className="hidden md:block"
          />

          <WizardProgress current={step} onStepClick={moveToStep} />

          {step === 1 ? (
            <WizardCard
              intro={<FolderIllustration color={colorValue} />}
              introTitle="기본 정보를 입력하세요"
              introDescription="프로젝트를 구분할 수 있는 이름, 색상, 설명과 프로젝트 목표 태그를 설정합니다."
            >
              <WizardBasicInfoStep
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
            </WizardCard>
          ) : null}

          {step === 2 ? (
            <WizardCard
              intro={<CalendarIllustration />}
              introTitle="일정 및 상태"
              introDescription="프로젝트 기간과 진행 상태를 설정합니다."
            >
              <WizardScheduleStep
                control={control}
                errors={errors}
                statusValue={statusValue}
                accentColor={accentColor}
                minDate={minDate}
                endDateMin={endDateMin}
                periodTotalLabel={periodTotalLabel}
              />
            </WizardCard>
          ) : null}

          {step === 3 ? (
            <WizardCard>
              <WizardSettingsStep
                control={control}
                accentColor={accentColor}
                nameValue={nameValue}
                teamIdValue={teamIdValue}
                isMainValue={isMainValue}
                currentMainProject={currentMainProject}
                adminName={adminName}
                onTeamChange={() => setAdminName(currentUser.name)}
              />
            </WizardCard>
          ) : null}
        </div>
      </div>

      <WizardBottomBar {...actionProps} />
    </form>
  );
}
