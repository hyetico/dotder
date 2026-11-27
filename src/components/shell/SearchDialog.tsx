"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import { useQuery } from "@tanstack/react-query";

import Badge, { type BadgeTone } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Folder, Inbox, ListChecks, Plus, Search, Target, X } from "@/components/ui/icon";
import Kbd from "@/components/ui/Kbd";
import { MenuHeader } from "@/components/ui/Menu";
import Modal from "@/components/ui/Modal";
import Segmented from "@/components/ui/Segmented";

import { getGoals } from "@/features/goals/api/goals";
import { getMemos } from "@/features/memos/api/memos";
import { getProjects } from "@/features/projects/api/projects";
import {
  GOAL_STATUS_BADGE,
  getTaskLateDays,
} from "@/features/projects/detail/projectOverviewModel";
import { PROJECT_STATUS_TONE } from "@/features/projects/list/ProjectCard";
import { getProjectStatusLabel } from "@/features/projects/utils/projectUtils";
import { getTasks } from "@/features/tasks/api/tasks";
import { TASK_STATUS_LABEL } from "@/features/tasks/taskModel";

import { cn } from "@/lib/cn";
import { formatDate, formatRelativeTime, toDateKey } from "@/lib/date";
import { getRecentProjectEntries, recordRecentProjectId } from "@/lib/projectSwitcherPreferences";
import { goalQueryKeys, memoQueryKeys, projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

type Kind = "all" | "project" | "goal" | "task" | "memo";

type Row = {
  key: string;
  kind: Exclude<Kind, "all">;
  title: string;
  sub: string;
  badge?: { tone: BadgeTone; label: string; dot?: boolean };
  href: string;
  projectId?: number;
};

const KIND_ITEMS: { value: Kind; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "project", label: "프로젝트" },
  { value: "goal", label: "목표" },
  { value: "task", label: "태스크" },
  { value: "memo", label: "메모" },
];

const KIND_LABEL: Record<Exclude<Kind, "all">, string> = {
  project: "프로젝트",
  goal: "목표",
  task: "태스크",
  memo: "메모",
};

const KIND_ICON: Record<Exclude<Kind, "all">, ReactNode> = {
  project: <Folder size={16} aria-hidden />,
  goal: <Target size={16} aria-hidden />,
  task: <ListChecks size={16} aria-hidden />,
  memo: <Inbox size={16} aria-hidden />,
};

// 「전체」에서 묶음마다 먼저 보이는 수. 넘치면 머리에 「· 전체 보기」 (보드 01-f)
const GROUP_LIMIT = 3;

/** 찾은 글자를 굵게 (보드 01-f <b>) */
function Highlight({ text, query }: { text: string; query: string }) {
  const index = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;

  if (index < 0) {
    return <>{text}</>;
  }

  return (
    <>
      {text.slice(0, index)}
      <b className="font-bold">{text.slice(index, index + query.length)}</b>
      {text.slice(index + query.length)}
    </>
  );
}

/**
 * 통합 검색 (보드 01-e · 01-f · 프로토타입 searchBox). 위 88 · 폭 600.
 * 머리 56: 돋보기 · 입력(16) · 닫기 → 종류 칸 → 결과(줄 48 · 아이콘 · 이름 + 종류 · 보조 글 · 배지).
 * 입력 전에는 「최근 본 항목」(최근 연 프로젝트) · 「바로 가기」. ↑ ↓로 고르고 Enter로 연다.
 */
export default function SearchDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<Kind>("all");
  const [active, setActive] = useState(0);
  const [openedFor, setOpenedFor] = useState(isOpen);
  const today = toDateKey(new Date());

  if (isOpen !== openedFor) {
    setOpenedFor(isOpen);
    if (isOpen) {
      setQuery("");
      setKind("all");
      setActive(0);
    }
  }

  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
  const { data: goals = [] } = useQuery({
    queryKey: goalQueryKeys.list("all"),
    queryFn: () => getGoals("all"),
    enabled: isOpen,
  });
  const { data: tasks = [] } = useQuery({
    queryKey: taskQueryKeys.list("all"),
    queryFn: () => getTasks("all"),
    enabled: isOpen,
  });
  const { data: memos = [] } = useQuery({
    queryKey: memoQueryKeys.all,
    queryFn: getMemos,
    enabled: isOpen,
  });

  const term = query.trim();
  const has = (text: string) => text.toLowerCase().includes(term.toLowerCase());

  const projectRow = (project: (typeof projects)[number], sub: string): Row => ({
    key: `p${project.id}`,
    kind: "project",
    title: project.name,
    sub,
    badge: {
      tone: PROJECT_STATUS_TONE[project.status],
      label: getProjectStatusLabel(project.status),
      dot: true,
    },
    href: `/projects/${project.id}`,
    projectId: project.id,
  });

  const all: Row[] = term
    ? [
        ...projects
          .filter((project) => has(project.name))
          .map((project) =>
            projectRow(
              project,
              `프로젝트${project.endDate ? ` · ${formatDate(project.endDate)}` : ""}`,
            ),
          ),
        ...goals
          .filter((goal) => has(goal.title))
          .map((goal): Row => {
            const own = tasks.filter((task) => task.goalId === goal.id);
            const badge = GOAL_STATUS_BADGE[goal.status];
            return {
              key: `g${goal.id}`,
              kind: "goal",
              title: goal.title,
              sub: `목표 · 태스크 ${own.filter((task) => task.status === "DONE").length}/${own.length}`,
              badge: { tone: badge.tone, label: badge.label, dot: true },
              href: `/goals?goal=${goal.id}`,
            };
          }),
        ...tasks
          .filter((task) => has(task.title))
          .map((task): Row => {
            const late = getTaskLateDays(task, today);
            return {
              key: `t${task.id}`,
              kind: "task",
              title: task.title,
              sub: `태스크 · ${TASK_STATUS_LABEL[task.status]}`,
              badge: late != null ? { tone: "bad", label: `${late}일 지남` } : undefined,
              href: `/tasks?task=${task.id}`,
            };
          }),
        ...memos
          .filter((memo) => has(memo.title))
          .map((memo): Row => ({
            key: `m${memo.id}`,
            kind: "memo",
            title: memo.title,
            sub: `메모 · ${formatDate(memo.createdAt.slice(0, 10))}`,
            href: "/memos",
          })),
      ]
    : getRecentProjectEntries()
        .map((entry) => {
          const project = projects.find((item) => item.id === entry.id);
          return project
            ? projectRow(project, `프로젝트 · ${formatRelativeTime(entry.openedAt)}`)
            : null;
        })
        .filter((row): row is Row => row != null)
        .slice(0, 3);

  const groups = (["project", "goal", "task", "memo"] as const)
    .filter((key) => kind === "all" || kind === key)
    .map((key) => {
      const items = all.filter((row) => row.kind === key);
      return {
        key,
        total: items.length,
        items: kind === "all" ? items.slice(0, GROUP_LIMIT) : items,
      };
    })
    .filter((group) => group.items.length > 0);
  const shortcuts: Row[] = term
    ? []
    : [
        {
          key: "new-project",
          kind: "project",
          title: "프로젝트 추가",
          sub: "",
          href: "/projects?new=1",
        },
        { key: "new-task", kind: "task", title: "태스크 추가", sub: "", href: "/tasks?new=1" },
      ];
  const flat = [...groups.flatMap((group) => group.items), ...shortcuts];
  const current = Math.min(active, Math.max(flat.length - 1, 0));

  const open = (row: Row) => {
    if (row.projectId != null) {
      recordRecentProjectId(row.projectId);
    }
    onClose();
    router.push(row.href);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current + step + flat.length) % Math.max(flat.length, 1));
    } else if (event.key === "Enter" && !event.nativeEvent.isComposing && flat[current]) {
      event.preventDefault();
      open(flat[current]);
    }
  };

  const rowView = (row: Row, index: number, short = false) => (
    <button
      key={row.key}
      type="button"
      onClick={() => open(row)}
      onMouseEnter={() => setActive(index)}
      className={cn(
        "kit-focus flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-3 text-left text-sm transition-colors duration-120",
        short ? "h-10" : "h-12",
        index === current && "bg-[var(--s3)]",
      )}
    >
      <span className="shrink-0 text-[var(--t3)]">
        {short ? <Plus size={16} aria-hidden /> : KIND_ICON[row.kind]}
      </span>
      {short ? (
        <span className="flex-1">{row.title}</span>
      ) : (
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate">
            <Highlight text={row.title} query={term} />
          </span>
          <span className="truncate text-xs text-[var(--t3)]">{row.sub}</span>
        </span>
      )}
      {row.badge ? (
        <Badge tone={row.badge.tone} dot={row.badge.dot}>
          {row.badge.label}
        </Badge>
      ) : null}
    </button>
  );

  let index = 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="통합 검색"
      width="search"
      placement="top"
      flush
      initialFocusRef={inputRef}
      header={
        <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--divider)] pr-3 pl-4">
          <Search size={18} aria-hidden className="shrink-0 text-[var(--t3)]" />
          <input
            ref={inputRef}
            // 브라우저 기본 지우기 X가 생기지 않게 text로 둔다 (닫기 X만 보드에 있음)
            type="text"
            role="searchbox"
            value={query}
            aria-label="통합 검색"
            placeholder="프로젝트, 목표, 태스크, 메모 검색"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={handleKeyDown}
            className="kit-input min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--t3)]"
          />
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label="닫기"
            tip="닫기 · Esc"
            onClick={onClose}
          >
            <X size={18} aria-hidden />
          </Button>
        </div>
      }
      footer={
        <span className="hidden items-center gap-4 md:flex">
          <span className="inline-flex items-center gap-1">
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> 이동
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>↵</Kbd> 열기
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>Esc</Kbd> 닫기
          </span>
        </span>
      }
      footerNote
    >
      <div className="px-3 pt-2">
        <Segmented
          label="검색 종류"
          value={kind}
          onChange={(next) => {
            setKind(next);
            setActive(0);
          }}
          items={KIND_ITEMS}
        />
      </div>
      <div className="flex max-h-105 flex-col overflow-y-auto px-1 pt-1 pb-2">
        {term && flat.length === 0 ? (
          <div className="flex flex-col gap-1 px-3 py-6 text-center">
            <p className="text-sm [overflow-wrap:anywhere] text-[var(--t2)]">
              ‘{term}’와 맞는 결과가 없어요
            </p>
            <p className="text-xs text-[var(--t3)]">다른 단어로 검색해 보세요.</p>
          </div>
        ) : null}
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col">
            <MenuHeader>
              {term ? (
                <>
                  {KIND_LABEL[group.key]} {group.total}
                  {kind === "all" && group.total > group.items.length ? (
                    <button
                      type="button"
                      onClick={() => setKind(group.key)}
                      className="kit-focus ml-1 cursor-pointer font-normal hover:text-[var(--text)]"
                    >
                      · 전체 보기
                    </button>
                  ) : null}
                </>
              ) : (
                "최근 본 항목"
              )}
            </MenuHeader>
            {group.items.map((row) => rowView(row, index++))}
          </div>
        ))}
        {shortcuts.length ? (
          <div className="flex flex-col">
            <MenuHeader>바로 가기</MenuHeader>
            {shortcuts.map((row) => rowView(row, index++, true))}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
