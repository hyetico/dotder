import { Folder, Inbox, ListChecks, Target, type LucideIcon } from "@/components/ui/icon";

export type ShellNavItem = { href: string; label: string; icon: LucideIcon };

/** 사이드바 메뉴 (보드 01 · 6-2: 「이번 주 진행률」 없음) */
export const SHELL_NAV_ITEMS: ShellNavItem[] = [
  { href: "/projects", label: "프로젝트", icon: Folder },
  { href: "/goals", label: "목표", icon: Target },
  { href: "/tasks", label: "태스크", icon: ListChecks },
  { href: "/memos", label: "메모", icon: Inbox },
];

/** 주소에 맞는 메뉴. 설정 등 메뉴에 없는 곳은 null */
export function findNavItem(pathname: string) {
  return (
    SHELL_NAV_ITEMS.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    ) ?? null
  );
}
