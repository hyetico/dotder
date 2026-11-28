import { readMode, subscribeMode } from "@/lib/storage/dotderMode";

const FAVORITES_KEY = "dotder:favorite-project-ids";
const RECENT_KEY = "dotder:recent-project-ids";

// 앱 이름을 바꾸기 전(Tessera · projectflow) 내 기록 키. 처음 읽을 때 새 키로 한 번 옮기고 지운다 (tech-debt D-5)
const LEGACY_KEYS: Record<string, string> = {
  [FAVORITES_KEY]: "projectflow:favorite-project-ids",
  [RECENT_KEY]: "projectflow:recent-project-ids",
};

const migratedKeys = new Set<string>();

function migrateLegacyKey(key: string) {
  if (migratedKeys.has(key) || typeof window === "undefined") {
    return;
  }
  migratedKeys.add(key);
  try {
    const legacyKey = LEGACY_KEYS[key];
    const legacy = localStorage.getItem(legacyKey);

    if (legacy == null) {
      return;
    }
    // 새 키가 이미 있으면 새 키가 최신이라 옛 값은 버린다
    if (localStorage.getItem(key) == null) {
      localStorage.setItem(key, legacy);
    }
    localStorage.removeItem(legacyKey);
  } catch {
    // 저장이 막힌 브라우저에서는 옮길 것이 없다
  }
}

// 즐겨찾기 · 최근은 모드마다 따로 둔다 (예시에서 고른 것이 내 기록에 남지 않게)
const mineKey = (key: string) => {
  migrateLegacyKey(key);
  return key;
};

const favoritesKey = () =>
  readMode() === "demo" ? "dotder:demo:favorite-project-ids" : mineKey(FAVORITES_KEY);

const FAVORITES_CHANGED_EVENT = "dotder:favorites-changed";

const recentKey = () =>
  readMode() === "demo" ? "dotder:demo:recent-project-ids" : mineKey(RECENT_KEY);

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

  if (key === favoritesKey()) {
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
    if (event.key != null && event.key !== favoritesKey()) {
      return;
    }

    onStoreChange();
  };

  window.addEventListener(FAVORITES_CHANGED_EVENT, onStoreChange);
  window.addEventListener("storage", handleStorage);
  const unsubscribeMode = subscribeMode(onStoreChange);

  return () => {
    unsubscribeMode();
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

  const raw = `${favoritesKey()}=${localStorage.getItem(favoritesKey())}`;

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
    const raw = localStorage.getItem(recentKey());

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

  localStorage.setItem(recentKey(), JSON.stringify(entries.slice(0, MAX_RECENT)));
}

export function getFavoriteProjectIds() {
  return readIds(favoritesKey()).slice(0, MAX_FAVORITES);
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
      favoritesKey(),
      current.filter((id) => id !== projectId),
    );

    return false;
  }

  if (current.length >= MAX_FAVORITES) {
    return null;
  }

  writeIds(favoritesKey(), [...current, projectId]);

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
  writeIds(favoritesKey(), [...new Set(projectIds)].slice(0, MAX_FAVORITES));
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

/**
 * 지금 모드의 즐겨찾기 · 최근 목록을 비운다 (예시를 새로 시작할 때 · 내 기록 「모두 지우기」).
 */
export function clearProjectPreferences() {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.removeItem(recentKey());
  } catch {
    // 저장이 막힌 브라우저에서는 지울 것이 없다
  }
  writeIds(favoritesKey(), []);
}
