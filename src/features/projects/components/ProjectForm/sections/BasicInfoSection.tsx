"use client";

import { Controller, type Control, type FieldErrors, type UseFormRegister } from "react-hook-form";

import DatePicker from "@/components/ui/date-picker/DatePicker";
import { FileText } from "@/components/ui/icon";
import Textarea from "@/components/ui/input/Textarea";

import { ProjectColorField } from "@/features/projects/components/ProjectForm/fields/ProjectColorField";
import {
  FieldError,
  FormLabel,
  FormSectionIntro,
} from "@/features/projects/components/ProjectForm/FormParts";
import { getProjectPeriodGuideItems } from "@/features/projects/constants/projectFormGuides";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { type ProjectFormLayout } from "@/features/projects/utils/projectFormLayout";

/**
 * BasicInfoSection
 *
 * 프로젝트의 색상, 이름, 설명, 기간을 입력하는 "기본 정보" 구역입니다.
 *
 * @param props - BasicInfoSection 컴포넌트 Props
 * @param props.control - 폼 컨트롤
 * @param props.register - 입력 칸을 폼에 등록하는 함수
 * @param props.errors - 폼 검증 에러
 * @param props.layout - 폼 레이아웃 값과 클래스
 * @param props.mobileSection - 모바일에서 보이는 구역
 * @param props.nameValue - 입력한 프로젝트 이름
 * @param props.descriptionValue - 입력한 프로젝트 설명
 * @param props.periodTotalLabel - 기간 합계 표시. 없으면 보이지 않음
 * @param props.accentColor - 프로젝트 강조 색
 * @param props.minDate - 선택할 수 있는 가장 이른 날짜
 * @param props.endDateMin - 마감일로 선택할 수 있는 가장 이른 날짜
 * @param props.datesLocked - 날짜를 직접 바꿀 수 없는 상태인지 여부
 * @param props.isCreating - 새 프로젝트를 만드는 중인지 여부
 * @param props.periodDeadline - 표시할 마감일
 */
export function BasicInfoSection({
  control,
  register,
  errors,
  layout,
  mobileSection,
  nameValue,
  descriptionValue,
  periodTotalLabel,
  accentColor,
  minDate,
  endDateMin,
  datesLocked,
  isCreating,
  periodDeadline,
}: {
  control: Control<ProjectFormData>;
  register: UseFormRegister<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  layout: ProjectFormLayout;
  mobileSection: "basic" | "settings";
  nameValue: string;
  descriptionValue: string;
  periodTotalLabel: string | undefined;
  accentColor: string;
  minDate: string | undefined;
  endDateMin: string | undefined;
  datesLocked: boolean;
  isCreating: boolean;
  periodDeadline: string;
}) {
  const { splitLayout, createShell, splitCardClassName, splitScrollClassName, formPanelClassName } =
    layout;

  return (
    <div
      className={
        splitLayout
          ? ` ${createShell ? splitCardClassName : splitScrollClassName} ${
              createShell ? "" : "md:pr-5"
            } ${mobileSection === "settings" ? "max-md:hidden" : ""} `
          : undefined
      }
    >
      <div className={formPanelClassName}>
        {splitLayout ? (
          <FormSectionIntro
            className={createShell ? "" : "hidden md:flex"}
            plain={createShell}
            icon={FileText}
            title="기본 정보"
            description="프로젝트의 기본 정보를 설정합니다."
            mobileDescription="프로젝트의 이름과 기간을 설정해주세요."
          />
        ) : null}

        <div className={splitLayout ? "shrink-0" : undefined}>
          <ProjectColorField control={control} />
        </div>

        <div className={splitLayout ? "shrink-0" : undefined}>
          <FormLabel
            htmlFor="project-name"
            label="프로젝트 이름"
            required
            counter={`${nameValue.length}/50`}
          />

          <Textarea
            id="project-name"
            {...register("name")}
            autoComplete="off"
            maxLength={50}
            rows={1}
            aria-invalid={Boolean(errors.name) || undefined}
            placeholder="프로젝트 이름을 입력하세요"
            className="!h-20"
          />

          <FieldError message={errors.name?.message} />
        </div>

        <div className={splitLayout ? "shrink-0" : undefined}>
          <FormLabel
            htmlFor="project-description"
            label="프로젝트 설명"
            counter={`${descriptionValue.length}/500`}
          />

          <Textarea
            id="project-description"
            {...register("description")}
            maxLength={500}
            rows={4}
            aria-invalid={Boolean(errors.description) || undefined}
            placeholder="프로젝트에 대한 설명을 입력하세요"
            className={splitLayout ? "min-h-32" : "h-24"}
          />

          <FieldError message={errors.description?.message} />
        </div>

        <div className={splitLayout ? "shrink-0" : undefined}>
          <FormLabel
            label="프로젝트 기간"
            required
            counter={periodTotalLabel}
            guideItems={getProjectPeriodGuideItems(accentColor)}
          />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="min-w-0">
              <p className="text-caption mb-1.5 text-[var(--color-text)]">시작일</p>

              <Controller
                name="startDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    min={minDate}
                    disabled={datesLocked}
                    invalid={Boolean(errors.startDate)}
                    title="시작일"
                    applyOnConfirm={isCreating}
                  />
                )}
              />

              <FieldError message={errors.startDate?.message} />
            </div>

            <div className="min-w-0">
              <p className="text-caption mb-1.5 text-[var(--color-text)]">마감일</p>

              {datesLocked ? (
                <DatePicker
                  value={periodDeadline}
                  onChange={() => undefined}
                  disabled
                  placeholder="마감일"
                />
              ) : (
                <Controller
                  name="endDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      min={endDateMin}
                      invalid={Boolean(errors.endDate)}
                      title="마감일"
                      applyOnConfirm={isCreating}
                    />
                  )}
                />
              )}

              {!datesLocked ? <FieldError message={errors.endDate?.message} /> : null}
            </div>
          </div>

          {datesLocked ? (
            <p className="text-caption mt-2 text-[var(--color-text-muted)]">
              마감일은 프로젝트 설정에서 변경할 수 있습니다.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
