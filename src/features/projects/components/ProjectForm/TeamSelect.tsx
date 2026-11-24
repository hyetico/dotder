"use client";

import { useState, type ReactNode } from "react";

import SecondaryButton from "@/components/ui/button/SecondaryButton";
import { fieldPaddingClassName } from "@/components/ui/fieldControl";
import { AppIcon, Users } from "@/components/ui/icon";

import TeamScopeModal from "@/features/projects/modals/TeamScopeModal";
import {
  PROJECT_TEAM_NONE,
  PROJECT_TEAM_NONE_LABEL,
  PROJECT_TEAM_PERSONAL,
  PROJECT_TEAM_PERSONAL_LABEL,
  type ProjectTeamOption,
} from "@/features/projects/utils/projectTeam";

type TeamSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: ProjectTeamOption[];
  description?: string;
  footer?: ReactNode;
};

export default function TeamSelect({
  value,
  onChange,
  options,
  description,
  footer = null,
}: TeamSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectableOptions = options.filter((option) => option.value !== PROJECT_TEAM_NONE);

  const selectedOption = selectableOptions.find((option) => option.value === value);

  const hasTeam = Boolean(selectedOption);

  const teamActionLabel = hasTeam ? "변경" : "추가";

  const teamDialogLabel = hasTeam ? "팀 변경" : "팀 추가";

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <div className="min-w-0">
      <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div
          className={`text-body flex min-h-[70px] w-full min-w-0 items-center justify-between gap-3 ${fieldPaddingClassName} text-left text-[var(--color-text)]`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {selectedOption ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center text-base leading-none">
                {selectedOption.icon}
              </span>
            ) : null}

            <div className="min-w-0">
              <p className="truncate font-medium">
                {selectedOption?.label ??
                  (value === PROJECT_TEAM_PERSONAL
                    ? PROJECT_TEAM_PERSONAL_LABEL
                    : PROJECT_TEAM_NONE_LABEL)}
              </p>

              {description ? (
                <p className="text-caption mt-0.5 truncate text-[var(--color-text-muted)]">
                  {description}
                </p>
              ) : null}
            </div>
          </div>

          <SecondaryButton
            onClick={open}
            aria-label={teamDialogLabel}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            hideIconOnMobile
            icon={<AppIcon icon={Users} size="sm" />}
          >
            {teamActionLabel}
          </SecondaryButton>
        </div>

        {footer}
      </div>

      <TeamScopeModal
        isOpen={isOpen}
        onClose={close}
        title={teamDialogLabel}
        closeLabel={hasTeam ? "팀 변경 닫기" : "팀 추가 닫기"}
        icon={<AppIcon icon={Users} size="sm" />}
        mode="team"
        options={options}
        teamValue={value}
        onConfirm={onChange}
      />
    </div>
  );
}
