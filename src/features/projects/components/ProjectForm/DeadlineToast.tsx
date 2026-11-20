"use client";

import { AppIcon, CircleCheck } from "@/components/ui/icon";
import CloseButton from "@/components/ui/button/CloseButton";

/**
 * DeadlineToast
 *
 * 마감일이 변경됐을 때 화면 위에 잠깐 보이는 알림입니다.
 *
 * @param props - DeadlineToast 컴포넌트 Props
 * @param props.deadlineToast - 마감일 변경 알림 내용. 없으면 보이지 않음
 * @param props.setDeadlineToast - 알림 내용을 바꾸거나 닫는 함수
 */
export function DeadlineToast({
  deadlineToast,
  setDeadlineToast,
}: {
  deadlineToast: { description?: string } | null;
  setDeadlineToast: (toast: { description?: string } | null) => void;
}) {
  if (!deadlineToast) {
    return null;
  }

  return (
    <div
      className="fixed top-4 left-1/2 z-[180] flex w-[min(24rem,calc(100%-2rem))] -translate-x-1/2 items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white px-3 py-3 shadow-[var(--shadow-dropdown)] md:px-4"
      role="status"
    >
      <span className="mt-0.5 inline-flex shrink-0 text-green-600">
        <AppIcon icon={CircleCheck} size="md" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-body font-medium text-[var(--color-text)]">마감일이 변경되었습니다.</p>

        {deadlineToast.description ? (
          <p className="text-caption mt-1 text-[var(--color-text-secondary)]">
            {deadlineToast.description}
          </p>
        ) : null}
      </div>

      <CloseButton
        label="알림 닫기"
        onClick={() => {
          setDeadlineToast(null);
        }}
      />
    </div>
  );
}
