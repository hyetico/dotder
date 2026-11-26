import { Search } from "@/components/ui/icon";

import { cn } from "@/lib/cn";

import type { Ref } from "react";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  /** 읽는 이름. 보이는 라벨이 없으니 꼭 넘긴다 */
  ariaLabel: string;
  /** 도구 줄 36(sm, 기본) · 팝오버 · 모달 안 40(md) */
  size?: "sm" | "md";
  className?: string;
  inputRef?: Ref<HTMLInputElement>;
  autoFocus?: boolean;
};

/**
 * 검색칸 (보드 01 도구 줄 · REBUILD 5-2). 앱의 모든 검색칸은 이것 하나를 쓴다.
 *
 * 테두리는 입력칸 선(--input-line)이 아니라 도구 줄 칸과 같은 --border, 바탕 --surface,
 * 아이콘 · 안내 글 --t3. 초점은 입력칸과 같은 --primary 테두리 + 3px 링. 기본 X 버튼은 숨긴다.
 *
 * @example
 * <SearchField value={q} onChange={setQ} placeholder="프로젝트 검색" ariaLabel="프로젝트 검색" />
 */
export default function SearchField({
  value,
  onChange,
  placeholder,
  ariaLabel,
  size = "sm",
  className,
  inputRef,
  autoFocus,
}: SearchFieldProps) {
  return (
    <label
      className={cn(
        "flex w-full min-w-0 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--text)] transition-[border-color,box-shadow] focus-within:border-[var(--primary)] focus-within:shadow-[0_0_0_3px_var(--input-ring)] hover:border-[var(--border-2)]",
        size === "sm" ? "h-9" : "h-10",
        className,
      )}
    >
      <Search size={16} aria-hidden className="shrink-0 text-[var(--t3)]" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="kit-input h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--t3)] [&::-webkit-search-cancel-button]:appearance-none"
      />
    </label>
  );
}
