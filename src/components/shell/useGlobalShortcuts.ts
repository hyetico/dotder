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

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * 앱 전체 단축키 (보드 01-i). 글을 쓰는 중이거나 창이 열려 있으면 듣지 않는다.
 * ? 안내 창 · [ 사이드바 접기 · G → P/G/T/M 이동 · N 새로 만들기 · ⇧N 빠른 메모(메모 화면).
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
        event.preventDefault();
        router.push("/memos");
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
