const FAVORITES_KEY = "projectflow:favorite-project-ids";

const FAVORITES_CHANGED_EVENT = "projectflow:favorites-changed";

const RECENT_KEY = "projectflow:recent-project-ids";

export const MAX_FAVORITES = 3;

const MAX_RECENT = 10;

export type RecentProjectEntry = {
  id: number;
  openedAt: string;
};

function readIds(key: string): number[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(key);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((id) => typeof id === "number");
  } catch {
    return [];
  }
}

function writeIds(key: string, ids: number[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(ids));

  if (key === FAVORITES_KEY) {
    window.dispatchEvent(new Event(FAVORITES_CHANGED_EVENT));
  }
}

let favoriteSnapshotIds: number[] = [];

let favoriteSnapshotRaw: string | null | undefined;

/**
 * subscribeFavoriteProjectIds
 *
 * 즐겨찾기 프로젝트 목록이 바뀌면 알려 줍니다.
 *
 * @param onStoreChange - 목록이 바뀔 때 실행되는 함수
 * @returns 구독을 해제하는 함수
 */
export function subscribeFavoriteProjectIds(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key != null && event.key !== FAVORITES_KEY) {
      return;
    }

    onStoreChange();
  };

  window.addEventListener(FAVORITES_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(FAVORITES_CHANGED_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStorage);
  };
}

/**
 * getFavoriteProjectIdsSnapshot
 *
 * 브라우저에 저장된 즐겨찾기 프로젝트 아이디를 같은 배열로 돌려줍니다.
 *
 * @returns 즐겨찾기 프로젝트 아이디. 아직 브라우저가 아니면 null
 */
export function getFavoriteProjectIdsSnapshot(): number[] | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(FAVORITES_KEY);

  if (raw === favoriteSnapshotRaw) {
    return favoriteSnapshotIds;
  }

  favoriteSnapshotRaw = raw;
  favoriteSnapshotIds = getFavoriteProjectIds();

  return favoriteSnapshotIds;
}

/**
 * getFavoriteProjectIdsServerSnapshot
 *
 * 서버에서는 즐겨찾기를 읽지 않습니다.
 *
 * @returns 아직 읽지 않았음을 나타내는 null
 */
export function getFavoriteProjectIdsServerSnapshot(): number[] | null {
  return null;
}

/**
 * readRecentEntries
 *
 * localStorage에 저장된 최근 프로젝트 목록을 읽고,
 * 예전 number[] 형식이면 새 형식으로 바꿉니다.
 */
function readRecentEntries(): RecentProjectEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(RECENT_KEY);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    if (parsed.every((item) => typeof item === "number")) {
      const now = Date.now();
      const migrated = parsed.map((id, index) => ({
        id: id as number,
        openedAt: new Date(now - index * 60 * 60 * 1000).toISOString(),
      }));

      writeRecentEntries(migrated);

      return migrated;
    }

    return parsed.filter(
      (item): item is RecentProjectEntry =>
        item != null &&
        typeof item === "object" &&
        typeof item.id === "number" &&
        typeof item.openedAt === "string",
    );
  } catch {
    return [];
  }
}

/**
 * writeRecentEntries
 *
 * 최근 프로젝트 목록을 localStorage에 저장합니다.
 *
 * @param entries - 저장할 최근 프로젝트 목록
 */
function writeRecentEntries(entries: RecentProjectEntry[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(RECENT_KEY, JSON.stringify(entries.slice(0, MAX_RECENT)));
}

export function getFavoriteProjectIds() {
  return readIds(FAVORITES_KEY).slice(0, MAX_FAVORITES);
}

/**
 * getRecentProjectEntries
 *
 * 최근에 연 프로젝트 id와 연 시각 목록을 반환합니다.
 */
export function getRecentProjectEntries() {
  return readRecentEntries();
}

/**
 * getRecentProjectIds
 *
 * 최근에 연 프로젝트 id만 순서대로 반환합니다.
 */
export function getRecentProjectIds() {
  return getRecentProjectEntries().map((entry) => entry.id);
}

/**
 * toggleFavoriteProjectId
 *
 * 즐겨찾기를 켜거나 끕니다. 추가는 최대 3개까지만 가능합니다.
 *
 * @param projectId - 즐겨찾기를 바꿀 프로젝트 id
 * @returns 즐겨찾기 상태. 추가 한도에 걸리면 null
 */
export function toggleFavoriteProjectId(projectId: number) {
  const current = getFavoriteProjectIds();
  const exists = current.includes(projectId);

  if (exists) {
    writeIds(
      FAVORITES_KEY,
      current.filter((id) => id !== projectId),
    );

    return false;
  }

  if (current.length >= MAX_FAVORITES) {
    return null;
  }

  writeIds(FAVORITES_KEY, [...current, projectId]);

  return true;
}

/**
 * setFavoriteProjectIds
 *
 * 즐겨찾기 프로젝트 목록을 한 번에 저장합니다.
 * 최대 3개까지만 남깁니다.
 *
 * @param projectIds - 즐겨찾기로 남길 프로젝트 아이디
 */
export function setFavoriteProjectIds(projectIds: number[]) {
  writeIds(FAVORITES_KEY, [...new Set(projectIds)].slice(0, MAX_FAVORITES));
}

/**
 * recordRecentProjectId
 *
 * 프로젝트를 최근 목록 맨 앞에 넣고 연 시각을 기록합니다.
 *
 * @param projectId - 최근 목록에 넣을 프로젝트 id
 */
export function recordRecentProjectId(projectId: number) {
  const current = getRecentProjectEntries().filter((entry) => entry.id !== projectId);

  writeRecentEntries([
    {
      id: projectId,
      openedAt: new Date().toISOString(),
    },
    ...current,
  ]);
}

/**
 * removeRecentProjectId
 *
 * 최근 프로젝트 목록에서 해당 id를 제거합니다.
 *
 * @param projectId - 목록에서 뺄 프로젝트 id
 */
export function removeRecentProjectId(projectId: number) {
  writeRecentEntries(getRecentProjectEntries().filter((entry) => entry.id !== projectId));
}
