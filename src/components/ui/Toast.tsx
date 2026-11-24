"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import CloseButton from "@/components/ui/button/CloseButton";
import { AppIcon, CircleCheck } from "@/components/ui/icon";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastProps = {
  /** 한 줄 결과 문구. 예: "즐겨찾기에서 해제했어요." */
  message: ReactNode;
  /** 문구 아래 보조 설명. */
  description?: ReactNode;
  /** `success`면 앞에 체크 아이콘. */
  tone?: "default" | "success";
  /** 되돌리기 같은 버튼 하나. 있으면 6초, 없으면 4초 뒤 닫힌다. */
  action?: ToastAction;
  /** 시간이 지나거나 X를 누르면 부른다. */
  onClose: () => void;
};

const DEFAULT_DURATION_MS = 4000;
const ACTION_DURATION_MS = 6000;

/**
 * 작업 결과를 화면 아래 가운데에 잠깐 보여준다 (handoff B5).
 *
 * 마우스나 키보드 초점이 올라가 있는 동안은 시간이 멈춘다. 오류는 토스트에만 띄우지 않는다.
 *
 * @example
 * <Toast message="즐겨찾기에서 해제했어요." action={{ label: "실행 취소", onClick: undo }} onClose={hide} />
 */
export default function Toast({
  message,
  description,
  tone = "default",
  action,
  onClose,
}: ToastProps) {
  const [isPaused, setIsPaused] = useState(false);
  const remainingRef = useRef(action ? ACTION_DURATION_MS : DEFAULT_DURATION_MS);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const startedAt = Date.now();
    const timer = window.setTimeout(() => onCloseRef.current(), remainingRef.current);

    return () => {
      window.clearTimeout(timer);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAt));
    };
  }, [isPaused]);

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      className="toast-enter fixed bottom-6 left-1/2 z-[var(--z-toast)] flex w-max max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] py-2 pr-2 pl-4 shadow-[var(--shadow-overlay)]"
    >
      {tone === "success" ? (
        <span className="inline-flex shrink-0 text-[var(--color-success-text)]">
          <AppIcon icon={CircleCheck} size="md" />
        </span>
      ) : null}

      <div className="min-w-0 flex-1">
        <p className="text-body font-medium text-[var(--color-text)]">{message}</p>
        {description ? (
          <p className="text-caption mt-0.5 text-[var(--color-text-secondary)]">{description}</p>
        ) : null}
      </div>

      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="text-body shrink-0 cursor-pointer rounded-[var(--radius-sm)] px-2 py-1 font-semibold text-[var(--color-info-text)] transition-colors hover:bg-[var(--color-hover)]"
        >
          {action.label}
        </button>
      ) : null}

      <CloseButton label="알림 닫기" onClick={onClose} />
    </div>
  );
}
