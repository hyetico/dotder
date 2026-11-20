import { mockTeams } from "@/lib/mock/teams";
import { getProjectTeamOptions, PROJECT_TEAM_NONE } from "@/features/projects/utils/projectTeam";
import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";
import { PROJECT_TAG_PRESETS } from "@/features/projects/constants/projectTags";

export const projectFormDomId = "project-form";

export const teamOptions = getProjectTeamOptions(mockTeams);

export const tooltipWidthClassName = "max-w-[480px]";

export const PROJECT_DESCRIPTION_LIMIT = 500;

export const defaultFormValues: ProjectFormData = {
  name: "",
  description: "",
  color: null,
  teamId: PROJECT_TEAM_NONE,
  startDate: "",
  endDate: "",
  status: "PLANNED",
  isMain: false,
  tags: [...PROJECT_TAG_PRESETS],
};

export const mainSettingTitle = "메인 프로젝트 설정";

export const deadlineChangeLabel = "마감일 변경";
