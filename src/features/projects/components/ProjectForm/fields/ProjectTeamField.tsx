"use client";

import { Controller, type Control } from "react-hook-form";
import TeamSelect from "@/features/projects/components/ProjectForm/TeamSelect";
import { getTeamMembers } from "@/lib/mock/teamMembers";
import { parseProjectTeamSelection } from "@/features/projects/utils/projectTeam";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { teamOptions } from "@/features/projects/constants/projectFormDefaults";
import { getTeamSelectionGuideItems } from "@/features/projects/constants/projectFormGuides";
import { FormLabel } from "@/features/projects/components/ProjectForm/FormParts";

export function ProjectTeamField({
  control,
  accentColor,
}: {
  control: Control<ProjectFormData>;
  accentColor: string;
}) {
  return (
    <div>
      <FormLabel label="팀" guideItems={getTeamSelectionGuideItems(accentColor)} />

      <Controller
        name="teamId"
        control={control}
        render={({ field }) => {
          const teamSelection = parseProjectTeamSelection(field.value);

          const teamAdminMember = getTeamMembers(teamSelection.teamId).find(
            (member) => member.role === "관리자",
          );

          return (
            <TeamSelect
              value={field.value}
              onChange={field.onChange}
              options={teamOptions}
              description={teamAdminMember ? `${teamAdminMember.name} · 팀 관리자` : undefined}
            />
          );
        }}
      />
    </div>
  );
}
