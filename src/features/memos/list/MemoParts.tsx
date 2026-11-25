"use client";

import { useRef, useState, type Ref } from "react";

import { useQuery } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import Card from "@/components/kit/Card";
import { MenuItem, MenuSeparator, MoreMenu, PickRow } from "@/components/kit/Menu";
import Popover from "@/components/kit/Popover";
import SearchField from "@/components/kit/SearchField";
import { useToast } from "@/components/kit/Toast";
import { Folder, ListChecks, Target, Trash2 } from "@/components/ui/icon";

import { BUTTON_LABEL, INLINE_SAVE_TEXT, TOAST_TEXT } from "@/content/ui";
import { useGoalMutations } from "@/features/goals/hooks/useGoalMutations";
import { deleteMemo, registerMemo, restoreMemo, updateMemo } from "@/features/memos/api/memos";
import { getProjects } from "@/features/projects/api/projects";
import { formatMonthDot } from "@/features/projects/detail/projectOverviewModel";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";

import { cn } from "@/lib/cn";
import { formatDate, formatRelativeTime } from "@/lib/date";
import { projectColorVar } from "@/lib/projectPalette";
import { projectQueryKeys } from "@/lib/queryKeys";

import type { Goal } from "@/features/goals/types/goal";
import type { Memo } from "@/features/memos/types/memo";

// 이틀 안이면 「n시간 전 · 어제」, 그 뒤는 MM.DD (보드 T 07 「어제」 · 「11.18」)
/** 이틀 안이면 「n시간 전 · 어제」, 그 뒤는 MM.DD */
export const memoWhen = (createdAt: string) => {
  const text = formatRelativeTime(createdAt);
  return /^\d{4}\./.test(text) ? formatMonthDot(createdAt.slice(0, 10)) : text;
};

/**
 * 메모 쓰는 칸 (보드 T · M 07 · T · M 11). 카드 안 글 칸 + 오른쪽 [저장] xs, ⌘/Ctrl+Enter로도 저장.
 */
export function MemoComposer({
  onSave,
  placeholder,
  inputRef,
}: {
  onSave: (title: string) => Promise<unknown>;
  placeholder: string;
  /** 헤더 「+」로 초점을 옮길 때 */
  inputRef?: Ref<HTMLTextAreaElement>;
}) {
  const [text, setText] = useState("");
  const save = () => {
    const title = text.trim();
    if (!title) {
      return;
    }
    void onSave(title).then(() => setText(""));
  };

  return (
    <Card className="flex flex-col gap-2 px-3.5 py-3 lg:hidden">
      <textarea
        ref={inputRef}
        value={text}
        rows={1}
        aria-label="메모 적기"
        placeholder={placeholder}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            save();
          }
        }}
        className="kit-input min-h-5.5 resize-none bg-transparent text-sm leading-5.5 outline-none placeholder:text-[var(--t3)]"
      />
      <div className="flex justify-end">
        <Button variant="primary" size="xs" disabled={!text.trim()} onClick={save}>
          {BUTTON_LABEL.save}
        </Button>
      </div>
    </Card>
  );
}

// 새 태스크 id (목업 저장: 만든 시각을 id로)
const createTaskId = () => Date.now();

/**
 * 메모 카드 (보드 07 · 11 · 07-a · 11-a · 07-b · 11-b). 웹은 3열 카드(16/48/16/16 · 최소 128), 태블릿 · 모바일은 한 열 14.
 * 누르면 그 자리에서 고치고(테두리 --primary) 칸을 벗어나면 바로 저장 · 「저장됨」 (REBUILD 4-3).
 * ⋯: 태스크로 만들기 · 목표로 만들기 · 연결 바꾸기(11-c) · 삭제.
 *
 * @param link - 아래 줄에 보일 연결. goal: 연결 목표(상세 메모 탭) · project: 연결 프로젝트(전체 메모)
 */
export function MemoCard({
  memo,
  goals,
  link,
  onChanged,
}: {
  memo: Memo;
  goals: Goal[];
  link: "goal" | "project";
  onChanged: () => Promise<unknown>;
}) {
  const toast = useToast();
  const cardRef = useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(memo.title);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "failed">("idle");
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const { addGoalAsync } = useGoalMutations();
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
  const project = projects.find((item) => item.id === memo.projectId) ?? null;
  const { createTaskMutation } = useTaskMutations(project?.id ?? "all");
  const [linkQuery, setLinkQuery] = useState("");
  const linkedGoal =
    memo.registration?.kind === "goal"
      ? goals.find((goal) => goal.id === memo.registration?.targetId)
      : undefined;

  const save = async () => {
    setIsEditing(false);
    const title = text.trim();

    if (!title || title === memo.title) {
      setText(memo.title);
      return;
    }

    try {
      await updateMemo(memo.id, { title });
      setSaveState("saved");
      await onChanged();
    } catch {
      setSaveState("failed");
    }
  };

  const toTask = async () => {
    try {
      const id = createTaskId();
      await createTaskMutation.mutateAsync({
        id,
        // 연결 없는 메모에서 만든 태스크는 프로젝트 없음(0 · 목업 저장)
        projectId: project?.id ?? 0,
        title: memo.title.split("\n")[0].slice(0, 40),
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        createdBy: 0,
        order: 0,
      });
      await registerMemo(memo.id, { kind: "task", targetId: id, projectId: project?.id ?? null });
      await onChanged();
      toast(TOAST_TEXT.memoToTask);
    } catch (error) {
      toast(error instanceof Error && error.message ? error.message : TOAST_TEXT.saveFailed);
    }
  };

  const toGoal = async () => {
    try {
      const goal = await addGoalAsync({
        projectId: project?.id ?? null,
        teamId: project?.teamId ?? null,
        title: memo.title.split("\n")[0].slice(0, 40),
        description: "",
        status: "NOT_STARTED",
        color: project?.color ?? null,
        icon: "layout",
        tags: [],
        startDate: "",
        endDate: "",
      });
      await registerMemo(memo.id, {
        kind: "goal",
        targetId: goal.id,
        projectId: project?.id ?? null,
      });
      await onChanged();
      toast(TOAST_TEXT.memoToGoal);
    } catch (error) {
      toast(error instanceof Error && error.message ? error.message : TOAST_TEXT.saveFailed);
    }
  };

  const relink = async (projectId: number | null) => {
    setIsLinkOpen(false);
    await updateMemo(memo.id, { projectId });
    await onChanged();
    toast(TOAST_TEXT.memoRelinked);
  };

  const remove = async () => {
    await deleteMemo(memo.id);
    await onChanged();
    toast(TOAST_TEXT.deleted, {
      undo: () => void restoreMemo(memo).then(onChanged),
    });
  };

  return (
    <Card
      as="li"
      ref={cardRef}
      interactive
      selected={isEditing}
      // 웹 16/48/16/16 · 최소 128 · 사이 12, 태블릿 · 모바일 14 · 사이 6 (보드 07 · T 07)
      className="flex flex-col gap-1.5 py-3.5 pr-10 pl-3.5 lg:min-h-32 lg:gap-3 lg:py-4 lg:pr-12 lg:pl-4"
    >
      {isEditing ? null : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          aria-label="메모 고치기"
          className="kit-focus absolute inset-0 cursor-text rounded-[inherit]"
        />
      )}
      <div className="flex flex-1 flex-col gap-1">
        {isEditing ? (
          <textarea
            // 카드를 누르면 바로 쓸 수 있게 초점을 준다 (보드 07-a)
            autoFocus
            value={text}
            aria-label="메모"
            onChange={(event) => setText(event.target.value)}
            onBlur={() => void save()}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.stopPropagation();
                setText(memo.title);
                setIsEditing(false);
              }
            }}
            className="kit-input min-h-16.5 w-full flex-1 resize-none bg-transparent text-sm leading-5.5 outline-none"
          />
        ) : (
          <span
            className={cn(
              "text-sm [overflow-wrap:anywhere] max-lg:line-clamp-1",
              // 보드 07: 3줄 · 22 / 보드 11: 4줄 · 20
              link === "goal" ? "leading-5.5 lg:line-clamp-3" : "leading-5 lg:line-clamp-4",
            )}
          >
            {memo.title}
          </span>
        )}
        {link === "project" ? <span className="flex-1 max-lg:hidden" /> : null}
        <span className="flex items-center gap-2 text-xs text-[var(--t3)]">
          <span className="truncate lg:hidden">
            {(link === "goal" ? linkedGoal?.title : project?.name) ?? "연결 없음"} ·{" "}
            {memoWhen(memo.createdAt)}
          </span>
          {link === "goal" ? (
            <>
              <span className="max-lg:hidden">{formatDate(memo.createdAt.slice(0, 10))}</span>
              {linkedGoal ? (
                <span className="inline-flex h-5 min-w-0 items-center gap-1 truncate rounded-full border border-[var(--border)] px-2 text-[var(--t2)] max-lg:hidden">
                  <Target size={12} aria-hidden />
                  {linkedGoal.title}
                </span>
              ) : null}
            </>
          ) : (
            // 보드 11: 점 8 + 연결 프로젝트(없으면 회색 「연결 없음」) · 오른쪽 MM.DD
            <span className="flex min-w-0 flex-1 items-center gap-1.5 max-lg:hidden">
              <span
                aria-hidden
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  !project && "bg-[var(--badge-n-dot)]",
                )}
                style={project ? { background: projectColorVar(project.color) } : undefined}
              />
              <span className="min-w-0 truncate">{project?.name ?? "연결 없음"}</span>
              <span className="ml-auto shrink-0">
                {formatMonthDot(memo.createdAt.slice(0, 10))}
              </span>
            </span>
          )}
          {saveState === "saved" ? (
            <span className="ml-auto">{INLINE_SAVE_TEXT.saved}</span>
          ) : saveState === "failed" ? (
            <span className="relative z-10 ml-auto text-[var(--bad)]">
              {INLINE_SAVE_TEXT.failed} ·{" "}
              <button
                type="button"
                className="kit-focus cursor-pointer underline"
                onClick={() => void save()}
              >
                {BUTTON_LABEL.retry}
              </button>
            </span>
          ) : null}
        </span>
      </div>
      <span className="absolute top-2.5 right-2.5 z-10">
        <MoreMenu label="메모 메뉴" title="메모" size="xs">
          {(close) => (
            <>
              <MenuItem
                icon={<ListChecks />}
                disabled={memo.registration != null}
                onSelect={() => {
                  close();
                  void toTask();
                }}
              >
                태스크로 만들기
              </MenuItem>
              <MenuItem
                icon={<Target />}
                disabled={memo.registration != null}
                onSelect={() => {
                  close();
                  void toGoal();
                }}
              >
                목표로 만들기
              </MenuItem>
              <MenuItem
                icon={<Folder />}
                onSelect={() => {
                  close();
                  setIsLinkOpen(true);
                }}
              >
                연결 바꾸기
              </MenuItem>
              <MenuSeparator />
              <MenuItem
                danger
                icon={<Trash2 />}
                onSelect={() => {
                  close();
                  void remove();
                }}
              >
                삭제
              </MenuItem>
            </>
          )}
        </MoreMenu>
      </span>
      <Popover
        isOpen={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        anchorRef={cardRef}
        title="연결 바꾸기"
        width={300}
        align="end"
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
            .filter((item) => item.name.includes(linkQuery.trim()))
            .map((item) => (
              <PickRow
                key={item.id}
                selected={item.id === memo.projectId}
                onSelect={() => void relink(item.id)}
                leading={
                  <span
                    aria-hidden
                    className="size-2.5 rounded-full"
                    style={{ background: projectColorVar(item.color) }}
                  />
                }
              >
                {item.name}
              </PickRow>
            ))}
          <MenuSeparator />
          <PickRow selected={memo.projectId == null} onSelect={() => void relink(null)}>
            프로젝트 없음
          </PickRow>
        </div>
      </Popover>
    </Card>
  );
}
