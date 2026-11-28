"use client";

import { useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { HeaderActions } from "@/components/shell/HeaderActions";
import { usePageMeta } from "@/components/shell/PageMeta";
import { useFavoriteProjectIds } from "@/components/shell/useFavoriteProjects";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import { Folder, Inbox, Plus } from "@/components/ui/icon";
import { MenuSeparator, PickRow } from "@/components/ui/Menu";
import PageTitle from "@/components/ui/PageTitle";
import Popover from "@/components/ui/Popover";
import SearchField from "@/components/ui/SearchField";
import Segmented from "@/components/ui/Segmented";
import Tabs from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";

import { BUTTON_LABEL, TOAST_TEXT } from "@/content/ui";
import { getGoals } from "@/features/goals/api/goals";
import { createMemo, getMemos } from "@/features/memos/api/memos";
import { MemoCard, MemoComposer } from "@/features/memos/list/MemoParts";
import { getProjects } from "@/features/projects/api/projects";

import { useIsClient } from "@/hooks/useIsClient";
import { parseDateKey, toDateKey } from "@/lib/date";
import { projectColorVar } from "@/lib/projectPalette";
import { goalQueryKeys, memoQueryKeys, projectQueryKeys } from "@/lib/queryKeys";

export type MemosScope = "all" | "main" | "favorites";
type MemoFilter = "all" | "none" | "week";

const SCOPE_TABS = [
  { key: "all", label: "전체", href: "/memos" },
  { key: "main", label: "메인 프로젝트", href: "/memos/main" },
  { key: "favorites", label: "즐겨찾기", href: "/memos/favorites" },
];

// 처음에 보이는 카드 수. 나머지는 「이전 메모 N개 더 보기」 (보드 11)
const PAGE_SIZE = 6;

/** 이번 주 월요일 `YYYY-MM-DD` */
const weekStart = (today: string) => {
  const date = parseDateKey(today) ?? new Date();
  date.setDate(date.getDate() - ((date.getDay() + 6) % 7));
  return toDateKey(date);
};

/**
 * 전체 메모 (REBUILD 3-6 · 보드 11 ~ 11-c · T · M 11).
 * 웹: 제목 「메모」 + 안내 → 탭 → 쓰는 카드(글 칸 · 「연결: 없음」 · ⌘ Enter · [저장]) → 칸(전체 · 연결 없음 · 이번 주) · 검색 240
 * → 카드 3열(사이 16) · 「이전 메모 N개 더 보기」. 태블릿 · 모바일: 탭 없이 쓰는 칸 + 칸 + 한 열 카드.
 */
export default function MemosScreen({ scope }: { scope: MemosScope }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const isClient = useIsClient();
  const favoriteIds = useFavoriteProjectIds();
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const compactRef = useRef<HTMLTextAreaElement>(null);
  const linkRef = useRef<HTMLButtonElement>(null);
  const [text, setText] = useState("");
  const [linkId, setLinkId] = useState<number | null>(null);
  const [linkQuery, setLinkQuery] = useState("");
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [filter, setFilter] = useState<MemoFilter>("all");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const today = toDateKey(new Date());

  const { data: memos = [], isLoading } = useQuery({
    queryKey: memoQueryKeys.all,
    queryFn: getMemos,
  });
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
  const { data: goals = [] } = useQuery({
    queryKey: goalQueryKeys.list("all"),
    queryFn: () => getGoals("all"),
  });
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: memoQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
    ]);
  const create = useMutation({
    mutationFn: ({ title, projectId }: { title: string; projectId: number | null }) =>
      createMemo({ title, body: "", projectId }),
    onSuccess: refresh,
  });

  usePageMeta("메모");

  // 메모가 0개면 거를 것이 없다: 탭 · 칸 · 검색을 못 쓰게 하고 조건은 기본값으로 (첫 메모가 가려지지 않게)
  const isEmpty = !isLoading && memos.length === 0;
  if (isEmpty && (filter !== "all" || query !== "")) {
    setFilter("all");
    setQuery("");
  }

  const scoped = memos.filter((memo) => {
    if (scope === "main") {
      return projects.some((project) => project.isMain && project.id === memo.projectId);
    }
    if (scope === "favorites") {
      return isClient && memo.projectId != null && favoriteIds.includes(memo.projectId);
    }
    return true;
  });
  const monday = weekStart(today);
  const matches = (key: MemoFilter) =>
    scoped.filter((memo) =>
      key === "none"
        ? memo.projectId == null
        : key === "week"
          ? memo.createdAt.slice(0, 10) >= monday
          : true,
    );
  const visible = matches(filter).filter((memo) => memo.title.includes(query.trim()));
  const shown = showAll ? visible : visible.slice(0, PAGE_SIZE);
  const linked = projects.find((project) => project.id === linkId) ?? null;

  const save = (title: string, projectId: number | null) =>
    create
      .mutateAsync({ title, projectId })
      .then(() => toast(TOAST_TEXT.saved))
      .catch(() => toast(TOAST_TEXT.saveFailed));

  const saveComposer = () => {
    const title = text.trim();
    if (!title) {
      return;
    }
    void save(title, linkId).then(() => setText(""));
  };

  return (
    <div className="min-h-full bg-[var(--bg)]">
      <div className="mx-auto flex w-full max-w-320 flex-col gap-3 px-4 pt-6 pb-8 md:px-6 md:pt-8 lg:gap-6 lg:px-10 lg:pt-10 lg:pb-16">
        <HeaderActions>
          <Button
            variant="primary"
            size="sm"
            className="max-lg:hidden"
            onClick={() => composerRef.current?.focus()}
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
            onClick={() => compactRef.current?.focus()}
          >
            <Plus size={18} aria-hidden />
          </Button>
        </HeaderActions>

        <PageTitle
          className="max-lg:hidden"
          summary="정리 안 된 생각을 모아 두는 곳이에요. 필요하면 태스크나 목표로 바꿔요."
        >
          메모
        </PageTitle>

        <Tabs
          label="메모 범위"
          value={isEmpty ? "all" : scope}
          items={SCOPE_TABS}
          disabled={isEmpty}
          className="max-lg:hidden"
        />

        {/* 웹 쓰는 카드 (보드 11) */}
        <Card className="flex flex-col gap-3 p-4 max-lg:hidden">
          <textarea
            ref={composerRef}
            data-quick-input="memo"
            value={text}
            aria-label="메모 입력"
            placeholder="메모 입력"
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                saveComposer();
              }
            }}
            className="kit-input min-h-16 resize-none bg-transparent text-sm leading-5.5 outline-none placeholder:text-[var(--t3)]"
          />
          <div className="flex items-center gap-2">
            <Button
              ref={linkRef}
              variant="ghost"
              size="sm"
              aria-haspopup="listbox"
              aria-expanded={isLinkOpen}
              onClick={() => setIsLinkOpen((open) => !open)}
              className="-ml-2 max-w-80"
            >
              <Folder size={16} aria-hidden />
              <span className="truncate">연결: {linked?.name ?? "없음"}</span>
            </Button>
            <span className="flex-1" />
            <span className="text-xs text-[var(--t3)]">⌘ Enter</span>
            <Button variant="primary" size="sm" disabled={!text.trim()} onClick={saveComposer}>
              {BUTTON_LABEL.save}
            </Button>
          </div>
        </Card>
        {/* 태블릿 · 모바일 쓰는 칸 (보드 T · M 11) */}
        <MemoComposer
          inputRef={compactRef}
          placeholder="메모 입력"
          onSave={(title) => save(title, null)}
        />

        <div className="flex items-center gap-2">
          <Segmented
            label="메모 보기"
            value={filter}
            onChange={setFilter}
            disabled={isEmpty}
            items={[
              { value: "all", label: "전체", count: matches("all").length },
              { value: "none", label: "연결 없음", count: matches("none").length },
              { value: "week", label: "이번 주", count: matches("week").length },
            ]}
          />
          <span className="flex-1" />
          <div className="w-60 max-lg:hidden">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="메모 검색"
              ariaLabel="메모 검색"
              disabled={isEmpty}
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<Inbox size={24} />}
            title={scoped.length ? "조건에 맞는 메모가 없어요" : "아직 메모가 없어요"}
            text={
              scoped.length ? "다른 검색어를 입력해 보세요." : "위 입력칸에 메모를 추가해 보세요."
            }
          />
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
              {shown.map((memo) => (
                <MemoCard
                  key={memo.id}
                  memo={memo}
                  goals={goals}
                  link="project"
                  onChanged={refresh}
                />
              ))}
            </ul>
            {visible.length > shown.length ? (
              <Button
                variant="ghost"
                size="sm"
                className="self-center"
                onClick={() => setShowAll(true)}
              >
                이전 메모 {visible.length - shown.length}개 더 보기
              </Button>
            ) : null}
          </>
        )}

        <Popover
          isOpen={isLinkOpen}
          onClose={() => setIsLinkOpen(false)}
          anchorRef={linkRef}
          title="연결"
          width={300}
          role="listbox"
        >
          <div className="p-1">
            <SearchField
              value={linkQuery}
              onChange={setLinkQuery}
              placeholder="프로젝트 검색"
              ariaLabel="프로젝트 검색"
            />
          </div>
          <div className="flex max-h-80 flex-col overflow-y-auto [&>*]:shrink-0">
            {projects
              .filter((project) => project.name.includes(linkQuery.trim()))
              .map((project) => (
                <PickRow
                  key={project.id}
                  selected={project.id === linkId}
                  onSelect={() => {
                    setLinkId(project.id);
                    setIsLinkOpen(false);
                  }}
                  leading={
                    <span
                      aria-hidden
                      className="size-2.5 rounded-full"
                      style={{ background: projectColorVar(project.color) }}
                    />
                  }
                >
                  {project.name}
                </PickRow>
              ))}
            <MenuSeparator />
            <PickRow
              selected={linkId == null}
              onSelect={() => {
                setLinkId(null);
                setIsLinkOpen(false);
              }}
            >
              없음
            </PickRow>
          </div>
        </Popover>
      </div>
    </div>
  );
}
