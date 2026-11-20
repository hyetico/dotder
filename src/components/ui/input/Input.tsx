import type { InputHTMLAttributes, ReactNode, Ref } from "react";

import {
  fieldControlClassName,
  fieldFocusWithinClassName,
  fieldStateClassName,
} from "@/components/ui/fieldControl";

const leadingFieldClassName = `${fieldControlClassName} ${fieldFocusWithinClassName} flex h-10 items-center gap-2 has-[input:disabled]:cursor-not-allowed has-[input:disabled]:border-[var(--color-field-border)] has-[input:disabled]:bg-[var(--color-field-disabled)] has-[input:disabled]:text-[var(--color-field-placeholder)] has-[input:disabled]:hover:border-[var(--color-field-border)] has-[input:disabled]:focus-within:border-[var(--color-field-border)] has-[input:disabled]:focus-within:shadow-none has-[input:read-only]:cursor-not-allowed has-[input:read-only]:border-[var(--color-field-border)] has-[input:read-only]:bg-[var(--color-field-disabled)] has-[input:read-only]:text-[var(--color-field-placeholder)] has-[input:read-only]:hover:border-[var(--color-field-border)] has-[input:read-only]:focus-within:border-[var(--color-field-border)] has-[input:read-only]:focus-within:shadow-none min-[1025px]:h-11`;

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  leading?: ReactNode;
  ref?: Ref<HTMLInputElement>;
};

/**
 * Input
 *
 * 테두리, 모서리, 높이가 같은 한 줄 입력 필드입니다.
 *
 * @param props - Input 컴포넌트 Props
 * @param props.leading - 입력창 왼쪽에 표시할 아이콘이나 내용
 * @param props.ref - 입력창에 연결할 ref
 * @param props.className - 필드에 더할 클래스
 */
export default function Input({ className = "", leading, ref, ...props }: InputProps) {
  if (!leading) {
    return (
      <input
        ref={ref}
        {...props}
        className={` ${fieldControlClassName} ${fieldStateClassName} h-10 min-[1025px]:h-11 [&::-webkit-search-cancel-button]:appearance-none ${className} `}
      />
    );
  }

  return (
    <div
      className={`${leadingFieldClassName} ${className}`}
    >
      {leading}

      <input
        ref={ref}
        {...props}
        className="h-full min-w-0 flex-1 bg-transparent text-inherit outline-none placeholder:text-[var(--color-field-placeholder)] disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:appearance-none"
      />
    </div>
  );
}
