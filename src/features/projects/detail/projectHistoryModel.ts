import { formatMonthDot, GOAL_STATUS_BADGE } from "@/features/projects/detail/projectOverviewModel";
import { getProjectStatusLabel } from "@/features/projects/utils/projectUtils";
import { TASK_STATUS_LABEL } from "@/features/tasks/taskModel";

import type { GoalStatus } from "@/features/goals/types/goal";
import type { TaskStatus } from "@/features/tasks/types/task";
import type { ProjectHistoryEntry } from "@/lib/mock/projectHistory";
import type { ProjectStatusColorKey } from "@/lib/statusColors";

// 받침이 없거나 ㄹ이면 「로」, 그 밖은 「으로」
const toParticle = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return "로";
  const final = code % 28;
  return final === 0 || final === 8 ? "로" : "으로";
};

const TARGET_LABEL = { project: "프로젝트", goal: "목표", task: "태스크" } as const;

/** 저장된 상태 값을 화면 이름으로 바꾼다 */
export function historyStatusLabel(entry: ProjectHistoryEntry, value = "") {
  if (entry.target === "task") return TASK_STATUS_LABEL[value as TaskStatus] ?? value;
  if (entry.target === "goal") return GOAL_STATUS_BADGE[value as GoalStatus]?.label ?? value;
  return getProjectStatusLabel(value as ProjectStatusColorKey) ?? value;
}

/**
 * 웹 기록 한 줄 (보드 08). 굵게 보일 부분은 `strong`으로 따로 돌려준다.
 *
 * @example
 * historyWideText(entry) // { text: "태스크 '로그인 UI 구현' 완료" }
 */
export function historyWideText(entry: ProjectHistoryEntry): { text: string; strong?: string } {
  const name = entry.name ? `${TARGET_LABEL[entry.target]} '${entry.name}' ` : "";
  switch (entry.kind) {
    case "create":
      return { text: "프로젝트 만듦" };
    case "add":
      return { text: `${name}추가` };
    case "delete":
      return { text: `${name}삭제` };
    case "done":
      return { text: `${name}완료` };
    case "status":
      return {
        text: `${name}상태 `,
        strong: `${historyStatusLabel(entry, entry.from)} → ${historyStatusLabel(entry, entry.to)}`,
      };
    case "deadline":
      return {
        text: "마감일 ",
        strong: `${formatMonthDot(entry.from ?? "")} → ${formatMonthDot(entry.to ?? "")}`,
      };
  }
}

/**
 * 태블릿 · 모바일 기록 한 줄 (보드 T · M 08). 「무엇 · 이름」 형식.
 */
export function historyCompactText(entry: ProjectHistoryEntry) {
  const target = TARGET_LABEL[entry.target];
  const tail = entry.name ? ` · ${entry.name}` : "";
  switch (entry.kind) {
    case "create":
      return "프로젝트 시작";
    case "add":
      return `${target} 추가${tail}`;
    case "delete":
      return `${target} 삭제${tail}`;
    case "done":
      return `${target} 완료${tail}`;
    case "status": {
      const label = historyStatusLabel(entry, entry.to);
      return `${label}${toParticle(label)} 이동${tail}`;
    }
    case "deadline":
      return `마감일 변경 ${formatMonthDot(entry.from ?? "")} → ${formatMonthDot(entry.to ?? "")}`;
  }
}
