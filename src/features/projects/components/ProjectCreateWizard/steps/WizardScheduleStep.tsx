"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";

import DatePicker from "@/components/ui/date-picker/DatePicker";
import FieldNotice from "@/components/ui/FieldNotice";
import StatusChoiceButton from "@/components/ui/StatusChoiceButton";

import { FieldError, FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import {
  getProjectPeriodGuideItems,
  getProjectStatusGuideItems,
} from "@/features/projects/constants/projectFormGuides";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { PROJECT_STATUSES } from "@/features/projects/types/project";
import { getProjectStatusLabel } from "@/features/projects/utils/projectUtils";

export const wizardStatusButtonClassName =
  "!h-[72px] !w-full !flex-col !justify-center !gap-2 !px-2 !text-center md:!h-[80px]";

/**
 * StatusRadioMark
 *
 * 상태 카드 위에 놓는 라디오 모양 표시입니다.
 *
 * @param props - StatusRadioMark 컴포넌트 Props
 * @param props.selected - 선택된 상태인지 여부
 */
export function StatusRadioMark({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${
        selected ? "border-[var(--color-field-focus)]" : "border-gray-300"
      }`}
    >
      {selected ? <span className="h-2 w-2 rounded-full bg-[var(--color-field-focus)]" /> : null}
    </span>
  );
}

/**
 * WizardScheduleStep
 *
 * 2단계 입력입니다. 프로젝트 상태와 시작일, 마감일을 입력합니다.
 * 새 프로젝트는 보류와 완료를 고를 수 없습니다.
 *
 * @param props - WizardScheduleStep 컴포넌트 Props
 * @param props.control - 폼 컨트롤
 * @param props.errors - 폼 검증 에러
 * @param props.statusValue - 선택한 프로젝트 상태
 * @param props.accentColor - 프로젝트 강조 색
 * @param props.minDate - 선택할 수 있는 가장 이른 날짜
 * @param props.endDateMin - 마감일로 선택할 수 있는 가장 이른 날짜
 * @param props.periodTotalLabel - 기간 합계 표시. 없으면 보이지 않음
 */
export function WizardScheduleStep({
  control,
  errors,
  statusValue,
  accentColor,
  minDate,
  endDateMin,
  periodTotalLabel,
}: {
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  statusValue: ProjectFormData["status"];
  accentColor: string;
  minDate: string | undefined;
  endDateMin: string | undefined;
  periodTotalLabel: string | undefined;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <FormLabel
          label="프로젝트 상태"
          required
          guideItems={getProjectStatusGuideItems(true, statusValue)}
        />

        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {PROJECT_STATUSES.map((status) => {
                const isSelected = field.value === status;

                const isDisabled = status === "DONE" || status === "ON_HOLD";

                return (
                  <StatusChoiceButton
                    key={status}
                    statusId={status}
                    palette="status"
                    className={wizardStatusButtonClassName}
                    showIconAlways
                    selected={isSelected}
                    disabled={isDisabled}
                    dimmed={isDisabled}
                    onClick={() => field.onChange(status)}
                    icon={<StatusRadioMark selected={isSelected} />}
                  >
                    {getProjectStatusLabel(status)}
                  </StatusChoiceButton>
                );
              })}
            </div>
          )}
        />

        <FieldNotice>
          {statusValue === "IN_PROGRESS"
            ? "진행 중으로 만들면 이후 계획 상태로 되돌릴 수 없습니다."
            : "완료와 보류는 프로젝트를 만든 뒤에 설정할 수 있습니다."}
        </FieldNotice>

        <FieldError message={errors.status?.message} />
      </div>

      <div className="border-t border-[var(--color-border)] pt-4">
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
                  invalid={Boolean(errors.startDate)}
                  placeholder="시작일 선택"
                  iconPosition="start"
                  applyOnConfirm
                />
              )}
            />

            <FieldError message={errors.startDate?.message} />
          </div>

          <div className="min-w-0">
            <p className="text-caption mb-1.5 text-[var(--color-text)]">마감일</p>

            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  min={endDateMin}
                  invalid={Boolean(errors.endDate)}
                  placeholder="마감일 선택"
                  iconPosition="start"
                  applyOnConfirm
                />
              )}
            />

            <FieldError message={errors.endDate?.message} />
          </div>
        </div>

        <FieldNotice>마감일은 프로젝트 설정에서 변경할 수 있습니다.</FieldNotice>
      </div>
    </div>
  );
}
