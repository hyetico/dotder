import type { Goal } from "@/features/goals/types/goal";
import type { Memo } from "@/features/memos/types/memo";
import type { Project, ProjectDeadlineChange } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";
import type { ProjectHistoryEntry } from "@/lib/mock/projectHistory";

/** 한 번에 저장 · 불러오는 앱 데이터 전체. 모양이 바뀌면 `version`을 올리고 옮기는 코드를 둔다. */
export type DotderData = {
  version: 1;
  projects: Project[];
  goals: Goal[];
  tasks: Task[];
  memos: Memo[];
  /** 프로젝트 기록 (보드 08) */
  history: ProjectHistoryEntry[];
  /** 프로젝트 마감 변경 기록 */
  deadlineChanges: ProjectDeadlineChange[];
};

/**
 * 앱 데이터를 저장하는 곳. 화면 · api 코드는 이 인터페이스만 쓴다.
 *
 * 로그인 기능을 붙이면 서버 저장소를 추가하고, 첫 로그인 때 이 브라우저 기록을 계정으로 옮긴다.
 */
export interface DotderStore {
  /** 저장된 데이터. 없거나 읽을 수 없으면 null */
  load(): Promise<DotderData | null>;
  /** 데이터 전체를 저장한다. 실패하면(용량 초과 · 사생활 모드) 던진다 */
  save(data: DotderData): Promise<void>;
  /** 저장된 데이터를 지운다 */
  clear(): Promise<void>;
}

const STORAGE_KEY = "dotder:data:v1";

/**
 * 이 브라우저(localStorage)에 저장하는 저장소. 키 `dotder:data:v1`.
 *
 * @example
 * const data = await localStorageAdapter.load();
 */
export const localStorageAdapter: DotderStore = {
  async load() {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const data = JSON.parse(raw) as Partial<DotderData> | null;
      // 모르는 버전 · 깨진 값은 없는 것으로 본다 (예시 데이터로 시작)
      return data?.version === 1 ? (data as DotderData) : null;
    } catch {
      return null;
    }
  },
  async save(data) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  async clear() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 사생활 모드 등으로 지울 수 없으면 할 일이 없다
    }
  },
};

/** 지금 앱이 쓰는 저장소. 서버 저장을 붙이면 여기만 바꾼다. */
export const dotderStore: DotderStore = localStorageAdapter;
