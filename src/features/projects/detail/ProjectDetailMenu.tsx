"use client";

import { MenuItem, MenuSeparator, MoreMenu } from "@/components/kit/Menu";

import type { ButtonVariant } from "@/components/kit/Button";
import type { Project } from "@/features/projects/types/project";

type ProjectDetailMenuProps = {
  project: Project;
  isFavorite: boolean;
  /** 태블릿 · 모바일만 맨 위에 「수정」. 웹은 헤더 [수정] 버튼이 맡아서 넣지 않는다 (11.25) */
  showEdit?: boolean;
  onEdit?: () => void;
  /** 웹 헤더 secondary · 태블릿 · 모바일 ghost (보드 03 · T · M 03) */
  variant: ButtonVariant;
  onToggleMain: () => void;
  onToggleFavorite: () => void;
  onDuplicate: () => void;
  onChangeDeadline: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

/**
 * 상세 ⋯ 메뉴 (보드 03-e · 프로토타입 pmenu). 메뉴 280, 모바일은 아래 시트 「프로젝트」.
 * (태블릿 · 모바일만 수정) · 메인 프로젝트로 지정(설명 한 줄)/해제 · 즐겨찾기에 추가/빼기 · 복제 · 마감일 변경(03-g · 프로토타입) ·
 * ─ · 보관하기 · 삭제(빨강).
 */
export default function ProjectDetailMenu({
  project,
  isFavorite,
  showEdit = false,
  onEdit,
  variant,
  onToggleMain,
  onToggleFavorite,
  onDuplicate,
  onChangeDeadline,
  onArchive,
  onDelete,
}: ProjectDetailMenuProps) {
  return (
    <MoreMenu label="더보기" title="프로젝트" size="sm" variant={variant} width={280}>
      {(close) => {
        const run = (action: () => void) => () => {
          close();
          action();
        };

        return (
          <>
            {showEdit && onEdit ? <MenuItem onSelect={run(onEdit)}>수정</MenuItem> : null}
            <MenuItem
              onSelect={run(onToggleMain)}
              help={
                project.isMain ? undefined : "사이드바 맨 위 · 프로젝트 전환 첫 줄에 고정돼요 (1개)"
              }
            >
              {project.isMain ? "메인 프로젝트 해제" : "메인 프로젝트로 지정"}
            </MenuItem>
            <MenuItem onSelect={run(onToggleFavorite)}>
              {isFavorite ? "즐겨찾기에서 빼기" : "즐겨찾기에 추가"}
            </MenuItem>
            <MenuItem onSelect={run(onDuplicate)}>복제</MenuItem>
            <MenuItem onSelect={run(onChangeDeadline)}>마감일 변경</MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={run(onArchive)}>보관하기</MenuItem>
            <MenuItem danger onSelect={run(onDelete)}>
              삭제
            </MenuItem>
          </>
        );
      }}
    </MoreMenu>
  );
}
