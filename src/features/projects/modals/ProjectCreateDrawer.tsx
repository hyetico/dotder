"use client";

import { useId, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import DatePicker from "@/components/ui/date-picker/DatePicker";
import Drawer from "@/components/ui/drawer/Drawer";
import FormField from "@/components/ui/form/FormField";
import { AppIcon, ChevronDown } from "@/components/ui/icon";
import Input from "@/components/ui/input/Input";
import Textarea from "@/components/ui/input/Textarea";
import AlertModal from "@/components/ui/modal/AlertModal";
import StatusChoiceButton from "@/components/ui/StatusChoiceButton";
import Switch from "@/components/ui/Switch";

import ProjectColorPicker from "@/features/projects/components/ProjectColorPicker";
import { GoalTagField } from "@/features/projects/components/ProjectForm/fields/GoalTagField";
import ProjectStatusIcon from "@/features/projects/components/ProjectStatusIcon";
import { PROJECT_TAG_PRESETS } from "@/features/projects/constants/projectTags";
import { useProjectMutations } from "@/features/projects/hooks/useProjectMutations";
import {
  projectCreateDrawerSchema,
  type ProjectCreateDrawerData,
} from "@/features/projects/schemas/projectSchema";
import { PROJECT_STATUSES } from "@/features/projects/types/project";
import { getProjectAccentColor } from "@/features/projects/utils/projectColors";
import {
  getAutoProjectStatus,
  getProjectStatusLabel,
} from "@/features/projects/utils/projectUtils";

import { useDrawerPresence } from "@/hooks/useDrawerPresence";
import { toDateKey } from "@/lib/date";
import { currentUser } from "@/lib/mock/users";
import { DEFAULT_PROJECT_COLOR } from "@/lib/projectPalette";
import { PROJECT_STATUS_FILTER_ICON_COLORS } from "@/lib/statusColors";

import type { Project } from "@/features/projects/types/project";

type ProjectCreateDrawerProps = {
  isOpen: boolean;
  /** 지금 메인 프로젝트. 새 프로젝트를 메인으로 정하면 이 프로젝트는 메인에서 풀린다. */
  mainProject: Project | null;
  onClose: () => void;
};

const defaultValues: ProjectCreateDrawerData = {
  name: "",
  color: DEFAULT_PROJECT_COLOR,
  status: null,
  startDate: "",
  endDate: "",
  description: "",
  tags: [...PROJECT_TAG_PRESETS],
  isMain: false,
};

const moreToggleClassName =
  "text-body -mx-2 flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-2 font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover)]";

/**
 * 프로젝트 만들기 드로어 (6단계 · 원본 01a · Layout Spec 05).
 *
 * 이름 * → 색상 → 「더 설정하기」(상태 · 기간 · 설명 · 태그 · 메인). 이름만 필수, 마감은 비워도 되고(P-3),
 * 상태는 고르지 않으면 시작일로 자동(P-2). 바꾼 내용이 있는데 닫으면 드로어 가운데에 확인창을 띄운다.
 */
export default function ProjectCreateDrawer({
  isOpen,
  mainProject,
  onClose,
}: ProjectCreateDrawerProps) {
  const { isPresent, isEntered } = useDrawerPresence(isOpen);

  if (!isPresent) {
    return null;
  }

  return (
    <ProjectCreateDrawerPanel isEntered={isEntered} mainProject={mainProject} onClose={onClose} />
  );
}

function ProjectCreateDrawerPanel({
  isEntered,
  mainProject,
  onClose,
}: Omit<ProjectCreateDrawerProps, "isOpen"> & { isEntered: boolean }) {
  const titleId = useId();
  const nameId = useId();
  const descriptionId = useId();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { createProject, isCreating } = useProjectMutations();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProjectCreateDrawerData>({
    resolver: zodResolver(projectCreateDrawerSchema),
    defaultValues,
  });

  const color = useWatch({ control, name: "color" });
  const accentColor = getProjectAccentColor(color);

  const requestClose = () => {
    if (isDirty) {
      setIsConfirmOpen(true);
      return;
    }

    onClose();
  };

  const submit = handleSubmit((data) => {
    const today = toDateKey(new Date());

    createProject({
      name: data.name,
      description: data.description,
      teamId: null,
      isPersonal: true,
      color: data.color,
      startDate: data.startDate,
      endDate: data.endDate,
      completedAt: null,
      status: data.status ?? getAutoProjectStatus(data.startDate, today),
      isStatusManual: data.status != null,
      isMain: data.isMain,
      tags: data.tags,
      creatorId: currentUser.id,
    });
  });

  return (
    <Drawer
      isEntered={isEntered}
      title="프로젝트 추가"
      titleId={titleId}
      onClose={requestClose}
      closeLabel="프로젝트 추가 닫기"
    >
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={submit} noValidate>
        <Drawer.Body>
          <FormField label="이름" htmlFor={nameId} required error={errors.name?.message}>
            <Input
              id={nameId}
              autoFocus
              aria-required="true"
              aria-invalid={errors.name ? true : undefined}
              maxLength={50}
              placeholder="프로젝트 이름을 입력하세요"
              {...register("name")}
            />
          </FormField>

          <FormField label="색상">
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <ProjectColorPicker label="색상" value={field.value} onChange={field.onChange} />
              )}
            />
          </FormField>

          <button
            type="button"
            aria-expanded={isMoreOpen}
            onClick={() => setIsMoreOpen((open) => !open)}
            className={moreToggleClassName}
          >
            <AppIcon
              icon={ChevronDown}
              size="sm"
              className={`transition-transform ${isMoreOpen ? "" : "-rotate-90"}`}
            />
            더 설정하기
            <span className="font-normal text-[var(--color-text-secondary)]">
              · 상태, 기간, 설명, 태그, 메인
            </span>
          </button>

          {isMoreOpen ? (
            <>
              <FormField
                label="상태"
                hint="평소엔 태스크 진행에 따라 자동으로 바뀌어요. 직접 고르면 그 값을 유지해요."
              >
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-1.5">
                      {PROJECT_STATUSES.map((status) => (
                        <StatusChoiceButton
                          key={status}
                          statusId={status}
                          palette="status"
                          showIconAlways
                          selected={field.value === status}
                          onClick={() => field.onChange(field.value === status ? null : status)}
                          icon={
                            <span
                              className="inline-flex"
                              style={{ color: PROJECT_STATUS_FILTER_ICON_COLORS[status] }}
                            >
                              <ProjectStatusIcon status={status} size={14} />
                            </span>
                          }
                        >
                          {getProjectStatusLabel(status)}
                        </StatusChoiceButton>
                      ))}
                    </div>
                  )}
                />
              </FormField>

              <div className="grid grid-cols-2 gap-3">
                <FormField label="시작일">
                  <Controller
                    name="startDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker value={field.value} onChange={field.onChange} title="시작일" />
                    )}
                  />
                </FormField>
                <FormField label="마감일" error={errors.endDate?.message}>
                  <Controller
                    name="endDate"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        title="마감일"
                        invalid={errors.endDate != null}
                      />
                    )}
                  />
                </FormField>
              </div>

              <FormField label="설명" htmlFor={descriptionId} error={errors.description?.message}>
                <Textarea id={descriptionId} maxLength={500} {...register("description")} />
              </FormField>

              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <GoalTagField
                    tags={field.value}
                    accentColor={accentColor}
                    error={errors.tags?.message}
                    onChange={field.onChange}
                  />
                )}
              />

              <FormField
                label="메인 프로젝트"
                hint={
                  mainProject ? "다른 프로젝트를 메인으로 정하면 기존 메인은 풀려요." : undefined
                }
              >
                <Controller
                  name="isMain"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      label="메인 프로젝트로 정하기"
                      onChange={field.onChange}
                    />
                  )}
                />
              </FormField>
            </>
          ) : null}
        </Drawer.Body>

        <Drawer.Footer>
          <SecondaryButton onClick={requestClose} disabled={isCreating}>
            취소
          </SecondaryButton>
          <PrimaryButton type="submit" disabled={isCreating}>
            추가
          </PrimaryButton>
        </Drawer.Footer>
      </form>

      <AlertModal
        isOpen={isConfirmOpen}
        title="수정을 취소할까요?"
        confirmLabel="취소하기"
        cancelLabel="계속 수정"
        tone="danger"
        onConfirm={() => {
          setIsConfirmOpen(false);
          onClose();
        }}
        onClose={() => setIsConfirmOpen(false)}
      />
    </Drawer>
  );
}
