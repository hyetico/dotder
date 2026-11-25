"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

import Button from "@/components/kit/Button";
import { useLayer, usePresence } from "@/components/kit/useLayer";
import { X } from "@/components/ui/icon";

import { cn } from "@/lib/cn";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  /** 폭. 폼 480(기본) · 검색 600 · 단축키 560 (보드 01-e · 01-i) */
  width?: "form" | "search" | "help";
  footer?: ReactNode;
  /** 헤더 아래 선 --border (보드 01-h 보관함) */
  headerDivider?: boolean;
  /** 푸터가 안내 글 한 줄이면 왼쪽 정렬 · 위아래 12 (보드 01-h) */
  footerNote?: boolean;
  /** 제목 옆 작은 숫자 (보드 01-h 「보관된 프로젝트 2」) */
  titleCount?: number;
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** 제목 대신 넣을 머리 (통합 검색 입력 줄 · 보드 01-e). 닫기 X는 직접 넣는다 */
  header?: ReactNode;
  /** 웹에서 위 88에 띄운다 (통합 검색 · 단축키, 보드 01-e · 01-i) */
  placement?: "center" | "top";
  /** 본문 여백 없이 (목록이 끝까지 차는 창) */
  flush?: boolean;
  children: ReactNode;
};

/**
 * 모달 (보드 .modal). 가운데 · 모서리 16 · 그림자 --shadow, 헤더 56(왼 24 · 오 12) ·
 * 본문 0/24/24 · 칸 사이 16 · 푸터 16/24 + 위 선 --divider · 버튼 사이 8.
 * 모바일은 아래 시트(모서리 20 · 손잡이)로 바뀌고 주 버튼이 남은 폭을 채운다 (프로토타입 .app.m .modal).
 *
 * @example
 * <Modal isOpen={open} onClose={close} title="즐겨찾기 추가" footer={…}>…</Modal>
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  width = "form",
  footer,
  headerDivider = false,
  footerNote = false,
  titleCount,
  initialFocusRef,
  header,
  placement = "center",
  flush = false,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { isPresent, isShown } = usePresence(isOpen);

  useLayer({ isOpen, onClose, panelRef, initialFocusRef });

  if (!isPresent || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[var(--z-modal)] flex items-end justify-center md:p-4",
        placement === "top" ? "md:items-start md:pt-22" : "md:items-center",
      )}
    >
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[var(--overlay-board)] transition-opacity duration-150 motion-reduce:duration-0",
          isShown ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[88dvh] w-full flex-col overflow-hidden bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow)] transition-[opacity,transform] duration-150 outline-none motion-reduce:duration-0",
          "max-md:rounded-t-[var(--radius-sheet)] md:rounded-[var(--radius-lg)]",
          width === "form" ? "md:max-w-120" : width === "help" ? "md:max-w-140" : "md:max-w-150",
          isShown ? "translate-y-0 opacity-100" : "max-md:translate-y-full md:opacity-0",
        )}
      >
        <span
          aria-hidden
          className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-[var(--radius-full)] bg-[var(--border-2)] md:hidden"
        />
        {header ?? (
          <header
            className={cn(
              "flex h-14 shrink-0 items-center gap-2 pr-3 pl-6",
              headerDivider && "border-b border-[var(--border)]",
            )}
          >
            <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">
              {title}
              {titleCount != null ? (
                <span className="ml-1.5 text-xs font-normal text-[var(--t3)] tabular-nums">
                  {titleCount}
                </span>
              ) : null}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="닫기"
              tip="닫기 · Esc"
              onClick={onClose}
            >
              <X size={18} aria-hidden />
            </Button>
          </header>
        )}
        <div
          className={cn(
            "flex min-h-0 flex-col overflow-y-auto",
            flush ? "" : cn("px-6", headerDivider ? "pt-2 pb-4" : "gap-4 pb-6"),
          )}
        >
          {children}
        </div>
        {footer ? (
          <div
            className={cn(
              "flex shrink-0 items-center gap-2 border-t border-[var(--divider)] px-6",
              footerNote
                ? "py-3 text-xs text-[var(--t3)]"
                : "justify-end py-4 max-md:[&>*:last-child]:flex-1",
            )}
          >
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
