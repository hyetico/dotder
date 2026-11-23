"use client";

import { Controller, type Control } from "react-hook-form";

import CrownBadge from "@/components/ui/badge/CrownBadge";
import { fieldPaddingClassName } from "@/components/ui/fieldControl";
import Switch from "@/components/ui/Switch";

import { FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import { mainSettingTitle } from "@/features/projects/constants/projectFormDefaults";
import { getProjectMainGuideItems } from "@/features/projects/constants/projectFormGuides";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { type Project } from "@/features/projects/types/project";

const changeBoxClassName =
  "grid min-w-0 w-full grid-cols-1 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] md:grid-cols-2";
const changeBeforeClassName = "min-w-0 bg-[var(--color-muted)] px-3 py-2";
const changeAfterClassName =
  "min-w-0 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 md:border-t-0 md:border-l";
const changeLabelClassName = "text-caption text-[var(--color-text-muted)]";
const changeTitleClassName = "text-body mt-1 font-medium break-words";

/**
 * MainChangeSide
 *
 * 메인 프로젝트 변경 박스의 한쪽 칸입니다.
 *
 * @param props - MainChangeSide 컴포넌트 Props
 * @param props.label - 칸 이름
 * @param props.title - 칸에 보여줄 프로젝트 이름
 * @param props.muted - 이름을 흐리게 보여줄지 여부
 * @param props.className - 칸 클래스
 */
function MainChangeSide({
  label,
  title,
  muted = false,
  className,
}: {
  label: string;
  title: string;
  muted?: boolean;
  className: string;
}) {
  const titleClassName = [
    changeTitleClassName,
    muted ? "text-[var(--color-text-secondary)]" : "text-[var(--color-text)]",
  ].join(" ");

  return (
    <div className={className}>
      <p className={changeLabelClassName}>{label}</p>

      <p title={title} className={titleClassName}>
        {title}
      </p>
    </div>
  );
}

/**
 * MainProjectChangeBox
 *
 * 메인 프로젝트 변경을 변경 전과 변경 후로 보여줍니다. 모바일은 위아래, 웹은 반반 칸입니다.
 *
 * @param props - MainProjectChangeBox 컴포넌트 Props
 * @param props.nameValue - 입력한 프로젝트 이름
 * @param props.currentMainProject - 현재 메인 프로젝트
 */
export function MainProjectChangeBox({
  nameValue,
  currentMainProject,
}: {
  nameValue: string;
  currentMainProject: Project | null;
}) {
  const nextTitle = nameValue.trim() || "이 프로젝트";

  return (
    <div className={changeBoxClassName}>
      <MainChangeSide
        label="변경 전"
        title={currentMainProject?.name ?? "없음"}
        muted={!currentMainProject}
        className={changeBeforeClassName}
      />

      <MainChangeSide label="변경 후" title={nextTitle} className={changeAfterClassName} />
    </div>
  );
}

/**
 * ProjectMainField
 *
 * 메인 프로젝트로 지정할지 정하는 필드입니다. 변경 전과 변경 후를 보여줍니다.
 *
 * @param props - ProjectMainField 컴포넌트 Props
 * @param props.control - 폼 컨트롤
 * @param props.accentColor - 프로젝트 강조 색
 * @param props.nameValue - 입력한 프로젝트 이름
 * @param props.currentMainProject - 현재 메인 프로젝트
 * @param props.splitLayout - 좌우 분할 레이아웃인지 여부
 */
export function ProjectMainField({
  control,
  accentColor,
  nameValue,
  currentMainProject,
  splitLayout,
}: {
  control: Control<ProjectFormData>;
  accentColor: string;
  nameValue: string;
  currentMainProject: Project | null;
  splitLayout: boolean;
}) {
  return (
    <>
      <Controller
        name="isMain"
        control={control}
        render={({ field }) => {
          const settingSwitch = (
            <Switch checked={field.value} label={mainSettingTitle} onChange={field.onChange} />
          );

          return (
            <div className={splitLayout ? "order-8 shrink-0" : undefined}>
              <FormLabel
                label={mainSettingTitle}
                guideItems={getProjectMainGuideItems(accentColor)}
              />

              <div className="rounded-[var(--radius-sm)] border border-[var(--color-field-border)] bg-[var(--color-field)]">
                <div className={`flex items-center gap-3 py-3 ${fieldPaddingClassName} `}>
                  <CrownBadge title="메인 프로젝트" />

                  <MainProjectChangeBox
                    nameValue={nameValue}
                    currentMainProject={currentMainProject}
                  />

                  {settingSwitch}
                </div>
              </div>
            </div>
          );
        }}
      />
    </>
  );
}
