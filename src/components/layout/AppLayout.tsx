"use client";

import { Suspense, useEffect, useState } from "react";

import Header from "@/components/layout/Header/Header";
import { HeaderActionsProvider } from "@/components/layout/Header/HeaderActions";
import Sidebar from "@/components/layout/Sidebar/Sidebar";
import { AlertProvider } from "@/components/ui/modal/AlertModal";

type AppLayoutProps = {
  children: React.ReactNode;
};

const appColumnClassName = "relative z-0 flex min-w-0 flex-1 flex-col transition-[margin-right] duration-[400ms] ease-in-out motion-reduce:duration-[1ms] min-[1024px]:mr-[var(--goal-drawer-offset)]";

function AppLayoutFrame({ children }: AppLayoutProps) {
  /*
   * 모바일 Sidebar 열림 / 닫힘 상태
   *
   * false
   * → 닫힘
   *
   * true
   * → 열림
   */
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  /*
   * 모바일 Sidebar
   * 열기 / 닫기
   */
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen((prev) => !prev);
  };

  /*
   * 모바일 Sidebar 닫기
   *
   * Overlay 클릭,
   * 메뉴 클릭,
   * ESC 등에서 재사용
   */
  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  /*
   * ESC 키를 누르면
   * 모바일 Sidebar 닫기
   */
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);

    /*
     * 컴포넌트가 사라질 때
     * 등록했던 이벤트 제거
     */
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileSidebarOpen]);

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      {/*
       * Tablet / Desktop Sidebar
       *
       * Sidebar 내부에서
       * md 이상에서만 보이도록 처리
       */}
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>

      {/*
       * Mobile Overlay
       *
       * 모바일 Sidebar가 열렸을 때
       * 뒤쪽 화면을 어둡게 처리
       *
       * 클릭하면 Sidebar 닫힘
       */}
      {isMobileSidebarOpen && (
        <button
          type="button"
          aria-label="모바일 메뉴 닫기"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
        />
      )}

      {/*
       * Mobile Sidebar Drawer
       *
       * 기본적으로 화면 왼쪽 밖에 있다가
       * isMobileSidebarOpen이 true가 되면
       * 화면 안으로 이동
       */}
      <div
        className={`fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:hidden ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } `}
      >
        <Suspense fallback={null}>
          <Sidebar variant="mobile" onNavigate={closeMobileSidebar} />
        </Suspense>
      </div>

      {/*
       * Sidebar 오른쪽
       * 전체 페이지 영역
       */}
      <HeaderActionsProvider>
        <div className={appColumnClassName}>
          {/*
           * 공통 Header
           *
           * 모바일 Sidebar 상태와
           * toggle 함수를 전달
           */}
          <Suspense fallback={<div aria-hidden className="h-[var(--header-height)] shrink-0" />}>
            <Header
              isMobileSidebarOpen={isMobileSidebarOpen}
              onToggleMobileSidebar={toggleMobileSidebar}
            />
          </Suspense>

          {/*
           * 실제 각 페이지가 들어오는 영역
           *
           * page.tsx가 children으로 들어옴
           */}
          <main className="page-content flex-1">{children}</main>
        </div>
      </HeaderActionsProvider>
    </div>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <AlertProvider>
      <AppLayoutFrame>{children}</AppLayoutFrame>
    </AlertProvider>
  );
}
