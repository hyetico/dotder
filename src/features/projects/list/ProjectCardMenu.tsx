"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DeleteConfirmDialog } from "@/components/kit/ConfirmDialog";
import { MenuItem, MenuSeparator, MoreMenu } from "@/components/kit/Menu";
import { useFavoriteProjectIds } from "@/components/shell/useFavoriteProjects";
import { Archive, ChevronRight, Copy, Crown, Star, Trash2 } from "@/components/ui/icon";

import { useProjectActions } from "@/features/projects/list/useProjectActions";

import { getProjectDetailPath } from "@/lib/projectRoutes";

import type { Project } from "@/features/projects/types/project";

type ProjectCardMenuProps = {
  project: Project;
  /** 보관함 줄에서는 열기 · 보관 대신 삭제만 */
  variant?: "card" | "archived";
};

/**
 * 프로젝트 ⋯ 메뉴 (REBUILD 6-1 · 프로토타입 pmenu). 카드 제목 줄 오른쪽 아이콘 버튼 xs 28.
 * 열기 · 메인 프로젝트로 지정/해제 · 즐겨찾기에 추가/빼기 · 복제 · 보관하기 · ─ · 삭제(확인창).
 */
export default function ProjectCardMenu({ project, variant = "card" }: ProjectCardMenuProps) {
  const router = useRouter();
  const actions = useProjectActions();
  const favoriteIds = useFavoriteProjectIds();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const isFavorite = favoriteIds.includes(project.id);

  return (
    <>
      <MoreMenu label={`‘${project.name}’ 메뉴`} size={variant === "card" ? "xs" : "sm"}>
        {(close) => {
          const run = (action: () => void) => () => {
            close();
            action();
          };

          return variant === "archived" ? (
            <MenuItem danger icon={<Trash2 />} onSelect={run(() => setIsDeleteOpen(true))}>
              삭제
            </MenuItem>
          ) : (
            <>
              <MenuItem
                icon={<ChevronRight />}
                onSelect={run(() => router.push(getProjectDetailPath(project.id)))}
              >
                열기
              </MenuItem>
              <MenuItem icon={<Crown />} onSelect={run(() => void actions.toggleMain(project))}>
                {project.isMain ? "메인 프로젝트 해제" : "메인 프로젝트로 지정"}
              </MenuItem>
              <MenuItem icon={<Star />} onSelect={run(() => actions.toggleFavorite(project))}>
                {isFavorite ? "즐겨찾기에서 빼기" : "즐겨찾기에 추가"}
              </MenuItem>
              <MenuItem icon={<Copy />} onSelect={run(() => void actions.duplicate(project))}>
                복제
              </MenuItem>
              <MenuItem icon={<Archive />} onSelect={run(() => void actions.archive(project))}>
                보관하기
              </MenuItem>
              <MenuSeparator />
              <MenuItem danger icon={<Trash2 />} onSelect={run(() => setIsDeleteOpen(true))}>
                삭제
              </MenuItem>
            </>
          );
        }}
      </MoreMenu>
      <DeleteConfirmDialog
        target="프로젝트"
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          setIsDeleteOpen(false);
          void actions.remove(project);
        }}
      />
    </>
  );
}
