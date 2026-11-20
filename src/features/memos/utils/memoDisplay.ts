import { getTeamName } from "@/lib/mock/teams";

import type { Memo } from "@/features/memos/types/memo";

type MemoProject = {
  name: string;
  teamId: number | null;
};

/**
 * splitMemoText
 *
 * 입력한 메모를 제목과 본문으로 나눕니다.
 * 첫 줄을 제목으로 쓰고, 다음 줄부터는 본문으로 둡니다.
 *
 * @param text - 입력한 메모
 * @returns 제목과 본문. 내용이 없으면 null
 */
export function splitMemoText(text: string): { title: string; body: string } | null {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  const [titleLine, ...rest] = trimmed.split(/\n+/);
  const title = titleLine.trim();

  if (!title) {
    return null;
  }

  return {
    title,
    body: rest.join("\n").trim(),
  };
}

/**
 * formatMemoDate
 *
 * 메모를 쓴 시각을 카드에 보여줄 문자열로 바꿉니다.
 *
 * @param value - `2026-11-09T13:48:00` 형태의 시각
 * @returns `2026.11.09 13:48`
 */
export function formatMemoDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * getMemoProjectLabel
 *
 * 메모 카드에 보여줄 프로젝트 이름을 만듭니다.
 * 프로젝트가 없으면 미연결로 표시하고, 팀이 있으면 팀 이름을 씁니다.
 *
 * @param project - 메모에 연결된 프로젝트. 없으면 null
 * @returns 카드에 표시할 이름
 */
export function getMemoProjectLabel(project: MemoProject | null) {
  if (!project) {
    return "프로젝트 미연결";
  }

  if (project.teamId == null) {
    return project.name;
  }

  const teamName = getTeamName(project.teamId);

  return teamName === "알 수 없음" ? project.name : teamName;
}

/**
 * getMemoRegistrationLabel
 *
 * 메모를 어디에 등록했는지 뱃지 문구로 바꿉니다.
 *
 * @param memo - 등록 상태를 볼 메모
 * @returns 등록 뱃지 문구. 아직 등록하지 않았으면 null
 */
export function getMemoRegistrationLabel(memo: Memo) {
  if (!memo.registration) {
    return null;
  }

  return memo.registration.kind === "goal" ? "목표 등록됨" : "태스크 등록됨";
}
