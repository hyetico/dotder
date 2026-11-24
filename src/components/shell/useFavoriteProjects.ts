"use client";

import { useSyncExternalStore } from "react";

import {
  getFavoriteProjectIdsServerSnapshot,
  getFavoriteProjectIdsSnapshot,
  subscribeFavoriteProjectIds,
} from "@/lib/projectSwitcherPreferences";

const EMPTY: number[] = [];

/**
 * 즐겨찾기 프로젝트 id (순서 그대로, 최대 3개). 브라우저 저장소가 바뀌면 다시 그린다.
 *
 * @example
 * const favoriteIds = useFavoriteProjectIds();
 */
export function useFavoriteProjectIds(): number[] {
  return (
    useSyncExternalStore(
      subscribeFavoriteProjectIds,
      getFavoriteProjectIdsSnapshot,
      getFavoriteProjectIdsServerSnapshot,
    ) ?? EMPTY
  );
}
