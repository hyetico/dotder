"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AppIcon, Folder, Plus } from "@/components/ui/icon";
import SearchInput from "@/components/ui/input/SearchInput";

import ProjectMark from "@/features/projects/components/ProjectMark";

import { getProjectDetailPath, getNewProjectPath } from "@/lib/projectRoutes";
import {
  MAX_FAVORITES,
  getFavoriteProjectIds,
  getRecentProjectIds,
  recordRecentProjectId,
} from "@/lib/projectSwitcherPreferences";

import type { Project } from "@/features/projects/types/project";

type ProjectSwitcherPanelProps = {
  projects: Project[];
  /** 항목을 눌러 이동할 때. 팝오버 · 시트를 닫는다. */
  onNavigate: () => void;
};

const RECENT_LIMIT = 3;

const itemClassName =
  "text-body flex h-9 w-full min-w-0 items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 text-left text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)] focus-visible:outline-none max-md:h-11";
const sectionHeadingClassName =
  "text-caption px-2.5 pt-1.5 pb-1 font-semibold text-[var(--color-text-muted)]";

/**
 * 프로젝트 전환 팝오버 · 시트의 내용 (Layout Spec 07 「프로젝트 전환 320」).
 *
 * 검색칸 → 메인 · 즐겨찾기 n/3 · 최근 묶음 → 구분선 → 프로젝트 추가 · 모든 프로젝트 보기.
 * 검색하면 묶음 대신 이름이 맞는 프로젝트만 보인다.
 *
 * @example
 * <ProjectSwitcherPanel projects={projects} onNavigate={close} />
 */
export default function ProjectSwitcherPanel({ projects, onNavigate }: ProjectSwitcherPanelProps) {
  const [query, setQuery] = useState("");
  // 열릴 때 한 번 읽는다 (localStorage). 열려 있는 동안 바뀌지 않는다.
  const [favoriteIds] = useState(getFavoriteProjectIds);
  const [recentIds] = useState(getRecentProjectIds);

  const sections = useMemo(() => {
    const byId = new Map(projects.map((project) => [project.id, project]));
    const main = projects.filter((project) => project.isMain);
    const favorites = favoriteIds.flatMap((id) => {
      const project = byId.get(id);

      return project && !project.isMain ? [project] : [];
    });
    const shownIds = new Set([...main, ...favorites].map((project) => project.id));
    const recent = recentIds
      .flatMap((id) => {
        const project = byId.get(id);

        return project && !shownIds.has(project.id) ? [project] : [];
      })
      .slice(0, RECENT_LIMIT);

    return [
      { key: "main", title: "메인", items: main },
      {
        key: "favorites",
        title: `즐겨찾기 ${favorites.length}/${MAX_FAVORITES}`,
        items: favorites,
      },
      { key: "recent", title: "최근", items: recent },
    ];
  }, [favoriteIds, projects, recentIds]);

  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? projects.filter((project) => project.name.toLowerCase().includes(normalizedQuery))
    : null;

  const renderRow = (project: Project) => (
    <li key={project.id}>
      <Link
        href={getProjectDetailPath(project.id)}
        onClick={() => {
          recordRecentProjectId(project.id);
          onNavigate();
        }}
        className={itemClassName}
      >
        <ProjectMark color={project.color} isMain={project.isMain} />
        <span className="min-w-0 flex-1 truncate">{project.name}</span>
      </Link>
    </li>
  );

  return (
    <div className="flex min-h-0 flex-col">
      <div className="p-1">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="프로젝트 찾기"
          ariaLabel="프로젝트 찾기"
        />
      </div>

      <div className="max-h-85 min-h-0 overflow-y-auto overscroll-contain p-1">
        {results ? (
          results.length > 0 ? (
            <ul>{results.map(renderRow)}</ul>
          ) : (
            <p className="text-caption px-2.5 py-2.5 text-[var(--color-text-muted)]">
              찾는 프로젝트가 없어요
            </p>
          )
        ) : (
          sections.map((section) =>
            section.items.length > 0 ? (
              <section key={section.key}>
                <h3 className={sectionHeadingClassName}>{section.title}</h3>
                <ul>{section.items.map(renderRow)}</ul>
              </section>
            ) : null,
          )
        )}
      </div>

      <div className="mx-1 my-1 h-px bg-[var(--color-border)]" />

      <div className="p-1">
        <Link href={getNewProjectPath()} onClick={onNavigate} className={itemClassName}>
          <AppIcon icon={Plus} size="sm" className="text-[var(--color-text-muted)]" />
          <span className="min-w-0 flex-1 truncate">프로젝트 추가</span>
        </Link>
        <Link href="/projects" onClick={onNavigate} className={itemClassName}>
          <AppIcon icon={Folder} size="sm" className="text-[var(--color-text-muted)]" />
          <span className="min-w-0 flex-1 truncate">모든 프로젝트 보기</span>
        </Link>
      </div>
    </div>
  );
}
