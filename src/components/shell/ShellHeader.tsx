"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import Button from "@/components/kit/Button";
import { HeaderActionsSlot } from "@/components/layout/Header/HeaderActions";
import { findNavItem } from "@/components/shell/navItems";
import { usePageMetaValue } from "@/components/shell/PageMeta";
import ShellSearch from "@/components/shell/ShellSearch";
import { ChevronLeft, Menu } from "@/components/ui/icon";

import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@/lib/cn";

type ShellHeaderProps = {
  onOpenMenu: () => void;
};

/**
 * 헤더 (보드 01 · T 01 · M 01). 56 · 아래 선 --border.
 * 웹: 왼쪽 위치(아이콘 16 + 메뉴 이름) · 오른쪽 검색 200 + 화면 버튼 자리. 안쪽은 본문과 같은 틀(최대 1280 · 좌우 40 · 가운데).
 * 태블릿 · 모바일: 제목 18/24 + 부제 12 · 검색 · 화면 버튼 자리 · (모바일) ☰. 왼 16 · 오 12.
 * 화면 버튼 자리는 옛 화면도 쓰는 `HeaderActionsSlot`이다.
 * 상세 화면(`usePageMeta`의 `back`, 보드 03): 웹 위치는 「메뉴 / 이름…」, 안쪽 틀은 목록과 같은 최대 1280 · 좌우 40.
 * 태블릿 · 모바일은 로고 대신 ← 뒤로, 검색 · ☰ 없이 화면 버튼만.
 */
export default function ShellHeader({ onOpenMenu }: ShellHeaderProps) {
  const pathname = usePathname();
  const nav = findNavItem(pathname);
  // 페이지가 알린 제목은 브라우저에 붙은 뒤에만 쓴다 (헤더가 늦게 붙을 때 하이드레이션 차이 방지)
  const isClient = useIsClient();
  const pageMeta = usePageMetaValue();
  const meta = isClient ? pageMeta : null;
  const label = nav?.label ?? (pathname.startsWith("/settings") ? "설정" : "");
  const NavIcon = nav?.icon;
  const back = meta?.back;

  return (
    // 늘 보이게 위에 붙는다 · 드로어 아래 (REBUILD 6 · 11.25)
    <header className="sticky top-0 z-[var(--z-header)] h-14 shrink-0 border-b border-[var(--border)] bg-[var(--surface)]">
      {/* 안쪽은 본문과 같은 틀: 최대 1280 · 좌우 40 · 가운데 (REBUILD 5 페이지 헤더) */}
      <div
        className={cn(
          "mx-auto flex h-full w-full max-w-320 items-center gap-2.5 pr-3 pl-4 lg:gap-2 lg:px-10",
        )}
      >
        <nav
          aria-label="현재 위치"
          className="flex min-w-0 items-center gap-2 text-sm text-[var(--text)] max-lg:hidden"
        >
          {back ? (
            <>
              <Link
                href={back}
                className="kit-focus shrink-0 rounded-[var(--radius-xs)] text-[var(--t3)] hover:text-[var(--text)]"
              >
                {label}
              </Link>
              <span aria-hidden className="text-[var(--t3)]">
                /
              </span>
              <span aria-current="page" className="min-w-0 truncate">
                {meta?.title}
              </span>
            </>
          ) : (
            <>
              {/* 아이콘은 프로젝트 목록 보드(01)에만 있다 (목표 · 태스크 · 메모 보드 09 · 10 · 11은 글자만) */}
              {NavIcon && nav?.href === "/projects" ? <NavIcon size={16} aria-hidden /> : null}
              {label}
            </>
          )}
        </nav>
        {back ? (
          <Button
            href={back}
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="뒤로"
            className="lg:hidden"
          >
            <ChevronLeft size={18} aria-hidden />
          </Button>
        ) : null}
        {back ? null : (
          <span className="inline-flex w-7 shrink-0 md:hidden">
            <Image
              src="/brand/dotder-logo.svg"
              alt=""
              width={26}
              height={22}
              unoptimized
              className="logo-light"
            />
            <Image
              src="/brand/dotder-logo-dark.svg"
              alt=""
              width={26}
              height={22}
              unoptimized
              className="logo-dark"
            />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col lg:hidden">
          <strong className="truncate text-lg leading-6 font-bold">{meta?.title ?? label}</strong>
          {meta?.subtitle ? (
            <span className="truncate text-xs text-[var(--t3)]">{meta.subtitle}</span>
          ) : null}
        </div>
        <div className="ml-auto flex shrink-0 items-center lg:gap-2">
          <div className={cn("flex", back && "max-lg:hidden")}>
            <ShellSearch />
          </div>
          <HeaderActionsSlot />
          {back ? null : (
            <Button
              variant="ghost"
              size="sm"
              iconOnly
              aria-label="메뉴"
              onClick={onOpenMenu}
              className="md:hidden"
            >
              <Menu size={18} aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
