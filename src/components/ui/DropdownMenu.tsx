"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { AppIcon, MoreVertical, type LucideIcon } from "@/components/ui/icon";

type DropdownMenuProps = {
  label: string;
  children?: ReactNode | ((close: () => void) => ReactNode);
  stopPropagation?: boolean;
  panelClassName?: string;
  triggerClassName?: string;
};

export default function DropdownMenu({
  label,
  children,
  stopPropagation = false,
  panelClassName = "",
  triggerClassName = "",
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const close = () => {
    setIsOpen(false);
  };

  const content = children ? (typeof children === "function" ? children(close) : children) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
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

          setIsOpen((prev) => !prev);
        }}
        className={
          triggerClassName ||
          `flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-transparent text-[var(--color-text-muted)] transition-colors hover:border-gray-200 hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)]`
        }
      >
        <AppIcon icon={MoreVertical} size="md" />
      </button>

      {isOpen && (
        <div
          className={`absolute top-10 right-0 z-30 w-32 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white p-1.5 shadow-[var(--shadow-dropdown)] ${panelClassName} `}
        >
          {content}
        </div>
      )}
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
