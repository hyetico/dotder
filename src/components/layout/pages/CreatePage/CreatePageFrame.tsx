import BottomAppBar from "@/components/layout/pages/CreatePage/BottomAppBar";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";

import type { ReactNode } from "react";

type CreatePageLayoutProps = {
  children: ReactNode;
  fitViewport?: boolean;
};

type CreatePageFrameProps = {
  children: ReactNode;
  formId: string;
  submitLabel: string;
  isSubmitting?: boolean;
  showActions?: boolean;
  fillViewport?: boolean;
  onCancel: () => void;
};

/**
 * CreatePageLayout
 *
 * 생성 화면이 헤더 아래 페이지 높이를 기준으로 늘어나게 감쌉니다.
 *
 * @param props - CreatePageLayout 컴포넌트 Props
 * @param props.children - 생성 페이지 내용
 * @param props.fitViewport - 헤더 아래 남은 화면 높이에 고정할지 여부
 */
export function CreatePageLayout({ children, fitViewport = false }: CreatePageLayoutProps) {
  return (
    <div
      className={
        fitViewport
          ? `flex min-h-[calc(100dvh-var(--header-height))] flex-col md:h-[calc(100dvh-var(--header-height))] md:min-h-0 md:overflow-hidden`
          : `flex min-h-[calc(100dvh-var(--header-height))] flex-col`
      }
    >
      {children}
    </div>
  );
}

/**
 * CreatePageFrame
 *
 * 생성 화면의 본문과 하단 버튼을 배치합니다. 버튼은 모바일에서는 내용 아래에 두고, 태블릿과 웹에서는 화면 아래에 고정합니다.
 *
 * @param props - CreatePageFrame 컴포넌트 Props
 * @param props.children - 생성 폼
 * @param props.formId - 하단 저장 버튼이 제출할 폼 id
 * @param props.submitLabel - 저장 버튼 문구
 * @param props.isSubmitting - 저장 중이면 버튼을 막는다
 * @param props.showActions - 하단 버튼을 보여줄지 여부
 * @param props.fillViewport - 본문이 남은 화면 높이를 채우게 할지 여부
 * @param props.onCancel - 취소 시 실행되는 함수
 */
export function CreatePageFrame({
  children,
  formId,
  submitLabel,
  isSubmitting = false,
  showActions = true,
  fillViewport = false,
  onCancel,
}: CreatePageFrameProps) {
  return (
    <>
      <div className={fillViewport ? `flex min-h-0 flex-1 flex-col` : "flex-1"}>{children}</div>

      {showActions ? (
        <BottomAppBar>
          <SecondaryButton
            size="md"
            onClick={onCancel}
            disabled={isSubmitting}
            className="min-w-[96px] justify-center"
          >
            취소
          </SecondaryButton>

          <PrimaryButton type="submit" form={formId} size="md" disabled={isSubmitting}>
            {isSubmitting ? "저장 중..." : submitLabel}
          </PrimaryButton>
        </BottomAppBar>
      ) : null}
    </>
  );
}
