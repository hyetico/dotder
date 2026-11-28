"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { HeaderActions } from "@/components/shell/HeaderActions";
import { usePageMeta } from "@/components/shell/PageMeta";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { Archive, Folder, Plus, Search } from "@/components/ui/icon";
import PageTitle from "@/components/ui/PageTitle";
import Tabs from "@/components/ui/Tabs";

import { getProjectActivity, getProjectListItems } from "@/features/projects/api/projects";
import ArchiveModal, { useArchivedProjects } from "@/features/projects/list/ArchiveModal";
import FavoritesPanel from "@/features/projects/list/FavoritesPanel";
import ProjectCard from "@/features/projects/list/ProjectCard";
import ProjectCardGrid from "@/features/projects/list/ProjectCardGrid";
import ProjectCreateRoute from "@/features/projects/list/ProjectCreateDrawer";
import {
  getProjectCounts,
  selectProjects,
  type ProjectListQuery,
} from "@/features/projects/list/projectListModel";
import ProjectListRow from "@/features/projects/list/ProjectListRow";
import ProjectToolbar, { type ProjectViewMode } from "@/features/projects/list/ProjectToolbar";

import { getNewProjectPath } from "@/lib/projectRoutes";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { ActivityDay } from "@/features/projects/utils/activityMosaic";

export type ProjectListScope = "all" | "main" | "favorites";

const NO_ACTIVITY: ActivityDay[] = [];
// 처음에 그리는 카드 수 · [더 보기] 한 번에 더하는 수 (보드 01-m)
const PAGE_SIZE = 24;
const DEFAULT_QUERY: ProjectListQuery = {
  status: "all",
  lateOnly: false,
  keyword: "",
  sort: "updated",
  tags: [],
};
const NO_ACTIVITY_MAP: Record<number, ActivityDay[]> = {};

// 맞춤 탭(01-k)은 데이터가 없어 숨긴다 (tech-debt R-4). 탭 숫자는 넣지 않는다 (6-3).
const SCOPE_TABS = [
  { key: "all", label: "전체", href: "/projects" },
  { key: "main", label: "메인 프로젝트", href: "/projects/main" },
  { key: "favorites", label: "즐겨찾기", href: "/projects/favorites" },
];

/**
 * 프로젝트 목록 (REBUILD 3-2 · 보드 01 · 01-j · 02 ~ 02-d · 01-h · T · M 01).
 * 웹: 본문 최대 1280 · 32/40/64, 제목 24/32 700 + 「N개 중 N개 진행 중 · N개 마감 지남」, 오른쪽 「보관함 N」,
 * 탭 → 도구 줄 → 카드(1280 이상 3열 · 768–1279 2열 · 767 이하 1열, 사이 24) 또는 목록.
 * 태블릿 · 모바일은 제목을 헤더로 올린다(`usePageMeta`).
 */
export default function ProjectListScreen({ scope }: { scope: ProjectListScope }) {
  const router = useRouter();
  const [query, setQuery] = useState<ProjectListQuery>(DEFAULT_QUERY);
  const [view, setView] = useState<ProjectViewMode>("card");
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);
  // [더 보기]를 누른 뒤 초점을 줄 새 첫 줄의 순번
  const focusIndexRef = useRef<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { data: projects = [], isLoading } = useQuery({
    queryKey: [...projectQueryKeys.all, "list"],
    queryFn: getProjectListItems,
  });
  const { data: activity = NO_ACTIVITY_MAP } = useQuery({
    queryKey: projectQueryKeys.activity,
    queryFn: getProjectActivity,
  });
  const { data: archived = [] } = useArchivedProjects();

  // 프로젝트가 0개면 거를 것이 없다: 도구 줄 · 탭을 못 누르게 하고 조건은 기본값으로 (첫 프로젝트가 가려지지 않게)
  const isEmpty = !isLoading && projects.length === 0;
  if (isEmpty && (query !== DEFAULT_QUERY || view !== "card")) {
    setQuery(DEFAULT_QUERY);
    setView("card");
  }

  const counts = useMemo(() => getProjectCounts(projects), [projects]);
  const scoped = scope === "main" ? projects.filter((project) => project.isMain) : projects;
  const visible = useMemo(() => selectProjects(scoped, query), [scoped, query]);
  // 탭 · 필터 · 정렬 · 검색이 바뀌면 다시 24개부터
  const listKey = `${scope}|${JSON.stringify(query)}`;
  const [shownKey, setShownKey] = useState(listKey);
  if (shownKey !== listKey) {
    setShownKey(listKey);
    setLimit(PAGE_SIZE);
  }
  const shown = visible.slice(0, limit);
  const showMore = () => {
    focusIndexRef.current = shown.length;
    setLimit((current) => current + PAGE_SIZE);
  };

  useEffect(() => {
    const index = focusIndexRef.current;
    if (index == null) {
      return;
    }
    focusIndexRef.current = null;
    const row = listRef.current?.querySelectorAll<HTMLElement>("[data-list-row]")[index];
    row?.querySelector<HTMLElement>("a, button")?.focus();
  }, [limit]);
  const allTags = useMemo(
    () => [...new Set(projects.flatMap((project) => project.tags))],
    [projects],
  );
  const subtitle = `${counts.all}개 중 ${counts.IN_PROGRESS}개 진행 중`;

  usePageMeta("프로젝트", subtitle);

  return (
    // 루트 배경은 목표 · 메모 화면과 같은 --bg (11.26)
    <div className="min-h-full bg-[var(--bg)]">
      <div className="mx-auto w-full max-w-320 px-4 pt-6 pb-8 md:px-6 md:pt-8 lg:px-10 lg:pt-10 lg:pb-16">
        <HeaderActions>
          <Button href={getNewProjectPath()} variant="primary" size="sm" className="max-lg:hidden">
            <Plus size={16} aria-hidden />
            추가
          </Button>
          <Button
            href={getNewProjectPath()}
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="새로 만들기"
            className="lg:hidden"
          >
            <Plus size={18} aria-hidden />
          </Button>
        </HeaderActions>

        <PageTitle
          className="max-lg:hidden"
          summary={
            <>
              {subtitle}
              {counts.late > 0 ? (
                <>
                  {" · "}
                  <span className="text-[var(--bad)]">{counts.late}개 마감 지남</span>
                </>
              ) : null}
            </>
          }
          aside={
            archived.length > 0 ? (
              <Button variant="ghost" size="sm" onClick={() => setIsArchiveOpen(true)}>
                <Archive size={16} aria-hidden />
                보관함 {archived.length}
              </Button>
            ) : undefined
          }
        >
          프로젝트
        </PageTitle>

        <Tabs
          className="lg:mt-6"
          label="프로젝트 탭"
          value={isEmpty ? "all" : scope}
          items={SCOPE_TABS}
          disabled={isEmpty}
        />

        <div className="mt-3 lg:mt-6">
          {scope === "favorites" ? (
            <FavoritesPanel
              projects={projects}
              activity={activity}
              onShowAll={() => router.push("/projects")}
            />
          ) : (
            <div ref={listRef} className="flex flex-col gap-6">
              <ProjectToolbar
                query={query}
                onChange={(next) => setQuery((current) => ({ ...current, ...next }))}
                counts={counts}
                view={view}
                onViewChange={setView}
                allTags={allTags}
                resultCount={visible.length}
                disabled={isEmpty}
              />
              {!isLoading && projects.length === 0 ? (
                <EmptyState
                  icon={<Folder size={24} />}
                  title="아직 프로젝트가 없어요"
                  text="프로젝트를 추가하면 메인 프로젝트로 정할 수 있어요."
                  actions={
                    <Button href={getNewProjectPath()} variant="primary">
                      <Plus size={16} aria-hidden />
                      프로젝트 추가
                    </Button>
                  }
                />
              ) : !isLoading && visible.length === 0 ? (
                <EmptyState
                  icon={<Search size={24} />}
                  title="조건에 맞는 프로젝트가 없어요"
                  text="필터를 바꾸거나 새 프로젝트를 추가해 보세요."
                />
              ) : view === "card" ? (
                <ProjectCardGrid>
                  {shown.map((project, index) => (
                    <li
                      key={project.id}
                      className="min-w-0"
                      data-list-row
                      data-tour={index === 0 ? "project-card" : undefined}
                    >
                      <ProjectCard
                        project={project}
                        activity={activity[project.id] ?? NO_ACTIVITY}
                      />
                    </li>
                  ))}
                </ProjectCardGrid>
              ) : (
                <ul className="flex flex-col gap-2">
                  {shown.map((project) => (
                    <ProjectListRow key={project.id} project={project} />
                  ))}
                </ul>
              )}
              {/* 더 보기 (보드 01-m): 목록 아래 40 · 「N개 중 M개」 12 --t3 · 보조 버튼 웹 · 태블릿 최소 200 · 모바일 가득 찬 폭 48 */}
              {shown.length < visible.length ? (
                <div className="mt-4 flex flex-col items-center gap-3">
                  <span className="text-xs text-[var(--t3)] tabular-nums">
                    {visible.length}개 중 {shown.length}개
                  </span>
                  <Button className="min-w-50 max-md:hidden" onClick={showMore}>
                    더 보기
                  </Button>
                  <Button size="lg" className="w-full md:hidden" onClick={showMore}>
                    더 보기
                  </Button>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <ArchiveModal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
        <ProjectCreateRoute />
      </div>
    </div>
  );
}
