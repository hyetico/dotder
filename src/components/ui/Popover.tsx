"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import Drawer from "@/components/ui/Drawer";
import { useIsMobile, useLayer } from "@/components/ui/useLayer";

import { cn } from "@/lib/cn";

const GAP = 6;
const EDGE = 8;

type PopoverProps = {
  isOpen: boolean;
  onClose: () => void;
  /** 붙일 기준 요소 (연 버튼 · 칸) */
  anchorRef: RefObject<HTMLElement | null>;
  /** 읽는 이름. 모바일 시트에서는 제목으로 보인다 */
  title: string;
  /** 폭: 메뉴 220(기본) · 정렬 · 묶기 200 · 필터 280 · 달력 282 · 프로젝트 고르기 300(보드 10-d) · 프로젝트 전환 320 · "anchor"는 기준 요소 폭 */
  width?: 200 | 220 | 280 | 282 | 300 | 320 | 340 | "anchor";
  /** 기준 요소의 왼쪽(기본) · 오른쪽 끝 · 가운데에 맞춘다 (가운데: 즐겨찾기 추가 카드의 + 아이콘 아래) */
  align?: "start" | "end" | "center";
  /** 역할. 메뉴면 "menu" */
  role?: "menu" | "dialog" | "listbox";
  /** 모바일 시트에서 줄을 좌우 8씩 넓힌다 (보드 M 01-j). ⋯ 메뉴 시트는 넓히지 않는다 (보드 M 03-e) */
  sheetBleed?: boolean;
  children: ReactNode;
};

const widthClassName = {
  200: "w-50",
  220: "w-55",
  280: "w-70",
  282: "w-70.5",
  300: "w-75",
  320: "w-80",
  340: "w-85",
} as const;

/**
 * 팝오버 (보드 .pop · 프로토타입 sheetOrPop). 기준 요소 아래 6에 붙고, 화면 아래가 모자라면 위로 뒤집힌다.
 * 바탕 --surface · 테두리 --border · 모서리 12 · 그림자 --shadow-pop · 안쪽 4.
 * Esc · 바깥 누르기로 닫고 연 요소로 초점을 돌린다. 모바일(767 이하)은 같은 내용을 아래 시트로 연다.
 *
 * @example
 * <Popover isOpen={open} onClose={close} anchorRef={buttonRef} title="정렬" width={200}>…</Popover>
 */
export default function Popover({
  isOpen,
  onClose,
  anchorRef,
  title,
  width = 220,
  align = "start",
  role = "dialog",
  sheetBleed = true,
  children,
}: PopoverProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} onClose={onClose} title={title}>
        <div role={role} aria-label={title} className={cn("flex flex-col", sheetBleed && "-mx-2")}>
          {children}
        </div>
      </Drawer>
    );
  }

  return isOpen ? (
    <FloatingPanel
      onClose={onClose}
      anchorRef={anchorRef}
      title={title}
      width={width}
      align={align}
      role={role}
    >
      {children}
    </FloatingPanel>
  ) : null;
}

function FloatingPanel({
  onClose,
  anchorRef,
  title,
  width,
  align,
  role,
  children,
}: Omit<PopoverProps, "isOpen"> & Required<Pick<PopoverProps, "width" | "align" | "role">>) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [place, setPlace] = useState<{ top: number; left: number; width?: number } | null>(null);
  const isTop = useLayer({
    isOpen: true,
    onClose,
    panelRef,
    lockScroll: false,
    trapFocus: false,
  });

  // 부르는 쪽이 매번 새 함수를 넘겨도 위치 계산이 다시 돌지 않게 ref로 받는다
  const onCloseRef = useRef(onClose);
  const isTopRef = useRef(isTop);

  useEffect(() => {
    onCloseRef.current = onClose;
    isTopRef.current = isTop;
  });

  useLayoutEffect(() => {
    const update = () => {
      const anchor = anchorRef.current?.getBoundingClientRect();
      const panel = panelRef.current;

      if (!anchor || !panel) {
        return;
      }

      const panelWidth = width === "anchor" ? anchor.width : panel.offsetWidth;
      const panelHeight = panel.offsetHeight;
      let left =
        align === "end"
          ? anchor.right - panelWidth
          : align === "center"
            ? anchor.left + anchor.width / 2 - panelWidth / 2
            : anchor.left;
      left = Math.max(EDGE, Math.min(left, window.innerWidth - panelWidth - EDGE));
      let top = anchor.bottom + GAP;

      if (top + panelHeight > window.innerHeight - EDGE) {
        top = Math.max(EDGE, anchor.top - panelHeight - GAP);
      }

      const nextWidth = width === "anchor" ? anchor.width : undefined;
      setPlace((prev) =>
        prev && prev.top === top && prev.left === left && prev.width === nextWidth
          ? prev
          : { top, left, width: nextWidth },
      );
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        isTopRef.current() &&
        !panelRef.current?.contains(target) &&
        !anchorRef.current?.contains(target)
      ) {
        onCloseRef.current();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [align, anchorRef, width]);

  return createPortal(
    <div
      ref={panelRef}
      role={role}
      aria-label={title}
      className={cn(
        "fixed z-[var(--z-popover)] flex flex-col rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] p-1 text-[var(--text)] shadow-[var(--shadow-pop)]",
        width !== "anchor" && widthClassName[width],
      )}
      style={
        place
          ? { top: place.top, left: place.left, width: place.width }
          : { top: 0, left: 0, visibility: "hidden" }
      }
    >
      {children}
    </div>,
    document.body,
  );
}
