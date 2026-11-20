"use client";

import Link from "next/link";

import Badge from "@/components/ui/badge/Badge";
import DropdownMenu from "@/components/ui/DropdownMenu";
import { AppIcon, ChevronDown, FileText, Folder, Trash2 } from "@/components/ui/icon";

import {
  formatMemoDate,
  getMemoProjectLabel,
  getMemoRegistrationLabel,
} from "@/features/memos/utils/memoDisplay";
import type { Memo } from "@/features/memos/types/memo";
import { buildTasksPath, getGoalDetailPath } from "@/lib/projectRoutes";

const archiveShellClassName =
  "overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-white";
const archiveRowClassName =
  "flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3";
const archiveTitleClassName =
  "w-full truncate text-left text-[14px] leading-5 font-medium text-[var(--color-text)]";
const archiveMetaClassName =
  "flex shrink-0 items-center gap-1 text-[12px] leading-4 text-[var(--color-text-muted)]";
const archiveMoreClassName =
  "flex h-11 w-full items-center justify-center gap-1 text-[13px] font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)]";
const archiveMenuItemClassName =
  "text-body-sm flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)]";
const archiveDeleteItemClassName =
  "text-body-sm flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-red-500 transition-colors hover:bg-red-50";
const archiveProjectBadgeClassName = "bg-[var(--color-field)] text-[var(--color-text-secondary)]";
const archiveRegisteredBadgeClassName =
  "bg-[var(--color-primary-soft)] text-[var(--color-primary)]";
const archiveLinkClassName =
  "text-[12px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)]";
const archiveEmptyClassName =
  "rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] px-4 py-8 text-center text-[13px] text-[var(--color-text-secondary)]";

type MemoProject = {
  id: number;
  name: string;
  teamId: number | null;
};

type MemoArchiveListProps = {
  memos: Memo[];
  projects: MemoProject[];
  expanded: boolean;
  onToggle: () => void;
  onOpen: (memo: Memo) => void;
  onDelete: (memo: Memo) => void;
};

const previewCount = 2;

/**
 * getArchiveHref
 *
 * 이전 메모에 연결된 목표나 태스크 주소를 만듭니다.
 *
 * @param memo - 연결을 볼 메모
 * @returns 이동할 주소. 아직 등록하지 않았으면 null
 */
function getArchiveHref(memo: Memo) {
  if (!memo.registration) {
    return null;
  }

  if (memo.registration.kind === "goal") {
    return getGoalDetailPath(memo.registration.targetId, memo.registration.projectId);
  }

  return buildTasksPath(memo.registration.projectId ?? "all");
}

/**
 * MemoArchiveList
 *
 * 이전 메모를 한 줄 목록으로 표시합니다.
 * 기본은 두 건만 보여주고, 더 보기로 나머지를 펼칩니다.
 *
 * @param props - MemoArchiveList 컴포넌트 Props
 * @param props.memos - 표시할 이전 메모
 * @param props.projects - 이름을 찾을 프로젝트
 * @param props.expanded - 목록을 모두 펼쳤는지 여부
 * @param props.onToggle - 더 보기와 접기를 누를 때 실행되는 함수
 * @param props.onOpen - 등록 드로어를 열 때 실행되는 함수
 * @param props.onDelete - 메모를 지울 때 실행되는 함수
 */
export default function MemoArchiveList({
  memos,
  projects,
  expanded,
  onToggle,
  onOpen,
  onDelete,
}: MemoArchiveListProps) {
  const visibleMemos = expanded ? memos : memos.slice(0, previewCount);
  const canToggle = memos.length > previewCount;

  if (memos.length === 0) {
    return <p className={archiveEmptyClassName}>이전 메모가 없습니다.</p>;
  }

  return (
    <div className={archiveShellClassName}>
      {visibleMemos.map((memo) => {
        const project = projects.find((item) => item.id === memo.projectId) ?? null;
        const registeredProject =
          projects.find((item) => item.id === memo.registration?.projectId) ?? project;
        const registrationLabel = getMemoRegistrationLabel(memo);
        const href = getArchiveHref(memo);
        const projectLabel = getMemoProjectLabel(registrationLabel ? registeredProject : project);

        return (
          <div key={memo.id} className={archiveRowClassName}>
            <AppIcon
              icon={FileText}
              size="md"
              className="shrink-0 text-[var(--color-text-muted)]"
            />
            <div className="min-w-0 flex-1">
              <button
                type="button"
                className={archiveTitleClassName}
                onClick={() => {
                  if (!memo.registration) {
                    onOpen(memo);
                  }
                }}
              >
                {memo.title}
              </button>
              {registrationLabel ? (
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge size="sm" className={archiveProjectBadgeClassName}>
                    {projectLabel}
                  </Badge>
                  <Badge size="sm" className={archiveRegisteredBadgeClassName}>
                    {registrationLabel}
                  </Badge>
                  {href ? (
                    <Link href={href} className={archiveLinkClassName}>
                      {memo.registration?.kind === "goal" ? "목표 보기" : "태스크 보기"}
                    </Link>
                  ) : null}
                </div>
              ) : null}
            </div>
            <span className={`${archiveMetaClassName} hidden max-w-[160px] sm:flex`}>
              <AppIcon icon={Folder} size="sm" className="shrink-0" />
              <span className="truncate">{getMemoProjectLabel(project)}</span>
            </span>
            <time dateTime={memo.createdAt} className={`${archiveMetaClassName} tabular-nums`}>
              {formatMemoDate(memo.createdAt)}
            </time>
            <DropdownMenu label={`${memo.title} 메뉴`} stopPropagation panelClassName="w-44">
              {(close) => (
                <>
                  {memo.registration ? null : (
                    <button
                      type="button"
                      className={archiveMenuItemClassName}
                      onClick={() => {
                        close();
                        onOpen(memo);
                      }}
                    >
                      <AppIcon icon={FileText} size="sm" />
                      <span>목표·태스크로 등록</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={archiveDeleteItemClassName}
                    onClick={() => {
                      close();
                      onDelete(memo);
                    }}
                  >
                    <AppIcon icon={Trash2} size="sm" />
                    <span>삭제</span>
                  </button>
                </>
              )}
            </DropdownMenu>
          </div>
        );
      })}
      {canToggle ? (
        <button type="button" className={archiveMoreClassName} onClick={onToggle}>
          {expanded ? "접기" : "더 보기"}
          <AppIcon icon={ChevronDown} size="sm" className={expanded ? "rotate-180" : ""} />
        </button>
      ) : null}
    </div>
  );
}
