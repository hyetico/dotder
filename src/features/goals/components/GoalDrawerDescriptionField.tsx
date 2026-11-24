"use client";

import {
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Ref,
} from "react";

const descriptionShellClassName =
  "w-full rounded-[var(--radius-sm)] border border-transparent bg-transparent";
const plainShellClassName = "w-full border-0 bg-transparent";
const descriptionShellFocusClassName =
  "w-full rounded-[var(--radius-sm)] border border-[var(--color-field-focus)] bg-[var(--color-field)] px-2.5 py-3 md:px-4";
const descriptionShellInvalidFocusClassName =
  "w-full rounded-[var(--radius-sm)] border border-[var(--color-field-error)] bg-[var(--color-field)] px-2.5 py-3 md:px-4";
const descriptionAreaClassName =
  "text-body block w-full resize-none overflow-hidden bg-transparent p-0 text-[var(--color-field-text)] outline-none placeholder:text-[var(--color-field-placeholder)]";
const descriptionCountClassName =
  "mt-2 w-full text-right text-xs leading-[18px] font-[400] text-[var(--color-text-muted)] tabular-nums";

type GoalDrawerDescriptionFieldProps = {
  id: string;
  value: string;
  maxLength: number;
  placeholder: string;
  invalid?: boolean;
  plain?: boolean;
  ariaLabel?: string;
  areaClassName?: string;
  inputRef?: Ref<HTMLTextAreaElement>;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
};

/**
 * resizeDescriptionArea
 *
 * 설명 칸 높이를 입력한 글 줄에 맞춥니다.
 *
 * @param area - 높이를 맞출 설명 입력창
 */
function resizeDescriptionArea(area: HTMLTextAreaElement) {
  area.style.height = "0px";
  area.style.height = `${area.scrollHeight}px`;
}

/**
 * GoalDrawerDescriptionField
 *
 * 새 목표 드로어에서 목표 설명을 입력하는 칸입니다.
 * 평소에는 테두리와 안내 문구 앞 여백이 없고, 포커스되면 한 줄 테두리와 안쪽 여백, 글자 수 제한이 보입니다.
 *
 * @param props - GoalDrawerDescriptionField 컴포넌트 Props
 * @param props.id - 설명 입력창 id
 * @param props.value - 입력 중인 설명
 * @param props.maxLength - 입력할 수 있는 최대 글자 수
 * @param props.placeholder - 설명이 없을 때 보여줄 안내 문구
 * @param props.invalid - 설명 값이 올바르지 않은지 여부
 * @param props.onChange - 설명을 바꿀 때 실행되는 함수
 */
export default function GoalDrawerDescriptionField({
  id,
  value,
  maxLength,
  placeholder,
  invalid = false,
  plain = false,
  ariaLabel,
  areaClassName = "",
  inputRef,
  onChange,
}: GoalDrawerDescriptionFieldProps) {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const shellClassName = plain
    ? plainShellClassName
    : !focused
      ? descriptionShellClassName
      : invalid
        ? descriptionShellInvalidFocusClassName
        : descriptionShellFocusClassName;
  const areaStateClassName = [descriptionAreaClassName, plain ? "min-h-0" : "", areaClassName]
    .filter(Boolean)
    .join(" ");

  // 부모가 넘긴 ref에도 같은 입력창을 연결한다. 마운트 뒤에만 읽히므로 null이 아니다.
  useImperativeHandle(inputRef, () => areaRef.current as HTMLTextAreaElement, []);

  useLayoutEffect(() => {
    const area = areaRef.current;

    if (!area) {
      return;
    }

    resizeDescriptionArea(area);
  }, [focused, value]);

  return (
    <div className={shellClassName}>
      <textarea
        ref={areaRef}
        id={id}
        value={value}
        maxLength={maxLength}
        rows={1}
        placeholder={placeholder}
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        className={areaStateClassName}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={onChange}
      />
      <p className={descriptionCountClassName}>
        {value.length}/{maxLength}
      </p>
    </div>
  );
}
