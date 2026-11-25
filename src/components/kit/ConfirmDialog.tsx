"use client";

import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

import Button from "@/components/kit/Button";
import { useLayer, usePresence } from "@/components/kit/useLayer";
import { Trash2 } from "@/components/ui/icon";

import {
  BUTTON_LABEL,
  DELETE_CONFIRM_TEXT,
  DISCARD_CONFIRM,
  deleteConfirmTitle,
} from "@/content/ui";

import { cn } from "@/lib/cn";

type ConfirmDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  text?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /**
   * default: 아이콘 없음 · 확인은 주 버튼(검정) — 닫기 확인 (보드 03-d).
   * danger: 빨간 휴지통 상자 40 · 확인은 빨강 버튼 — 삭제 확인에만 (보드 03-f).
   */
  tone?: "default" | "danger";
  /** 이 요소(드로어 패널 등)의 가운데에 띄운다. 없으면 화면 가운데 */
  withinRef?: RefObject<HTMLElement | null>;
};

/**
 * 확인창 (프로토타입 confirmBox · Components 확인창 320). 모바일에서도 시트가 아니라 가운데 상자.
 *
 * 폭 320 · 안쪽 24 · 제목 18 · 설명 --t2 · 위 16 · 버튼 둘이 반반(취소 · 확인). 열리면 「취소」에 초점이 간다.
 * `tone="danger"`(삭제)만 빨간 휴지통 상자 40(모서리 12)과 빨강 버튼을 쓴다 (보드 03-d · 03-f · REBUILD 4-3).
 *
 * @example
 * <ConfirmDialog isOpen={open} title="프로젝트를 삭제할까요?" confirmLabel="삭제" tone="danger" onConfirm={remove} onClose={close} />
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  text,
  confirmLabel = "확인",
  cancelLabel = BUTTON_LABEL.cancel,
  tone = "default",
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
        {tone === "danger" ? (
          <span
            aria-hidden
            className="mb-2 inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--badge-bad-bg)] text-[var(--bad)]"
          >
            <Trash2 size={20} />
          </span>
        ) : null}
        <h2 className="text-lg font-semibold">{title}</h2>
        {text ? <p className="text-sm text-[var(--t2)]">{text}</p> : null}
        <div className="mt-4 flex gap-2">
          <Button ref={cancelRef} grow onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
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

type PresetConfirmProps = Pick<
  ConfirmDialogProps,
  "isOpen" | "onClose" | "onConfirm" | "withinRef"
>;

/**
 * 바꾼 채로 닫을 때 확인창 (REBUILD 5-3). 「저장하지 않고 닫을까요?」 / 「수정한 내용이 사라져요.」 [취소] [닫기(주 버튼)], 아이콘 없음 (보드 03-d).
 *
 * @example
 * <DiscardConfirmDialog isOpen={open} withinRef={panelRef} onConfirm={closeDrawer} onClose={() => setOpen(false)} />
 */
export function DiscardConfirmDialog(props: PresetConfirmProps) {
  return (
    <ConfirmDialog
      {...props}
      title={DISCARD_CONFIRM.title}
      text={DISCARD_CONFIRM.text}
      confirmLabel={BUTTON_LABEL.close}
    />
  );
}

/**
 * 삭제 확인창 (REBUILD 5-3). 「{대상}을/를 삭제할까요?」 / 「삭제하면 되돌릴 수 없어요.」 [취소] [삭제(빨강)].
 *
 * @example
 * <DeleteConfirmDialog target="프로젝트" isOpen={open} onConfirm={remove} onClose={() => setOpen(false)} />
 */
export function DeleteConfirmDialog({
  target,
  detail,
  ...props
}: PresetConfirmProps & {
  target: string;
  /** 「삭제하면 되돌릴 수 없어요.」 앞에 붙는 문장. 함께 지워지는 것 (보드 03-f) */
  detail?: string;
}) {
  return (
    <ConfirmDialog
      {...props}
      title={deleteConfirmTitle(target)}
      text={detail ? `${detail} ${DELETE_CONFIRM_TEXT}` : DELETE_CONFIRM_TEXT}
      confirmLabel={BUTTON_LABEL.delete}
      tone="danger"
    />
  );
}
