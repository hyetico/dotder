"use client";

import { useLayoutEffect, useRef } from "react";

import ProjectBoardCard from "@/features/projects/components/ProjectBoardCard";

import type { ProjectListItem } from "@/features/projects/types/project";

const favoriteFolderFrameClassName = "relative h-[134px] w-[148px] shrink-0";
const favoriteFolderCardClassName = "absolute top-0 left-0 w-[296px] origin-top-left scale-50";

type FavoriteProjectFolderIconProps = {
  project: ProjectListItem;
  pressed?: boolean;
  onSelect?: () => void;
};

/**
 * FavoriteProjectFolderIcon
 *
 * 즐겨찾기 프로젝트 목표 제목 아래에 두는 작은 폴더입니다.
 * 태스크가 없는 닫힌 프로젝트 폴더 카드를 가로와 세로 절반으로 줄여 보여 줍니다.
 *
 * @param props - FavoriteProjectFolderIcon 컴포넌트 Props
 * @param props.project - 표시할 즐겨찾기 프로젝트
 * @param props.pressed - 이 폴더의 목표만 보고 있는지 여부
 * @param props.onSelect - 폴더를 눌러 목표를 거를 때 실행되는 함수
 */
export default function FavoriteProjectFolderIcon({
  project,
  pressed = false,
  onSelect,
}: FavoriteProjectFolderIconProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const closedProject: ProjectListItem = {
    ...project,
    completedGoals: 0,
    totalGoals: 0,
    completedTasks: 0,
    totalTasks: 0,
  };

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const card = cardRef.current;

    if (!frame || !card) {
      return;
    }

    const updateHeight = () => {
      frame.style.height = `${card.offsetHeight / 2}px`;
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);

    observer.observe(card);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frameRef} className={favoriteFolderFrameClassName}>
      <div ref={cardRef} className={favoriteFolderCardClassName}>
        <ProjectBoardCard project={closedProject} pressed={pressed} onSelect={onSelect} />
      </div>
    </div>
  );
}
