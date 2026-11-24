"use client";

import { Controller, type Control, type FieldErrors } from "react-hook-form";

import FieldNotice from "@/components/ui/FieldNotice";
import { AppIcon, CircleAlert, CircleCheck } from "@/components/ui/icon";
import StatusChoiceButton from "@/components/ui/StatusChoiceButton";

import { FieldError, FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import ProjectStatusIcon from "@/features/projects/components/ProjectStatusIcon";
import { getProjectStatusGuideItems } from "@/features/projects/constants/projectFormGuides";
import { PROJECT_STATUS_FILTER_ICON_COLORS } from "@/features/projects/constants/projectStatusColors";
import { type ProjectDeadlineState } from "@/features/projects/hooks/useProjectDeadlineChange";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { PROJECT_STATUSES } from "@/features/projects/types/project";
import { getProjectStatusLabel } from "@/features/projects/utils/projectUtils";

/**
 * ProjectStatusField
 *
 * 프로젝트 상태를 고르는 필드입니다. 지연 안내와 상태 변경 제한 안내도 함께 보여줍니다.
 *
 * @param props - ProjectStatusField 컴포넌트 Props
 * @param props.control - 폼 컨트롤
 * @param props.errors - 폼 검증 에러
 * @param props.isCreating - 새 프로젝트를 만드는 중인지 여부
 * @param props.statusValue - 선택한 프로젝트 상태
 * @param props.plannedLocked - 계획 상태로 되돌릴 수 없는지 여부
 * @param props.deadline - 마감일 변경 상태와 동작
 */
export function ProjectStatusField({
  control,
  errors,
  isCreating,
  statusValue,
  plannedLocked,
  deadline,
}: {
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  isCreating: boolean;
  statusValue: ProjectFormData["status"];
  plannedLocked: boolean;
  deadline: ProjectDeadlineState;
}) {
  const { isDelayed, delayDays, recoveredFromDelay, statusNotice } = deadline;

  return (
    <>
      <FormLabel
        label="프로젝트 상태"
        required
        guideItems={getProjectStatusGuideItems(isCreating, statusValue, plannedLocked, isDelayed)}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <div className="grid grid-cols-4 gap-1.5 lg:gap-2">
            {PROJECT_STATUSES.map((status) => {
              const isDisabled =
                isDelayed ||
                (isCreating && (status === "DONE" || status === "ON_HOLD")) ||
                (plannedLocked && status === "PLANNED");

              const isSelected = field.value === status;

              const showAsDelayed = isDelayed && status === "IN_PROGRESS";

              const appearance = showAsDelayed ? "DELAYED" : status;

              return (
                <StatusChoiceButton
                  key={status}
                  statusId={appearance}
                  palette="status"
                  className="!h-10 !w-full !justify-center !gap-1.5 !px-2 !text-center lg:!h-11"
                  showIconAlways
                  selected={isSelected || showAsDelayed}
                  disabled={isDisabled}
                  dimmed={isDisabled && !showAsDelayed}
                  onClick={() => field.onChange(status)}
                  icon={
                    appearance === "DELAYED" ? null : (
                      <span
                        className="inline-flex"
                        style={{
                          color: PROJECT_STATUS_FILTER_ICON_COLORS[appearance],
                        }}
                      >
                        <ProjectStatusIcon status={appearance} size={14} />
                      </span>
                    )
                  }
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
            마감일이 변경되어 프로젝트가 진행 중으로 전환되었습니다. 필요에 따라 다른 정보를 수정할
            수 있습니다.
          </p>
        </div>
      ) : statusNotice ? (
        <FieldNotice className="!mt-3">{statusNotice}</FieldNotice>
      ) : null}

      {isCreating ? (
        <FieldNotice>
          {statusValue === "IN_PROGRESS"
            ? "진행 중으로 만들면 이후 계획 상태로 되돌릴 수 없습니다."
            : "완료와 보류는 프로젝트를 만든 뒤에 설정할 수 있습니다."}
        </FieldNotice>
      ) : null}

      <FieldError message={errors.status?.message} />
    </>
  );
}
