export type TeamMember = {
  id: number;
  teamId: number;
  name: string;
  role: string;
  email: string;
};

export const mockTeamMembers: TeamMember[] = [
  {
    id: 1,
    teamId: 1,
    name: "김인수",
    role: "관리자",
    email: "insu@example.com",
  },
  {
    id: 2,
    teamId: 1,
    name: "이지온",
    role: "멤버",
    email: "jion@example.com",
  },
  {
    id: 3,
    teamId: 1,
    name: "박서연",
    role: "멤버",
    email: "seoyeon@example.com",
  },
  {
    id: 4,
    teamId: 1,
    name: "최민호",
    role: "멤버",
    email: "minho@example.com",
  },
  {
    id: 5,
    teamId: 1,
    name: "정다은",
    role: "게스트",
    email: "daeun@example.com",
  },
  {
    id: 6,
    teamId: 2,
    name: "김민수",
    role: "관리자",
    email: "minsu@example.com",
  },
  {
    id: 7,
    teamId: 2,
    name: "이지은",
    role: "멤버",
    email: "jieun@example.com",
  },
  {
    id: 8,
    teamId: 2,
    name: "박준영",
    role: "멤버",
    email: "junyoung@example.com",
  },
  {
    id: 9,
    teamId: 3,
    name: "한소희",
    role: "관리자",
    email: "sohee@example.com",
  },
  {
    id: 10,
    teamId: 3,
    name: "오예린",
    role: "멤버",
    email: "yerin@example.com",
  },
  {
    id: 11,
    teamId: 4,
    name: "윤도현",
    role: "관리자",
    email: "dohyun@example.com",
  },
  {
    id: 12,
    teamId: 4,
    name: "장하늘",
    role: "멤버",
    email: "haneul@example.com",
  },
  {
    id: 13,
    teamId: 5,
    name: "서준호",
    role: "관리자",
    email: "junho@example.com",
  },
  {
    id: 14,
    teamId: 5,
    name: "배수아",
    role: "멤버",
    email: "sua@example.com",
  },
  {
    id: 15,
    teamId: 6,
    name: "노은채",
    role: "관리자",
    email: "eunchae@example.com",
  },
  {
    id: 16,
    teamId: 6,
    name: "문지호",
    role: "멤버",
    email: "jiho@example.com",
  },
];

export function getTeamMembers(teamId: number | null): TeamMember[] {
  if (teamId == null) {
    return [];
  }

  return mockTeamMembers.filter((member) => member.teamId === teamId);
}

export function getMemberInitial(name: string) {
  return name.charAt(0);
}

/**
 * getTeamMember
 *
 * 멤버 번호로 팀 멤버를 찾습니다.
 *
 * @param memberId - 찾을 멤버 번호
 * @returns 멤버. 없으면 null
 */
export function getTeamMember(memberId: number) {
  return mockTeamMembers.find((member) => member.id === memberId) ?? null;
}
