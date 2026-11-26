import { mockGoals } from "@/lib/mock/goals";
import { mockMemos } from "@/lib/mock/memos";
import { mockProjectDeadlineChanges } from "@/lib/mock/projectDeadlineChanges";
import { mockProjectHistory } from "@/lib/mock/projectHistory";
import { mockProjects } from "@/lib/mock/projects";
import { mockTasks } from "@/lib/mock/tasks";
import { readMode, type DotderMode } from "@/lib/storage/dotderMode";
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

const EMPTY_DATA: DotderData = {
  version: 1,
  projects: [],
  goals: [],
  tasks: [],
  memos: [],
  history: [],
  deadlineChanges: [],
};

// 예시 목업 원본. 데이터를 바꾸기 전(파일을 처음 읽을 때)에 떠 둔다
const EXAMPLE_DATA = snapshotData();

/** 예시 목업 원본을 새로 복사해 돌려준다 (예시 모드). */
function readExampleData(): DotderData {
  return structuredClone(EXAMPLE_DATA);
}

let loadedMode: DotderMode | null = null;
let loading: Promise<void> | null = null;

/**
 * 지금 모드의 데이터를 메모리에 불러온다. 모드가 바뀌었을 때만 다시 불러온다.
 * - 예시(`demo`): 늘 예시 목업을 새로 불러온다. 저장하지 않는다.
 * - 내 기록(`mine`): 저장된 것을 불러온다. 없으면 빈 상태 (예시를 섞지 않는다).
 *
 * api 함수는 데이터를 읽거나 바꾸기 전에 이것을 기다린다. 서버에서 그릴 때는 바로 끝난다.
 */
export function ensureDataLoaded(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }
  const mode = readMode();
  if (loading && loadedMode === mode) {
    return loading;
  }
  loadedMode = mode;
  loading =
    mode === "demo"
      ? Promise.resolve(applyData(readExampleData()))
      : dotderStore.load().then((data) => applyData(data ?? EMPTY_DATA));
  return loading;
}

/** 이 브라우저에 저장된 내 기록이 있는지 (첫 화면 [시작하기] · [이어서 하기]). */
export async function hasSavedData() {
  return (await dotderStore.load()) != null;
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
 * 지금 데이터를 저장소에 저장한다 (내 기록 모드만). 만들기 · 수정 · 삭제 · 되돌리기 등 데이터를 바꾼 api 함수가 끝에 부른다.
 * 실패해도(용량 초과 · 사생활 모드) 던지지 않고 앱은 메모리 데이터로 계속 동작한다. 알림은 처음 한 번만.
 */
export async function saveData() {
  // 예시 모드에서 바꾼 것은 저장하지 않는다 (내 기록을 건드리지 않음)
  if (typeof window === "undefined" || readMode() === "demo") {
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
 * 내 기록을 모두 지운다 (설정 → 데이터 「모두 지우기」). 저장된 것이 없어지므로 첫 화면은 [시작하기]가 된다.
 */
export async function clearAllData() {
  await dotderStore.clear();
  if (readMode() === "mine") {
    applyData(EMPTY_DATA);
  }
}

/** 내보내기용 데이터 (설정 → 데이터 「내보내기」). 예시가 아닌 저장된 내 기록. 없으면 빈 데이터. */
export async function exportData(): Promise<DotderData> {
  return (await dotderStore.load()) ?? structuredClone(EMPTY_DATA);
}
