import { AppIcon, Search } from "@/components/ui/icon";
import Input from "@/components/ui/input/Input";

import type { ReactNode, Ref } from "react";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel?: string;
  className?: string;
  leading?: ReactNode;
  inputRef?: Ref<HTMLInputElement>;
};

/**
 * SearchInput
 *
 * 공통 입력 필드 왼쪽에 검색 아이콘을 붙여 검색어를 받습니다.
 *
 * @param props - SearchInput 컴포넌트 Props
 * @param props.value - 입력된 검색어
 * @param props.onChange - 검색어가 바뀔 때 실행되는 함수
 * @param props.placeholder - 검색어를 입력하기 전에 보여줄 문구
 * @param props.ariaLabel - 입력 필드의 접근성 이름
 * @param props.className - 필드에 더할 클래스
 * @param props.leading - 검색 아이콘과 입력창 사이에 표시할 내용
 * @param props.inputRef - 입력창에 연결할 ref
 */
export default function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  className = "",
  leading,
  inputRef,
}: SearchInputProps) {
  return (
    <label className={`block w-full min-w-0 ${className} `}>
      <Input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className="h-10! px-3!"
        leading={
          <>
            <AppIcon
              icon={Search}
              size="md"
              className="pointer-events-none shrink-0 text-[var(--color-field-placeholder)]"
            />
            {leading}
          </>
        }
      />
    </label>
  );
}
