import { fieldControlClassName, fieldStateClassName } from "@/components/ui/fieldControl";

import type { Ref, TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  ref?: Ref<HTMLTextAreaElement>;
  preview?: boolean;
};

/**
 * Textarea
 *
 * 한 줄 입력 필드와 같은 테두리로 여러 줄을 입력합니다.
 *
 * @param props - Textarea 컴포넌트 Props
 * @param props.ref - 입력창에 연결할 ref
 * @param props.preview - 칸만 보여주고 여기서는 쓰지 않을 때 사용
 * @param props.className - 필드에 더할 클래스
 */
export default function Textarea({
  className = "",
  ref,
  preview = false,
  readOnly,
  ...props
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      readOnly={preview || readOnly}
      {...props}
      className={` ${fieldControlClassName} ${preview ? "" : fieldStateClassName} resize-none overflow-y-auto py-3 ${className} `}
    />
  );
}
