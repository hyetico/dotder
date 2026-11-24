"use client";

import BottomAppBar from "@/components/layout/pages/CreatePage/BottomAppBar";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";

import { projectFormDomId } from "@/features/projects/constants/projectFormDefaults";

const actionBarButtonClassName = `
  min-w-0!
  flex-1!
  basis-0!
  shrink!
  justify-center

  md:w-auto
  md:flex-none!
  md:basis-auto!
  md:shrink-0!
`;

/**
 * FormActions
 *
 * 폼 아래에 보이는 취소와 저장 버튼입니다.
 *
 * @param props - FormActions 컴포넌트 Props
 * @param props.splitLayout - 좌우 분할 레이아웃인지 여부
 * @param props.isSubmitting - 저장 중인지 여부
 * @param props.submitLabel - 저장 버튼 문구
 * @param props.onCancel - 취소할 때 실행되는 함수
 */
export function FormActions({
  splitLayout,
  isSubmitting,
  submitLabel,
  onCancel,
}: {
  splitLayout: boolean;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-end gap-2.5 ${
        splitLayout ? "mt-3 shrink-0 md:mt-4" : "mt-8"
      } `}
    >
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="text-body inline-flex h-[var(--button-height-action)] min-w-[96px] items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--button-px-action)] font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        취소
      </button>

      <PrimaryButton type="submit" size="md" disabled={isSubmitting}>
        {isSubmitting ? "저장 중..." : submitLabel}
      </PrimaryButton>
    </div>
  );
}

/**
 * FormActionBar
 *
 * 모바일 하단 앱 바에 취소, 미리보기, 저장 버튼을 보여줍니다.
 *
 * @param props - FormActionBar 컴포넌트 Props
 * @param props.formId - 버튼과 연결할 폼 id
 * @param props.isSubmitting - 저장 중인지 여부
 * @param props.submitLabel - 저장 버튼 문구
 * @param props.onCancel - 취소할 때 실행되는 함수
 * @param props.setIsPreviewOpen - 미리보기 모달을 열거나 닫는 함수
 */
export function FormActionBar({
  formId,
  isSubmitting,
  submitLabel,
  onCancel,
  setIsPreviewOpen,
}: {
  formId: string | undefined;
  isSubmitting: boolean;
  submitLabel: string;
  onCancel: () => void;
  setIsPreviewOpen: (open: boolean) => void;
}) {
  return (
    <BottomAppBar>
      <SecondaryButton
        size="md"
        onClick={onCancel}
        disabled={isSubmitting}
        className={actionBarButtonClassName}
      >
        취소
      </SecondaryButton>

      <SecondaryButton
        size="md"
        onClick={() => setIsPreviewOpen(true)}
        disabled={isSubmitting}
        className={actionBarButtonClassName}
      >
        미리보기
      </SecondaryButton>

      <PrimaryButton
        type="submit"
        form={formId ?? projectFormDomId}
        size="md"
        disabled={isSubmitting}
        className={actionBarButtonClassName}
      >
        {isSubmitting ? "저장 중..." : submitLabel}
      </PrimaryButton>
    </BottomAppBar>
  );
}
