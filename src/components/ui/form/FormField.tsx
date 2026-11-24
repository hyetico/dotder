import type { ReactNode } from "react";

type FormFieldProps = {
  /** 칸 이름. 예: "이름" */
  label: string;
  /** 라벨과 이어 줄 입력칸 id. 넘기면 `<label for>`로 그린다. */
  htmlFor?: string;
  /** 필수 칸. 라벨 뒤에 빨간 `*`를 붙인다 (입력칸에는 `aria-required`를 따로 단다). */
  required?: boolean;
  /** 칸 아래 안내 한 줄 (12 · 보조색). 오류가 있으면 오류만 보인다. */
  hint?: ReactNode;
  /** 칸 아래 오류 글 (12 · 빨강). */
  error?: string;
  /** 라벨 줄 오른쪽 끝. 글자 수 같은 것. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * 드로어 · 폼의 칸 하나: 라벨(14/600) 위 · 칸 · 아래 안내/오류 (Components 08 · Layout Spec 05).
 *
 * 라벨과 칸 사이 8, 칸과 안내 사이 6. 칸끼리 간격 24는 감싸는 쪽(`Drawer.Body`)이 준다.
 *
 * @example
 * <FormField label="이름" htmlFor={nameId} required error={errors.name?.message}>
 *   <Input id={nameId} aria-required … />
 * </FormField>
 */
export default function FormField({
  label,
  htmlFor,
  required = false,
  hint,
  error,
  aside,
  children,
  className = "",
}: FormFieldProps) {
  const labelContent = (
    <>
      {label}
      {required ? (
        <span aria-hidden className="ml-0.5 text-[var(--color-danger-text)]">
          *
        </span>
      ) : null}
    </>
  );

  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <div className="flex min-w-0 items-center justify-between gap-2">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-label text-[var(--color-text)]">
            {labelContent}
          </label>
        ) : (
          <span className="text-label text-[var(--color-text)]">{labelContent}</span>
        )}
        {aside ? <span className="shrink-0">{aside}</span> : null}
      </div>

      {children}

      {error ? (
        <p role="alert" className="text-caption -mt-0.5 text-[var(--color-danger-text)]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-caption -mt-0.5 text-[var(--color-text-secondary)]">{hint}</p>
      ) : null}
    </div>
  );
}
