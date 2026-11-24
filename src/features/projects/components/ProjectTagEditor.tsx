"use client";

import { useRef, useState, type KeyboardEvent } from "react";

import { AppIcon, X } from "@/components/ui/icon";

import { PROJECT_TAG_LIMIT } from "@/features/projects/constants/projectTags";

type ProjectTagEditorProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
};

const chipClassName =
  "text-caption inline-flex h-6 items-center gap-1 rounded-[var(--radius-xs)] border border-[var(--color-border)] bg-[var(--color-surface)] pr-1 pl-2 whitespace-nowrap text-[var(--color-text-secondary)]";
const chipRemoveClassName =
  "inline-flex size-4 cursor-pointer items-center justify-center rounded-[var(--radius-xs)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]";
const inlineInputClassName =
  "text-caption h-7 w-37.5 rounded-[var(--radius-sm)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-2 text-[var(--color-field-text)] outline-none placeholder:text-[var(--color-field-placeholder)] focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50";

/**
 * 프로젝트 태그 편집 (프로토타입 projectForm · tagEditor).
 *
 * 칩 + 칩 줄 끝 입력칸. Enter로 추가(같은 이름 · 빈 값은 무시), 최대 10개, 칩 ×로 지운다. 끝에 「n / 10」.
 *
 * @example
 * <ProjectTagEditor tags={tags} onChange={setTags} />
 */
export default function ProjectTagEditor({ tags, onChange }: ProjectTagEditorProps) {
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isFull = tags.length >= PROJECT_TAG_LIMIT;

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 중 Enter는 글자 확정이라 추가하지 않는다
    if (event.key !== "Enter" || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    const value = draft.trim();

    if (!value || tags.includes(value) || isFull) {
      return;
    }

    onChange([...tags, value]);
    setDraft("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {tags.map((tag) => (
        <span key={tag} className={chipClassName}>
          {tag}
          <button
            type="button"
            aria-label={`${tag} 태그 지우기`}
            onClick={() => onChange(tags.filter((item) => item !== tag))}
            className={chipRemoveClassName}
          >
            <AppIcon icon={X} size="xs" />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        value={draft}
        disabled={isFull}
        aria-label="태그 추가"
        placeholder="+ 태그 (Enter)"
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        className={inlineInputClassName}
      />
      <span className="text-caption text-[var(--color-text-muted)] tabular-nums">
        {tags.length} / {PROJECT_TAG_LIMIT}
      </span>
    </div>
  );
}
