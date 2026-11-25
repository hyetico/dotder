import { getTeamName } from "@/lib/mock/teams";

export type ProjectTeamOption = {
  value: string;
  label: string;
  description: string;
  icon: string;
};

export const PROJECT_TEAM_NONE = "none";

export const PROJECT_TEAM_PERSONAL = "personal";

export const PROJECT_TEAM_NONE_LABEL = "없음";

export const PROJECT_TEAM_PERSONAL_LABEL = "개인";

const teamOptionDescription = "팀원 구성과 프로젝트 진행 상황을 함께 관리합니다.";

type ProjectTeamSource = {
  teamId: number | null;
  isPersonal: boolean;
};

type TeamOptionSource = {
  id: number;
  name: string;
  icon: string;
};

export function getProjectTeamOptions(teams: TeamOptionSource[]): ProjectTeamOption[] {
  return teams.map((team) => ({
    value: String(team.id),
    label: team.name,
    description: teamOptionDescription,
    icon: team.icon,
  }));
}

export function parseProjectTeamSelection(value: string): ProjectTeamSource {
  if (value === PROJECT_TEAM_PERSONAL) {
    return {
      teamId: null,
      isPersonal: true,
    };
  }

  const teamId = Number(value);

  if (Number.isInteger(teamId) && teamId > 0) {
    return {
      teamId,
      isPersonal: false,
    };
  }

  return {
    teamId: null,
    isPersonal: false,
  };
}

export function toProjectTeamFormValue({ teamId, isPersonal }: ProjectTeamSource) {
  if (isPersonal) {
    return PROJECT_TEAM_PERSONAL;
  }

  if (teamId == null) {
    return PROJECT_TEAM_NONE;
  }

  return String(teamId);
}

export function getProjectTeamLabel({ teamId, isPersonal }: ProjectTeamSource) {
  if (isPersonal) {
    return PROJECT_TEAM_PERSONAL_LABEL;
  }

  if (teamId == null) {
    return PROJECT_TEAM_NONE_LABEL;
  }

  return getTeamName(teamId);
}
