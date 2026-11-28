"use client";

import { useRef, useState, type RefObject } from "react";

import { useFavoriteProjectIds } from "@/components/shell/useFavoriteProjects";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import EmptyState from "@/components/ui/EmptyState";
import { FolderAddCard } from "@/components/ui/FolderCard";
import { GripVertical, Plus, Star } from "@/components/ui/icon";
import { MenuHeader, MenuSeparator } from "@/components/ui/Menu";
import Popover from "@/components/ui/Popover";
import ProjectMarker from "@/components/ui/ProjectMarker";
import SearchField from "@/components/ui/SearchField";
import { useToast } from "@/components/ui/Toast";

import { TOAST_TEXT } from "@/content/ui";
import ProjectCard, { getLateDays } from "@/features/projects/list/ProjectCard";
import ProjectCardGrid from "@/features/projects/list/ProjectCardGrid";
import { getProjectStatusLabel } from "@/features/projects/utils/projectUtils";

import { cn } from "@/lib/cn";
import {
  MAX_FAVORITES,
  getRecentProjectIds,
  setFavoriteProjectIds,
  toggleFavoriteProjectId,
} from "@/lib/projectSwitcherPreferences";

import type { ProjectListItem } from "@/features/projects/types/project";
import type { ActivityDay } from "@/features/projects/utils/activityMosaic";

const NO_ACTIVITY: ActivityDay[] = [];

type FavoritesPanelProps = {
  projects: ProjectListItem[];
  activity: Record<number, ActivityDay[]>;
  onShowAll: () => void;
};

/**
 * 즐겨찾기 탭 (보드 02 · 02-a · 02-b · 02-c · 02-d).
 * 안내 줄 「★ 즐겨찾기 n / 3 · 사이드바 프로젝트 전환 맨 위에도 보여요」 · [순서 바꾸기] · [선택].
 * 카드 + 폴더 모양 「즐겨찾기 추가」 카드(3개면 숨김 · 선택 모드는 비활성) → + 아이콘 아래 340 팝오버. 선택 모드는 체크 · 「즐겨찾기에서 빼기 (n)」 · [완료].
 * 비면 EmptyState(목록 페이지) + [즐겨찾기 추가] · [전체 프로젝트 보기] (보드 02-a).
 */
export default function FavoritesPanel({ projects, activity, onShowAll }: FavoritesPanelProps) {
  const toast = useToast();
  const favoriteIds = useFavoriteProjectIds();
  const [mode, setMode] = useState<"view" | "select" | "reorder">("view");
  const [selected, setSelected] = useState<number[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  // 추가 팝오버 기준점: 카드 안 + 아이콘 (아래 가운데) · 빈 상태는 [즐겨찾기 추가] 버튼
  const addIconRef = useRef<HTMLSpanElement>(null);
  const emptyAddRef = useRef<HTMLButtonElement>(null);
  const byId = new Map(projects.map((project) => [project.id, project]));
  const favorites = favoriteIds
    .map((id) => byId.get(id))
    .filter((project): project is ProjectListItem => Boolean(project));
  const left = MAX_FAVORITES - favorites.length;

  const addPopover = (anchorRef: RefObject<HTMLElement | null>, align: "start" | "center") => (
    <AddFavoritePopover
      isOpen={isAddOpen}
      onClose={() => setIsAddOpen(false)}
      anchorRef={anchorRef}
      align={align}
      projects={projects}
      favoriteIds={favoriteIds}
      onAdd={(project) => {
        toggleFavoriteProjectId(project.id);
        toast(TOAST_TEXT.favoriteAdded);

        if (favoriteIds.length + 1 >= MAX_FAVORITES) {
          setIsAddOpen(false);
        }
      }}
    />
  );

  if (favorites.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Star size={24} />}
          title="자주 보는 프로젝트를 즐겨찾기 해 보세요"
          text="최대 3개 · 사이드바 맨 위와 이 탭에서 바로 열 수 있어요."
          actions={
            <>
              <Button ref={emptyAddRef} variant="primary" onClick={() => setIsAddOpen(true)}>
                <Plus size={16} aria-hidden />
                즐겨찾기 추가
              </Button>
              <Button onClick={onShowAll}>전체 프로젝트 보기</Button>
            </>
          }
        />
        {addPopover(emptyAddRef, "start")}
      </>
    );
  }

  const removeSelected = () => {
    setFavoriteProjectIds(favoriteIds.filter((id) => !selected.includes(id)));
    toast(TOAST_TEXT.favoriteRemoved);
    setSelected([]);
    setMode("view");
  };

  const moveTo = (targetId: number) => {
    if (dragId == null || dragId === targetId) {
      return;
    }

    const next = favoriteIds.filter((id) => id !== dragId);
    next.splice(next.indexOf(targetId), 0, dragId);
    setFavoriteProjectIds(next);
  };

  const allSelected = selected.length === favorites.length;

  const finishSelect = () => {
    setMode("view");
    setSelected([]);
  };

  const selectAll = (
    <label className="flex cursor-pointer items-center gap-2">
      <Checkbox
        checked={allSelected}
        indeterminate={selected.length > 0 && !allSelected}
        onChange={() => setSelected(allSelected ? [] : favorites.map((project) => project.id))}
      />
      전체 선택
    </label>
  );

  return (
    <div className="flex flex-col gap-6">
      {mode === "select" ? (
        <>
          {/* 웹 선택 막대 (보드 02-c): 최소 44 · 아래 구분선 위 여백 12 · 사이 12 · 오른쪽 두 버튼은 한 묶음 8 */}
          <div className="flex min-h-11 items-center gap-3 border-b border-[var(--divider)] pb-3 text-sm max-lg:hidden">
            {selectAll}
            <span aria-hidden className="h-4 w-px bg-[var(--border)]" />
            <strong className="font-semibold">{selected.length}개 선택</strong>
            <span className="flex-1" />
            <div className="flex items-center gap-2">
              <Button
                variant="secondaryDanger"
                size="sm"
                disabled={selected.length === 0}
                onClick={removeSelected}
              >
                즐겨찾기에서 빼기 ({selected.length})
              </Button>
              <Button variant="primary" size="sm" onClick={finishSelect}>
                완료
              </Button>
            </div>
          </div>
          {/* 태블릿 · 모바일 선택 막대 (보드 T · M 02-c): 최소 48 · 「n개 선택」 작게 · [완료] 고스트, 빼기는 아래 고정 막대 */}
          <div className="-mx-4 flex min-h-12 items-center gap-3 border-b border-[var(--divider)] px-4 pb-3 text-sm lg:hidden">
            {selectAll}
            <span className="text-xs text-[var(--t3)]">{selected.length}개 선택</span>
            <span className="flex-1" />
            <Button variant="ghost" size="sm" onClick={finishSelect}>
              완료
            </Button>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-[var(--t2)]">
            <Star size={14} aria-hidden className="fill-current text-[var(--star)]" />
            즐겨찾기{" "}
            <b className="font-semibold">
              {favorites.length} / {MAX_FAVORITES}
            </b>{" "}
            · 사이드바 프로젝트 전환 맨 위에도 보여요
          </span>
          <span className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            aria-pressed={mode === "reorder"}
            onClick={() => setMode(mode === "reorder" ? "view" : "reorder")}
          >
            <GripVertical size={16} aria-hidden />
            {mode === "reorder" ? "완료" : "순서 바꾸기"}
          </Button>
          <Button size="sm" onClick={() => setMode("select")}>
            선택
          </Button>
        </div>
      )}

      <ProjectCardGrid>
        {favorites.map((project) => {
          const isSelected = selected.includes(project.id);
          const toggle = () =>
            setSelected((ids) =>
              isSelected ? ids.filter((id) => id !== project.id) : [...ids, project.id],
            );

          return (
            <li
              key={project.id}
              draggable={mode === "reorder"}
              onDragStart={() => setDragId(project.id)}
              onDragOver={(event) => {
                if (mode === "reorder") {
                  event.preventDefault();
                }
              }}
              onDrop={() => moveTo(project.id)}
              onDragEnd={() => setDragId(null)}
              onClick={mode === "select" ? toggle : undefined}
              className={cn(
                "min-w-0",
                mode === "reorder" && "cursor-grab",
                mode === "select" && "cursor-pointer",
                dragId === project.id && "opacity-40",
              )}
            >
              <ProjectCard
                project={project}
                activity={activity[project.id] ?? NO_ACTIVITY}
                titleAction={mode === "view" ? undefined : null}
                leading={
                  mode === "select" ? (
                    <Checkbox
                      checked={isSelected}
                      onChange={toggle}
                      label={`‘${project.name}’ 선택`}
                    />
                  ) : undefined
                }
                href={mode === "view" ? undefined : null}
              />
            </li>
          );
        })}
        {/* 추가 카드: 보기 모드는 누를 수 있고, 선택 모드는 같은 모양으로 비활성 (보드 02-c) · 순서 바꾸기에서는 숨김 */}
        {left > 0 && mode !== "reorder" ? (
          <li className="min-w-0">
            <FolderAddCard
              title="즐겨찾기 추가"
              description={
                mode === "select" ? "선택 중에는 추가할 수 없어요" : `${left}개 더 추가할 수 있어요`
              }
              disabled={mode === "select"}
              iconRef={addIconRef}
              expanded={isAddOpen}
              onClick={() => setIsAddOpen(true)}
            />
            {addPopover(addIconRef, "center")}
          </li>
        ) : null}
      </ProjectCardGrid>

      {/* 태블릿 · 모바일 아래 고정 막대 (보드 T · M 02-c): 안쪽 12/16/24 · 위 선 --border · 가득 찬 폭 48 보조 위험 버튼 */}
      {mode === "select" ? (
        <div className="sticky bottom-0 z-10 -mx-4 border-t border-[var(--border)] bg-[var(--surface)] px-4 pt-3 pb-6 md:-mx-6 lg:hidden">
          <Button
            variant="secondaryDanger"
            size="lg"
            grow
            disabled={selected.length === 0}
            onClick={removeSelected}
            className="w-full"
          >
            즐겨찾기에서 빼기 ({selected.length})
          </Button>
        </div>
      ) : null}
    </div>
  );
}

type AddFavoritePopoverProps = {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  /** 카드 안 + 아이콘이면 가운데, 빈 상태 버튼이면 왼쪽 */
  align: "start" | "center";
  projects: ProjectListItem[];
  favoriteIds: number[];
  onAdd: (project: ProjectListItem) => void;
};

/** 즐겨찾기 추가 팝오버 (보드 02-d): 340 · 검색 · 「최근 본 프로젝트」 · 줄마다 [+ 추가] · 아래 「즐겨찾기 n / 3」. */
function AddFavoritePopover({
  isOpen,
  onClose,
  anchorRef,
  align,
  projects,
  favoriteIds,
  onAdd,
}: AddFavoritePopoverProps) {
  const [query, setQuery] = useState("");
  const keyword = query.trim().toLowerCase();
  const recentIds = getRecentProjectIds();
  const candidates = projects
    .filter((project) => !favoriteIds.includes(project.id))
    .filter((project) => !keyword || project.name.toLowerCase().includes(keyword))
    .sort((a, b) => rank(recentIds, a.id) - rank(recentIds, b.id));

  return (
    <Popover
      isOpen={isOpen}
      onClose={onClose}
      anchorRef={anchorRef}
      align={align}
      title="즐겨찾기 추가"
      width={340}
    >
      <div className="flex flex-col p-1">
        <div className="p-1">
          <SearchField
            value={query}
            onChange={setQuery}
            placeholder="프로젝트 검색"
            ariaLabel="프로젝트 검색"
          />
        </div>
        <MenuHeader>{keyword ? `검색 결과 ${candidates.length}` : "최근 본 프로젝트"}</MenuHeader>
        <div className="flex max-h-80 flex-col overflow-y-auto [&>*]:shrink-0">
          {candidates.map((project) => {
            const lateDays = getLateDays(project);

            return (
              <div
                key={project.id}
                className="flex min-h-11 items-start gap-2 rounded-[var(--radius-sm)] px-2 py-2 hover:bg-[var(--s3)]"
              >
                <span className="flex h-5 shrink-0 items-center">
                  <ProjectMarker color={project.color} />
                </span>
                <span className="flex min-w-0 flex-1 flex-col text-sm">
                  <span className="[overflow-wrap:anywhere] break-keep">{project.name}</span>
                  <span className="text-xs text-[var(--t3)]">
                    {getProjectStatusLabel(project.status)} ·{" "}
                    {lateDays != null ? `${lateDays}일 지연` : `${project.progress}%`}
                  </span>
                </span>
                <Button
                  size="xs"
                  disabled={favoriteIds.length >= MAX_FAVORITES}
                  onClick={() => onAdd(project)}
                >
                  <Plus size={14} aria-hidden />
                  추가
                </Button>
              </div>
            );
          })}
        </div>
        <MenuSeparator />
        <div className="flex items-center gap-1 px-2 py-1.5 text-xs text-[var(--t3)]">
          <Star size={14} aria-hidden />
          즐겨찾기 {favoriteIds.length} / {MAX_FAVORITES}
        </div>
      </div>
    </Popover>
  );
}

function rank(recentIds: number[], id: number) {
  const index = recentIds.indexOf(id);
  return index < 0 ? Number.MAX_SAFE_INTEGER : index;
}
