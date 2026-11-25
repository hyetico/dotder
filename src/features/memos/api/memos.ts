import { mockMemos } from "@/lib/mock/memos";

import type { Memo, MemoRegistration } from "@/features/memos/types/memo";

export type CreateMemoInput = {
  title: string;
  body: string;
  projectId: number | null;
};

/**
 * copyMemo
 *
 * 메모 저장값을 화면에서 고쳐도 원본 목록이 바뀌지 않도록 복사합니다.
 *
 * @param memo - 복사할 메모
 * @returns 복사한 메모
 */
function copyMemo(memo: Memo): Memo {
  return {
    ...memo,
    registration: memo.registration ? { ...memo.registration } : null,
  };
}

/**
 * stampMemoCreatedAt
 *
 * 메모를 만든 시각을 목록에 저장할 문자열로 만듭니다.
 *
 * @returns `2026-11-09T13:48:00` 형태의 로컬 시각
 */
function stampMemoCreatedAt() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

/**
 * readMemos
 *
 * 빠른 기록과 이전 메모를 바로 읽습니다.
 *
 * @returns 메모 목록
 */
export function readMemos(): Memo[] {
  return mockMemos.map(copyMemo);
}

/**
 * getMemos
 *
 * 빠른 기록과 이전 메모를 모두 가져옵니다.
 *
 * @returns 메모 목록
 */
export async function getMemos(): Promise<Memo[]> {
  return readMemos();
}

/**
 * createMemo
 *
 * 빠른 기록 맨 앞에 새 메모를 추가합니다.
 *
 * @param input - 제목, 본문, 연결할 프로젝트
 * @returns 추가한 메모
 */
export async function createMemo(input: CreateMemoInput): Promise<Memo> {
  const nextId = mockMemos.reduce((maxId, memo) => Math.max(maxId, memo.id), 0) + 1;
  const nextRank = mockMemos.reduce((minRank, memo) => Math.min(minRank, memo.sortRank), 0) - 1;
  const memo: Memo = {
    id: nextId,
    title: input.title,
    body: input.body,
    projectId: input.projectId,
    createdAt: stampMemoCreatedAt(),
    zone: "quick",
    sortRank: nextRank,
    registration: null,
  };

  mockMemos.unshift(memo);

  return copyMemo(memo);
}

/**
 * deleteMemo
 *
 * 메모를 목록에서 지웁니다. 이미 등록한 목표나 태스크는 그대로 둡니다.
 *
 * @param id - 지울 메모 번호
 */
export async function deleteMemo(id: number): Promise<void> {
  const index = mockMemos.findIndex((memo) => memo.id === id);

  if (index < 0) {
    throw new Error("메모를 찾을 수 없습니다.");
  }

  mockMemos.splice(index, 1);
}

/**
 * registerMemo
 *
 * 메모에 등록한 목표나 태스크 연결만 남깁니다.
 * 메모 원문은 등록한 항목과 맞추지 않습니다.
 *
 * @param id - 등록할 메모 번호
 * @param registration - 만들어진 목표나 태스크 연결
 * @returns 연결을 저장한 메모
 */
export async function registerMemo(id: number, registration: MemoRegistration): Promise<Memo> {
  const memo = mockMemos.find((item) => item.id === id);

  if (!memo) {
    throw new Error("메모를 찾을 수 없습니다.");
  }

  if (memo.registration) {
    throw new Error("이미 등록된 메모입니다.");
  }

  memo.registration = { ...registration };

  return copyMemo(memo);
}

/**
 * 메모 글 · 연결 프로젝트를 바꾼다 (보드 07-a 바로 고치기 · 07-b 연결 바꾸기).
 *
 * @throws 메모가 없으면
 */
export async function updateMemo(
  id: number,
  patch: Partial<Pick<Memo, "title" | "projectId">>,
): Promise<Memo> {
  const memo = mockMemos.find((item) => item.id === id);

  if (!memo) {
    throw new Error("메모를 찾을 수 없습니다.");
  }

  Object.assign(memo, patch);

  return copyMemo(memo);
}

/** 지운 메모를 같은 id로 다시 넣는다 (삭제 토스트 「되돌리기」). */
export async function restoreMemo(memo: Memo): Promise<Memo> {
  if (!mockMemos.some((item) => item.id === memo.id)) {
    mockMemos.unshift(copyMemo(memo));
  }

  return copyMemo(memo);
}

/**
 * 프로젝트를 지울 때 그 프로젝트에 연결된 메모를 함께 지운다 (REBUILD 6 버그 2).
 *
 * @returns 지운 메모 (되돌리기에 쓴다)
 */
export function removeMemosOfProject(projectId: number): Memo[] {
  const removed = mockMemos.filter((memo) => memo.projectId === projectId).map(copyMemo);
  for (let index = mockMemos.length - 1; index >= 0; index -= 1) {
    if (mockMemos[index].projectId === projectId) {
      mockMemos.splice(index, 1);
    }
  }
  return removed;
}

/** 프로젝트 삭제 되돌리기 때 메모를 다시 넣는다 */
export function restoreMemos(memos: Memo[]) {
  memos.forEach((memo) => {
    if (!mockMemos.some((item) => item.id === memo.id)) {
      mockMemos.push(copyMemo(memo));
    }
  });
}

/** 예시 데이터 정리 (E01 시작 선택): 남길 프로젝트에 연결된 메모만 둔다 */
export function keepMemosOf(projectIds: number[]) {
  for (let index = mockMemos.length - 1; index >= 0; index -= 1) {
    const projectId = mockMemos[index].projectId;
    if (projectId == null || !projectIds.includes(projectId)) {
      mockMemos.splice(index, 1);
    }
  }
}
