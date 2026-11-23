import { useEffect, useState } from "react";

import { type UseFormSetValue } from "react-hook-form";

import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { getTomorrowDateValue } from "@/features/projects/utils/projectFormUtils";
import { getProjectDaysAfterEnd, isProjectDelayed } from "@/features/projects/utils/projectUtils";

/**
 * useProjectDeadlineChange
 *
 * 프로젝트 마감일 변경 상태를 관리합니다.
 * 지연 여부, 변경 모달, 변경 알림, 변경 사유와 새 마감일 적용을 한곳에서 다룹니다.
 *
 * @param params - useProjectDeadlineChange에 필요한 값
 * @param params.statusValue - 선택한 프로젝트 상태
 * @param params.startDateValue - 입력한 시작일
 * @param params.endDateValue - 입력한 마감일
 * @param params.scheduleEndDate - 저장된 마감일
 * @param params.originalEndDate - 처음 등록된 마감일
 * @param params.isCreating - 새 프로젝트를 만드는 중인지 여부
 * @param params.datesLocked - 날짜를 직접 바꿀 수 없는 상태인지 여부
 * @param params.setValue - 폼 값을 바꾸는 함수
 * @returns 마감일 변경 상태와 동작
 */
export function useProjectDeadlineChange({
  statusValue,
  startDateValue,
  endDateValue,
  scheduleEndDate,
  originalEndDate,
  isCreating,
  datesLocked,
  setValue,
}: {
  statusValue: ProjectFormData["status"];
  startDateValue: string;
  endDateValue: string;
  scheduleEndDate: string | undefined;
  originalEndDate: string | undefined;
  isCreating: boolean;
  datesLocked: boolean;
  setValue: UseFormSetValue<ProjectFormData>;
}) {
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);

  const [deadlineChangeReason, setDeadlineChangeReason] = useState("");

  const [deadlineToast, setDeadlineToast] = useState<{
    description?: string;
  } | null>(null);

  const [deadlineSaveError, setDeadlineSaveError] = useState<string | null>(null);

  const canChangeDeadline =
    datesLocked && (statusValue === "PLANNED" || statusValue === "IN_PROGRESS");

  const savedEndDate = scheduleEndDate || "";

  const appliedChangedDeadline =
    originalEndDate && savedEndDate && originalEndDate !== savedEndDate ? savedEndDate : "";

  const tomorrowDate = getTomorrowDateValue();

  const nextDeadlineMin = startDateValue > tomorrowDate ? startDateValue : tomorrowDate;

  const [confirmedDeadline, setConfirmedDeadline] = useState<string | null>(null);

  const periodDeadline = confirmedDeadline || endDateValue || savedEndDate;

  const isDelayed =
    datesLocked &&
    isProjectDelayed({
      status: statusValue,
      endDate: endDateValue || scheduleEndDate || "",
    });

  const delayDays = isDelayed ? getProjectDaysAfterEnd(endDateValue || scheduleEndDate || "") : 0;

  const displayedChangedDeadline = confirmedDeadline ?? (isDelayed ? "" : appliedChangedDeadline);

  const recoveredFromDelay =
    Boolean(confirmedDeadline) &&
    isProjectDelayed({
      status: "IN_PROGRESS",
      endDate: scheduleEndDate || "",
    });

  const changedDeadlinePlaceholder =
    isDelayed && !confirmedDeadline ? "마감일 변경 후 선택됩니다." : "변경 이력 없음";

  const statusNotice =
    !isDelayed && !isCreating && statusValue === "DONE"
      ? "완료된 프로젝트는 마감일을 변경할 수 없습니다."
      : null;

  // 지연이 풀리면 마감 저장 오류도 지운다.
  if (!isDelayed && deadlineSaveError !== null) {
    setDeadlineSaveError(null);
  }

  useEffect(() => {
    if (!deadlineToast) {
      return;
    }

    const timer = window.setTimeout(() => {
      setDeadlineToast(null);
    }, 4000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [deadlineToast]);

  const applyPendingDeadline = (endDate: string, reason: string) => {
    const wasDelayed = isDelayed;

    setValue("endDate", endDate, {
      shouldValidate: true,
      shouldDirty: true,
    });

    if (wasDelayed) {
      setValue("status", "IN_PROGRESS", {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    setConfirmedDeadline(endDate);
    setDeadlineChangeReason(reason);
    setIsDeadlineModalOpen(false);
    setDeadlineToast({
      description: wasDelayed ? "프로젝트 상태가 진행 중으로 전환되었습니다." : undefined,
    });
  };

  return {
    isDeadlineModalOpen,
    setIsDeadlineModalOpen,
    deadlineChangeReason,
    deadlineToast,
    setDeadlineToast,
    deadlineSaveError,
    setDeadlineSaveError,
    canChangeDeadline,
    savedEndDate,
    nextDeadlineMin,
    confirmedDeadline,
    periodDeadline,
    isDelayed,
    delayDays,
    displayedChangedDeadline,
    recoveredFromDelay,
    changedDeadlinePlaceholder,
    statusNotice,
    applyPendingDeadline,
  };
}

export type ProjectDeadlineState = ReturnType<typeof useProjectDeadlineChange>;
