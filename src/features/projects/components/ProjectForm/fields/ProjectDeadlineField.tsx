"use client";

import { useRouter } from "next/navigation";
import { AppIcon, CalendarSync, History } from "@/components/ui/icon";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import InfoTooltip from "@/components/ui/InfoTooltip";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import { getProjectDetailPath } from "@/lib/projectRoutes";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import {
  tooltipWidthClassName,
  deadlineChangeLabel,
} from "@/features/projects/constants/projectFormDefaults";
import { FieldError, FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import { type FieldErrors } from "react-hook-form";
import { type ProjectDeadlineState } from "@/features/projects/hooks/useProjectDeadlineChange";

/**
 * ProjectDeadlineField
 *
 * 현재 마감일과 변경된 마감일을 보여주고, 마감일 변경 모달을 여는 필드입니다.
 *
 * @param props - ProjectDeadlineField 컴포넌트 Props
 * @param props.projectId - 수정 중인 프로젝트 id
 * @param props.errors - 폼 검증 에러
 * @param props.deadline - 마감일 변경 상태와 동작
 */
export function ProjectDeadlineField({
  projectId,
  errors,
  deadline,
}: {
  projectId: number | undefined;
  errors: FieldErrors<ProjectFormData>;
  deadline: ProjectDeadlineState;
}) {
  const {
    setIsDeadlineModalOpen,
    deadlineSaveError,
    canChangeDeadline,
    savedEndDate,
    confirmedDeadline,
    isDelayed,
    displayedChangedDeadline,
    changedDeadlinePlaceholder,
  } = deadline;

  const router = useRouter();

  return (
    <>
      <FormLabel
        label="프로젝트 마감일"
        required={isDelayed}
        accessory={
          <InfoTooltip
            title={deadlineChangeLabel}
            description="새로운 마감일과 변경 사유를 입력하면 변경된 마감일에 적용됩니다. 지연 상태면 진행 중으로 바뀝니다."
            maxWidthClassName={tooltipWidthClassName}
          />
        }
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
          ) : (
            <SecondaryButton
              tone={deadlineSaveError ? "danger" : "default"}
              disabled={!canChangeDeadline}
              onClick={() => {
                setIsDeadlineModalOpen(true);
              }}
              hideIconOnMobile
              icon={<AppIcon icon={CalendarSync} size="sm" />}
            >
              {deadlineChangeLabel}
            </SecondaryButton>
          )
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="min-w-0">
          <p className="text-caption mb-1.5 text-[var(--color-text-muted)]">현재 마감일</p>

          <DatePicker
            value={savedEndDate}
            onChange={() => undefined}
            disabled
            placeholder="현재 마감일"
          />
        </div>

        <div className="min-w-0">
          <p className="text-caption mb-1.5 text-[var(--color-text-muted)]">변경된 마감일</p>

          <DatePicker
            value={displayedChangedDeadline}
            onChange={() => undefined}
            disabled
            placeholder={changedDeadlinePlaceholder}
          />
        </div>
      </div>

      <FieldError message={deadlineSaveError ?? errors.endDate?.message} />
    </>
  );
}
