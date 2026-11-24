"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { AppIcon, MoreVertical, type LucideIcon } from "@/components/ui/icon";

type DropdownMenuProps = {
  label: string;
  children?: ReactNode | ((close: () => void) => ReactNode);
  stopPropagation?: boolean;
  panelClassName?: string;
  triggerClassName?: string;
};

const MOBILE_QUERY = "(max-width: 767px)";

// 모바일(767 이하)은 아래에서 올라오는 바텀시트 · 항목 높이 44 (Components 12 「메뉴 … 모바일은 바텀시트」)
const sheetOverlayClassName = "fixed inset-0 z-[var(--z-modal)] bg-[var(--color-overlay)]";
const sheetPanelClassName =
  "fixed inset-x-0 bottom-0 z-[var(--z-modal)] flex flex-col rounded-t-[var(--radius-lg)] border-t border-[var(--color-border)] bg-[var(--color-surface)] px-2 pb-4 shadow-[var(--shadow-overlay)] [&_a]:min-h-11 [&_button]:min-h-11";
const sheetHandleClassName =
  "mx-auto mt-2 mb-2 h-1 w-9 shrink-0 rounded-full bg-[var(--color-border-strong)]";

/**
 * 점 세 개(⋯) 메뉴. 웹 · 태블릿은 버튼 아래 팝오버 220, 모바일은 바텀시트.
 *
 * @example
 * <DropdownMenu label="메모 메뉴">{(close) => <button onClick={close}>삭제</button>}</DropdownMenu>
 */
export default function DropdownMenu({
  label,
  children,
  stopPropagation = false,
  panelClassName = "",
  triggerClassName = "",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSheet, setIsSheet] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setIsOpen(false);
  };

  const content = children ? (typeof children === "function" ? children(close) : children) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        !sheetRef.current?.contains(target)
      ) {
        close();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={isOpen}
        onPointerDown={(event) => {
          if (stopPropagation) {
            event.stopPropagation();
          }
        }}
        onClick={(event) => {
          if (stopPropagation) {
            event.stopPropagation();
          }

          if (!children) {
            return;
          }

          setIsSheet(window.matchMedia(MOBILE_QUERY).matches);
          setIsOpen((prev) => !prev);
        }}
        className={
          triggerClassName ||
          `flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-transparent text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-border)] hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)]`
        }
      >
        <AppIcon icon={MoreVertical} size="md" />
      </button>

      {isOpen && !isSheet && (
        <div
          className={`absolute top-10 right-0 z-30 w-[var(--popover-menu)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-[var(--shadow-overlay)] ${panelClassName} `}
        >
          {content}
        </div>
      )}

      {isOpen && isSheet
        ? createPortal(
            <>
              <div aria-hidden className={sheetOverlayClassName} />
              <div
                ref={sheetRef}
                role="menu"
                aria-label={label}
                className={sheetPanelClassName}
                onClick={(event) => {
                  if (stopPropagation) {
                    event.stopPropagation();
                  }
                }}
              >
                <span aria-hidden className={sheetHandleClassName} />
                {content}
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}

type DropdownMenuLinkProps = {
  href: string;
  icon?: LucideIcon;
  children: ReactNode;
  onClick?: () => void;
};

/**
 * DropdownMenuLink
 *
 * 점 세 개 메뉴에서 다른 페이지로 이동하는 항목입니다.
 *
 * @param props - DropdownMenuLink 컴포넌트 Props
 * @param props.href - 이동할 경로
 * @param props.icon - 항목 왼쪽 아이콘
 * @param props.children - 항목 이름
 * @param props.onClick - 항목을 고르면 실행되는 함수
 */
export function DropdownMenuLink({ href, icon, children, onClick }: DropdownMenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-caption flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)]"
    >
      {icon ? <AppIcon icon={icon} size="sm" /> : null}
      <span className="min-w-0 truncate">{children}</span>
    </Link>
  );
}
