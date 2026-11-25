"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { ToastProvider } from "@/components/kit/Toast";
import { useLayer, usePresence } from "@/components/kit/useLayer";
import { HeaderActionsProvider } from "@/components/layout/Header/HeaderActions";
import DemoTour from "@/components/shell/DemoTour";
import { useDemoStep } from "@/components/shell/demoTourStore";
import { PageMetaProvider } from "@/components/shell/PageMeta";
import ShellHeader from "@/components/shell/ShellHeader";
import ShellSidebar from "@/components/shell/ShellSidebar";
import ShortcutsDialog from "@/components/shell/ShortcutsDialog";
import { useGlobalShortcuts } from "@/components/shell/useGlobalShortcuts";
import { AlertProvider } from "@/components/ui/modal/AlertModal";

import { cn } from "@/lib/cn";

const COLLAPSED_KEY = "dotder:sidebar-collapsed";
const listeners = new Set<() => void>();

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeCollapsed(value: boolean) {
  try {
    localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
  } catch {
    // 저장이 막혀도 이번 화면에서는 접힘 상태를 바꾼다
  }

  listeners.forEach((listener) => listener());
}

/**
 * 앱 틀 (REBUILD 3-1 · 보드 01 · T 01 · M 01).
 * 웹 · 태블릿(768 이상): 사이드바 245, 접으면 64 막대(브라우저에 기억 · REBUILD 6).
 * 접고 펼 때 폭이 0.2초 동안 바뀌고, 글자는 접히는 동안 숨는다 (DOC3 14).
 * 모바일: 사이드바 없이 헤더 ☰로 왼쪽 300 시트(보드 M 01-g).
 * 옛 화면이 쓰는 헤더 버튼 자리 · 알림 창 · 상세 드로어 밀림(`--drawer-offset`)을 그대로 받는다.
 */
export default function AppShell({ children }: { children: ReactNode }) {
  const isCollapsed = useSyncExternalStore(
    (onChange) => {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
    readCollapsed,
    () => false,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useGlobalShortcuts({
    onHelp: () => setIsHelpOpen(true),
    onToggleSidebar: () => writeCollapsed(!readCollapsed()),
  });
  // 처음 그릴 때(저장된 접힘 상태를 읽을 때)는 움직이지 않는다
  const [canAnimate, setCanAnimate] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setCanAnimate(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const isDemo = useDemoStep() != null;

  return (
    <AlertProvider>
      <ToastProvider>
        <PageMetaProvider>
          <HeaderActionsProvider>
            {/* 예시로 둘러보기 위 띠 44 (보드 E01): 헤더 · 사이드바가 그 아래에 붙는다 */}
            <div className={cn(isDemo && "[--tour-bar-h:--spacing(11)]")}>
              <Suspense fallback={null}>
                <DemoTour />
              </Suspense>
              <div className="flex min-h-dvh bg-[var(--bg)] text-[var(--text)]">
                <aside
                  className={cn(
                    // 막대 툴팁 · 프로젝트 전환 팝오버가 헤더 위로 뜨도록 헤더보다 한 층 위 (DOC4 --z-sidebar)
                    "sticky top-[var(--tour-bar-h)] z-[var(--z-sidebar)] hidden h-[calc(100dvh-var(--tour-bar-h))] shrink-0 md:block",
                    // 펼칠 때만 잘라 낸다 (막대 툴팁은 오른쪽 밖에 뜬다)
                    isCollapsed ? "w-16" : "w-61.25 overflow-hidden",
                    canAnimate &&
                      "transition-[width] duration-200 ease-in-out motion-reduce:duration-0",
                  )}
                >
                  <Suspense fallback={null}>
                    {/* 태블릿도 웹처럼 245 + 접기, 접으면 64 막대 · 상태는 같이 기억 (REBUILD 6 · 11.25) */}
                    <ShellSidebar
                      isRail={isCollapsed}
                      onToggle={() => writeCollapsed(!isCollapsed)}
                      toggleLabel={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
                    />
                  </Suspense>
                </aside>
                <div className="relative flex min-w-0 flex-1 flex-col transition-[margin-right] duration-[400ms] ease-in-out motion-reduce:duration-0 lg:mr-[var(--drawer-offset)]">
                  <Suspense fallback={<div aria-hidden className="h-14 shrink-0" />}>
                    <ShellHeader onOpenMenu={() => setIsSheetOpen(true)} />
                  </Suspense>
                  {/* 본문 안 z-index가 고정 헤더 위로 올라오지 않게 따로 쌓는다 */}
                  <main className="page-content isolate min-w-0 flex-1">{children}</main>
                </div>
              </div>
            </div>
            <NavSheet isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} />
            <ShortcutsDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
          </HeaderActionsProvider>
        </PageMetaProvider>
      </ToastProvider>
    </AlertProvider>
  );
}

/** 모바일 ☰ 시트 (보드 M 01-g): 왼쪽 300 · 그림자 · 덮개, 메뉴를 누르거나 Esc · 바깥으로 닫는다. */
function NavSheet({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { isPresent, isShown } = usePresence(isOpen);

  useLayer({ isOpen, onClose, panelRef });

  // 주소가 바뀌면 닫는다 (메뉴 · 전환 팝오버에서 이동)
  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      onClose();
    }
  }, [onClose, pathname]);

  if (!isPresent || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-drawer)] md:hidden">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-[var(--overlay-board)] transition-opacity duration-150",
          isShown ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="메뉴"
        className={cn(
          "absolute inset-y-0 left-0 w-[min(var(--sheet-nav-w),calc(100vw-var(--spacing)*12))] shadow-[8px_0_24px_rgb(0_0_0/15%)] transition-transform duration-[180ms] ease-out motion-reduce:duration-0",
          isShown ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <ShellSidebar fill onToggle={onClose} toggleLabel="메뉴 닫기" onNavigate={onClose} />
      </div>
    </div>,
    document.body,
  );
}
