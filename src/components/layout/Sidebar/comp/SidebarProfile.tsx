"use client";

import { useEffect, useRef, useState } from "react";

import { AppIcon, Bell, ListTodo, LogOut, Moon, Settings, User } from "@/components/ui/icon";
import MenuLink from "@/components/ui/MenuLink";

import { currentUser } from "@/lib/mock/users";

const userMenuItems = [
  {
    label: "내 프로필",
    href: "/profile",
    icon: User,
  },
  {
    label: "내 작업",
    href: "/my-tasks",
    icon: ListTodo,
  },
  {
    label: "알림 설정",
    href: "/settings/notifications",
    icon: Bell,
  },
  {
    label: "계정 설정",
    href: "/settings",
    icon: Settings,
  },
];

type SidebarProfileProps = {
  isCollapsed: boolean;
  onNavigate?: () => void;
};

export default function SidebarProfile({ isCollapsed, onNavigate }: SidebarProfileProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
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
    <div ref={menuRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-label={`${currentUser.name} 계정 메뉴`}
        className={`flex cursor-pointer items-center transition-colors hover:bg-[var(--color-nav-hover)] ${
          isMenuOpen ? "bg-[var(--color-nav-hover)]" : ""
        } ${
          isCollapsed
            ? "h-[68px] w-full justify-center rounded-xl p-0"
            : "h-20 w-full gap-2 rounded-xl px-2"
        } `}
      >
        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[var(--color-hover-strong)]">
          <img src={currentUser.image} alt="" className="h-full w-full object-cover" />
        </div>

        {!isCollapsed && (
          <span className="min-w-0 flex-1 truncate text-left text-sm font-normal text-[var(--color-text)]">
            {currentUser.name}
          </span>
        )}
      </button>

      {isMenuOpen && (
        <div
          role="menu"
          className={`absolute z-50 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-[var(--shadow-overlay)] ${
            isCollapsed ? "bottom-0 left-[calc(100%+8px)] w-64" : "bottom-full left-0 mb-1.5 w-full"
          } `}
        >
          <div className="border-b border-[var(--color-border)] px-3 py-3">
            <p className="text-sm font-normal text-[var(--color-text)]">{currentUser.name}</p>

            <p className="mt-1 text-xs text-[var(--color-text-muted)]">{currentUser.email}</p>
          </div>

          <div className="py-2">
            {userMenuItems.map((item) => {
              const Icon = item.icon;

              return (
                <MenuLink
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    closeMenu();
                    onNavigate?.();
                  }}
                >
                  <AppIcon icon={Icon} size="md" />

                  <span>{item.label}</span>
                </MenuLink>
              );
            })}

            <button
              type="button"
              role="menuitem"
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)]"
            >
              <AppIcon icon={Moon} size="md" />

              <span>다크 모드</span>
            </button>
          </div>

          <div className="border-t border-[var(--color-border)] pt-2">
            <button
              type="button"
              role="menuitem"
              className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-[var(--color-danger-text)] transition-colors hover:bg-[var(--color-danger-soft)]"
            >
              <AppIcon icon={LogOut} size="md" />

              <span>로그아웃</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
