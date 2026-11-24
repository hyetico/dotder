export type Team = {
  id: number;
  name: string;
  icon: string;
};

export const mockTeams: Team[] = [
  {
    id: 1,
    name: "Dotder 팀",
    icon: "🚀",
  },
  {
    id: 2,
    name: "개발팀",
    icon: "💻",
  },
  {
    id: 3,
    name: "디자인팀",
    icon: "🎨",
  },
  {
    id: 4,
    name: "마케팅팀",
    icon: "📣",
  },
  {
    id: 5,
    name: "QA팀",
    icon: "🧪",
  },
  {
    id: 6,
    name: "운영팀",
    icon: "⚙️",
  },
];

export function getTeamName(teamId: number) {
  return mockTeams.find((team) => team.id === teamId)?.name ?? "알 수 없음";
}
