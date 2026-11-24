"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useQuery } from "@tanstack/react-query";

import ProjectSwitcherPanel from "@/components/layout/Sidebar/comp/ProjectSwitcherPanel";
import { AppIcon, ChevronDown } from "@/components/ui/icon";
import Modal from "@/components/ui/modal/Modal";

import { getProjects, readMainProjectId, readProject } from "@/features/projects/api/projects";
import ProjectMark from "@/features/projects/components/ProjectMark";

import { projectQueryKeys } from "@/lib/queryKeys";

type SidebarMainProjectProps = {
  isCollapsed: boolean;
  /** 프로젝트로 이동할 때. 모바일 메뉴 시트를 닫는다. */
  onNavigate?: () => void;
};

const POPOVER_GAP = 8;
const MOBILE_QUERY = "(max-width: 767px)";
const SWITCHER_TITLE = "프로젝트 전환";

const triggerClassName =
  "flex h-11 w-full min-w-0 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 text-left transition-colors hover:border-[var(--color-border-strong)]";
const collapsedTriggerClassName =
  "group relative mx-auto flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-[var(--color-border-strong)]";

/**
 * 접힌 사이드바에서 항목 옆에 뜨는 이름 라벨.
 */
function SidebarHoverLabel({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute top-1/2 left-[calc(100%+20px)] z-50 hidden h-9 -translate-y-1/2 items-center rounded-xl bg-[var(--color-nav-hover)]/50 px-3 text-sm font-medium whitespace-nowrap text-[var(--color-text)] shadow-[var(--shadow-overlay)] backdrop-blur-sm group-hover:flex">
      {children}
    </span>
  );
}

/**
 * 사이드바의 프로젝트 전환 칸. 점(메인은 왕관) + 메인 프로젝트 이름 + ▾ (Layout Spec 02).
 *
 * 누르면 웹 · 태블릿은 칸 아래 팝오버 320, 모바일은 바텀시트로 `ProjectSwitcherPanel`을 연다.
 * 접힌 사이드바는 칸 오른쪽에 연다.
 */
export default function SidebarMainProject({ isCollapsed, onNavigate }: SidebarMainProjectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const { data: projects = [], isPending } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const pendingMainProjectId = isPending ? readMainProjectId() : null;
  const mainProject =
    projects.find((project) => project.isMain) ??
    (pendingMainProjectId == null ? null : (readProject(pendingMainProjectId) ?? null));
  const label = mainProject?.name ?? SWITCHER_TITLE;

  const open = () => {
    setIsMobile(window.matchMedia(MOBILE_QUERY).matches);
    setPosition(null);
    setIsOpen(true);
  };

  const close = () => setIsOpen(false);

  const handleNavigate = () => {
    close();
    onNavigate?.();
  };

  const isPopoverOpen = isOpen && !isMobile;

  useEffect(() => {
    if (!isPopoverOpen) {
      return;
    }

    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      const width = popoverRef.current?.offsetWidth ?? 0;
      const height = popoverRef.current?.offsetHeight ?? 0;

      if (!rect) {
        return;
      }

      const top = isCollapsed ? rect.top : rect.bottom + POPOVER_GAP;
      const left = isCollapsed ? rect.right + POPOVER_GAP : rect.left;

      setPosition({
        top: Math.max(POPOVER_GAP, Math.min(top, window.innerHeight - height - POPOVER_GAP)),
        left: Math.max(POPOVER_GAP, Math.min(left, window.innerWidth - width - POPOVER_GAP)),
      });
    };

    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !popoverRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      const dialogs = document.querySelectorAll("[role='dialog']");

      if (event.key !== "Escape" || dialogs[dialogs.length - 1] !== popoverRef.current) {
        return;
      }

      setIsOpen(false);
      triggerRef.current?.focus();
    };

    place();
    window.addEventListener("resize", place);
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("resize", place);
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isCollapsed, isPopoverOpen]);

  const isPlaced = position !== null;

  useEffect(() => {
    // 자리를 잡은 뒤 검색칸으로 초점을 옮긴다
    if (isPopoverOpen && isPlaced) {
      popoverRef.current?.querySelector("input")?.focus({ preventScroll: true });
    }
  }, [isPlaced, isPopoverOpen]);

  const panel = <ProjectSwitcherPanel projects={projects} onNavigate={handleNavigate} />;

  const trigger = isCollapsed ? (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={`${SWITCHER_TITLE} · ${label}`}
      onClick={() => (isOpen ? close() : open())}
      className={collapsedTriggerClassName}
    >
      <ProjectMark color={mainProject?.color ?? null} isMain={mainProject != null} />
      <SidebarHoverLabel>{label}</SidebarHoverLabel>
    </button>
  ) : (
    <button
      ref={triggerRef}
      type="button"
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-label={`${SWITCHER_TITLE} · ${label}`}
      onClick={() => (isOpen ? close() : open())}
      className={triggerClassName}
    >
      <ProjectMark color={mainProject?.color ?? null} isMain={mainProject != null} />
      <span className="text-body min-w-0 flex-1 truncate font-medium text-[var(--color-text)]">
        {label}
      </span>
      <AppIcon icon={ChevronDown} size="sm" className="shrink-0 text-[var(--color-text-muted)]" />
    </button>
  );

  return (
    <>
      {trigger}

      {isPopoverOpen
        ? createPortal(
            <div
              ref={popoverRef}
              role="dialog"
              aria-label={SWITCHER_TITLE}
              className="fixed z-[var(--z-popover)] w-[var(--popover-switcher)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1 shadow-[var(--shadow-overlay)]"
              style={
                position
                  ? { top: position.top, left: position.left }
                  : { top: 0, left: 0, visibility: "hidden" }
              }
            >
              {panel}
            </div>,
            document.body,
          )
        : null}

      <Modal
        isOpen={isOpen && isMobile}
        onClose={close}
        padded={false}
        labelledBy="project-switcher-title"
      >
        <Modal.Header id="project-switcher-title" title={SWITCHER_TITLE} onClose={close} />
        <div className="min-h-0 overflow-y-auto px-2 pb-4">{panel}</div>
      </Modal>
    </>
  );
}
