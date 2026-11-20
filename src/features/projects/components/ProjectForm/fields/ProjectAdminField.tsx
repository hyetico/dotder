"use client";

import { useState } from "react";
import AdminSelect from "@/features/projects/components/ProjectForm/AdminSelect";
import { fieldPaddingClassName } from "@/components/ui/fieldControl";
import { getTeamMembers } from "@/lib/mock/teamMembers";
import { mockUsers } from "@/lib/mock/users";
import { parseProjectTeamSelection } from "@/features/projects/utils/projectTeam";
import { teamOptions } from "@/features/projects/constants/projectFormDefaults";
import { getProjectAdminGuideItems } from "@/features/projects/constants/projectFormGuides";
import { FormLabel } from "@/features/projects/components/ProjectForm/FormParts";

export type ProjectAdminSummary = {
  name: string;
  role: string;
  image: string;
};

/**
 * AdminPerson
 *
 * 관리자 프로필과 이름을 한 줄로 보여 줍니다.
 *
 * @param props - AdminPerson 컴포넌트 Props
 * @param props.name - 관리자 이름
 * @param props.image - 프로필 이미지 주소
 * @param props.caption - 이름 아래 표시할 역할
 */
function AdminPerson({ name, image, caption }: { name: string; image?: string; caption?: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {image ? (
        <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-200">
          <img src={image} alt={`${name} 프로필`} className="h-full w-full object-cover" />
        </span>
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-sm font-semibold text-[var(--color-primary)]">
          {name.slice(0, 1)}
        </span>
      )}

      <div className="min-w-0">
        <p className="text-body truncate font-semibold text-[var(--color-text)]">{name}</p>

        {caption ? (
          <p className="text-caption mt-0.5 truncate text-[var(--color-text-muted)]">{caption}</p>
        ) : null}
      </div>
    </div>
  );
}

export function ProjectAdminField({
  admin,
  teamValue,
  accentColor,
  showChangeButton = false,
  onAdminChange,
}: {
  admin: ProjectAdminSummary;
  teamValue: string;
  accentColor: string;
  showChangeButton?: boolean;
  onAdminChange?: (name: string) => void;
}) {
  const [adminName, setAdminName] = useState(admin.name);

  const teamSelection = parseProjectTeamSelection(teamValue);

  const selectedMember = getTeamMembers(teamSelection.teamId).find(
    (member) => member.name === adminName,
  );

  const profile = mockUsers.find((user) => user.name === adminName);

  const image = profile?.image || (adminName === admin.name ? admin.image || undefined : undefined);

  const caption =
    profile?.role ||
    selectedMember?.role ||
    (adminName === admin.name ? admin.role || undefined : undefined);

  return (
    <div>
      <FormLabel label="프로젝트 관리자" guideItems={getProjectAdminGuideItems(accentColor)} />

      <div className="overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-field-border)] bg-[var(--color-field)]">
        <div
          className={`flex h-[70px] items-center justify-between gap-3 ${fieldPaddingClassName} `}
        >
          <AdminPerson name={adminName} image={image} caption={caption} />

          {showChangeButton ? (
            <AdminSelect
              teamValue={teamValue}
              options={teamOptions}
              selectedMemberId={selectedMember?.id}
              onChange={(member) => {
                setAdminName(member.name);
                onAdminChange?.(member.name);
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
