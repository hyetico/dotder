"use client";

import { AppIcon, Check } from "@/components/ui/icon";

import { type ProjectBadgeMark } from "@/features/projects/components/ProjectBadge";
import ProjectMark from "@/features/projects/components/ProjectMark";
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
 * 고르는 목록의 프로젝트 한 줄. 선택 표시(라디오 · 체크 18) + 색 점(메인은 왕관) + 이름 + 상태.
 *
 * 이름은 자르지 않고, 선택 표시와 점은 첫 줄에 맞춘다 (Components 09 · handoff B7 · B8).
 * 줄 높이는 웹 40 · 터치 44 이상 (handoff B11).
 *
 * @param props - ProjectListItem 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.mark - 앞에 둘 선택 표시. `radio` · `check`가 아니면 표시 없이 점만
 * @param props.selected - 라디오나 체크가 선택된 상태인지 여부
 * @param props.disabled - 이 줄을 고를 수 없는지 여부
 * @param props.onSelect - 줄을 눌러 선택하거나 열 때 실행되는 함수
 * @param props.extra - 설명 아래에 둘 추가 내용
 */
const selectionMarkClassName =
  "inline-flex size-4.5 shrink-0 items-center justify-center border text-[var(--color-text-inverse)]";

function SelectionMark({ kind, selected }: { kind: "radio" | "checkbox"; selected: boolean }) {
  if (kind === "radio") {
    return (
      <span
        aria-hidden
        className={`${selectionMarkClassName} rounded-full ${
          selected
            ? "border-5 border-[var(--color-primary)]"
            : "border-[var(--color-border-strong)] bg-[var(--color-surface)]"
        }`}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={`${selectionMarkClassName} rounded-[var(--radius-xs)] ${
        selected
          ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
          : "border-[var(--color-border-strong)] bg-[var(--color-surface)]"
      }`}
    >
      {selected ? <AppIcon icon={Check} size="xs" /> : null}
    </span>
  );
}

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
    "rounded-[var(--radius-sm)] px-2 pt-2.5 max-md:pt-3",
    extra ? "pb-1" : "pb-2.5 max-md:pb-3",
    active ? "bg-[var(--color-hover)]" : disabled ? "" : "hover:bg-[var(--color-hover)]",
  ].join(" ");
  const selectButtonClassName = [
    // 고르는 목록은 이름을 자르지 않고, 상자는 첫 줄에 맞춘다 (handoff B7 · Components 09)
    "flex min-w-0 flex-1 items-start gap-2.5 text-left",
    disabled ? "cursor-not-allowed disabled:opacity-100" : "",
  ].join(" ");

  const summary = (
    <>
      {selectionRole ? (
        <span className="flex h-5 shrink-0 items-center">
          <SelectionMark kind={selectionRole} selected={selected} />
        </span>
      ) : null}
      <span className="flex h-5 shrink-0 items-center">
        <ProjectMark color={project.color} isMain={project.isMain} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-body block font-medium break-words text-[var(--color-text)]">
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
        <div className="mt-0.5 flex items-center gap-1 pl-6">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">{extra}</div>
        </div>
      ) : null}
    </li>
  );
}
