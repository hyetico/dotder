"use client";

import { useToast } from "@/components/kit/Toast";

import { TOAST_TEXT, duplicatedToast } from "@/content/ui";
import { useProjectMutations } from "@/features/projects/hooks/useProjectMutations";

import { toDateKey } from "@/lib/date";
import {
  MAX_FAVORITES,
  getFavoriteProjectIds,
  toggleFavoriteProjectId,
} from "@/lib/projectSwitcherPreferences";

import type { Project } from "@/features/projects/types/project";

/**
 * 프로젝트 ⋯ 메뉴 동작 (프로토타입 pmenu). 메인 지정 · 해제 · 즐겨찾기 · 복제 · 보관 · 삭제와 토스트.
 * 보관 · 삭제 토스트에는 「되돌리기」가 붙는다 (REBUILD 5-3).
 *
 * @example
 * const actions = useProjectActions();
 * actions.archive(project);
 */
export function useProjectActions() {
  const toast = useToast();
  const {
    setMainProjectAsync,
    duplicateProjectAsync,
    setProjectArchivedAsync,
    deleteProjectAsync,
    restoreDeletedProjectAsync,
  } = useProjectMutations();

  const failed = (retry: () => void) => toast(TOAST_TEXT.saveFailed, { retry });

  const toggleMain = async (project: Project) => {
    try {
      await setMainProjectAsync({ projectId: project.id, isMain: !project.isMain });
      toast(project.isMain ? TOAST_TEXT.mainCleared : TOAST_TEXT.mainSet);
    } catch {
      failed(() => void toggleMain(project));
    }
  };

  const toggleFavorite = (project: Project) => {
    const favorites = getFavoriteProjectIds();
    const isFavorite = favorites.includes(project.id);

    if (!isFavorite && favorites.length >= MAX_FAVORITES) {
      toast(TOAST_TEXT.favoriteFull, { kind: "bad" });
      return;
    }

    toggleFavoriteProjectId(project.id);
    toast(isFavorite ? TOAST_TEXT.favoriteRemoved : TOAST_TEXT.favoriteAdded);
  };

  const duplicate = async (project: Project) => {
    try {
      const copy = await duplicateProjectAsync(project.id);
      toast(duplicatedToast(copy.name));
    } catch {
      failed(() => void duplicate(project));
    }
  };

  const archive = async (project: Project) => {
    try {
      await setProjectArchivedAsync({ projectId: project.id, archivedAt: toDateKey(new Date()) });
      toast(TOAST_TEXT.archived, {
        undo: () => void setProjectArchivedAsync({ projectId: project.id, archivedAt: null }),
      });
    } catch {
      failed(() => void archive(project));
    }
  };

  const restore = async (project: Project) => {
    try {
      await setProjectArchivedAsync({ projectId: project.id, archivedAt: null });
      toast(TOAST_TEXT.restored);
    } catch {
      failed(() => void restore(project));
    }
  };

  const remove = async (project: Project) => {
    try {
      await deleteProjectAsync(project.id);
      toast(TOAST_TEXT.deleted, { undo: () => void restoreDeletedProjectAsync(project) });
    } catch {
      failed(() => void remove(project));
    }
  };

  return { toggleMain, toggleFavorite, duplicate, archive, restore, remove };
}
