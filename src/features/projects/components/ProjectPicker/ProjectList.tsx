"use client";

import { modalSidePaddingClassName } from "@/components/ui/modal/Modal";

import ProjectListItem from "@/features/projects/components/ProjectPicker/ProjectListItem";

import type { ProjectBadgeMark } from "@/features/projects/components/ProjectBadge";
import type { Project } from "@/features/projects/types/project";
import type { ReactNode } from "react";

type ProjectListProps = {
  projects: Project[];
  mark: ProjectBadgeMark;
  selectedIds?: number[];
  disabledIds?: number[];
  onSelect?: (project: Project) => void;
  renderExtra?: (project: Project) => ReactNode;
  pairDelay?: boolean;
  emptyLabel: string;
  label?: string;
};

type ListScrollProps = {
  children: ReactNode;
};

/**
 * ListScroll
 *
 * 목록만 스크롤되고, 얇은 스크롤바는 그 목록 안에 둡니다.
 *
 * @param props - ListScroll 컴포넌트 Props
 * @param props.children - 스크롤할 목록
 */
export function ListScroll({ children }: ListScrollProps) {
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${modalSidePaddingClassName} `}>
      <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-none">
        {children}
      </div>
    </div>
  );
}

/**
 * ProjectList
 *
 * 프로젝트 선택·조회 목록을 표시합니다.
 *
 * @param props - ProjectList 컴포넌트 Props
 * @param props.projects - 표시할 프로젝트
 * @param props.mark - 각 줄 배지의 표시 종류
 * @param props.selectedIds - 선택된 프로젝트 아이디
 * @param props.disabledIds - 선택할 수 없는 프로젝트 아이디
 * @param props.onSelect - 줄을 눌렀을 때 실행되는 함수
 * @param props.renderExtra - 줄 아래에 추가로 그릴 내용
 * @param props.pairDelay - 지연이면 진행 상태 옆에 지연 뱃지를 둘지 여부
 * @param props.emptyLabel - 프로젝트가 없을 때 보여줄 문구
 * @param props.label - 목록의 접근 이름
 */
export default function ProjectList({
  projects,
  mark,
  selectedIds = [],
  disabledIds = [],
  onSelect,
  renderExtra,
  pairDelay = false,
  emptyLabel,
  label = "프로젝트",
}: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <p className="text-caption px-2 py-8 text-center text-[var(--color-text-secondary)]">
        {emptyLabel}
      </p>
    );
  }

  const selected = new Set(selectedIds);
  const disabled = new Set(disabledIds);

  return (
    <ul
      role={mark === "radio" ? "radiogroup" : undefined}
      aria-label={label}
      className="space-y-0.5"
    >
      {projects.map((project) => (
        <ProjectListItem
          key={project.id}
          project={project}
          mark={mark}
          selected={selected.has(project.id)}
          disabled={disabled.has(project.id)}
          onSelect={onSelect ? () => onSelect(project) : undefined}
          extra={renderExtra ? renderExtra(project) : undefined}
          pairDelay={pairDelay}
        />
      ))}
    </ul>
  );
}
