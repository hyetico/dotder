"use client";

import { type ReactNode } from "react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Settings } from "@/components/ui/icon";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { type Project } from "@/features/projects/types/project";
import { FormSectionIntro } from "@/features/projects/components/ProjectForm/FormParts";
import {
  ProjectAdminField,
  type ProjectAdminSummary,
} from "@/features/projects/components/ProjectForm/fields/ProjectAdminField";
import { ProjectTeamField } from "@/features/projects/components/ProjectForm/fields/ProjectTeamField";
import { GoalTagField } from "@/features/projects/components/ProjectForm/fields/GoalTagField";
import { type ProjectFormLayout } from "@/features/projects/utils/projectFormLayout";
import { type ProjectDeadlineState } from "@/features/projects/hooks/useProjectDeadlineChange";
import { ProjectStatusField } from "@/features/projects/components/ProjectForm/fields/ProjectStatusField";
import { ProjectDeadlineField } from "@/features/projects/components/ProjectForm/fields/ProjectDeadlineField";
import { ProjectMainField } from "@/features/projects/components/ProjectForm/fields/ProjectMainField";

/**
 * SettingsSection
 *
 * 프로젝트의 상태, 마감일, 태그, 팀, 관리자, 메인 설정을 다루는 "프로젝트 설정" 구역입니다.
 *
 * @param props - SettingsSection 컴포넌트 Props
 * @param props.control - 폼 컨트롤
 * @param props.errors - 폼 검증 에러
 * @param props.layout - 폼 레이아웃 값과 클래스
 * @param props.mobileSection - 모바일에서 보이는 구역
 * @param props.accentColor - 프로젝트 강조 색
 * @param props.statusValue - 선택한 프로젝트 상태
 * @param props.isCreating - 새 프로젝트를 만드는 중인지 여부
 * @param props.plannedLocked - 계획 상태로 되돌릴 수 없는지 여부
 * @param props.datesLocked - 날짜를 직접 바꿀 수 없는 상태인지 여부
 * @param props.nameValue - 입력한 프로젝트 이름
 * @param props.teamIdValue - 선택한 팀 값
 * @param props.currentMainProject - 현재 메인 프로젝트
 * @param props.projectId - 수정 중인 프로젝트 id
 * @param props.admin - 관리자 정보
 * @param props.setPreviewAdminName - 관리자를 바꿀 때 미리보기 이름을 바꾸는 함수
 * @param props.columnFooter - 설정 구역 아래에 붙일 내용
 * @param props.deadline - 마감일 변경 상태와 동작
 */
export function SettingsSection({
  control,
  errors,
  layout,
  mobileSection,
  accentColor,
  statusValue,
  isCreating,
  plannedLocked,
  datesLocked,
  nameValue,
  teamIdValue,
  currentMainProject,
  projectId,
  admin,
  setPreviewAdminName,
  columnFooter,
  deadline,
}: {
  control: Control<ProjectFormData>;
  errors: FieldErrors<ProjectFormData>;
  layout: ProjectFormLayout;
  mobileSection: "basic" | "settings";
  accentColor: string;
  statusValue: ProjectFormData["status"];
  isCreating: boolean;
  plannedLocked: boolean;
  datesLocked: boolean;
  nameValue: string;
  teamIdValue: string;
  currentMainProject: Project | null;
  projectId: number | undefined;
  admin: ProjectAdminSummary;
  setPreviewAdminName: (name: string) => void;
  columnFooter: ReactNode;
  deadline: ProjectDeadlineState;
}) {
  const { splitLayout, createShell, splitCardClassName, splitScrollClassName, formPanelClassName } =
    layout;

  return (
    <div
      className={
        splitLayout
          ? ` ${createShell ? splitCardClassName : splitScrollClassName} @container ${
              createShell ? "" : "md:pl-5"
            } ${mobileSection === "basic" ? "max-md:hidden" : ""} `
          : undefined
      }
    >
      <div className={formPanelClassName}>
        {splitLayout ? (
          <FormSectionIntro
            className={createShell ? "order-first" : "order-first hidden md:flex"}
            plain={createShell}
            icon={Settings}
            title="프로젝트 설정"
            description="프로젝트의 상태, 마감일, 태그, 팀, 관리자를 설정합니다."
            mobileDescription="상태, 태그, 팀, 관리자를 설정해주세요."
          />
        ) : null}

        <div className={splitLayout ? "order-0 shrink-0" : undefined}>
          <ProjectStatusField
            control={control}
            errors={errors}
            isCreating={isCreating}
            statusValue={statusValue}
            plannedLocked={plannedLocked}
            deadline={deadline}
          />
        </div>

        {datesLocked ? (
          <div className={splitLayout ? "order-2 shrink-0" : undefined}>
            <ProjectDeadlineField projectId={projectId} errors={errors} deadline={deadline} />
          </div>
        ) : null}

        <div
          className={
            splitLayout ? (isCreating ? "order-4 shrink-0" : "order-5 shrink-0") : undefined
          }
        >
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
        </div>

        <div
          className={
            splitLayout
              ? ` ${isCreating ? "order-5" : "order-6"} grid shrink-0 gap-3`
              : "space-y-4 md:space-y-6"
          }
        >
          <ProjectTeamField control={control} accentColor={accentColor} />

          <ProjectAdminField
            admin={admin}
            teamValue={teamIdValue}
            accentColor={accentColor}
            showChangeButton={!isCreating}
            onAdminChange={setPreviewAdminName}
          />
        </div>

        <ProjectMainField
          control={control}
          accentColor={accentColor}
          nameValue={nameValue}
          currentMainProject={currentMainProject}
          splitLayout={splitLayout}
        />

        {columnFooter ? (
          <div className={splitLayout ? "order-9 shrink-0" : undefined}>{columnFooter}</div>
        ) : null}
      </div>
    </div>
  );
}
