"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import SidebarMainProject from "@/components/layout/Sidebar/comp/SidebarMainProject";
import SidebarProfile from "@/components/layout/Sidebar/comp/SidebarProfile";
import IconButton from "@/components/ui/button/IconButton";
import {
  AppIcon,
  ArrowRight,
  Folder,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from "@/components/ui/icon";
import MenuLink from "@/components/ui/MenuLink";

import { getProjects, readMainProjectId } from "@/features/projects/api/projects";
import { useCurrentProjectScope } from "@/features/projects/hooks/useCurrentProjectScope";

import { primaryNavItems, secondaryNavItems, type NavItem } from "@/lib/navConfig";
import { buildNavHref, getProjectGoalsPath, isStaticNavActive } from "@/lib/projectRoutes";
import { projectQueryKeys } from "@/lib/queryKeys";

const mockWeeklyProgress = {
  percent: 67,
  completed: 27,
  total: 40,
};

/** 1280px 이상은 웹. 그 아래 모바일·태블릿은 사이드바를 접는다. */
const sidebarExpandedQuery = "(min-width: 1280px)";

/**
 * readSidebarCollapsed
 *
 * 모바일과 태블릿에서는 사이드바를 접힌 상태로 두고, 웹에서는 펼칩니다.
 *
 * @returns 사이드바를 접을지 여부
 */
function readSidebarCollapsed() {
  return !window.matchMedia(sidebarExpandedQuery).matches;
}

const overlaySidebarClassName =
  "fixed inset-y-0 left-0 z-50 hidden h-dvh w-[var(--sidebar-width)] border-r border-[var(--color-border)] shadow-[var(--shadow-overlay)] md:flex";

const overlayBackdropClassName = "fixed inset-0 z-40 hidden bg-[var(--color-overlay)] md:block";

const overlaySpacerClassName = "hidden w-[var(--sidebar-collapsed-width)] shrink-0 md:block";

const sidebarFrameClassName = "flex shrink-0 flex-col bg-[var(--color-surface)]";

type SidebarProps = {
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
};

function getNavLinkClassName(isDesktopCollapsed: boolean) {
  return `
    sidebar-nav-link
    relative
    h-9
    gap-1.5!
    rounded-xl

    ${isDesktopCollapsed ? "size-9! justify-center gap-0! p-0!" : "px-3"}
  `;
}

function SidebarNavList({
  items,
  pathname,
  projectScope,
  mainProjectId,
  searchParams,
  isDesktopCollapsed,
  onNavigate,
}: {
  items: NavItem[];
  pathname: string;
  projectScope: ReturnType<typeof useCurrentProjectScope>;
  mainProjectId: number | null;
  searchParams: URLSearchParams;
  isDesktopCollapsed: boolean;
  onNavigate?: () => void;
}) {
  return (
    <ul className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;

        const href =
          item.href === "/goals" && mainProjectId != null
            ? getProjectGoalsPath(mainProjectId)
            : buildNavHref(item.href, projectScope, searchParams);

        const isActive = isStaticNavActive(item.href, pathname);

        return (
          <li key={item.href} className={isDesktopCollapsed ? "flex justify-center" : undefined}>
            <MenuLink
              href={href}
              onClick={onNavigate}
              data-active={isActive}
              className={getNavLinkClassName(isDesktopCollapsed)}
            >
              <AppIcon icon={Icon} size="lg" className="shrink-0" />

              {isDesktopCollapsed ? (
                <span className="sidebar-nav-tooltip pointer-events-none absolute top-1/2 left-[calc(100%+20px)] z-50 h-9 -translate-y-1/2 items-center rounded-xl bg-[var(--color-nav-hover)]/50 px-3 text-sm font-normal whitespace-nowrap text-[var(--color-text)] uppercase shadow-[var(--shadow-overlay)] backdrop-blur-sm">
                  {item.label}
                </span>
              ) : (
                <span className="truncate">{item.label}</span>
              )}
            </MenuLink>
          </li>
        );
      })}
    </ul>
  );
}

export default function Sidebar({ variant = "desktop", onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectScope = useCurrentProjectScope();
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
  const mainProjectId = projects.find((project) => project.isMain)?.id ?? readMainProjectId();

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isNarrowLayout, setIsNarrowLayout] = useState(true);
  const [hasSidebarDefault, setHasSidebarDefault] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const isMobile = variant === "mobile";

  const isDesktopCollapsed = !isMobile && isCollapsed;

  const isOverlayOpen = !isMobile && isNarrowLayout && !isCollapsed && !isSettingsOpen;

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev);
  };

  /**
   * handleSidebarNavigate
   *
   * 태블릿에서 사이드바가 모달로 열린 동안 메뉴를 누르면 사이드바를 접습니다.
   */
  const handleSidebarNavigate = () => {
    if (!isMobile && isNarrowLayout) {
      setIsCollapsed(true);
    }

    onNavigate?.();
  };

  useLayoutEffect(() => {
    if (isMobile) return;

    const media = window.matchMedia(sidebarExpandedQuery);
    const applyDefault = () => {
      const narrow = readSidebarCollapsed();

      setIsNarrowLayout(narrow);
      setIsCollapsed(narrow);
    };

    applyDefault();
    const frame = requestAnimationFrame(() => {
      setHasSidebarDefault(true);
    });
    media.addEventListener("change", applyDefault);

    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", applyDefault);
    };
  }, [isMobile]);

  useLayoutEffect(() => {
    if (isMobile) return;

    document.documentElement.dataset.sidebar = isNarrowLayout || isCollapsed ? "closed" : "open";

    return () => {
      delete document.documentElement.dataset.sidebar;
    };
  }, [isCollapsed, isMobile, isNarrowLayout]);

  useEffect(() => {
    if (!isOverlayOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCollapsed(true);
      }
    };

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOverlayOpen]);

  const desktopSidebarClassName = [
    "sticky top-0 hidden h-dvh border-r border-[var(--color-border)] md:flex",
    hasSidebarDefault && !isNarrowLayout ? "transition-[width] duration-300" : "",
    isDesktopCollapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]",
  ]
    .filter(Boolean)
    .join(" ");
  const sidebarClassName = isMobile
    ? `${sidebarFrameClassName} relative z-20 h-full w-[min(var(--sidebar-width),calc(100vw-48px))] shadow-[var(--shadow-overlay)]`
    : isSettingsOpen
      ? `${sidebarFrameClassName} hidden`
      : isOverlayOpen
        ? `${sidebarFrameClassName} ${overlaySidebarClassName}`
        : `${sidebarFrameClassName} relative z-20 ${desktopSidebarClassName}`;

  const navListProps = {
    pathname,
    projectScope,
    mainProjectId,
    searchParams,
    isDesktopCollapsed,
    onNavigate: handleSidebarNavigate,
  };

  return (
    <>
      {isOverlayOpen ? (
        <button
          type="button"
          aria-label="사이드바 닫기"
          onClick={toggleSidebar}
          className={overlayBackdropClassName}
        />
      ) : null}
      {isOverlayOpen ? <div aria-hidden className={overlaySpacerClassName} /> : null}
      <aside className={sidebarClassName}>
        <div
          className={`sidebar-brand flex shrink-0 items-center ${
            isDesktopCollapsed ? "justify-center px-[10px]" : "justify-between px-[10px]"
          } `}
        >
          {isDesktopCollapsed ? (
            <IconButton
              label="사이드바 펼치기"
              onClick={toggleSidebar}
              className="size-9! shrink-0 rounded-xl! text-[var(--color-text)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
            >
              <AppIcon icon={PanelLeftOpen} size="lg" />
            </IconButton>
          ) : (
            <Link
              href="/projects"
              onClick={handleSidebarNavigate}
              aria-label="프로젝트로 이동"
              className={`flex min-w-0 items-center ${
                isDesktopCollapsed ? "justify-center" : "gap-1.5"
              } `}
            >
              <div
                className={`flex size-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface)] ${
                  isDesktopCollapsed ? "" : "ml-3"
                } `}
              >
                <span className="bg-primary-gradient flex size-6 items-center justify-center rounded-sm text-[var(--color-text-inverse)]">
                  <AppIcon icon={Folder} size="sm" />
                </span>
              </div>

              {!isDesktopCollapsed && (
                <span className="truncate text-base leading-5 font-bold tracking-tight text-[var(--color-text)]">
                  Tessera
                </span>
              )}
            </Link>
          )}

          {!isDesktopCollapsed && (
            <IconButton
              label={isMobile || isOverlayOpen ? "사이드바 닫기" : "사이드바 접기"}
              onClick={isMobile ? onNavigate : toggleSidebar}
              className="size-9! shrink-0 rounded-xl! text-[var(--color-text)] hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
            >
              {isMobile ? (
                <AppIcon icon={X} size="md" />
              ) : (
                <AppIcon icon={PanelLeftClose} size="lg" />
              )}
            </IconButton>
          )}
        </div>

        <div className="shrink-0 px-[10px] pb-2">
          <SidebarMainProject
            isCollapsed={isDesktopCollapsed}
            onNavigate={handleSidebarNavigate}
            onDrawerOpenChange={isMobile ? undefined : setIsSettingsOpen}
          />
        </div>

        <nav
          className={`min-h-0 flex-1 ${
            isDesktopCollapsed
              ? "overflow-visible px-[10px] pb-4"
              : "overflow-y-auto px-[10px] pb-2"
          } `}
        >
          <SidebarNavList items={primaryNavItems} {...navListProps} />

          <div
            className={` ${
              isDesktopCollapsed ? "my-4 border-t border-[var(--color-border)]" : "my-4"
            } `}
          />

          <SidebarNavList items={secondaryNavItems} {...navListProps} />
        </nav>

        <div className={`shrink-0 px-[10px] ${isDesktopCollapsed ? "pb-4" : "pb-5"} `}>
          {!isDesktopCollapsed ? (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3 md:p-4">
              <p className="text-xs font-semibold text-[var(--color-text)]">이번 주 진행률</p>

              <div className="mt-4 flex justify-center">
                <div
                  className="flex h-24 w-24 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(
                    var(--color-primary)
                    ${mockWeeklyProgress.percent}%,
                    var(--color-hover-strong)
                    ${mockWeeklyProgress.percent}%
                  )`,
                  }}
                >
                  <div className="flex h-[74px] w-[74px] items-center justify-center rounded-full bg-[var(--color-surface)]">
                    <span className="text-lg font-bold text-[var(--color-text)]">
                      {mockWeeklyProgress.percent}%
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-[var(--color-text-secondary)]">
                {mockWeeklyProgress.completed} / {mockWeeklyProgress.total} 완료
              </p>

              <MenuLink
                href="/reports"
                onClick={handleSidebarNavigate}
                className="mt-2 h-8 justify-center bg-transparent px-2 text-xs font-medium text-[var(--color-primary)] hover:bg-transparent hover:text-[var(--color-primary-hover)]"
              >
                <span>전체 리포트 보기</span>

                <AppIcon icon={ArrowRight} size="sm" />
              </MenuLink>
            </div>
          ) : (
            <MenuLink
              href="/reports"
              className="flex h-10 justify-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-0 hover:bg-[var(--color-hover-soft)] lg:h-12"
            >
              <span className="text-xs font-bold text-[var(--color-primary)]">
                {mockWeeklyProgress.percent}%
              </span>
            </MenuLink>
          )}
        </div>

        <div className="flex shrink-0 items-center border-t border-[var(--color-border)] px-[10px] py-[10px]">
          <SidebarProfile isCollapsed={isDesktopCollapsed} onNavigate={handleSidebarNavigate} />
        </div>
      </aside>
    </>
  );
}
