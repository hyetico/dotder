"use client";

import { useState, type ReactNode } from "react";

import { Controller, type Control } from "react-hook-form";

import SecondaryButton from "@/components/ui/button/SecondaryButton";
import { AppIcon, FileText, Users } from "@/components/ui/icon";
import InfoTooltip, { type InfoTooltipItem } from "@/components/ui/InfoTooltip";
import MemberAvatar from "@/components/ui/MemberAvatar";
import Switch from "@/components/ui/Switch";

import { MainProjectChangeBox } from "@/features/projects/components/ProjectForm/fields/ProjectMainField";
import {
  mainSettingTitle,
  teamOptions,
  tooltipWidthClassName,
} from "@/features/projects/constants/projectFormDefaults";
import {
  getProjectAdminGuideItems,
  getProjectMainGuideItems,
  getTeamSelectionGuideItems,
} from "@/features/projects/constants/projectFormGuides";
import TeamScopeModal from "@/features/projects/modals/TeamScopeModal";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { type Project } from "@/features/projects/types/project";
import { getProjectAdmin } from "@/features/projects/utils/projectFormUtils";
import {
  getProjectTeamLabel,
  parseProjectTeamSelection,
} from "@/features/projects/utils/projectTeam";

import { getMemberInitial, getTeamMembers } from "@/lib/mock/teamMembers";

const rowClassName =
  "grid grid-cols-1 gap-y-1 py-4 md:grid-cols-[168px_minmax(0,1fr)_auto] md:items-center md:gap-y-0 md:py-5";
const rowHeaderClassName = "flex items-center justify-between gap-3 md:contents";
const rowLabelCellClassName =
  "flex min-w-0 items-center gap-1 md:col-start-1 md:row-start-1 md:border-r md:border-[var(--color-border)] md:pr-4";
const rowValueClassName = "min-w-0 md:col-start-2 md:row-start-1 md:pl-5";
const rowActionClassName = "shrink-0 md:col-start-3 md:row-start-1 md:pl-4";
const stackedRowClassName = "flex flex-col gap-2 py-4 md:py-5";
const stackedHeaderClassName = "flex items-center justify-between gap-3";
const stackedLabelClassName = "flex min-w-0 items-center gap-1";
const identityClassName = "flex min-w-0 items-center gap-2";
const teamMarkClassName =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-base leading-none";

/**
 * SettingRow
 *
 * 팀 및 프로젝트 설정의 한 줄입니다. 웹은 이름, 값, 버튼을 한 줄로 두고
 * 모바일은 이름과 버튼을 한 줄로, 값은 그 아래에 둡니다.
 * 쌓는 줄은 구분선 없이 이름과 버튼을 위에, 값을 아래에 둡니다.
 *
 * @param props - SettingRow 컴포넌트 Props
 * @param props.label - 설정 이름
 * @param props.guideItems - 이름 옆 안내 내용
 * @param props.action - 오른쪽에 둘 버튼이나 스위치
 * @param props.stacked - 이름과 버튼 아래에 값을 둘지 여부
 * @param props.children - 현재 설정 값
 */
function SettingRow({
  label,
  guideItems,
  action,
  stacked = false,
  children,
}: {
  label: string;
  guideItems: InfoTooltipItem[];
  action?: ReactNode;
  stacked?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={stacked ? stackedRowClassName : rowClassName}>
      <div className={stacked ? stackedHeaderClassName : rowHeaderClassName}>
        <div className={stacked ? stackedLabelClassName : rowLabelCellClassName}>
          <span className="text-body font-semibold text-[var(--color-text)]">{label}</span>

          <InfoTooltip title={label} items={guideItems} maxWidthClassName={tooltipWidthClassName} />
        </div>

        {action ? <div className={stacked ? "shrink-0" : rowActionClassName}>{action}</div> : null}
      </div>

      <div className={stacked ? "min-w-0" : rowValueClassName}>{children}</div>
    </div>
  );
}

/**
 * TeamSettingRow
 *
 * 연결할 팀을 보여주고, 추가·변경 버튼으로 팀 선택 창을 엽니다.
 *
 * @param props - TeamSettingRow 컴포넌트 Props
 * @param props.value - 선택한 팀 값
 * @param props.accentColor - 프로젝트 강조 색
 * @param props.onChange - 팀을 확정할 때 실행되는 함수
 */
function TeamSettingRow({
  value,
  accentColor,
  onChange,
}: {
  value: string;
  accentColor: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const selection = parseProjectTeamSelection(value);

  const selectedOption = teamOptions.find((option) => option.value === value);

  const hasTeam = Boolean(selectedOption);

  const teamAdmin = getTeamMembers(selection.teamId).find((member) => member.role === "관리자");

  const dialogLabel = hasTeam ? "팀 변경" : "팀 추가";

  return (
    <>
      <SettingRow
        label="팀"
        guideItems={getTeamSelectionGuideItems(accentColor)}
        action={
          <SecondaryButton
            aria-label={dialogLabel}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            icon={<AppIcon icon={Users} size="sm" />}
            onClick={() => setIsOpen(true)}
          >
            {hasTeam ? "변경" : "추가"}
          </SecondaryButton>
        }
      >
        {selectedOption ? (
          <div className={identityClassName}>
            <span className={teamMarkClassName}>{selectedOption.icon}</span>

            <div className="min-w-0">
              <p className="text-body truncate font-semibold text-[var(--color-text)]">
                {selectedOption.label}
              </p>

              {teamAdmin ? (
                <p className="text-caption truncate text-[var(--color-text-muted)]">
                  {teamAdmin.name} · 팀 관리자
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-body text-[var(--color-text-secondary)]">
            {getProjectTeamLabel(selection)}
          </p>
        )}
      </SettingRow>

      <TeamScopeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={dialogLabel}
        closeLabel={hasTeam ? "팀 변경 닫기" : "팀 추가 닫기"}
        icon={<AppIcon icon={Users} size="sm" />}
        mode="team"
        options={teamOptions}
        teamValue={value}
        onConfirm={onChange}
      />
    </>
  );
}

/**
 * EditSettingsStep
 *
 * 3단계 입력입니다. 연결할 팀을 고르고, 프로젝트 관리자를 확인하고, 메인 프로젝트 여부를 정합니다.
 * 아래에는 지금까지 정한 설정을 한 번 더 요약해서 보여줍니다.
 *
 * @param props - EditSettingsStep 컴포넌트 Props
 * @param props.control - 폼 컨트롤
 * @param props.accentColor - 프로젝트 강조 색
 * @param props.nameValue - 입력한 프로젝트 이름
 * @param props.teamIdValue - 선택한 팀 값
 * @param props.isMainValue - 메인 프로젝트로 지정했는지 여부
 * @param props.currentMainProject - 현재 메인 프로젝트
 * @param props.adminName - 프로젝트 관리자 이름
 * @param props.onTeamChange - 팀을 바꿀 때 실행되는 함수
 * @param props.hideIntro - 구역 제목을 숨길지 여부. 바깥 카드에 제목이 있을 때 씁니다
 * @param props.adminAction - 관리자 줄 오른쪽에 둘 변경 버튼
 * @param props.footer - 설정 요약 아래에 붙일 내용
 */
export function EditSettingsStep({
  control,
  accentColor,
  nameValue,
  teamIdValue,
  isMainValue,
  currentMainProject,
  adminName,
  onTeamChange,
  hideIntro = false,
  adminAction,
  footer,
}: {
  control: Control<ProjectFormData>;
  accentColor: string;
  nameValue: string;
  teamIdValue: string;
  isMainValue: boolean;
  currentMainProject: Project | null;
  adminName: string;
  onTeamChange: () => void;
  hideIntro?: boolean;
  adminAction?: ReactNode;
  footer?: ReactNode;
}) {
  const profile = getProjectAdmin(adminName);

  const selectedMember = getTeamMembers(parseProjectTeamSelection(teamIdValue).teamId).find(
    (member) => member.name === adminName,
  );

  const admin = { name: profile.name, role: profile.role || selectedMember?.role || "" };

  const summaryItems = [
    { label: "팀", value: getProjectTeamLabel(parseProjectTeamSelection(teamIdValue)) },
    {
      label: "프로젝트 관리자",
      value: admin.role ? `${admin.name} (${admin.role})` : admin.name,
    },
    { label: "메인 프로젝트", value: isMainValue ? "지정" : "지정 안 함" },
  ];

  return (
    <div>
      {hideIntro ? null : (
        <div className="pb-1">
          <h2 className="text-section-title text-[var(--color-text)]">팀 및 프로젝트 설정</h2>

          <p className="text-body mt-1 text-[var(--color-text-secondary)]">
            프로젝트에 참여할 팀과 관리자를 확인하고 메인 프로젝트 여부를 설정합니다.
          </p>
        </div>
      )}

      <div className="divide-y divide-[var(--color-border)]">
        <Controller
          name="teamId"
          control={control}
          render={({ field }) => (
            <TeamSettingRow
              value={field.value}
              accentColor={accentColor}
              onChange={(value) => {
                field.onChange(value);
                onTeamChange();
              }}
            />
          )}
        />

        <SettingRow
          label="프로젝트 관리자"
          guideItems={getProjectAdminGuideItems(accentColor)}
          action={adminAction}
        >
          <div className={identityClassName}>
            <MemberAvatar
              label={getMemberInitial(admin.name)}
              title={admin.name}
              bordered={false}
            />

            <div className="min-w-0">
              <p className="text-body truncate font-semibold text-[var(--color-text)]">
                {admin.name}
              </p>

              {admin.role ? (
                <p className="text-caption truncate text-[var(--color-text-muted)]">{admin.role}</p>
              ) : null}
            </div>
          </div>
        </SettingRow>

        <Controller
          name="isMain"
          control={control}
          render={({ field }) => (
            <SettingRow
              label={mainSettingTitle}
              guideItems={getProjectMainGuideItems(accentColor)}
              stacked
              action={
                <Switch checked={field.value} label={mainSettingTitle} onChange={field.onChange} />
              }
            >
              <MainProjectChangeBox nameValue={nameValue} currentMainProject={currentMainProject} />
            </SettingRow>
          )}
        />
      </div>

      <div className="mt-2 rounded-[var(--radius-md)] bg-[var(--color-muted)] px-4 py-3 md:flex md:items-center md:gap-5">
        <p className="text-body flex shrink-0 items-center gap-2 font-semibold text-[var(--color-text)]">
          <AppIcon icon={FileText} size="md" />
          설정 확인
        </p>

        <dl className="mt-2 grid gap-1.5 border-t border-[var(--color-border)] pt-2 md:mt-0 md:flex md:min-w-0 md:flex-1 md:flex-wrap md:gap-x-6 md:border-t-0 md:border-l md:pt-0 md:pl-5">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="text-body grid grid-cols-[104px_minmax(0,1fr)] gap-2 md:flex md:gap-1.5"
            >
              <dt className="text-[var(--color-text-secondary)]">{item.label}:</dt>

              <dd className="min-w-0 font-medium text-[var(--color-text)]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {footer}
    </div>
  );
}
