import { mockGoals } from "@/lib/mock/goals";
import { mockMemos } from "@/lib/mock/memos";
import { mockProjectDeadlineChanges } from "@/lib/mock/projectDeadlineChanges";
import { mockProjectHistory } from "@/lib/mock/projectHistory";
import { mockProjects } from "@/lib/mock/projects";
import { mockTasks } from "@/lib/mock/tasks";
import { dotderStore, type DotderData } from "@/lib/storage/dotderStore";

/**
 * 배열 안 내용을 통째로 바꾼다. 여러 api 파일이 같은 배열을 가리키므로 새 배열을 만들지 않는다.
 *
 * @example
 * replaceItems(mockTasks, mockTasks.filter((task) => task.id !== 3));
 */
export function replaceItems<T>(target: T[], items: readonly T[]) {
  const next = [...items];
  target.splice(0, target.length, ...next);
}

/** 지금 메모리에 있는 데이터 전체를 저장 형식으로 묶는다 (저장 · 내보내기). */
export function snapshotData(): DotderData {
  return structuredClone({
    version: 1,
    projects: mockProjects,
    goals: mockGoals,
    tasks: mockTasks,
    memos: mockMemos,
    history: mockProjectHistory,
    deadlineChanges: mockProjectDeadlineChanges,
  });
}

function applyData(data: DotderData) {
  replaceItems(mockProjects, data.projects ?? []);
  replaceItems(mockGoals, data.goals ?? []);
  replaceItems(mockTasks, data.tasks ?? []);
  replaceItems(mockMemos, data.memos ?? []);
  replaceItems(mockProjectHistory, data.history ?? []);
  replaceItems(mockProjectDeadlineChanges, data.deadlineChanges ?? []);
}

let loading: Promise<void> | null = null;

/**
 * 앱 시작 때 한 번 저장된 데이터를 불러온다. 저장된 것이 있으면 그것만 쓰고, 없으면 예시 데이터 그대로.
 * api 함수는 데이터를 읽거나 바꾸기 전에 이것을 기다린다. 서버에서 그릴 때는 바로 끝난다.
 */
export function ensureDataLoaded(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  loading ??= dotderStore.load().then((data) => {
    if (data) {
      applyData(data);
    }
  });
  return loading;
}

type SaveErrorListener = () => void;
const saveErrorListeners = new Set<SaveErrorListener>();
let hasReportedSaveError = false;

/**
 * 저장에 실패했을 때 한 번 알림을 받는다 (토스트 「이 브라우저에 저장하지 못했어요」).
 *
 * @returns 구독을 끊는 함수
 */
export function onSaveError(listener: SaveErrorListener) {
  saveErrorListeners.add(listener);
  return () => {
    saveErrorListeners.delete(listener);
  };
}

/**
 * 지금 데이터를 저장소에 저장한다. 만들기 · 수정 · 삭제 · 되돌리기 등 데이터를 바꾼 api 함수가 끝에 부른다.
 * 실패해도(용량 초과 · 사생활 모드) 던지지 않고 앱은 메모리 데이터로 계속 동작한다. 알림은 처음 한 번만.
 */
export async function saveData() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    await dotderStore.save(snapshotData());
  } catch {
    if (!hasReportedSaveError) {
      hasReportedSaveError = true;
      saveErrorListeners.forEach((listener) => listener());
    }
  }
}

/**
 * 모든 데이터를 지운다 (설정 → 데이터 「모두 지우기」). 빈 상태를 저장해 새로고침해도 예시가 돌아오지 않는다.
 */
export async function clearAllData() {
  await ensureDataLoaded();
  await dotderStore.clear();
  applyData({
    version: 1,
    projects: [],
    goals: [],
    tasks: [],
    memos: [],
    history: [],
    deadlineChanges: [],
  });
  await saveData();
}

/** 내보내기용 데이터 (설정 → 데이터 「내보내기」). 저장된 것과 같은 모양이다. */
export async function exportData(): Promise<DotderData> {
  await ensureDataLoaded();
  return snapshotData();
}
