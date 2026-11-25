/**
 * 프로젝트 기록 (보드 08 · REBUILD 6 버그 2). 추가 · 삭제 · 상태 · 완료 · 마감 변경 · 기간을 줄일 때 같이 옮긴 날짜를 저장한다.
 * 목업 저장이라 새로고침하면 처음 값으로 돌아간다 (실제 저장이 들어오면 서버로 옮김).
 */
export type ProjectHistoryKind =
  "create" | "add" | "delete" | "status" | "done" | "deadline" | "start";

export type ProjectHistoryEntry = {
  id: number;
  projectId: number;
  /** ISO 시각 */
  at: string;
  kind: ProjectHistoryKind;
  /** 무엇에 대한 기록인지. 프로젝트 자신이면 project */
  target: "project" | "goal" | "task";
  /** 목표 · 태스크 이름 */
  name?: string;
  /** 상태 · 마감 변경 전 값 (상태 이름 · YYYY-MM-DD) */
  from?: string;
  /** 상태 · 마감 변경 뒤 값 */
  to?: string;
  /** 마감 변경 사유 */
  reason?: string;
};

export const mockProjectHistory: ProjectHistoryEntry[] = [];

/**
 * 기록 하나를 남긴다.
 *
 * @example
 * recordProjectHistory({ projectId: 1, kind: "done", target: "task", name: "로그인 UI 구현" });
 */
export function recordProjectHistory(
  input: Omit<ProjectHistoryEntry, "id" | "at"> & { at?: string },
) {
  const id = mockProjectHistory.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
  mockProjectHistory.unshift({ ...input, id, at: input.at ?? new Date().toISOString() });
}

/** 프로젝트를 지울 때 그 기록도 지운다 */
export function removeProjectHistory(projectId: number) {
  for (let index = mockProjectHistory.length - 1; index >= 0; index -= 1) {
    if (mockProjectHistory[index].projectId === projectId) {
      mockProjectHistory.splice(index, 1);
    }
  }
}
