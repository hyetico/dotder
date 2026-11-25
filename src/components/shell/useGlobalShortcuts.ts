"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const GO_TARGETS: Record<string, string> = {
  p: "/projects",
  g: "/goals",
  t: "/tasks",
  m: "/memos",
};

// 「새로 만들기」는 지금 화면 기준 (보드 01-i)
const newPathFor = (pathname: string) => {
  if (
    pathname === "/projects" ||
    pathname.startsWith("/projects/main") ||
    pathname.startsWith("/projects/favorites")
  ) {
    return `${pathname}?new=1`;
  }
  if (pathname.startsWith("/goals")) {
    return "/goals?new=1";
  }
  if (pathname.startsWith("/tasks")) {
    return "/tasks?new=1";
  }
  return null;
};

const isVisible = (element: HTMLElement) => element.getClientRects().length > 0;

/** 화면에 보이는 첫 요소가 생기면 초점을 준다 (화면을 옮긴 뒤 · 2초까지) */
function focusWhenReady(selector: string) {
  const startedAt = Date.now();
  const tryFocus = () => {
    const element = [...document.querySelectorAll<HTMLElement>(selector)].find(isVisible);
    if (element) {
      element.focus();
    } else if (Date.now() - startedAt < 2000) {
      requestAnimationFrame(tryFocus);
    }
  };
  tryFocus();
}

/**
 * 목록 줄 사이로 초점을 옮긴다 (↑↓ · 보드 01-i). 줄은 `data-list-row`, 여는 버튼은 `data-list-open`.
 * Enter는 초점이 간 버튼이 그대로 연다.
 *
 * @returns 옮겼으면 true (줄이 없는 화면에서는 스크롤을 막지 않는다)
 */
function moveListFocus(step: 1 | -1) {
  const rows = [...document.querySelectorAll<HTMLElement>("[data-list-row]")].filter(isVisible);
  if (rows.length === 0) {
    return false;
  }
  const current = rows.findIndex((row) => row.contains(document.activeElement));
  const nextIndex =
    current === -1
      ? step === 1
        ? 0
        : rows.length - 1
      : Math.min(Math.max(current + step, 0), rows.length - 1);
  const row = rows[nextIndex];
  const target = row.matches("[data-list-open]")
    ? row
    : (row.querySelector<HTMLElement>("[data-list-open]") ??
      row.querySelector<HTMLElement>("a[href], button") ??
      row);
  target.focus();
  target.scrollIntoView({ block: "nearest" });
  return true;
}

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * 앱 전체 단축키 (보드 01-i). 글을 쓰는 중이거나 창이 열려 있으면 듣지 않는다.
 * ? 안내 창 · [ 사이드바 접기 · G → P/G/T/M 이동 · N 새로 만들기 · ⇧N 빠른 메모(메모 화면 입력칸에 초점) ·
 * 목록 ↑↓ 줄 이동 · Enter 열기 · X 완료로 표시.
 * ⌘K는 헤더 검색(ShellSearch)이 맡는다.
 *
 * @example
 * useGlobalShortcuts({ onHelp: () => setHelpOpen(true), onToggleSidebar: toggle });
 */
export function useGlobalShortcuts({
  onHelp,
  onToggleSidebar,
}: {
  onHelp: () => void;
  onToggleSidebar: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const goPending = useRef(0);
  const handlers = useRef({ onHelp, onToggleSidebar, pathname });

  useEffect(() => {
    handlers.current = { onHelp, onToggleSidebar, pathname };
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || isTyping(event.target)) {
        return;
      }
      // 드로어 · 모달이 열려 있으면 그 창이 키를 맡는다
      if (document.querySelector('[aria-modal="true"]')) {
        return;
      }

      const key = event.key.toLowerCase();
      const { onHelp: help, onToggleSidebar: toggle, pathname: path } = handlers.current;

      if (Date.now() - goPending.current < 1000 && GO_TARGETS[key]) {
        goPending.current = 0;
        event.preventDefault();
        router.push(GO_TARGETS[key]);
        return;
      }

      if (event.key === "?") {
        event.preventDefault();
        help();
      } else if (event.key === "[") {
        event.preventDefault();
        toggle();
      } else if (key === "g" && !event.shiftKey) {
        goPending.current = Date.now();
      } else if (key === "n" && event.shiftKey) {
        // 메모 화면으로 가서 빠른 입력에 초점 (보드 01-i)
        event.preventDefault();
        if (path !== "/memos") {
          router.push("/memos");
        }
        focusWhenReady('[data-quick-input="memo"]');
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        if (moveListFocus(event.key === "ArrowDown" ? 1 : -1)) {
          event.preventDefault();
        }
      } else if (key === "x") {
        // 초점이 간 줄의 체크박스를 누른다 (완료로 표시)
        const row = (document.activeElement as HTMLElement | null)?.closest("[data-list-row]");
        const checkbox = row?.querySelector<HTMLElement>(
          '[role="checkbox"]:not([aria-checked="true"])',
        );
        if (checkbox) {
          event.preventDefault();
          checkbox.click();
        }
      } else if (key === "n") {
        const next = newPathFor(path);
        if (next) {
          event.preventDefault();
          router.push(next);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);
}
