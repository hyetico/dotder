"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import {
  HeaderActionsSlot,
  headerIconButtonClassName,
} from "@/components/layout/Header/HeaderActions";
import HeaderSearchButton from "@/components/layout/Header/HeaderSearchButton";
import { AppIcon, ChevronLeft, Menu } from "@/components/ui/icon";

import { readGoalTitle } from "@/features/goals/api/goals";
import { getProjects, readProject, readProjectName } from "@/features/projects/api/projects";
import { useCurrentProjectScope } from "@/features/projects/hooks/useCurrentProjectScope";

import { getHeaderPageTrail, getPageNavFromPath, type HeaderPageTrail } from "@/lib/navConfig";
import { buildNavHref } from "@/lib/projectRoutes";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Project } from "@/features/projects/types/project";

type HeaderProps = {
  /*
   * AppLayout에서 관리하는
   * 모바일 Sidebar 상태
   */
  isMobileSidebarOpen: boolean;

  /*
   * 모바일 Sidebar
   * 열기 / 닫기 함수
   */
  onToggleMobileSidebar: () => void;
};

const currentCrumbTextClassName = "text-black";

const parentCrumbTextClassName = "text-[var(--color-text-secondary)] group-hover:text-black";

const crumbLinkClassName = `
  min-w-0
  truncate
  rounded-sm
  outline-none
  transition-colors

  focus-visible:ring-2
  focus-visible:ring-[var(--color-primary)]
`;

function getTrailLabel(item: HeaderPageTrail) {
  if (item.kind === "label") {
    return item.label;
  }

  if (item.kind === "project") {
    return readProjectName(item.projectId) ?? "프로젝트";
  }

  return readGoalTitle(item.goalId) ?? "목표";
}

/**
 * getMobileBackHref
 *
 * 하위 페이지일 때 한 단계 위 경로를 고릅니다.
 *
 * @param trail - 현재 위치의 경로 조각
 * @param sectionHref - 섹션 첫 페이지 경로
 * @returns 뒤로 갈 경로. 섹션 첫 페이지면 null
 */
function getMobileBackHref(trail: HeaderPageTrail[], sectionHref: string) {
  if (trail.length === 0) {
    return null;
  }

  for (let index = trail.length - 2; index >= 0; index -= 1) {
    const itemHref = trail[index]?.href;

    if (itemHref) {
      return itemHref;
    }
  }

  return sectionHref;
}

function isProjectTrailItem(
  item: HeaderPageTrail,
): item is Extract<HeaderPageTrail, { kind: "project" }> {
  return item.kind === "project";
}

function ProjectTitleText({
  project,
  active,
  withGoalLabel = false,
}: {
  project: Project;
  active: boolean;
  withGoalLabel?: boolean;
}) {
  const label = withGoalLabel ? `${project.name} 목표` : project.name;

  return (
    <span
      className={`flex min-w-0 items-baseline ${
        active ? currentCrumbTextClassName : parentCrumbTextClassName
      } `}
      title={label}
    >
      <span className="block max-w-[300px] min-w-0 truncate">{project.name}</span>
      {withGoalLabel ? <span className="shrink-0"> 목표</span> : null}
    </span>
  );
}

export default function Header({ isMobileSidebarOpen, onToggleMobileSidebar }: HeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const projectScope = useCurrentProjectScope();

  /*
   * 현재 pathname에 맞는
   * 페이지 위치와 이동 경로
   */
  const { title, href: pageHref, icon: PageIcon } = getPageNavFromPath(pathname);

  const href = buildNavHref(pageHref, projectScope, searchParams);

  const trail = getHeaderPageTrail(pathname);

  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  /*
   * 섹션 루트는 아이콘과 이름을 함께 보여 준다.
   * 프로젝트 안에서는 "프로젝트 / 현재 이름"만 보여 주고,
   * 이름은 300px에서 줄인다. 왕관과 상태 배지는 본문에 둔다.
   * 프로젝트 목표는 "프로젝트 제목 목표"를 한 글자로 보여 준다.
   * 그 다음 상세 목표가 바로 나오고, 목표는 다시 나누지 않는다.
   * 모바일에서는 앞 경로를 빼고, 뒤로 가기와 현재 페이지만 보여 준다.
   */
  const sectionIsCurrent = trail.length === 0;
  const hideGoalsSection = pageHref === "/goals" && trail.some(isProjectTrailItem);

  const resolveProject = (projectId: number) =>
    projects.find((project) => project.id === projectId) ?? readProject(projectId);

  const backHref = getMobileBackHref(trail, href);

  return (
    <header
      className="sticky top-0 z-30 flex h-[var(--header-height)] min-w-0 shrink-0 items-center justify-between gap-2 px-4"
    >
      {/*
       * =====================================================
       * Left Area
       * =====================================================
       */}
      <div className="flex min-w-0 flex-1 items-center">
        {/*
         * 모바일 왼쪽.
         * 하위 페이지는 뒤로 가기만 둔다.
         */}
        {backHref ? (
          <div className="flex shrink-0 items-center md:hidden">
            <Link
              href={backHref}
              aria-label="뒤로 가기"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl text-black transition-colors hover:bg-gray-100"
            >
              <AppIcon icon={ChevronLeft} size="lg" />
            </Link>
          </div>
        ) : null}

        <nav aria-label="현재 위치" className="max-w-full min-w-0 flex-1 overflow-hidden">
          <ol className="flex min-w-0 items-center gap-3 text-[16px] leading-5 font-medium md:text-sm">
            {hideGoalsSection ? null : (
              <li
                className={`min-w-0 shrink-0 items-center ${
                  sectionIsCurrent ? "flex" : "hidden md:flex"
                } `}
              >
                <Link
                  href={href}
                  aria-label={title}
                  aria-current={sectionIsCurrent ? "page" : undefined}
                  className={` ${crumbLinkClassName} group flex items-center gap-2`}
                >
                  <span className="hidden h-9 shrink-0 items-center justify-center md:flex">
                    <AppIcon
                      icon={PageIcon}
                      size="lg"
                      className={`shrink-0 ${
                        sectionIsCurrent
                          ? "text-black"
                          : "text-[var(--color-text-secondary)] group-hover:text-black"
                      } `}
                    />
                  </span>

                  {sectionIsCurrent ? (
                    <span className={`truncate ${currentCrumbTextClassName} `}>{title}</span>
                  ) : (
                    <span className={`hidden truncate md:inline ${parentCrumbTextClassName} `}>
                      {title}
                    </span>
                  )}
                </Link>
              </li>
            )}

            {trail.map((item, index) => {
              const isCurrent = index === trail.length - 1;
              const project = isProjectTrailItem(item) ? resolveProject(item.projectId) : undefined;
              const label = getTrailLabel(item);
              const withGoalLabel = isProjectTrailItem(item) && item.withGoalLabel === true;
              const crumb = project ? (
                <ProjectTitleText
                  project={project}
                  active={isCurrent}
                  withGoalLabel={withGoalLabel}
                />
              ) : (
                <span
                  className={`block max-w-[300px] min-w-0 truncate ${
                    isCurrent ? currentCrumbTextClassName : parentCrumbTextClassName
                  } `}
                  title={withGoalLabel ? `${label} 목표` : label}
                >
                  {withGoalLabel ? `${label} 목표` : label}
                </span>
              );

              return (
                <li
                  key={`${item.kind}-${index}`}
                  className={`min-w-0 items-center gap-3 ${isCurrent ? "flex" : "hidden md:flex"} `}
                >
                  {hideGoalsSection && index === 0 ? null : (
                    <span
                      aria-hidden="true"
                      className="hidden shrink-0 text-[var(--color-text-muted)] md:inline"
                    >
                      /
                    </span>
                  )}

                  {isCurrent || !item.href ? (
                    <span aria-current={isCurrent ? "page" : undefined} className="min-w-0">
                      {crumb}
                    </span>
                  ) : (
                    <Link href={item.href} className={` ${crumbLinkClassName} group min-w-0`}>
                      {crumb}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/*
       * 오른쪽 버튼.
       * 데스크톱은 헤더 끝에 고정한다.
       * 모바일 A안은 페이지 버튼을 전체 메뉴와 분리해 메뉴 왼쪽에 둔다.
       */}
      <div className="flex shrink-0 items-center gap-2">
        <HeaderSearchButton />
        <HeaderActionsSlot />

        {/*
         * 모바일 전용 메뉴 버튼.
         * 닫혀 있으면 흰 배경과 테두리, 열리면 기본 색으로 바뀐다.
         */}
        <div className="md:hidden">
          <button
            type="button"
            aria-label={isMobileSidebarOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={isMobileSidebarOpen}
            onClick={onToggleMobileSidebar}
            className={headerIconButtonClassName(isMobileSidebarOpen)}
          >
            <AppIcon icon={Menu} size="md" />
          </button>
        </div>
      </div>
    </header>
  );
}
