"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState, type ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import Checkbox from "@/components/kit/Checkbox";
import { Chip } from "@/components/kit/Chip";
import { DeleteConfirmDialog } from "@/components/kit/ConfirmDialog";
import EmptyState from "@/components/kit/EmptyState";
import { MenuHeader, MenuSeparator, PickRow } from "@/components/kit/Menu";
import Popover from "@/components/kit/Popover";
import Segmented from "@/components/kit/Segmented";
import Tabs from "@/components/kit/Tabs";
import { useToast } from "@/components/kit/Toast";
import { HeaderActions } from "@/components/layout/Header/HeaderActions";
import { usePageMeta } from "@/components/shell/PageMeta";
import { useFavoriteProjectIds } from "@/components/shell/useFavoriteProjects";
import { CircleAlert, Funnel, ListFilter, Plus, Target } from "@/components/ui/icon";

import { NOT_FOUND_TITLE, TOAST_TEXT } from "@/content/ui";
import { getGoals } from "@/features/goals/api/goals";
import GoalAddDrawer from "@/features/goals/drawers/GoalAddDrawer";
import GoalDetailDrawer from "@/features/goals/drawers/GoalDetailDrawer";
import { useGoalMutations } from "@/features/goals/hooks/useGoalMutations";
import GoalFilterPopover from "@/features/goals/list/GoalFilterPopover";
import { getGoalStats, type GoalStatusFilter } from "@/features/goals/list/goalListModel";
import GoalRow from "@/features/goals/list/GoalRow";
import { getProjects } from "@/features/projects/api/projects";
import { GOAL_STATUS_BADGE } from "@/features/projects/detail/projectOverviewModel";
import { getTasks } from "@/features/tasks/api/tasks";

import { useIsClient } from "@/hooks/useIsClient";
import { toDateKey } from "@/lib/date";
import { projectColorVar } from "@/lib/projectPalette";
import { getNewProjectPath } from "@/lib/projectRoutes";
import { goalQueryKeys, projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

import type { Goal, GoalStatus } from "@/features/goals/types/goal";

export type GoalsScope = "all" | "main" | "favorites";
type GoalGroup = "project" | "status" | "none";

const GROUP_LABEL: Record<GoalGroup, string> = {
  project: "프로젝트",
  status: "상태",
  none: "없음",
};
const GROUPS: GoalGroup[] = ["project", "status", "none"];
const STATUS_ORDER: GoalStatus[] = ["IN_PROGRESS", "NOT_STARTED", "COMPLETED"];

const SCOPE_TABS = [
  { key: "all", label: "전체", href: "/goals" },
  { key: "main", label: "메인 프로젝트", shortLabel: "메인", href: "/goals/main" },
  { key: "favorites", label: "즐겨찾기", href: "/goals/favorites" },
];

/**
 * 전체 목표 (REBUILD 3-4 · 보드 09 ~ 09-g · T · M 09).
 * 웹: 본문 최대 1280 · 40/40/64 · 사이 24, 제목 「목표」 + 「N개 중 N개 진행 중 · N개 마감 지남」 →
 * 탭(전체 · 메인 프로젝트 · 즐겨찾기) → 도구 줄(상태 칸 · 마감 지남만 · ─ · 묶기 · 필터) → 묶음(프로젝트 · 상태 · 없음)별 목표 줄.
 * 태블릿 · 모바일: 제목은 헤더로, 상태 칸(전체 · 진행 중 · 완료) + 필터 아이콘(마감 지남만 · 묶기 · 태그).
 * 주소 `?goal=id`면 그 목표 상세를 연다.
 */
export default function GoalsScreen({ scope }: { scope: GoalsScope }) {
  return (
    <div className="min-h-full bg-[var(--bg)]">
      <Suspense fallback={null}>
        <GoalsBody scope={scope} />
      </Suspense>
    </div>
  );
}

function GoalsBody({ scope }: { scope: GoalsScope }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const isClient = useIsClient();
  const favoriteIds = useFavoriteProjectIds();
  const groupRef = useRef<HTMLButtonElement>(null);
  const filterRef = useRef<HTMLButtonElement>(null);
  const compactFilterRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<GoalStatusFilter>("all");
  const [lateOnly, setLateOnly] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [group, setGroup] = useState<GoalGroup>("project");
  const [panel, setPanel] = useState<"group" | "filter" | "compact" | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(searchParams.get("new") === "1");
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const { updateGoalAsync, deleteGoalAsync, restoreGoalAsync } = useGoalMutations();

  const { data: goals = [], isLoading } = useQuery({
    queryKey: goalQueryKeys.list("all"),
    queryFn: () => getGoals("all"),
  });
  const { data: tasks = [] } = useQuery({
    queryKey: taskQueryKeys.list("all"),
    queryFn: () => getTasks("all"),
  });
  const { data: projects = [], isLoading: isProjectsLoading } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const today = toDateKey(new Date());
  const projectOf = (goal: Goal) => projects.find((project) => project.id === goal.projectId);
  const scoped = goals.filter((goal) => {
    if (scope === "main") {
      return Boolean(projectOf(goal)?.isMain);
    }
    if (scope === "favorites") {
      return isClient && goal.projectId != null && favoriteIds.includes(goal.projectId);
    }
    return true;
  });
  const lateOf = (goal: Goal) => getGoalStats(goal, tasks, today).lateDays;
  const count = (key: GoalStatusFilter) =>
    scoped.filter((goal) => key === "all" || goal.status === key).length;
  const lateCount = scoped.filter((goal) => lateOf(goal) != null).length;
  const visible = scoped
    .filter((goal) => status === "all" || goal.status === status)
    .filter((goal) => !lateOnly || lateOf(goal) != null)
    .filter((goal) => tags.length === 0 || goal.tags.some((tag) => tags.includes(tag)))
    .sort((a, b) => (a.endDate || "9").localeCompare(b.endDate || "9"));
  const isFiltered = status !== "all" || lateOnly || tags.length > 0;
  const openGoalId = Number(searchParams.get("goal")) || null;
  const openGoal = goals.find((goal) => goal.id === openGoalId) ?? null;
  const subtitle = `${scoped.length}개 중 ${count("IN_PROGRESS")}개 진행 중`;

  // 없는 목표 주소(/goals/1/999 → ?goal=999)는 목록 대신 「찾을 수 없음」 (위치 「목표 / 찾을 수 없음」)
  const isGoalMissing = !isLoading && openGoalId != null && !openGoal;
  // 프로젝트가 하나도 없으면 목표를 만들 곳이 없다
  const hasNoProjects = !isLoading && !isProjectsLoading && projects.length === 0 && !scoped.length;

  usePageMeta(
    isGoalMissing ? NOT_FOUND_TITLE : "목표",
    isGoalMissing ? undefined : subtitle,
    isGoalMissing ? "/goals" : undefined,
  );

  const setOpenGoal = (goalId: number | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (goalId) {
      params.set("goal", String(goalId));
    } else {
      params.delete("goal");
    }
    const query = params.toString();
    router.replace(query ? `?${query}` : "?", { scroll: false });
  };

  const sections: { key: string; head?: ReactNode; projectId?: number; items: Goal[] }[] =
    group === "none"
      ? [{ key: "all", items: visible }]
      : group === "status"
        ? STATUS_ORDER.map((key) => ({
            key,
            head: <strong className="text-sm">{GOAL_STATUS_BADGE[key].label}</strong>,
            items: visible.filter((goal) => goal.status === key),
          })).filter((section) => section.items.length > 0)
        : [...new Set(visible.map((goal) => goal.projectId ?? 0))].map((projectId) => {
            const project = projects.find((item) => item.id === projectId);
            return {
              key: String(projectId),
              projectId: project?.id,
              head: project ? (
                <>
                  <span
                    aria-hidden
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: projectColorVar(project.color) }}
                  />
                  <strong className="max-w-[60%] truncate text-sm">{project.name}</strong>
                </>
              ) : (
                <strong className="text-sm">프로젝트 없음</strong>
              ),
              items: visible.filter((goal) => (goal.projectId ?? 0) === projectId),
            };
          });

  const complete = async (goal: Goal) => {
    await updateGoalAsync({
      ...goal,
      status: "COMPLETED",
      teamId: projectOf(goal)?.teamId ?? null,
    });
    toast(TOAST_TEXT.goalCompleted, {
      undo: () => void updateGoalAsync({ ...goal, teamId: projectOf(goal)?.teamId ?? null }),
    });
  };

  const remove = async (goal: Goal) => {
    const removed = await deleteGoalAsync(goal.id);
    toast(TOAST_TEXT.deleted, { undo: () => void restoreGoalAsync(removed) });
  };

  const resetFilters = () => {
    setStatus("all");
    setLateOnly(false);
    setTags([]);
  };

  const groupPicker = (onPick: () => void) =>
    GROUPS.map((key) => (
      <PickRow
        key={key}
        selected={group === key}
        onSelect={() => {
          setGroup(key);
          onPick();
        }}
      >
        {GROUP_LABEL[key]}
      </PickRow>
    ));

  if (isGoalMissing) {
    return (
      <div className="mx-auto flex w-full max-w-320 flex-col gap-3 px-4 pt-6 pb-8 md:px-6 md:pt-8 lg:gap-6 lg:px-10 lg:pt-10 lg:pb-16">
        <EmptyState
          icon={<Target size={24} />}
          title="목표를 찾을 수 없어요"
          text="지워졌거나 주소가 바뀌었을 수 있어요."
          actions={
            <Button href="/goals" variant="primary">
              목표 목록으로
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-320 flex-col gap-3 px-4 pt-6 pb-8 md:px-6 md:pt-8 lg:gap-6 lg:px-10 lg:pt-10 lg:pb-16">
      <HeaderActions>
        <Button
          variant="primary"
          size="sm"
          className="max-lg:hidden"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus size={16} aria-hidden />
          추가
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconOnly
          aria-label="새로 만들기"
          className="lg:hidden"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus size={18} aria-hidden />
        </Button>
      </HeaderActions>

      <header className="flex flex-col gap-1 max-lg:hidden">
        <h1 className="text-2xl font-bold">목표</h1>
        <p className="text-sm text-[var(--t2)]">
          {subtitle}
          {lateCount > 0 ? (
            <>
              {" · "}
              <span className="text-[var(--bad)]">{lateCount}개 마감 지남</span>
            </>
          ) : null}
        </p>
      </header>

      <Tabs
        label="목표 범위"
        value={scope}
        items={SCOPE_TABS}
        className="max-lg:-mx-4 max-lg:px-4"
      />

      {/* 웹 도구 줄 (보드 09) */}
      <div className="flex items-center gap-2 max-lg:hidden">
        <Segmented
          label="목표 상태"
          value={status}
          onChange={setStatus}
          items={[
            { value: "all", label: "전체", count: count("all") },
            { value: "IN_PROGRESS", label: "진행 중", count: count("IN_PROGRESS") },
            { value: "NOT_STARTED", label: "계획", count: count("NOT_STARTED") },
            { value: "COMPLETED", label: "완료", count: count("COMPLETED") },
          ]}
        />
        <Chip
          selected={lateOnly}
          icon={<CircleAlert size={16} aria-hidden />}
          onClick={() => setLateOnly((value) => !value)}
        >
          마감 지남만
        </Chip>
        <span className="flex-1" />
        <Button
          ref={groupRef}
          variant="ghost"
          size="sm"
          aria-haspopup="listbox"
          aria-expanded={panel === "group"}
          onClick={() => setPanel(panel === "group" ? null : "group")}
        >
          <ListFilter size={16} aria-hidden />
          묶기: {GROUP_LABEL[group]}
        </Button>
        <Button
          ref={filterRef}
          size="sm"
          aria-haspopup="dialog"
          aria-expanded={panel === "filter"}
          onClick={() => setPanel(panel === "filter" ? null : "filter")}
        >
          <Funnel size={16} aria-hidden />
          필터{tags.length ? ` ${tags.length}` : ""}
        </Button>
      </div>

      {/* 태블릿 · 모바일 도구 줄 (보드 T · M 09) */}
      <div className="flex items-center gap-2 lg:hidden">
        <Segmented
          label="목표 상태"
          value={status}
          onChange={setStatus}
          items={[
            { value: "all", label: "전체", count: count("all") },
            { value: "IN_PROGRESS", label: "진행 중", count: count("IN_PROGRESS") },
            { value: "COMPLETED", label: "완료", count: count("COMPLETED") },
          ]}
        />
        <span className="flex-1" />
        <Button
          ref={compactFilterRef}
          size="sm"
          iconOnly
          aria-label="필터"
          aria-haspopup="dialog"
          aria-expanded={panel === "compact"}
          onClick={() => setPanel(panel === "compact" ? null : "compact")}
        >
          <Funnel size={16} aria-hidden />
        </Button>
      </div>

      {isLoading ? null : hasNoProjects ? (
        <EmptyState
          icon={<Target size={24} />}
          title="먼저 프로젝트를 추가해 주세요"
          text="목표는 프로젝트 안에 만들어요."
          actions={
            <Button href={getNewProjectPath()} variant="primary">
              <Plus size={16} aria-hidden />
              프로젝트 추가
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<Target size={24} />}
          title={scoped.length ? "조건에 맞는 목표가 없어요" : "아직 목표가 없어요"}
          text={
            scoped.length
              ? "필터를 바꿔 보세요."
              : "목표를 추가하면 태스크를 묶어서 진행률을 볼 수 있어요."
          }
          actions={
            isFiltered ? (
              <Button onClick={resetFilters}>필터 초기화</Button>
            ) : (
              <Button variant="primary" onClick={() => setIsAddOpen(true)}>
                <Plus size={16} aria-hidden />
                목표 추가
              </Button>
            )
          }
        />
      ) : (
        sections.map((section) => (
          <section key={section.key} className="flex flex-col lg:gap-2">
            {section.head ? (
              <div className="flex min-w-0 items-center gap-2 max-lg:pb-2">
                {section.head}
                <span className="shrink-0 text-xs text-[var(--t3)]">{section.items.length}개</span>
                <span className="flex-1" />
                {section.projectId ? (
                  <Button
                    variant="ghost"
                    size="xs"
                    href={`/projects/${section.projectId}?tab=goals`}
                    className="max-lg:hidden"
                  >
                    프로젝트 보기
                  </Button>
                ) : null}
              </div>
            ) : null}
            <ul className="flex flex-col lg:gap-2">
              {section.items.map((goal) => (
                <GoalRow
                  key={goal.id}
                  goal={goal}
                  stats={getGoalStats(goal, tasks, today)}
                  onOpen={() => setOpenGoal(goal.id)}
                  onComplete={() => void complete(goal)}
                  onDelete={() => setDeleteTarget(goal)}
                />
              ))}
            </ul>
          </section>
        ))
      )}

      <Popover
        isOpen={panel === "group"}
        onClose={() => setPanel(null)}
        anchorRef={groupRef}
        title="묶기"
        width={200}
        align="end"
        role="listbox"
      >
        {groupPicker(() => setPanel(null))}
      </Popover>
      <GoalFilterPopover
        isOpen={panel === "filter"}
        onClose={() => setPanel(null)}
        anchorRef={filterRef}
        goals={scoped}
        tags={tags}
        onTagsChange={setTags}
        resultCount={visible.length}
      />
      <GoalFilterPopover
        isOpen={panel === "compact"}
        onClose={() => setPanel(null)}
        anchorRef={compactFilterRef}
        goals={scoped}
        tags={tags}
        onTagsChange={setTags}
        resultCount={visible.length}
        onReset={resetFilters}
        before={
          <>
            <label className="flex min-h-9 cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 text-sm hover:bg-[var(--s3)] max-md:min-h-13">
              <Checkbox checked={lateOnly} onChange={setLateOnly} label="마감 지남만" />
              <span className="flex-1">마감 지남만</span>
              <span className="text-xs text-[var(--bad)] tabular-nums">{lateCount}</span>
            </label>
            <MenuSeparator />
            <MenuHeader>묶기</MenuHeader>
            {groupPicker(() => undefined)}
            <MenuSeparator />
          </>
        }
      />

      <GoalAddDrawer
        isOpen={isAddOpen}
        onClose={() => {
          setIsAddOpen(false);
          // 단축키 · 통합 검색에서 온 ?new=1은 닫으면 지운다
          if (searchParams.get("new")) {
            router.replace("?", { scroll: false });
          }
        }}
        projectId={null}
      />
      <GoalDetailDrawer goal={openGoal} tasks={tasks} onClose={() => setOpenGoal(null)} />
      <DeleteConfirmDialog
        target="목표"
        isOpen={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (target) {
            void remove(target);
          }
        }}
      />
    </div>
  );
}
