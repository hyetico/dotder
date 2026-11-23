"use client";

import { useMemo, useState, type ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { CalendarSync } from "@/components/ui/icon";
import LineTabMenu from "@/components/ui/tab/LineTabMenu";

import { useSyncProjectAccent } from "@/features/projects/components/ProjectAccent";
import { DeadlineToast } from "@/features/projects/components/ProjectForm/DeadlineToast";
import { FormActions, FormActionBar } from "@/features/projects/components/ProjectForm/FormActions";
import { FormPageTitle } from "@/features/projects/components/ProjectForm/FormParts";
import { BasicInfoSection } from "@/features/projects/components/ProjectForm/sections/BasicInfoSection";
import { SettingsSection } from "@/features/projects/components/ProjectForm/sections/SettingsSection";
import {
  defaultFormValues,
  deadlineChangeLabel,
} from "@/features/projects/constants/projectFormDefaults";
import { useProjectDeadlineChange } from "@/features/projects/hooks/useProjectDeadlineChange";
import ChangeProjectDeadlineModal from "@/features/projects/modals/ChangeProjectDeadlineModal";
import ProjectPreviewModal from "@/features/projects/modals/ProjectPreviewModal";
import {
  createProjectSchema,
  type ProjectFormData,
} from "@/features/projects/schemas/projectSchema";
import { type Project } from "@/features/projects/types/project";
import { getProjectAccentColor } from "@/features/projects/utils/projectColors";
import { getProjectFormLayout } from "@/features/projects/utils/projectFormLayout";
import {
  getProjectAdmin,
  scrollToProjectFormError,
} from "@/features/projects/utils/projectFormUtils";
import {
  getProjectTeamLabel,
  parseProjectTeamSelection,
  PROJECT_TEAM_NONE,
} from "@/features/projects/utils/projectTeam";
import { getProjectSpanDays, isProjectDelayed } from "@/features/projects/utils/projectUtils";

import { currentUser } from "@/lib/mock/users";

type ProjectFormProps = {
  defaultValues?: Partial<ProjectFormData>;
  adminName?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  minDate?: string;
  isCreating?: boolean;
  currentMainProject?: Project | null;
  scheduleEndDate?: string;
  originalEndDate?: string;
  projectId?: number;
  formId?: string;
  showActions?: boolean;
  showActionBar?: boolean;
  pageLayout?: "card" | "split";
  initialMobileSection?: "basic" | "settings";
  fillViewport?: boolean;
  pageTitle?: string;
  pageDescription?: string;
  columnFooter?: ReactNode;
  onSubmit: (data: ProjectFormData, deadlineChangeReason?: string) => void;
  onCancel: () => void;
};

export default function ProjectForm({
  defaultValues,
  adminName = currentUser.name,
  submitLabel = "프로젝트 추가",
  isSubmitting = false,
  minDate,
  isCreating = false,
  currentMainProject = null,
  scheduleEndDate,
  originalEndDate,
  projectId,
  formId,
  showActions = true,
  showActionBar = false,
  pageLayout,
  initialMobileSection = "basic",
  fillViewport = true,
  pageTitle,
  pageDescription,
  columnFooter,
  onSubmit,
  onCancel,
}: ProjectFormProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [mobileSection, setMobileSection] = useState<"basic" | "settings">(initialMobileSection);

  const [previewAdminName, setPreviewAdminName] = useState(adminName);

  const initialStatus = defaultValues?.status;

  const plannedLocked =
    !isCreating && (initialStatus === "IN_PROGRESS" || initialStatus === "ON_HOLD");

  const schema = useMemo(
    () => createProjectSchema(minDate, isCreating, initialStatus),
    [minDate, isCreating, initialStatus],
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

  const colorValue = watch("color") || null;

  useSyncProjectAccent(colorValue);

  const accentColor = getProjectAccentColor(colorValue);

  const statusValue = watch("status") ?? "PLANNED";

  const descriptionValue = watch("description") ?? "";

  const startDateValue = watch("startDate") ?? "";

  const endDateValue = watch("endDate") ?? "";

  const isMainValue = watch("isMain") ?? false;

  const teamIdValue = watch("teamId") ?? PROJECT_TEAM_NONE;

  const tagsValue = watch("tags") ?? [];

  const endDateMin = minDate && startDateValue > minDate ? startDateValue : minDate;

  const periodTotalLabel =
    isCreating && startDateValue && endDateValue && endDateValue >= startDateValue
      ? `총 ${getProjectSpanDays(startDateValue, endDateValue)}일`
      : undefined;

  const datesLocked = !isCreating;

  const deadline = useProjectDeadlineChange({
    statusValue,
    startDateValue,
    endDateValue,
    scheduleEndDate,
    originalEndDate,
    isCreating,
    datesLocked,
    setValue,
  });

  const {
    isDelayed,
    delayDays,
    deadlineChangeReason,
    setDeadlineSaveError,
    periodDeadline,
    savedEndDate,
    nextDeadlineMin,
    applyPendingDeadline,
    isDeadlineModalOpen,
    setIsDeadlineModalOpen,
    deadlineToast,
    setDeadlineToast,
  } = deadline;

  const admin = getProjectAdmin(adminName);

  const layout = getProjectFormLayout({
    pageLayout,
    isCreating,
    fillViewport,
  });

  const { splitLayout, splitFillsViewport, createShell } = layout;

  return (
    <div
      className={
        splitLayout
          ? splitFillsViewport
            ? `flex min-h-full flex-1 flex-col md:min-h-0`
            : "flex flex-col"
          : undefined
      }
    >
      <form
        id={formId}
        onSubmit={handleSubmit(
          (data) => {
            const stillDelayed =
              datesLocked &&
              isProjectDelayed({
                status: data.status,
                endDate: data.endDate,
              });

            if (stillDelayed) {
              setMobileSection("settings");
              setDeadlineSaveError("프로젝트를 저장하려면 마감일을 변경해주세요.");
              return;
            }

            setDeadlineSaveError(null);

            onSubmit(data, deadlineChangeReason || undefined);
          },
          (fieldErrors) => {
            const basicInvalid = Boolean(
              fieldErrors.name ||
              fieldErrors.description ||
              fieldErrors.color ||
              fieldErrors.startDate ||
              (!datesLocked && fieldErrors.endDate),
            );

            const settingsInvalid = Boolean(
              fieldErrors.status ||
              fieldErrors.tags ||
              fieldErrors.teamId ||
              (datesLocked && fieldErrors.endDate) ||
              isDelayed,
            );

            if (settingsInvalid && !basicInvalid) {
              setMobileSection("settings");
            } else if (basicInvalid) {
              setMobileSection("basic");
            }

            if (basicInvalid || settingsInvalid) {
              scrollToProjectFormError(formId);
            }

            if (!isDelayed) {
              return;
            }

            setDeadlineSaveError("프로젝트를 저장하려면 마감일을 변경해주세요.");
          },
        )}
        className={` ${splitLayout ? "max-md:[--button-height:36px]" : ""} ${
          splitLayout
            ? splitFillsViewport
              ? `flex flex-1 flex-col md:min-h-0 md:overflow-hidden`
              : "flex flex-col"
            : `rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] md:p-8`
        } `}
      >
        {splitLayout ? (
          <div
            className={`sticky top-[var(--header-height)] z-20 bg-[var(--color-page)] px-[var(--page-padding-x)] pt-2 md:hidden`}
          >
            <LineTabMenu
              ariaLabel="프로젝트 관리 구역"
              value={mobileSection}
              items={[
                {
                  id: "basic",
                  label: "기본 정보",
                },
                {
                  id: "settings",
                  label: "프로젝트 설정",
                },
              ]}
              onChange={setMobileSection}
            />
          </div>
        ) : null}

        {createShell && pageTitle ? (
          <FormPageTitle title={pageTitle} description={pageDescription} />
        ) : null}

        <div
          className={
            splitLayout
              ? createShell
                ? `relative grid min-h-full flex-1 grid-cols-1 grid-rows-[minmax(min-content,1fr)] gap-4 px-[var(--page-padding-x)] pt-3 pb-4 md:min-h-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)] md:gap-5 md:pt-0 md:pb-5`
                : splitFillsViewport
                  ? `relative grid min-h-full flex-1 grid-cols-1 grid-rows-[minmax(min-content,1fr)] md:min-h-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]`
                  : `relative grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]`
              : "space-y-4 md:space-y-6"
          }
        >
          {splitLayout && !createShell ? (
            <div
              aria-hidden
              className="pointer-events-none absolute top-6 bottom-6 left-1/2 hidden w-px -translate-x-1/2 bg-[var(--color-border)] md:block"
            />
          ) : null}

          <BasicInfoSection
            control={control}
            register={register}
            errors={errors}
            layout={layout}
            mobileSection={mobileSection}
            nameValue={nameValue}
            descriptionValue={descriptionValue}
            periodTotalLabel={periodTotalLabel}
            accentColor={accentColor}
            minDate={minDate}
            endDateMin={endDateMin}
            datesLocked={datesLocked}
            isCreating={isCreating}
            periodDeadline={periodDeadline}
          />

          <SettingsSection
            control={control}
            errors={errors}
            layout={layout}
            mobileSection={mobileSection}
            accentColor={accentColor}
            statusValue={statusValue}
            isCreating={isCreating}
            plannedLocked={plannedLocked}
            datesLocked={datesLocked}
            nameValue={nameValue}
            teamIdValue={teamIdValue}
            currentMainProject={currentMainProject}
            projectId={projectId}
            admin={admin}
            setPreviewAdminName={setPreviewAdminName}
            columnFooter={columnFooter}
            deadline={deadline}
          />
        </div>

        <ProjectPreviewModal
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
          name={nameValue}
          description={descriptionValue}
          color={colorValue}
          isMain={isMainValue}
          status={statusValue}
          delayed={isDelayed}
          startDate={startDateValue}
          endDate={periodDeadline}
          teamLabel={getProjectTeamLabel(parseProjectTeamSelection(teamIdValue))}
          adminName={previewAdminName}
          tags={tagsValue}
        />

        {showActions ? (
          <FormActions
            splitLayout={splitLayout}
            isSubmitting={isSubmitting}
            submitLabel={submitLabel}
            onCancel={onCancel}
          />
        ) : null}
      </form>

      {showActionBar ? (
        <FormActionBar
          formId={formId}
          isSubmitting={isSubmitting}
          submitLabel={submitLabel}
          onCancel={onCancel}
          setIsPreviewOpen={setIsPreviewOpen}
        />
      ) : null}

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

      <DeadlineToast deadlineToast={deadlineToast} setDeadlineToast={setDeadlineToast} />
    </div>
  );
}
