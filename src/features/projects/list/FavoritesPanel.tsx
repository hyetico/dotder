"use client";

import { useRef, useState, type RefObject } from "react";

import { useFavoriteProjectIds } from "@/components/shell/useFavoriteProjects";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
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
 * 카드 + 점선 「즐겨찾기 추가」 카드(3개면 숨김) → 340 팝오버. 선택 모드는 체크 · 「즐겨찾기에서 빼기 (n)」 · [완료].
 * 비면 작은 빈 상태(회색 한 줄) + [즐겨찾기 추가] · [전체 프로젝트 보기].
 */
export default function FavoritesPanel({ projects, activity, onShowAll }: FavoritesPanelProps) {
  const toast = useToast();
  const favoriteIds = useFavoriteProjectIds();
  const [mode, setMode] = useState<"view" | "select" | "reorder">("view");
  const [selected, setSelected] = useState<number[]>([]);
  const [dragId, setDragId] = useState<number | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const addRef = useRef<HTMLButtonElement>(null);
  const emptyAddRef = useRef<HTMLButtonElement>(null);
  const byId = new Map(projects.map((project) => [project.id, project]));
  const favorites = favoriteIds
    .map((id) => byId.get(id))
    .filter((project): project is ProjectListItem => Boolean(project));
  const left = MAX_FAVORITES - favorites.length;

  const addPopover = (anchorRef: RefObject<HTMLElement | null>) => (
    <AddFavoritePopover
      isOpen={isAddOpen}
      onClose={() => setIsAddOpen(false)}
      anchorRef={anchorRef}
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
      // 작은 빈 상태: 회색 한 줄 (ProjectOverview 「남은 태스크가 없어요」와 같은 모양) + 기존 버튼
      <section className="flex flex-col items-start gap-3">
        <p className="text-xs text-[var(--t3)]">
          자주 보는 프로젝트를 즐겨찾기 해 보세요 · 최대 3개 · 사이드바 맨 위와 이 탭에서 바로 열 수
          있어요.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button ref={emptyAddRef} variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus size={16} aria-hidden />
            즐겨찾기 추가
          </Button>
          <Button size="sm" onClick={onShowAll}>
            전체 프로젝트 보기
          </Button>
        </div>
        {addPopover(emptyAddRef)}
      </section>
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

  return (
    <div className="flex flex-col gap-6">
      {mode === "select" ? (
        <div className="flex h-11 items-center gap-3 border-b border-[var(--divider)] text-sm">
          <label className="flex cursor-pointer items-center gap-2">
            <Checkbox
              checked={allSelected}
              indeterminate={selected.length > 0 && !allSelected}
              onChange={() =>
                setSelected(allSelected ? [] : favorites.map((project) => project.id))
              }
            />
            전체 선택
          </label>
          <span aria-hidden className="h-4 w-px bg-[var(--border)]" />
          <strong className="font-semibold">{selected.length}개 선택</strong>
          <span className="flex-1" />
          <Button
            variant="secondaryDanger"
            size="sm"
            disabled={selected.length === 0}
            onClick={removeSelected}
          >
            즐겨찾기에서 빼기 ({selected.length})
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setMode("view");
              setSelected([]);
            }}
          >
            완료
          </Button>
        </div>
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
        {left > 0 && mode === "view" ? (
          <li className="flex min-w-0 flex-col">
            <span
              aria-hidden
              className="inline-block h-6 w-27.5 rounded-t-[var(--radius-md)] border-[length:var(--line-dash)] border-b-0 border-dashed border-[var(--primary)]"
            />
            <button
              ref={addRef}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={isAddOpen}
              onClick={() => setIsAddOpen(true)}
              className="kit-focus flex min-h-86.5 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[var(--radius-lg)] rounded-tl-none border-[length:var(--line-dash)] border-dashed border-[var(--primary)] bg-[var(--s2)] text-sm text-[var(--t2)]"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--s3)]">
                <Plus size={18} aria-hidden />
              </span>
              <strong className="font-semibold text-[var(--text)]">즐겨찾기 추가</strong>
              <span className="text-xs text-[var(--t3)]">{left}개 더 추가할 수 있어요</span>
            </button>
            {addPopover(addRef)}
          </li>
        ) : null}
      </ProjectCardGrid>
    </div>
  );
}

type AddFavoritePopoverProps = {
  isOpen: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
  projects: ProjectListItem[];
  favoriteIds: number[];
  onAdd: (project: ProjectListItem) => void;
};

/** 즐겨찾기 추가 팝오버 (보드 02-d): 340 · 검색 · 「최근 본 프로젝트」 · 줄마다 [+ 추가] · 아래 「즐겨찾기 n / 3」. */
function AddFavoritePopover({
  isOpen,
  onClose,
  anchorRef,
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
