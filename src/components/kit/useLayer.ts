"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type RefObject } from "react";

/** 들어오기 · 나가기 시간 (프로토타입 slide .18s · fade .15s) */
export const LAYER_MOTION_MS = 180;

// 열린 레이어 순서. Esc · 바깥 누르기는 맨 위 레이어만 받는다.
const stack: string[] = [];
let lockedOverflow: string | null = null;
let lockCount = 0;

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * 767 이하(모바일)인지 알려 준다. 서버 그리기에서는 false.
 *
 * @example
 * const isMobile = useIsMobile();
 */
export function useIsMobile() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia("(max-width: 767px)");
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}

/**
 * 열고 닫을 때 움직임이 끝날 때까지 화면에 남겨 둔다.
 *
 * @returns `isPresent`(그릴지) · `isShown`(들어온 상태 클래스를 줄지)
 */
export function usePresence(isOpen: boolean) {
  const [isPresent, setIsPresent] = useState(isOpen);
  const [isShown, setIsShown] = useState(false);

  if (isOpen && !isPresent) {
    setIsPresent(true);
  }

  // 닫힐 때는 그리는 중에 바로 나가기 상태로 바꾼다 (효과 안에서 상태를 바꾸지 않게)
  if (!isOpen && isShown) {
    setIsShown(false);
  }

  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(() => setIsShown(true));
      return () => cancelAnimationFrame(frame);
    }

    const timer = window.setTimeout(() => setIsPresent(false), LAYER_MOTION_MS);
    return () => window.clearTimeout(timer);
  }, [isOpen]);

  return { isPresent, isShown };
}

type UseLayerOptions = {
  isOpen: boolean;
  onClose: () => void;
  /** 레이어 바깥 요소 (패널) */
  panelRef: RefObject<HTMLElement | null>;
  /** 처음 초점을 줄 요소. 없으면 첫 입력칸 → 첫 버튼 */
  initialFocusRef?: RefObject<HTMLElement | null>;
  /** 뒤 화면 스크롤을 막을지 (드로어 · 모달 · 시트). 팝오버는 막지 않는다 */
  lockScroll?: boolean;
  /** 안에서만 Tab이 돌게 할지 (드로어 · 모달 · 시트) */
  trapFocus?: boolean;
};

/**
 * 드로어 · 모달 · 시트 · 팝오버 공통 동작 (Components 13 · 프로토타입 pushLayer).
 *
 * 열리면 첫 입력칸(없으면 첫 메뉴 줄 · 고른 줄)에 초점, 안에서만 Tab 순환, Esc로 닫기(맨 위 레이어만), 닫히면 연 요소로 초점 복귀,
 * 뒤 페이지 스크롤 잠금.
 *
 * @returns 이 레이어가 맨 위인지 묻는 함수 (바깥 누르기 처리에 쓴다)
 */
export function useLayer({
  isOpen,
  onClose,
  panelRef,
  initialFocusRef,
  lockScroll = true,
  trapFocus = true,
}: UseLayerOptions) {
  const id = useId();
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const opener = document.activeElement as HTMLElement | null;
    stack.push(id);

    if (lockScroll) {
      lockCount += 1;

      if (lockCount === 1) {
        lockedOverflow = document.documentElement.style.overflow;
        document.documentElement.style.overflow = "hidden";
      }
    }

    const focusFirst = window.setTimeout(() => {
      const panel = panelRef.current;
      const target =
        initialFocusRef?.current ??
        panel?.querySelector<HTMLElement>("input:not([disabled]), textarea:not([disabled])") ??
        panel?.querySelector<HTMLElement>(
          '[role="menuitem"]:not(:disabled), [aria-selected="true"]',
        ) ??
        panel?.querySelector<HTMLElement>(FOCUSABLE) ??
        panel;
      target?.focus({ preventScroll: true });
    }, 30);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== id) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }

      if (event.key === "Tab" && trapFocus && panelRef.current) {
        const items = [...panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
          (element) => element.offsetParent !== null,
        );

        if (items.length === 0) {
          return;
        }

        const first = items[0];
        const last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.clearTimeout(focusFirst);
      document.removeEventListener("keydown", handleKeyDown, true);
      stack.splice(stack.indexOf(id), 1);

      if (lockScroll) {
        lockCount -= 1;

        if (lockCount === 0 && lockedOverflow !== null) {
          document.documentElement.style.overflow = lockedOverflow;
          lockedOverflow = null;
        }
      }

      opener?.focus?.({ preventScroll: true });
    };
  }, [id, initialFocusRef, isOpen, lockScroll, panelRef, trapFocus]);

  return () => stack[stack.length - 1] === id;
}
