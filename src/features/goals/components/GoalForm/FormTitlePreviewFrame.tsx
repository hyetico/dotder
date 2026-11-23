import { formTitleFrameClassName } from "@/components/layout/pages/CreatePage/formSpacing";

import type { ReactNode } from "react";

type FormTitlePreviewFrameProps = {
  children: ReactNode;
};

/**
 * FormTitlePreviewFrame
 *
 * 생성·수정 폼 상단에 제목 미리보기를 같은 높이와 여백으로 둡니다.
 *
 * @param props - FormTitlePreviewFrame 컴포넌트 Props
 * @param props.children - 미리보기 헤더
 */
export default function FormTitlePreviewFrame({ children }: FormTitlePreviewFrameProps) {
  return (
    <div className={formTitleFrameClassName}>
      <div className="flex w-full shrink-0 items-stretch md:h-[120px]">{children}</div>
    </div>
  );
}
