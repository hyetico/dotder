"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";

import Badge from "@/components/ui/badge/Badge";
import DropdownMenu from "@/components/ui/DropdownMenu";
import { AppIcon, ChevronRight, FileText, Folder, Plus, Trash2 } from "@/components/ui/icon";

import { getMemoProjectLabel, getMemoRegistrationLabel } from "@/features/memos/utils/memoDisplay";

import { formatDateTime } from "@/lib/date";
import { buildTasksPath, getGoalDetailPath } from "@/lib/projectRoutes";

import type { Memo } from "@/features/memos/types/memo";

const memoCardClassName =
  "flex h-full min-h-[172px] flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4";
const memoTitleClassName =
  "line-clamp-2 min-w-0 flex-1 text-left text-base leading-6 font-semibold text-[var(--color-text)]";
const memoMetaClassName =
  "flex min-w-0 items-center gap-1 text-xs leading-4 text-[var(--color-text-muted)]";
const memoMenuItemClassName =
  "text-caption flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)]";
const memoDeleteItemClassName =
  "text-caption flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-[var(--color-danger-text)] transition-colors hover:bg-[var(--color-danger-soft)]";
const memoProjectBadgeClassName = "bg-[var(--color-field)] text-[var(--color-text-secondary)]";
const memoRegisteredBadgeClassName = "bg-[var(--color-primary-soft)] text-[var(--color-primary)]";
const memoLinkClassName =
  "inline-flex items-center gap-0.5 text-xs leading-none font-medium text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text)]";
const composeInputClassName =
  "min-h-0 flex-1 resize-none bg-transparent text-base leading-6 font-semibold text-[var(--color-text)] outline-none placeholder:font-medium placeholder:text-[var(--color-text-muted)]";
const addCardClassName =
  "flex h-full min-h-[172px] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50";

type MemoProject = {
  id: number;
  name: string;
  teamId: number | null;
};

type MemoComposeCardProps = {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  disabled?: boolean;
  onSave: (text: string) => void;
};

type MemoCardProps = {
  memo: Memo;
  project: MemoProject | null;
  registeredProject: MemoProject | null;
  onOpen: (memo: Memo) => void;
  onDelete: (memo: Memo) => void;
};

type MemoAddCardProps = {
  disabled?: boolean;
  onClick: () => void;
};

/**
 * getMemoHref
 *
 * 등록한 목표나 태스크를 여는 주소를 만듭니다.
 *
 * @param memo - 연결을 볼 메모
 * @returns 이동할 주소. 아직 등록하지 않았으면 null
 */
function getMemoHref(memo: Memo) {
  if (!memo.registration) {
    return null;
  }

  if (memo.registration.kind === "goal") {
    return getGoalDetailPath(memo.registration.targetId, memo.registration.projectId);
  }

  return buildTasksPath(memo.registration.projectId ?? "all");
}

/**
 * MemoComposeCard
 *
 * 빠른 기록 맨 앞에서 메모를 입력합니다.
 * 입력을 멈추면 자동으로 저장합니다.
 *
 * @param props - MemoComposeCard 컴포넌트 Props
 * @param props.inputRef - 입력창에 연결할 ref
 * @param props.disabled - 메모를 추가할 수 없는지 여부
 * @param props.onSave - 입력한 메모를 저장할 때 실행되는 함수
 */
export function MemoComposeCard({ inputRef, disabled = false, onSave }: MemoComposeCardProps) {
  const [draft, setDraft] = useState("");
  const draftRef = useRef("");
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const saveDraft = () => {
    const text = draftRef.current.trim();

    if (!text || disabled) {
      return;
    }

    draftRef.current = "";
    setDraft("");
    onSaveRef.current(text);
  };

  useEffect(() => {
    if (!draft.trim() || disabled) {
      return;
    }

    const timer = window.setTimeout(() => {
      const text = draftRef.current.trim();

      if (!text) {
        return;
      }

      draftRef.current = "";
      setDraft("");
      onSaveRef.current(text);
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [draft, disabled]);

  return (
    <form
      className={memoCardClassName}
      onSubmit={(event) => {
        event.preventDefault();
        saveDraft();
      }}
    >
      <textarea
        ref={inputRef}
        value={draft}
        disabled={disabled}
        rows={3}
        placeholder="메모를 입력하세요"
        aria-label="메모 입력"
        className={composeInputClassName}
        onChange={(event) => {
          draftRef.current = event.target.value;
          setDraft(event.target.value);
        }}
        onBlur={saveDraft}
      />
      <p className="text-xs leading-4 text-[var(--color-text-muted)]">자동 저장</p>
    </form>
  );
}

/**
 * MemoCard
 *
 * 빠른 기록 카드 하나에 메모 제목과 프로젝트, 작성 시각을 표시합니다.
 * 등록한 메모는 설명과 연결 링크를 함께 보여 줍니다.
 *
 * @param props - MemoCard 컴포넌트 Props
 * @param props.memo - 표시할 메모
 * @param props.project - 메모에 연결된 프로젝트
 * @param props.registeredProject - 목표나 태스크를 등록한 프로젝트
 * @param props.onOpen - 등록 드로어를 열 때 실행되는 함수
 * @param props.onDelete - 메모를 지울 때 실행되는 함수
 */
export function MemoCard({ memo, project, registeredProject, onOpen, onDelete }: MemoCardProps) {
  const registrationLabel = getMemoRegistrationLabel(memo);
  const href = getMemoHref(memo);
  const projectLabel = getMemoProjectLabel(registrationLabel ? registeredProject : project);
  const cardClassName = memo.registration
    ? memoCardClassName
    : `${memoCardClassName} cursor-pointer transition-colors hover:border-[var(--color-border-strong)]`;
  const openMemo = () => {
    if (memo.registration) {
      return;
    }

    onOpen(memo);
  };

  return (
    <article className={cardClassName} onClick={openMemo}>
      <div className="flex items-start gap-2">
        <h3 className={memoTitleClassName}>{memo.title}</h3>
        <div
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <DropdownMenu label={`${memo.title} 메뉴`} stopPropagation>
            {(close) => (
              <>
                {memo.registration ? null : (
                  <button
                    type="button"
                    className={memoMenuItemClassName}
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
                  className={memoDeleteItemClassName}
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
      </div>
      {registrationLabel ? (
        <div className="mt-2 flex min-h-0 flex-1 flex-col">
          {memo.body ? (
            <p className="line-clamp-2 text-xs leading-5 text-[var(--color-text-secondary)]">
              {memo.body}
            </p>
          ) : null}
          <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
            <Badge size="sm" className={memoProjectBadgeClassName}>
              {projectLabel}
            </Badge>
            <Badge size="sm" className={memoRegisteredBadgeClassName}>
              {registrationLabel}
            </Badge>
          </div>
          {href ? (
            <Link
              href={href}
              className={`${memoLinkClassName} mt-3`}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {memo.registration?.kind === "goal" ? "목표 보기" : "태스크 보기"}
              <AppIcon icon={ChevronRight} size="sm" />
            </Link>
          ) : null}
        </div>
      ) : (
        <div className={`${memoMetaClassName} mt-auto justify-between gap-3 pt-3`}>
          <span className="flex min-w-0 items-center gap-1">
            <AppIcon icon={Folder} size="sm" className="shrink-0" />
            <span className="truncate">{projectLabel}</span>
          </span>
          <time dateTime={memo.createdAt} className="shrink-0 tabular-nums">
            {formatDateTime(memo.createdAt)}
          </time>
        </div>
      )}
    </article>
  );
}

/**
 * MemoAddCard
 *
 * 빠른 기록 끝에 두고, 누르면 메모 입력창으로 이동합니다.
 *
 * @param props - MemoAddCard 컴포넌트 Props
 * @param props.disabled - 메모를 추가할 수 없는지 여부
 * @param props.onClick - 카드를 눌렀을 때 실행되는 함수
 */
export function MemoAddCard({ disabled = false, onClick }: MemoAddCardProps) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={addCardClassName}>
      <Plus size={28} aria-hidden />
      <span className="text-base leading-6 font-semibold">새 메모</span>
    </button>
  );
}
