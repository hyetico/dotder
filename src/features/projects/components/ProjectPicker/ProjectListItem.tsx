"use client";

import ProjectBadge, { type ProjectBadgeMark } from "@/features/projects/components/ProjectBadge";
import ProjectStatusBadge from "@/features/projects/components/ProjectStatusBadge";
import { isProjectDelayed } from "@/features/projects/utils/projectUtils";

import type { Project } from "@/features/projects/types/project";
import type { ReactNode } from "react";

type ProjectListItemProps = {
  project: Project;
  mark: ProjectBadgeMark;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  extra?: ReactNode;
};

/**
 * ProjectListItem
 *
 * 프로젝트 한 줄을 배지, 이름, 상태와 함께 표시합니다.
 *
 * @param props - ProjectListItem 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.mark - 배지에 올릴 폴더, 라디오, 체크
 * @param props.selected - 라디오나 체크가 선택된 상태인지 여부
 * @param props.disabled - 이 줄을 고를 수 없는지 여부
 * @param props.onSelect - 줄을 눌러 선택하거나 열 때 실행되는 함수
 * @param props.extra - 설명 아래에 둘 추가 내용
 */
export default function ProjectListItem({
  project,
  mark,
  selected = false,
  disabled = false,
  onSelect,
  extra,
}: ProjectListItemProps) {
  const selectionRole = mark === "radio" ? "radio" : mark === "check" ? "checkbox" : undefined;

  const active = selected && selectionRole != null;

  const delayed = isProjectDelayed(project);
  const rowClassName = [
    "rounded-[var(--radius-sm)] px-2 pt-2",
    extra ? "pb-1" : "pb-2",
    active ? "bg-[var(--color-hover)]" : disabled ? "" : "hover:bg-[var(--color-hover)]",
  ].join(" ");
  const selectButtonClassName = [
    // 고르는 목록은 이름을 자르지 않고, 상자는 첫 줄에 맞춘다 (handoff B7 · Components 09)
    "flex min-w-0 flex-1 items-start gap-2.5 text-left",
    disabled ? "cursor-not-allowed disabled:opacity-100" : "",
  ].join(" ");

  const summary = (
    <>
      <ProjectBadge color={project.color} size="sm" mark={mark} selected={selected} />
      <span className="min-w-0 flex-1">
        <span className="text-caption block font-semibold break-words text-[var(--color-text)]">
          {project.name}
        </span>
        {project.description ? (
          <span className="text-caption mt-0.5 block truncate text-[var(--color-text-secondary)]">
            {project.description}
          </span>
        ) : null}
      </span>
    </>
  );

  return (
    <li className={rowClassName}>
      <div className="flex items-start gap-2">
        {onSelect ? (
          <button
            type="button"
            role={selectionRole}
            aria-checked={selectionRole ? selected : undefined}
            disabled={disabled}
            onClick={onSelect}
            className={selectButtonClassName}
          >
            {summary}
          </button>
        ) : (
          <div className="flex min-w-0 flex-1 items-start gap-2.5">{summary}</div>
        )}

        <ProjectStatusBadge status={project.status} delayed={delayed} />
      </div>

      {extra ? (
        <div className="mt-0.5 flex items-center gap-1 pl-[46px]">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{extra}</div>
        </div>
      ) : null}
    </li>
  );
}
