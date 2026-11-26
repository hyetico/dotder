"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

import Button from "@/components/ui/Button";
import { X } from "@/components/ui/icon";
import { useLayer, usePresence } from "@/components/ui/useLayer";

import { cn } from "@/lib/cn";

type DrawerProps = {
  isOpen: boolean;
  /** 닫기 요청 (X · Esc · 바깥). 바꾼 내용 확인은 부르는 쪽에서 한다 */
  onClose: () => void;
  title: string;
  /** 제목 위 작은 글 (수정 드로어의 프로젝트 이름 등) */
  kicker?: string;
  /** 제목 아래 작은 글 (마감일 변경 드로어의 프로젝트 이름 · 보드 03-g) */
  subtitle?: string;
  /** 닫기 앞 머리 버튼 (상세 드로어의 ⋯ · 넓게 보기 · 보드 04-b) */
  headerActions?: ReactNode;
  /** 넓게 보기: 웹 · 태블릿에서 화면 폭 − 64 (프로토타입 .drawer.wide) */
  wide?: boolean;
  /** 제목 크기. 상세 드로어는 xl 20 (보드 04-b), 기본 lg 18 */
  titleSize?: "lg" | "xl";
  /** 푸터 버튼들. 왼쪽 → 오른쪽 순서(취소 → 주 버튼). 없으면 푸터를 그리지 않는다 */
  footer?: ReactNode;
  /** 푸터 왼쪽 작은 글 (보드 05-a 「Enter로 추가하고 하나 더」). 모바일에서는 숨긴다 */
  footerNote?: ReactNode;
  /** 처음 초점을 줄 요소. 없으면 첫 입력칸 */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** 패널 요소. 안에 띄우는 확인창 · 팝오버의 기준으로 쓴다 */
  panelRef?: RefObject<HTMLElement | null>;
  /** 본문 위 · 아래로 감싸는 form 등. 받은 노드 안에 본문과 푸터를 넣는다 */
  wrap?: (children: ReactNode) => ReactNode;
  children: ReactNode;
};

/**
 * 드로어 (보드 01-a · Components 드로어). 만들기 · 수정에 쓴다.
 *
 * 웹 · 태블릿: 오른쪽 400 · 헤더 56(왼 24 · 오 12, 제목 18/28 600, 닫기 ghost sm 36) · 본문 패딩 24 · 칸 사이 24 ·
 * 푸터 72(좌우 24 · 버튼 사이 8 · 오른쪽 정렬, 버튼 md 40).
 * 모바일(767 이하): 아래 시트 · 위 모서리 20 · 손잡이 36×4 · 헤더 52 · 본문 8/20/20 · 칸 사이 20 ·
 * 푸터 12/20/28 · 버튼 48 · 주 버튼이 남은 폭을 채운다 (보드 M 01-a).
 *
 * @example
 * <Drawer isOpen={open} onClose={close} title="프로젝트 추가" footer={<><Button onClick={close}>취소</Button><Button variant="primary" type="submit">추가</Button></>}>…</Drawer>
 */
export default function Drawer({
  isOpen,
  onClose,
  title,
  kicker,
  subtitle,
  headerActions,
  wide = false,
  titleSize = "lg",
  footer,
  footerNote,
  initialFocusRef,
  panelRef: externalPanelRef,
  wrap,
  children,
}: DrawerProps) {
  const ownPanelRef = useRef<HTMLElement>(null);
  const panelRef = externalPanelRef ?? ownPanelRef;
  const { isPresent, isShown } = usePresence(isOpen);

  useLayer({ isOpen, onClose, panelRef, initialFocusRef });

  if (!isPresent || typeof document === "undefined") {
    return null;
  }

  const inner = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-4 px-5 pt-1 pb-4 md:gap-6 md:p-6">{children}</div>
      </div>
      {footer ? (
        <div className="flex shrink-0 items-center gap-2 border-t border-[var(--divider)] px-5 pt-3 pb-7 md:h-18 md:justify-end md:border-[var(--border)] md:px-6 md:py-0 max-md:[&>*]:h-[var(--btn-h-sheet)] max-md:[&>*:last-child]:flex-1">
          {footerNote ? (
            <span className="mr-auto text-xs text-[var(--t3)] max-md:hidden">{footerNote}</span>
          ) : null}
          {footer}
        </div>
      ) : null}
    </>
  );

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-drawer)]">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[var(--overlay-board)] transition-opacity duration-150 motion-reduce:duration-0",
          isShown ? "opacity-100" : "opacity-0",
        )}
      />
      <aside
        ref={panelRef as RefObject<HTMLElement>}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          "absolute flex flex-col bg-[var(--surface)] text-[var(--text)] transition-transform duration-[180ms] ease-out outline-none motion-reduce:duration-0",
          // 웹 · 태블릿: 오른쪽 패널
          "md:inset-y-0 md:right-0 md:shadow-[var(--shadow-drawer)]",
          wide ? "md:w-[calc(100%-var(--spacing)*16)]" : "md:w-[min(var(--drawer-w),100%)]",
          // 모바일: 아래 시트
          "max-md:inset-x-0 max-md:bottom-0 max-md:max-h-[88dvh] max-md:rounded-t-[var(--radius-sheet)] max-md:shadow-[0_-8px_24px_rgb(0_0_0/12%)]",
          isShown ? "translate-0" : "max-md:translate-y-full md:translate-x-full",
        )}
      >
        <span
          aria-hidden
          className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-[var(--radius-full)] bg-[var(--border-2)] md:hidden"
        />
        <header className="flex h-13 shrink-0 items-center gap-1 pr-2 pl-5 md:h-14 md:border-b md:border-[var(--border)] md:pr-3 md:pl-6">
          <div className="flex min-w-0 flex-1 flex-col">
            {/* 모바일 시트는 제목만 (보드 M 03-a · 03-g) */}
            {kicker ? (
              <span className="truncate text-xs text-[var(--t3)] max-md:hidden">{kicker}</span>
            ) : null}
            <h2
              className={cn(
                "truncate font-semibold",
                titleSize === "xl" ? "text-xl max-md:text-lg" : "text-lg",
              )}
            >
              {title}
            </h2>
            {subtitle ? (
              <span className="truncate text-xs text-[var(--t3)] max-md:hidden">{subtitle}</span>
            ) : null}
          </div>
          {headerActions}
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
        {wrap ? wrap(inner) : inner}
      </aside>
    </div>,
    document.body,
  );
}
