"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import ProjectMarker from "@/components/kit/ProjectMarker";
import { SHELL_NAV_ITEMS, findNavItem } from "@/components/shell/navItems";
import ProjectSwitcher from "@/components/shell/ProjectSwitcher";
import { ChevronDown, PanelLeft, Settings } from "@/components/ui/icon";

import { getProjects } from "@/features/projects/api/projects";

import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@/lib/cn";
import { projectQueryKeys } from "@/lib/queryKeys";

type ShellSidebarProps = {
  /** 접힌 막대(64)로 그린다 (태블릿 · 웹에서 접었을 때) */
  isRail?: boolean;
  /** 접기 · 펴기 버튼 (웹). 모바일 시트에서는 닫기 */
  onToggle?: () => void;
  toggleLabel?: string;
  /** 메뉴를 누른 뒤 (모바일 시트 닫기) */
  onNavigate?: () => void;
  /** 모바일 ☰ 시트 안에서 시트 폭(300)을 채운다 */
  fill?: boolean;
};

function Logo({ size = 26 }: { size?: number }) {
  return (
    <span className="flex shrink-0 items-center">
      <Image
        src="/brand/dotder-logo.svg"
        alt=""
        width={size}
        height={Math.round(size * 0.85)}
        unoptimized
        className="logo-light"
      />
      <Image
        src="/brand/dotder-logo-dark.svg"
        alt=""
        width={size}
        height={Math.round(size * 0.85)}
        unoptimized
        className="logo-dark"
      />
    </span>
  );
}

/** 사람 동그라미 (보드 .av): 24 · 12 600 · --avatar-bg · --t2 */
export function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-[var(--avatar-bg)] text-xs font-semibold text-[var(--t2)]"
    >
      {name.slice(0, 1)}
    </span>
  );
}

/**
 * 사이드바 (보드 01 · T 01). 펼침 245: 로고 · 프로젝트 전환(44) · 메뉴(36) · 아래 설정(왼쪽).
 * 막대 64: 로고 · 아이콘 메뉴(sm 36) · 아래 설정. 사람(아바타 · 이름)은 로그인 전까지 숨긴다. 「이번 주 진행률」은 없다(6-2).
 */
export default function ShellSidebar({
  isRail = false,
  onToggle,
  toggleLabel,
  onNavigate,
  fill = false,
}: ShellSidebarProps) {
  const pathname = usePathname();
  const active = findNavItem(pathname);
  const switcherRef = useRef<HTMLButtonElement>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
  // 서버 그리기에는 프로젝트 데이터가 없어서, 브라우저에 붙은 뒤에만 메인을 보인다 (하이드레이션 차이 방지)
  const isClient = useIsClient();
  const main = isClient ? (projects.find((project) => project.isMain) ?? null) : null;

  if (isRail) {
    return (
      <nav
        aria-label="메인 메뉴"
        className="flex h-full w-16 flex-col items-center gap-1 border-r border-[var(--border)] bg-[var(--surface)] p-3"
      >
        <span className="mb-3 inline-flex">
          <Logo />
        </span>
        {onToggle ? (
          <Button
            variant="ghost"
            size="xs"
            iconOnly
            aria-label={toggleLabel}
            tip={toggleLabel}
            tipSide="right"
            onClick={onToggle}
            className="mb-2"
          >
            <PanelLeft size={16} aria-hidden />
          </Button>
        ) : null}
        {SHELL_NAV_ITEMS.map((item) => {
          const isOn = item === active;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isOn ? "page" : undefined}
              data-tip={item.label}
              data-tip-side="right"
              onClick={onNavigate}
              className={cn(
                "kit-focus inline-flex size-9 items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-120",
                isOn
                  ? "bg-[var(--nav-on-bg)] text-[var(--nav-on-fg)]"
                  : "text-[var(--t2)] hover:bg-[var(--s3)]",
              )}
            >
              <Icon size={18} aria-hidden />
            </Link>
          );
        })}
        {/* 아래는 설정만 (가짜 사용자 아바타 · 이름은 숨김 · PRD 숨긴 기능). 메뉴 아이콘과 같은 36 칸 */}
        <span className="mt-auto inline-flex size-9 items-center justify-center">
          <Button
            href="/settings"
            variant="ghost"
            size="xs"
            iconOnly
            aria-label="설정"
            tip="설정"
            tipSide="right"
          >
            <Settings size={16} aria-hidden />
          </Button>
        </span>
      </nav>
    );
  }

  return (
    <nav
      aria-label="메인 메뉴"
      className={cn(
        "flex h-full flex-col gap-0.5 border-r border-[var(--border)] bg-[var(--surface)] px-2.5 py-3",
        fill ? "w-full" : "w-61.25",
      )}
    >
      <div className="flex h-8 items-center gap-2 px-1.5">
        <Link
          href="/projects"
          onClick={onNavigate}
          className="kit-focus flex items-center gap-2 rounded-[var(--radius-xs)]"
        >
          <Logo />
          <span className="text-base font-bold tracking-logo text-[var(--text)]">dotder</span>
        </Link>
        {onToggle ? (
          <span className="ml-auto">
            <Button
              variant="ghost"
              size="xs"
              iconOnly
              aria-label={toggleLabel}
              tip={toggleLabel}
              onClick={onToggle}
            >
              <PanelLeft size={16} aria-hidden />
            </Button>
          </span>
        ) : null}
      </div>

      <button
        ref={switcherRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isSwitcherOpen}
        aria-label={`프로젝트 전환${main ? ` · ${main.name}` : ""}`}
        onClick={() => setIsSwitcherOpen((open) => !open)}
        className="kit-focus my-2 flex h-11 w-full cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2 text-left text-sm text-[var(--text)] hover:bg-[var(--s3)]"
      >
        {main ? <ProjectMarker color={main.color} /> : null}
        <span className="min-w-0 flex-1 truncate">{main ? main.name : "프로젝트 전환"}</span>
        <ChevronDown size={16} aria-hidden className="shrink-0 text-[var(--t3)]" />
      </button>
      <ProjectSwitcher
        isOpen={isSwitcherOpen}
        onClose={() => setIsSwitcherOpen(false)}
        anchorRef={switcherRef}
      />

      {SHELL_NAV_ITEMS.map((item) => {
        const isOn = item === active;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isOn ? "page" : undefined}
            onClick={onNavigate}
            className={cn(
              // 사이드바 메뉴 호버 --s2 · 0.12초 (DOC3 14)
              "kit-focus flex h-9 items-center gap-2.5 rounded-[var(--radius-sm)] px-3 text-sm transition-colors duration-120",
              isOn
                ? "bg-[var(--nav-on-bg)] text-[var(--nav-on-fg)]"
                : "text-[var(--text)] hover:bg-[var(--s2)]",
            )}
          >
            <Icon size={18} aria-hidden className="shrink-0" />
            {item.label}
          </Link>
        );
      })}

      {/* 아래는 설정만 · 왼쪽 정렬 (가짜 사용자 아바타 · 이름은 숨김 · PRD 숨긴 기능) */}
      <div className="mt-auto flex items-center gap-2 border-t border-[var(--border)] px-1.5 pt-2 text-sm text-[var(--text)]">
        <Button href="/settings" variant="ghost" size="xs" iconOnly aria-label="설정">
          <Settings size={16} aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
