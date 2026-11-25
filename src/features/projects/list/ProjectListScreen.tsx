"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import EmptyState from "@/components/kit/EmptyState";
import Tabs from "@/components/kit/Tabs";
import { HeaderActions } from "@/components/layout/Header/HeaderActions";
import { usePageMeta } from "@/components/shell/PageMeta";
import { Archive, Plus, Search } from "@/components/ui/icon";

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
const NO_ACTIVITY_MAP: Record<number, ActivityDay[]> = {};

// 맞춤 탭(01-k)은 데이터가 없어 숨긴다 (tech-debt R-4). 탭 숫자는 넣지 않는다 (6-3).
const SCOPE_TABS = [
  { key: "all", label: "전체", href: "/projects" },
  { key: "main", label: "메인", href: "/projects/main" },
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
  const [query, setQuery] = useState<ProjectListQuery>({
    status: "all",
    lateOnly: false,
    keyword: "",
    sort: "updated",
    tags: [],
  });
  const [view, setView] = useState<ProjectViewMode>("card");
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const { data: projects = [], isLoading } = useQuery({
    queryKey: [...projectQueryKeys.all, "list"],
    queryFn: getProjectListItems,
  });
  const { data: activity = NO_ACTIVITY_MAP } = useQuery({
    queryKey: projectQueryKeys.activity,
    queryFn: getProjectActivity,
  });
  const { data: archived = [] } = useArchivedProjects();

  const counts = useMemo(() => getProjectCounts(projects), [projects]);
  const scoped = scope === "main" ? projects.filter((project) => project.isMain) : projects;
  const visible = useMemo(() => selectProjects(scoped, query), [scoped, query]);
  const allTags = useMemo(
    () => [...new Set(projects.flatMap((project) => project.tags))],
    [projects],
  );
  const subtitle = `${counts.all}개 중 ${counts.IN_PROGRESS}개 진행 중`;

  usePageMeta("프로젝트", subtitle);

  return (
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

      <header className="flex items-end gap-4 max-lg:hidden">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h1 className="text-2xl font-bold">프로젝트</h1>
          <p className="text-sm text-[var(--t2)]">
            {subtitle}
            {counts.late > 0 ? (
              <>
                {" · "}
                <span className="text-[var(--bad)]">{counts.late}개 마감 지남</span>
              </>
            ) : null}
          </p>
        </div>
        {archived.length > 0 ? (
          <Button variant="ghost" size="sm" onClick={() => setIsArchiveOpen(true)}>
            <Archive size={16} aria-hidden />
            보관함 {archived.length}
          </Button>
        ) : null}
      </header>

      <Tabs className="lg:mt-6" label="프로젝트 탭" value={scope} items={SCOPE_TABS} />

      <div className="mt-3 lg:mt-6">
        {scope === "favorites" ? (
          <FavoritesPanel
            projects={projects}
            activity={activity}
            onShowAll={() => router.push("/projects")}
          />
        ) : (
          <div className="flex flex-col gap-6">
            <ProjectToolbar
              query={query}
              onChange={(next) => setQuery((current) => ({ ...current, ...next }))}
              counts={counts}
              view={view}
              onViewChange={setView}
              allTags={allTags}
              resultCount={visible.length}
            />
            {!isLoading && visible.length === 0 ? (
              <EmptyState
                icon={<Search size={24} />}
                title="조건에 맞는 프로젝트가 없어요"
                text="필터를 바꾸거나 새 프로젝트를 추가해 보세요."
              />
            ) : view === "card" ? (
              <ProjectCardGrid>
                {visible.map((project) => (
                  <li key={project.id} className="min-w-0">
                    <ProjectCard project={project} activity={activity[project.id] ?? NO_ACTIVITY} />
                  </li>
                ))}
              </ProjectCardGrid>
            ) : (
              <ul className="flex flex-col gap-2">
                {visible.map((project) => (
                  <ProjectListRow key={project.id} project={project} />
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <ArchiveModal isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
      <ProjectCreateRoute />
    </div>
  );
}
