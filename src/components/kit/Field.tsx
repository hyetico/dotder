import { cn } from "@/lib/cn";

import type { ReactNode } from "react";

type FieldProps = {
  /** 칸 이름. 14/20 500 */
  label: ReactNode;
  /** 라벨과 이어 줄 입력칸 id. 넘기면 `<label for>`로 그린다 */
  htmlFor?: string;
  /** 라벨 id. 입력칸이 아닌 묶음(색 칸 등)에 `aria-labelledby`로 쓴다 */
  labelId?: string;
  /** 필수 표시 `*` (--bad) */
  required?: boolean;
  /** 라벨 옆 작은 글 (태그 개수 「3 / 10」 등, 12 --t3) */
  labelAside?: ReactNode;
  /** 라벨 아래 · 칸 위 안내 글 (프로토타입 태그 칸처럼). 12/18 --t3 */
  hint?: ReactNode;
  /** 칸 아래 안내 글. 오류가 있으면 오류 글이 대신 나온다 */
  help?: ReactNode;
  /** 오류 글. 12/18 --bad */
  error?: ReactNode;
  className?: string;
  children: ReactNode;
};

/**
 * 라벨 + 칸 + 안내 · 오류 글 (보드 .field). 라벨과 칸 사이 6.
 *
 * 칸과 칸 사이 24는 부르는 쪽(드로어 본문 gap)이 정한다.
 *
 * @example
 * <Field label="이름" htmlFor={id} required error={errors.name?.message}>
 *   <TextInput id={id} placeholder="예: 포트폴리오 리뉴얼" />
 * </Field>
 */
export default function Field({
  label,
  htmlFor,
  labelId,
  required = false,
  labelAside,
  hint,
  help,
  error,
  className,
  children,
}: FieldProps) {
  const LabelTag = htmlFor ? "label" : "span";

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <LabelTag
        id={labelId}
        htmlFor={htmlFor}
        className="flex items-center gap-1 text-sm font-medium text-[var(--text)]"
      >
        {label}
        {required ? (
          <span aria-hidden className="text-[var(--bad)]">
            *
          </span>
        ) : null}
        {labelAside ? (
          <span className="text-xs font-normal text-[var(--t3)] tabular-nums">{labelAside}</span>
        ) : null}
      </LabelTag>
      {hint ? <p className="-mt-0.5 text-xs text-[var(--t3)]">{hint}</p> : null}
      {children}
      {error ? (
        <p role="alert" className="text-xs text-[var(--bad)]">
          {error}
        </p>
      ) : help ? (
        <p className="text-xs text-[var(--t3)]">{help}</p>
      ) : null}
    </div>
  );
}
