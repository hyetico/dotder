"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import SidebarDrawer from "@/components/layout/Sidebar/drawers/SidebarDrawer/SidebarDrawer";
import ProjectAccent from "@/features/projects/components/ProjectAccent";
import CrownBadge from "@/components/ui/badge/CrownBadge";
import IconButton from "@/components/ui/button/IconButton";
import ProjectSettingsIcon from "@/features/projects/components/ProjectSettingsIcon";

import { getProjects, readMainProjectId, readProject } from "@/features/projects/api/projects";
import { useCurrentProjectScope } from "@/features/projects/hooks/useCurrentProjectScope";
import { projectQueryKeys } from "@/lib/queryKeys";
import {
  buildScopeChangeHref,
  getContextualMainProjectPath,
  type ProjectScope,
} from "@/lib/projectRoutes";

type SidebarMainProjectProps = {
  isCollapsed: boolean;
  initialDrawerOpen?: boolean;
  onNavigate?: () => void;
  onDrawerOpenChange?: (open: boolean) => void;
};

type SidebarHoverLabelProps = {
  children: ReactNode;
  group?: "group" | "settings";
};

/**
 * SidebarHoverLabel
 *
 * 접힌 사이드바에서 항목 옆에 뜨는 이름 라벨입니다.
 *
 * @param props - SidebarHoverLabel 컴포넌트 Props
 * @param props.children - 라벨에 표시할 내용
 * @param props.group - 호버를 감지할 그룹 이름
 */
function SidebarHoverLabel({ children, group = "group" }: SidebarHoverLabelProps) {
  return (
    <span
      className={`pointer-events-none absolute top-1/2 left-[calc(100%+20px)] z-50 hidden h-9 -translate-y-1/2 items-center rounded-xl bg-[var(--color-nav-hover)]/50 px-3 text-sm font-medium whitespace-nowrap text-black shadow-[var(--shadow-dropdown)] backdrop-blur-sm ${
        group === "settings" ? "group-hover/settings:flex" : "group-hover:flex"
      } `}
    >
      {children}
    </span>
  );
}

type CollapsedSettingsButtonProps = {
  label: string;
  boxed?: boolean;
  onClick: () => void;
};

/**
 * CollapsedSettingsButton
 *
 * 접힌 사이드바에서 프로젝트 설정을 여는 버튼입니다.
 *
 * @param props - CollapsedSettingsButton 컴포넌트 Props
 * @param props.label - 버튼과 호버 라벨에 쓸 이름
 * @param props.boxed - 흰 카드 배경과 그림자를 둘지 여부
 * @param props.onClick - 프로젝트 설정을 열 때 실행되는 함수
 */
function CollapsedSettingsButton({ label, boxed = false, onClick }: CollapsedSettingsButtonProps) {
  return (
    <span className="group/settings relative">
      <IconButton
        label={label}
        onClick={onClick}
        className={`size-9! shrink-0 rounded-xl! text-black hover:bg-gray-100 hover:text-black ${
          boxed ? `bg-white shadow-[var(--shadow-card)]` : ""
        } `}
      >
        <ProjectSettingsIcon />
      </IconButton>
      <SidebarHoverLabel group="settings">{label}</SidebarHoverLabel>
    </span>
  );
}

export default function SidebarMainProject({
  isCollapsed,
  initialDrawerOpen = false,
  onNavigate,
  onDrawerOpenChange,
}: SidebarMainProjectProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedProjectScope = useCurrentProjectScope();
  const [isDrawerOpen, setIsDrawerOpen] = useState(initialDrawerOpen);

  const { data: projects = [], isPending } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const handleProjectChange = (nextScope: ProjectScope) => {
    const href = buildScopeChangeHref(pathname, searchParams, nextScope);

    if (!href) {
      return;
    }

    router.push(href);
  };

  const openSettings = () => {
    onNavigate?.();
    onDrawerOpenChange?.(true);
    setIsDrawerOpen(true);
  };

  const closeSettings = () => {
    onDrawerOpenChange?.(false);
    setIsDrawerOpen(false);
  };

  const pendingMainProjectId = isPending ? readMainProjectId() : null;

  const mainProject =
    projects.find((project) => project.isMain) ??
    (pendingMainProjectId == null ? null : (readProject(pendingMainProjectId) ?? null));

  const mainProjectHref = mainProject
    ? getContextualMainProjectPath(pathname, mainProject.id, searchParams)
    : null;

  const href = mainProjectHref ?? "/projects";

  const drawer = (
    <SidebarDrawer
      isOpen={isDrawerOpen}
      onClose={closeSettings}
      projects={projects}
      selectedProjectScope={selectedProjectScope}
      onProjectChange={handleProjectChange}
    />
  );

  let content: ReactNode;

  if (!mainProject) {
    content = isCollapsed ? (
      <div className="flex justify-center">
        <CollapsedSettingsButton label="메인 프로젝트 설정" boxed onClick={openSettings} />
      </div>
    ) : (
      <button
        type="button"
        onClick={openSettings}
        className="flex h-10 w-full min-w-0 cursor-pointer items-center justify-center gap-0 rounded-xl border border-[var(--color-border)] bg-white px-2 font-medium tracking-tight text-[var(--color-text)] shadow-[var(--shadow-card)] transition-colors hover:bg-[var(--color-nav-hover)]"
      >
        <span className="flex max-w-full min-w-0 items-center">
          <span className="flex size-[34px] shrink-0 items-center justify-center">
            <ProjectSettingsIcon />
          </span>

          <span className="min-w-0 truncate text-[14px] leading-5">메인 프로젝트 설정</span>

          <span aria-hidden="true" className="size-[34px] shrink-0" />
        </span>
      </button>
    );
  } else if (isCollapsed) {
    content = (
      <div className="mx-auto flex w-9 flex-col items-center gap-1 rounded-xl bg-white shadow-[var(--shadow-card)]">
        <Link
          href={href}
          onClick={onNavigate}
          aria-label={`메인 프로젝트 ${mainProject.name}`}
          title={mainProject.name}
          className="group relative flex size-9 items-center justify-center rounded-xl hover:bg-[var(--color-nav-hover)]"
        >
          <ProjectAccent color={mainProject.color}>
            <CrownBadge label="메인 프로젝트" />
          </ProjectAccent>
          <SidebarHoverLabel>{mainProject.name}</SidebarHoverLabel>
        </Link>

        <CollapsedSettingsButton label="내 프로젝트" onClick={openSettings} />
      </div>
    );
  } else {
    content = (
      <div className="relative flex h-10 min-w-0 items-center rounded-xl bg-white pr-0.5 pl-[11px] shadow-[var(--shadow-card)]">
        <Link
          href={href}
          onClick={onNavigate}
          aria-label={`메인 프로젝트 ${mainProject.name}`}
          className="group/main flex h-full min-w-0 flex-1 items-center gap-2 rounded-lg"
        >
          <ProjectAccent color={mainProject.color}>
            <CrownBadge label="메인 프로젝트" />
          </ProjectAccent>

          <span className="min-w-0 truncate text-sm font-medium tracking-tight text-[var(--color-text)] underline-offset-4 transition-colors group-hover/main:underline">
            {mainProject.name}
          </span>
        </Link>

        <button
          type="button"
          aria-label="내 프로젝트"
          onClick={openSettings}
          className="flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-xl text-black transition-colors hover:bg-gray-100 hover:text-black"
        >
          <ProjectSettingsIcon />
        </button>
      </div>
    );
  }

  return (
    <>
      {content}
      {drawer}
    </>
  );
}
