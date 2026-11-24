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

import ProjectColorPicker from "@/features/projects/components/ProjectColorPicker";
import ProjectTagEditor from "@/features/projects/components/ProjectTagEditor";
import { PROJECT_TAG_PRESETS } from "@/features/projects/constants/projectTags";
import { useProjectMutations } from "@/features/projects/hooks/useProjectMutations";
import {
  projectCreateDrawerSchema,
  type ProjectCreateDrawerData,
} from "@/features/projects/schemas/projectSchema";
import { getAutoProjectStatus } from "@/features/projects/utils/projectUtils";

import { useDrawerPresence } from "@/hooks/useDrawerPresence";
import { toDateKey } from "@/lib/date";
import { currentUser } from "@/lib/mock/users";
import { DEFAULT_PROJECT_COLOR } from "@/lib/projectPalette";

type ProjectCreateDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
};

const defaultValues: ProjectCreateDrawerData = {
  name: "",
  color: DEFAULT_PROJECT_COLOR,
  startDate: "",
  endDate: "",
  description: "",
  // 새 프로젝트는 기본 태그 3개 (프로토타입 defTags.slice(0, 3))
  tags: PROJECT_TAG_PRESETS.slice(0, 3),
};

const moreToggleClassName =
  "text-body -mx-2 flex h-9 w-fit cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] px-2 font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover)]";

/**
 * 프로젝트 만들기 드로어 (6단계 · 원본 01a · Layout Spec 05).
 *
 * 이름 * → 색상 → 「더 설정하기 · 기간, 설명, 태그」(시작일/마감일 → 설명 → 태그). 화면 모양은 보드 01-a,
 * 펼친 안쪽과 동작은 프로토타입 projectForm. 상태는 자동(P-2), 메인은 ⋯ 메뉴에서 정한다(드로어에 없음).
 * 바꾼 내용이 있는데 닫으면 드로어 가운데에 확인창을 띄운다.
 */
export default function ProjectCreateDrawer({ isOpen, onClose }: ProjectCreateDrawerProps) {
  const { isPresent, isEntered } = useDrawerPresence(isOpen);

  if (!isPresent) {
    return null;
  }

  return <ProjectCreateDrawerPanel isEntered={isEntered} onClose={onClose} />;
}

function ProjectCreateDrawerPanel({
  isEntered,
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

  const name = useWatch({ control, name: "name" });

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
      status: getAutoProjectStatus(data.startDate, today),
      isStatusManual: false,
      isMain: false,
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
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={submit}
        noValidate
        onKeyDown={(event) => {
          // ⌘ / Ctrl + Enter로 추가 (프로토타입). 이름이 비어 있으면 오류 글을 보인다
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            void submit();
          }
        }}
      >
        <Drawer.Body>
          <FormField label="이름" htmlFor={nameId} required error={errors.name?.message}>
            <Input
              id={nameId}
              autoFocus
              aria-required="true"
              aria-invalid={errors.name ? true : undefined}
              maxLength={50}
              placeholder="예: 포트폴리오 리뉴얼"
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

          {/* 펼치면 버튼은 사라지고 안쪽이 그 자리에 나온다 (프로토타입 bindMore) */}
          {isMoreOpen ? null : (
            <button
              type="button"
              aria-expanded={false}
              onClick={() => setIsMoreOpen(true)}
              className={moreToggleClassName}
            >
              <AppIcon icon={ChevronDown} size="sm" className="-rotate-90" />더 설정하기
              <span className="font-normal text-[var(--color-text-secondary)]">
                · 기간, 설명, 태그
              </span>
            </button>
          )}

          {isMoreOpen ? (
            <>
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
                <Textarea
                  id={descriptionId}
                  maxLength={500}
                  placeholder="어떤 프로젝트인지 적어 두세요"
                  {...register("description")}
                />
              </FormField>

              <FormField label="태그" error={errors.tags?.message}>
                <p className="text-caption -mt-1 text-[var(--color-text-secondary)]">
                  목표가 이 태그 중에서 골라 써요
                </p>
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => (
                    <ProjectTagEditor tags={field.value} onChange={field.onChange} />
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
          <PrimaryButton type="submit" disabled={isCreating || !name.trim()}>
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
