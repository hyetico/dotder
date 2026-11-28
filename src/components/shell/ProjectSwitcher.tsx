"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type KeyboardEvent, type ReactNode, type RefObject } from "react";

import { useQuery } from "@tanstack/react-query";

import { useFavoriteProjectIds } from "@/components/shell/useFavoriteProjects";
import Button from "@/components/ui/Button";
import { Folder, Plus, Star } from "@/components/ui/icon";
import { MenuHeader, MenuSeparator } from "@/components/ui/Menu";
import Popover from "@/components/ui/Popover";
import ProjectMarker from "@/components/ui/ProjectMarker";
import SearchField from "@/components/ui/SearchField";

import { getProjects } from "@/features/projects/api/projects";

import { cn } from "@/lib/cn";
import { formatRelativeTime } from "@/lib/date";
import { getProjectDetailPath, getNewProjectPath } from "@/lib/projectRoutes";
import {
  MAX_FAVORITES,
  getRecentProjectEntries,
  toggleFavoriteProjectId,
} from "@/lib/projectSwitcherPreferences";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Project } from "@/features/projects/types/project";

type ProjectSwitcherProps = {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
};

// 보드 01-b .mi: 40 · 좌우 8 · 사이 8 · 호버 --s3
const rowBaseClassName =
  "flex min-h-10 w-full min-w-0 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-2 text-left text-sm text-[var(--text)] ring-[var(--primary)] ring-inset outline-none hover:bg-[var(--s3)] max-md:min-h-11";
// 줄 자체가 버튼 · 링크 (「새 프로젝트」 · 「모든 프로젝트 보기」). 초점 표시는 안쪽 테두리 + 면 (팝오버 가장자리에 잘리지 않게)
const rowClassName = `${rowBaseClassName} focus-visible:bg-[var(--s3)] focus-visible:ring-2`;
// 프로젝트 줄: 안의 이름 버튼이 초점을 받으면 줄 전체를 같은 모양으로
const projectRowClassName = `${rowBaseClassName} has-[>button:first-child:focus-visible]:bg-[var(--s3)] has-[>button:first-child:focus-visible]:ring-2`;

// 초점이 목록 줄에 있을 때 마우스를 올린 줄로 초점을 옮긴다 (강조는 늘 한 줄)
const followPointer = (target: HTMLElement | null) => {
  if (target && document.activeElement?.closest("[data-switcher-row]")) {
    target.focus();
  }
};

/**
 * 프로젝트 전환 팝오버 (보드 01-b · 01-c). 320 · 검색 → 메인 · 즐겨찾기 n/3 · 최근 →
 * 「새 프로젝트」 · 「모든 프로젝트 보기」. 검색하면 「검색 결과 N」과 맞는 글자를 굵게 보인다.
 * 줄 오른쪽 별로 즐겨찾기를 넣고 뺀다(3개까지). 모바일은 아래 시트.
 */
export default function ProjectSwitcher({ isOpen, onClose, anchorRef }: ProjectSwitcherProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const favoriteIds = useFavoriteProjectIds();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const byId = useMemo(() => new Map(projects.map((project) => [project.id, project])), [projects]);
  const keyword = query.trim().toLowerCase();

  // ↑ · ↓: 검색칸과 줄 사이를 옮긴다 (별 버튼에 있으면 그 줄에서 센다). Tab은 Popover가 맡는다
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = event.currentTarget;
    const active = document.activeElement;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      const items = [
        list.querySelector<HTMLElement>("input"),
        ...list.querySelectorAll<HTMLElement>("[data-switcher-row]"),
      ].filter((item): item is HTMLElement => item != null);
      const index = items.findIndex(
        (item) =>
          item === active || (item.parentElement !== list && item.parentElement?.contains(active)),
      );
      const step = event.key === "ArrowDown" ? 1 : -1;
      event.preventDefault();
      items[index < 0 ? 0 : Math.max(0, Math.min(items.length - 1, index + step))]?.focus();
    }
  };

  const go = (href: string) => {
    onClose();
    setQuery("");
    router.push(href);
  };

  const row = (project: Project, aside?: ReactNode, wrap = false) => {
    const isFavorite = favoriteIds.includes(project.id);
    const canFavorite = isFavorite || favoriteIds.length < MAX_FAVORITES;

    return (
      <div
        key={project.id}
        className={cn(projectRowClassName, "pr-1", wrap && "items-start py-2")}
        onMouseEnter={(event) =>
          followPointer(event.currentTarget.querySelector<HTMLElement>("[data-switcher-row]"))
        }
      >
        <button
          type="button"
          data-switcher-row
          onClick={() => go(getProjectDetailPath(project.id))}
          className={cn(
            "flex min-w-0 flex-1 cursor-pointer gap-2 text-left outline-none",
            wrap ? "items-start" : "items-center",
          )}
        >
          <span className={cn("flex shrink-0 items-center", wrap && "h-5")}>
            <ProjectMarker color={project.color} isMain={project.isMain} />
          </span>
          <span
            className={cn(
              "min-w-0 flex-1",
              wrap ? "[overflow-wrap:anywhere] break-keep" : "truncate",
            )}
          >
            {highlight(project.name, keyword)}
          </span>
          {aside ? <span className="shrink-0 text-xs text-[var(--t3)]">{aside}</span> : null}
        </button>
        <Button
          variant="ghost"
          size="xs"
          iconOnly
          disabled={!canFavorite}
          aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
          aria-pressed={isFavorite}
          onClick={() => toggleFavoriteProjectId(project.id)}
        >
          <Star
            size={16}
            aria-hidden
            className={isFavorite ? "fill-current text-[var(--star)]" : "text-[var(--t4)]"}
          />
        </Button>
      </div>
    );
  };

  const results = keyword
    ? projects.filter((project) => project.name.toLowerCase().includes(keyword))
    : [];
  const main = projects.find((project) => project.isMain);
  const favorites = favoriteIds
    .map((id) => byId.get(id))
    .filter((project): project is Project => Boolean(project));
  const recents = getRecentProjectEntries()
    .map((entry) => ({ entry, project: byId.get(entry.id) }))
    .filter((item): item is { entry: { id: number; openedAt: string }; project: Project } =>
      Boolean(item.project),
    )
    .filter((item) => !item.project.isMain && !favoriteIds.includes(item.project.id))
    .slice(0, 5);
  // 메인 · 즐겨찾기 · 최근이 모두 비면 최근 수정한 5개를 대신 보인다 (빈 팝오버 방지)
  const latest =
    !main && favorites.length === 0 && recents.length === 0
      ? [...projects]
          .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "") || b.id - a.id)
          .slice(0, 5)
      : [];

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      anchorRef={anchorRef}
      title="프로젝트 전환"
      width={320}
    >
      <div className="flex flex-col p-1" onKeyDown={handleKeyDown}>
        <div className="p-1">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="프로젝트 검색"
            ariaLabel="프로젝트 검색"
          />
        </div>
        {keyword ? (
          <>
            <MenuHeader>검색 결과 {results.length}</MenuHeader>
            {results.map((project) => row(project))}
          </>
        ) : (
          <>
            {/* 작은 빈 상태: 회색 한 줄, 아래 「새 프로젝트」는 그대로 */}
            {!isLoading && projects.length === 0 ? (
              <p className="px-2 py-2 text-xs text-[var(--t3)]">아직 프로젝트가 없어요</p>
            ) : null}
            {main ? (
              <>
                <MenuHeader>메인</MenuHeader>
                {row(main, undefined, true)}
              </>
            ) : null}
            {favorites.length > 0 ? (
              <>
                <MenuHeader>
                  즐겨찾기{" "}
                  <span className="font-normal">
                    {favorites.length}/{MAX_FAVORITES}
                  </span>
                </MenuHeader>
                {favorites.map((project) => row(project))}
              </>
            ) : null}
            {recents.length > 0 ? (
              <>
                <MenuHeader>최근</MenuHeader>
                {recents.map(({ entry, project }) =>
                  row(project, formatRelativeTime(entry.openedAt)),
                )}
              </>
            ) : null}
            {latest.length > 0 ? (
              <>
                <MenuHeader>최근 수정</MenuHeader>
                {latest.map((project) =>
                  row(
                    project,
                    project.updatedAt ? formatRelativeTime(project.updatedAt) : undefined,
                  ),
                )}
              </>
            ) : null}
          </>
        )}
        <MenuSeparator />
        <button
          type="button"
          data-switcher-row
          onClick={() => go(getNewProjectPath())}
          onMouseEnter={(event) => followPointer(event.currentTarget)}
          className={rowClassName}
        >
          <Plus size={16} aria-hidden className="shrink-0 text-[var(--t2)]" />
          <span className="flex-1">새 프로젝트</span>
        </button>
        <Link
          href="/projects"
          data-switcher-row
          onClick={onClose}
          onMouseEnter={(event) => followPointer(event.currentTarget)}
          className={rowClassName}
        >
          <Folder size={16} aria-hidden className="shrink-0 text-[var(--t2)]" />
          모든 프로젝트 보기
        </Link>
      </div>
    </Popover>
  );
}

// 검색어와 맞는 글자를 굵게 (보드 01-c)
function highlight(name: string, keyword: string) {
  const index = keyword ? name.toLowerCase().indexOf(keyword) : -1;

  if (index < 0) {
    return name;
  }

  return (
    <>
      {name.slice(0, index)}
      <b className="font-semibold">{name.slice(index, index + keyword.length)}</b>
      {name.slice(index + keyword.length)}
    </>
  );
}
