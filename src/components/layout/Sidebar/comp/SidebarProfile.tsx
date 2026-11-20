"use client";

import { useEffect, useRef, useState } from "react";

import { AppIcon, Bell, ListTodo, LogOut, Moon, Settings, User } from "@/components/ui/icon";

import Button from "@/components/ui/button/Button";
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
      <Button
        type="button"
        onClick={() => setIsMenuOpen((prev) => !prev)}
        aria-expanded={isMenuOpen}
        aria-haspopup="menu"
        aria-label={`${currentUser.name} 계정 메뉴`}
        className={`flex items-center hover:bg-[var(--color-nav-hover)] ${
          isMenuOpen ? "bg-[var(--color-nav-hover)]" : ""
        } ${
          isCollapsed
            ? "h-[68px] w-full justify-center rounded-xl p-0"
            : "h-20 w-full gap-2 rounded-xl px-2"
        } `}
      >
        <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-gray-200">
          <img src={currentUser.image} alt="" className="h-full w-full object-cover" />
        </div>

        {!isCollapsed && (
          <span className="min-w-0 flex-1 truncate text-left text-sm font-normal text-[var(--color-text)]">
            {currentUser.name}
          </span>
        )}
      </Button>

      {isMenuOpen && (
        <div
          role="menu"
          className={`absolute z-50 rounded-xl border border-[var(--color-border)] bg-white p-2 shadow-[var(--shadow-dropdown)] ${
            isCollapsed ? "bottom-0 left-[calc(100%+8px)] w-64" : "bottom-full left-0 mb-1.5 w-full"
          } `}
        >
          <div className="border-b border-gray-100 px-3 py-3">
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

            <Button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-[var(--color-text)] hover:bg-[var(--color-hover-soft)]"
            >
              <AppIcon icon={Moon} size="md" />

              <span>다크 모드</span>
            </Button>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <Button
              type="button"
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
            >
              <AppIcon icon={LogOut} size="md" />

              <span>로그아웃</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
