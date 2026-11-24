"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import Button from "@/components/kit/Button";
import { useLayer, usePresence } from "@/components/kit/useLayer";
import { TriangleAlert, Trash2 } from "@/components/ui/icon";

import { cn } from "@/lib/cn";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  text?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** 지우기 같은 되돌릴 수 없는 일 (빨간 아이콘 · danger 버튼) */
  danger?: boolean;
  /** 이 요소(드로어 패널 등)의 가운데에 띄운다. 없으면 화면 가운데 */
  withinRef?: RefObject<HTMLElement | null>;
};

/**
 * 확인창 (프로토타입 confirmBox · Components 확인창 320). 모바일에서도 시트가 아니라 가운데 상자.
 *
 * 폭 320 · 안쪽 24 · 아이콘 상자 40(모서리 12) · 제목 18 · 설명 --t2 · 버튼 둘이 반반(취소 · 확인).
 * 열리면 「취소」에 초점이 간다.
 *
 * @example
 * <ConfirmDialog isOpen={open} title="수정을 취소할까요?" confirmLabel="취소하기" cancelLabel="계속 수정" danger withinRef={panelRef} onConfirm={discard} onClose={close} />
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  text,
  confirmLabel = "확인",
  cancelLabel = "취소",
  danger = false,
  withinRef,
}: ConfirmDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const { isPresent, isShown } = usePresence(isOpen);
  const [center, setCenter] = useState<{ x: number; y: number } | null>(null);

  useLayer({ isOpen, onClose, panelRef, initialFocusRef: cancelRef, lockScroll: false });

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    const rect = withinRef?.current?.getBoundingClientRect();
    setCenter(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null);
  }, [isOpen, withinRef]);

  if (!isPresent || typeof document === "undefined") {
    return null;
  }

  const Icon = danger ? Trash2 : TriangleAlert;

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-modal)]">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[var(--overlay)] transition-opacity duration-150",
          isShown ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute flex w-80 max-w-[calc(100vw-var(--spacing)*8)] -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-[var(--radius-lg)] bg-[var(--surface)] p-6 text-[var(--text)] shadow-[var(--shadow)] transition-opacity duration-150",
          isShown ? "opacity-100" : "opacity-0",
        )}
        style={center ? { left: center.x, top: center.y } : { left: "50%", top: "50%" }}
      >
        <span
          aria-hidden
          className={cn(
            "mb-2 inline-flex size-10 items-center justify-center rounded-[var(--radius-md)]",
            danger
              ? "bg-[var(--bad-bg)] text-[var(--bad)]"
              : "bg-[var(--warn-bg)] text-[var(--warn)]",
          )}
        >
          <Icon size={20} />
        </span>
        <h2 className="text-lg font-semibold">{title}</h2>
        {text ? <p className="text-sm text-[var(--t2)]">{text}</p> : null}
        <div className="mt-4 flex gap-2">
          <Button ref={cancelRef} grow onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? "danger" : "primary"}
            grow
            onClick={() => {
              onConfirm();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
