"use client";

import { useRef, useState } from "react";

import { Tag } from "@/components/kit/Chip";
import Field from "@/components/kit/Field";

import { TAG_FIELD_TEXT } from "@/content/ui";

type TagFieldProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** 최대 개수. 프로젝트 태그 10 */
  max?: number;
};

/**
 * 프로젝트 태그 칸 (보드 01-a2 · REBUILD 5-3). 라벨 옆 「3 / 10」, 아래 안내 글,
 * 칩(×로 삭제) + 점선 「+ 태그 추가」. 누르면 그 자리에서 입력칸이 되고 Enter로 추가(같은 이름 · 빈 값 무시),
 * Esc나 바깥으로 나가면 닫힌다. 개수가 다 차면 「+ 태그 추가」를 숨긴다.
 *
 * @example
 * <TagField tags={tags} onChange={setTags} />
 */
export default function TagField({ tags, onChange, max = 10 }: TagFieldProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const addRef = useRef<HTMLButtonElement>(null);
  const isFull = tags.length >= max;

  const finish = (focusButton: boolean) => {
    setIsAdding(false);
    setDraft("");

    if (focusButton) {
      requestAnimationFrame(() => addRef.current?.focus());
    }
  };

  return (
    <Field
      label={TAG_FIELD_TEXT.label}
      labelAside={`${tags.length} / ${max}`}
      hint={TAG_FIELD_TEXT.hint}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <Tag
            key={tag}
            removeLabel={`${tag} 태그 지우기`}
            onRemove={() => onChange(tags.filter((item) => item !== tag))}
          >
            {tag}
          </Tag>
        ))}
        {isFull ? null : isAdding ? (
          <input
            autoFocus
            data-esc-local
            value={draft}
            aria-label="태그 이름"
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => finish(false)}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                // 드로어는 data-esc-local을 보고 닫지 않는다
                finish(true);
                return;
              }

              if (event.key !== "Enter" || event.nativeEvent.isComposing) {
                return;
              }

              event.preventDefault();
              const value = draft.trim();

              if (value && !tags.includes(value)) {
                onChange([...tags, value]);
              }

              setDraft("");

              if (tags.length + 1 >= max) {
                finish(false);
              }
            }}
            className="kit-input h-6 w-28 rounded-[var(--radius-full)] border border-[var(--primary)] bg-[var(--surface)] px-2 text-xs text-[var(--text)] outline-none"
          />
        ) : (
          <button
            ref={addRef}
            type="button"
            onClick={() => setIsAdding(true)}
            className="kit-focus inline-flex h-6 cursor-pointer items-center rounded-[var(--radius-full)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--t2)] hover:border-[var(--border-2)] hover:text-[var(--text)]"
          >
            {TAG_FIELD_TEXT.add}
          </button>
        )}
      </div>
    </Field>
  );
}
