"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useLayoutEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import Badge from "@/components/kit/Badge";
import Button from "@/components/kit/Button";
import { DeleteConfirmDialog } from "@/components/kit/ConfirmDialog";
import Tabs from "@/components/kit/Tabs";
import { HeaderActions } from "@/components/layout/Header/HeaderActions";
import { usePageMeta } from "@/components/shell/PageMeta";
import { useFavoriteProjectIds } from "@/components/shell/useFavoriteProjects";
import {
  Calendar,
  Crown,
  History,
  Inbox,
  LayoutGrid,
  ListChecks,
  Pencil,
  Star,
  Target,
} from "@/components/ui/icon";

import { getGoals } from "@/features/goals/api/goals";
import { getMemos } from "@/features/memos/api/memos";
import { getProjectDeadlineChangeList, getProjectListItem } from "@/features/projects/api/projects";
import ProjectDeadlineDrawer from "@/features/projects/detail/ProjectDeadlineDrawer";
import ProjectDetailMenu from "@/features/projects/detail/ProjectDetailMenu";
import ProjectEditDrawer from "@/features/projects/detail/ProjectEditDrawer";
import ProjectGoalsTab from "@/features/projects/detail/ProjectGoalsTab";
import ProjectHistoryTab from "@/features/projects/detail/ProjectHistoryTab";
import ProjectMemosTab from "@/features/projects/detail/ProjectMemosTab";
import ProjectOverview from "@/features/projects/detail/ProjectOverview";
import { formatMonthDot } from "@/features/projects/detail/projectOverviewModel";
import ProjectTasksTab from "@/features/projects/detail/ProjectTasksTab";
import { PROJECT_STATUS_TONE, getLateDays } from "@/features/projects/list/ProjectCard";
import { useProjectActions } from "@/features/projects/list/useProjectActions";
import { getProjectStatusLabel } from "@/features/projects/utils/projectUtils";
import { getTasks } from "@/features/tasks/api/tasks";

import { useIsClient } from "@/hooks/useIsClient";
import { cn } from "@/lib/cn";
import { formatDate, toDateKey } from "@/lib/date";
import { projectColorVar } from "@/lib/projectPalette";
import { getProjectDetailPath } from "@/lib/projectRoutes";
import { goalQueryKeys, memoQueryKeys, projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

export type ProjectDetailTab = "overview" | "goals" | "tasks" | "memos" | "history";

const DETAIL_TABS: ProjectDetailTab[] = ["overview", "goals", "tasks", "memos", "history"];

/**
 * 프로젝트 상세 (REBUILD 3-3 · 보드 03 ~ 08 · T · M 03).
 * 웹: 본문 최대 1280 · 40/40/64 · 사이 24 (목록과 같은 틀 · 보드 03). 머리(색 점 · 메인 · 상태 · 지연 배지 → 이름 24/32 → 설명 + 더보기 →
 * 기간 · 최종 수정 · 태그) → 탭(아이콘 · 숫자) → 탭 내용. 헤더: 위치 「프로젝트 / 이름」 · 검색 · ☆ · [수정] · ⋯.
 * 태블릿 · 모바일: 헤더에 ← · 이름 · ☆ · ⋯, 본문은 배지 → 기간 · 태그 한 줄 → 탭 → 내용 (사이 12).
 * 탭은 주소 `?tab=`으로 고른다(프로토타입과 같음).
 */
export default function ProjectDetailScreen({ projectId }: { projectId: number }) {
  return (
    // 본문 바탕은 보드대로 --bg (옛 화면의 .page-content 회색을 덮는다)
    <div className="min-h-full bg-[var(--bg)]">
      <Suspense fallback={null}>
        <DetailBody projectId={projectId} />
      </Suspense>
    </div>
  );
}

function DetailBody({ projectId }: { projectId: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isClient = useIsClient();
  const rawTab = searchParams.get("tab") as ProjectDetailTab | null;
  const tab: ProjectDetailTab = rawTab && DETAIL_TABS.includes(rawTab) ? rawTab : "overview";
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);
  const actions = useProjectActions();
  const favoriteIds = useFavoriteProjectIds();

  const { data: project, isLoading } = useQuery({
    queryKey: projectQueryKeys.detail(projectId),
    queryFn: () => getProjectListItem(projectId),
  });
  const { data: goals = [] } = useQuery({
    queryKey: goalQueryKeys.list(projectId),
    queryFn: () => getGoals(projectId),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: taskQueryKeys.list(projectId),
    queryFn: () => getTasks(projectId),
  });
  const { data: memos = [] } = useQuery({ queryKey: memoQueryKeys.all, queryFn: getMemos });
  const { data: deadlineChanges = [] } = useQuery({
    queryKey: projectQueryKeys.deadlineChanges(projectId),
    queryFn: () => getProjectDeadlineChangeList(projectId),
  });

  usePageMeta(project?.name ?? "", undefined, "/projects");

  if (isLoading) {
    return null;
  }

  if (!project) {
    return (
      <p className="px-4 py-12 text-center text-sm text-[var(--t3)]">
        프로젝트를 찾을 수 없습니다.
      </p>
    );
  }

  const today = toDateKey(new Date());
  const lateDays = getLateDays(project);
  const isFavorite = isClient && favoriteIds.includes(project.id);
  const tabHref = (key: ProjectDetailTab) =>
    key === "overview" ? pathname : `${pathname}?tab=${key}`;
  const counts: Partial<Record<ProjectDetailTab, number>> = {
    goals: goals.length,
    tasks: tasks.length,
    memos: memos.filter((memo) => memo.projectId === project.id).length,
  };
  const tabs = [
    { key: "overview", label: "개요", icon: <LayoutGrid /> },
    { key: "goals", label: "목표", icon: <Target /> },
    { key: "tasks", label: "태스크", icon: <ListChecks /> },
    { key: "memos", label: "메모", icon: <Inbox /> },
    { key: "history", label: "기록", icon: <History /> },
  ].map((item) => ({
    ...item,
    href: tabHref(item.key as ProjectDetailTab),
    count: counts[item.key as ProjectDetailTab],
  }));

  const toggleFavorite = () => actions.toggleFavorite(project);
  const menuProps = {
    project,
    isFavorite,
    onEdit: () => setIsEditOpen(true),
    onToggleMain: () => void actions.toggleMain(project),
    onToggleFavorite: toggleFavorite,
    onDuplicate: () =>
      void actions.duplicate(project, (copy) => router.push(getProjectDetailPath(copy.id))),
    onChangeDeadline: () => setIsDeadlineOpen(true),
    onArchive: () => {
      void actions.archive(project);
      router.replace("/projects");
    },
    onDelete: () => setIsDeleteOpen(true),
  };
  const remove = () => {
    void actions.remove(project);
    router.replace("/projects");
  };
  const starIcon = (
    <Star
      size={16}
      aria-hidden
      className={cn(isFavorite && "fill-[var(--star)] text-[var(--star)]")}
    />
  );

  return (
    <div className="mx-auto flex w-full max-w-320 flex-col gap-3 px-4 pt-6 pb-8 md:px-6 md:pt-8 lg:gap-6 lg:px-10 lg:pt-10 lg:pb-16">
      <HeaderActions>
        <div className="flex items-center gap-2 max-lg:hidden">
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            aria-label="즐겨찾기"
            aria-pressed={isFavorite}
            onClick={toggleFavorite}
          >
            {starIcon}
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsEditOpen(true)}>
            <Pencil size={16} aria-hidden />
            수정
          </Button>
          <ProjectDetailMenu {...menuProps} variant="secondary" />
        </div>
        <div className="flex items-center lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="즐겨찾기"
            aria-pressed={isFavorite}
            onClick={toggleFavorite}
          >
            {starIcon}
          </Button>
          <ProjectDetailMenu {...menuProps} variant="ghost" showEdit />
        </div>
      </HeaderActions>

      {/* 웹 머리 (보드 03): 사이 8 */}
      <header className="flex flex-col gap-2 max-lg:hidden">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-full"
            style={{ background: projectColorVar(project.color) }}
          />
          {project.isMain ? (
            <Badge>
              <Crown size={12} aria-hidden />
              메인 프로젝트
            </Badge>
          ) : null}
          <Badge tone={PROJECT_STATUS_TONE[project.status]} dot>
            {getProjectStatusLabel(project.status)}
          </Badge>
          {lateDays != null ? <Badge tone="bad">{lateDays}일 지연</Badge> : null}
        </div>
        <h1 className="text-2xl font-bold [overflow-wrap:anywhere]">{project.name}</h1>
        {project.description ? <ProjectDescription text={project.description} /> : null}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--t3)]">
          {project.startDate || project.endDate ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={14} aria-hidden />
              {formatDate(project.startDate)} ~ {formatDate(project.endDate)}
            </span>
          ) : null}
          {project.updatedAt ? (
            <span>최종 수정 {formatDate(project.updatedAt.slice(0, 10))}</span>
          ) : null}
          {project.tags.length > 0 ? (
            <span className="flex flex-wrap items-center gap-1">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex h-6 items-center rounded-full border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--t2)]"
                >
                  {tag}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </header>

      {/* 태블릿 · 모바일 머리 (보드 T · M 03): 이름은 헤더에 */}
      <h1 className="sr-only lg:hidden">{project.name}</h1>
      {/* 다른 탭에서는 배지 · 기간 줄 없이 탭부터 (보드 T · M 04) */}
      <div className={cn("flex flex-col gap-3 lg:hidden", tab !== "overview" && "hidden")}>
        <div className="flex items-center gap-1.5">
          <Badge tone={PROJECT_STATUS_TONE[project.status]} dot>
            {getProjectStatusLabel(project.status)}
          </Badge>
          {lateDays != null ? <Badge tone="bad">{lateDays}일 지연</Badge> : null}
        </div>
        <span className="text-xs text-[var(--t3)]">
          {[
            project.startDate || project.endDate
              ? `${formatDate(project.startDate)} ~ ${formatMonthDot(project.endDate)}`
              : null,
            ...project.tags,
          ]
            .filter(Boolean)
            .join(" · ")}
        </span>
      </div>

      <Tabs
        label="프로젝트 보기"
        value={tab}
        items={tabs}
        hideIconsBelowLg
        className="max-lg:-mx-4 max-lg:gap-5 max-lg:px-4"
      />

      {tab === "overview" ? (
        <ProjectOverview
          project={project}
          goals={goals}
          tasks={tasks}
          deadlineChanges={deadlineChanges}
          lateDays={lateDays}
          today={today}
          tabHref={tabHref}
        />
      ) : null}

      {tab === "goals" ? (
        <ProjectGoalsTab project={project} goals={goals} tasks={tasks} today={today} />
      ) : null}
      {tab === "tasks" ? (
        <ProjectTasksTab project={project} goals={goals} tasks={tasks} today={today} />
      ) : null}
      {tab === "memos" ? (
        <ProjectMemosTab
          project={project}
          memos={memos.filter((memo) => memo.projectId === project.id)}
          goals={goals}
        />
      ) : null}
      {tab === "history" ? <ProjectHistoryTab changes={deadlineChanges} /> : null}

      <ProjectEditDrawer
        project={project}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onDelete={remove}
      />
      <ProjectDeadlineDrawer
        project={project}
        goals={goals}
        tasks={tasks}
        isOpen={isDeadlineOpen}
        onClose={() => setIsDeadlineOpen(false)}
      />
      <DeleteConfirmDialog
        target="프로젝트"
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          setIsDeleteOpen(false);
          remove();
        }}
      />
    </div>
  );
}

/**
 * 상세 설명 (REBUILD 6 · DOC2 06). 3줄 이하면 전부 보이고, 넘으면 3줄 + 아래 줄 「더보기」(ghost xs) → 「접기」.
 */
function ProjectDescription({ text }: { text: string }) {
  const textRef = useRef<HTMLParagraphElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLong, setIsLong] = useState(false);

  useLayoutEffect(() => {
    const element = textRef.current;
    if (!element) {
      return;
    }
    const measure = () => {
      // 접힌 상태에서만 잰다 (3줄을 넘는지)
      if (!isOpen) {
        setIsLong(element.scrollHeight > element.clientHeight + 1);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [isOpen, text]);

  return (
    <div className="flex flex-col items-start gap-1">
      <p
        ref={textRef}
        className={cn(
          "text-sm [overflow-wrap:anywhere] text-[var(--t2)]",
          !isOpen && "line-clamp-3",
        )}
      >
        {text}
      </p>
      {isLong || isOpen ? (
        <Button
          variant="ghost"
          size="xs"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
          className="-ml-2"
        >
          {isOpen ? "접기" : "더보기"}
        </Button>
      ) : null}
    </div>
  );
}
