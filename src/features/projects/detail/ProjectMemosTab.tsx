"use client";

import { useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import Card from "@/components/kit/Card";
import EmptyState from "@/components/kit/EmptyState";
import { MenuItem, MenuSeparator, MoreMenu, PickRow } from "@/components/kit/Menu";
import Popover from "@/components/kit/Popover";
import QuickAddInput from "@/components/kit/QuickAddInput";
import { useToast } from "@/components/kit/Toast";
import { Folder, Inbox, ListChecks, Target, Trash2 } from "@/components/ui/icon";

import { BUTTON_LABEL, INLINE_SAVE_TEXT, QUICK_ADD_PLACEHOLDER, TOAST_TEXT } from "@/content/ui";
import { useGoalMutations } from "@/features/goals/hooks/useGoalMutations";
import {
  createMemo,
  deleteMemo,
  registerMemo,
  restoreMemo,
  updateMemo,
} from "@/features/memos/api/memos";
import { getProjects } from "@/features/projects/api/projects";
import { formatMonthDot } from "@/features/projects/detail/projectOverviewModel";
import { useTaskMutations } from "@/features/tasks/hooks/useTaskMutations";

import { formatDate, formatRelativeTime } from "@/lib/date";
import { projectColorVar } from "@/lib/projectPalette";
import { memoQueryKeys, projectQueryKeys } from "@/lib/queryKeys";

import type { Goal } from "@/features/goals/types/goal";
import type { Memo } from "@/features/memos/types/memo";
import type { Project } from "@/features/projects/types/project";

type ProjectMemosTabProps = {
  project: Project;
  memos: Memo[];
  goals: Goal[];
};

// 이틀 안이면 「n시간 전 · 어제」, 그 뒤는 MM.DD (보드 T 07 「어제」 · 「11.18」)
const memoWhen = (createdAt: string) => {
  const text = formatRelativeTime(createdAt);
  return /^\d{4}\./.test(text) ? formatMonthDot(createdAt.slice(0, 10)) : text;
};

function MemoComposer({ onSave }: { onSave: (title: string) => Promise<unknown> }) {
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
        value={text}
        rows={1}
        aria-label="메모 적기"
        placeholder="이 프로젝트에 대한 생각…"
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

// 새 태스크 id (옛 화면 CreateTaskButton과 같은 방식, 목업 저장)
const createTaskId = () => Date.now();

/**
 * 상세 메모 탭 (보드 07 · 07-a · 07-b · 프로토타입 memosBlock).
 * 「+ 생각 적기」 카드(Enter로 저장) → 메모 카드 3열(사이 16): 글 3줄 · 날짜 + 연결 목표 · ⋯(오른쪽 위 10).
 * 카드를 누르면 그 자리에서 고치고(테두리 --primary), 칸을 벗어나면 바로 저장 · 「저장됨」 (REBUILD 4-3).
 */
export default function ProjectMemosTab({ project, memos, goals }: ProjectMemosTabProps) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: memoQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
    ]);
  const create = useMutation({
    mutationFn: (title: string) => createMemo({ title, body: "", projectId: project.id }),
    onSuccess: refresh,
  });

  return (
    <>
      {/* 웹 (보드 07): 「+ 생각 적기」 한 줄 */}
      <div className="flex items-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] py-2 pr-2 pl-4 max-lg:hidden">
        <QuickAddInput
          variant="row"
          size="sm"
          placeholder={QUICK_ADD_PLACEHOLDER.memo}
          ariaLabel="메모 적기"
          onSubmit={(title) =>
            void create.mutateAsync(title).catch(() => toast(TOAST_TEXT.saveFailed))
          }
        />
      </div>
      {/* 태블릿 · 모바일 (보드 T · M 07): 쓰는 칸 + [저장] */}
      <MemoComposer
        onSave={(title) => create.mutateAsync(title).catch(() => toast(TOAST_TEXT.saveFailed))}
      />
      {memos.length === 0 ? (
        <EmptyState
          icon={<Inbox size={24} />}
          title="아직 메모가 없어요"
          text="위 입력칸에 메모를 추가해 보세요."
        />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-3 lg:gap-4">
          {memos.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              project={project}
              goals={goals}
              onChanged={refresh}
            />
          ))}
        </ul>
      )}
    </>
  );
}

function MemoCard({
  memo,
  project,
  goals,
  onChanged,
}: {
  memo: Memo;
  project: Project;
  goals: Goal[];
  onChanged: () => Promise<unknown>;
}) {
  const toast = useToast();
  const cardRef = useRef<HTMLElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(memo.title);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "failed">("idle");
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const { addGoalAsync } = useGoalMutations();
  const { createTaskMutation } = useTaskMutations(project.id);
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
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
        projectId: project.id,
        title: memo.title.split("\n")[0].slice(0, 40),
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: "",
        createdBy: 0,
        order: 0,
      });
      await registerMemo(memo.id, { kind: "task", targetId: id, projectId: project.id });
      await onChanged();
      toast(TOAST_TEXT.memoToTask);
    } catch (error) {
      toast(error instanceof Error && error.message ? error.message : TOAST_TEXT.saveFailed);
    }
  };

  const toGoal = async () => {
    try {
      const goal = await addGoalAsync({
        projectId: project.id,
        teamId: project.teamId,
        title: memo.title.split("\n")[0].slice(0, 40),
        description: "",
        status: "NOT_STARTED",
        color: project.color,
        icon: "layout",
        tags: [],
        startDate: "",
        endDate: "",
      });
      await registerMemo(memo.id, { kind: "goal", targetId: goal.id, projectId: project.id });
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
          <span className="line-clamp-3 text-sm leading-5.5 [overflow-wrap:anywhere]">
            {memo.title}
          </span>
        )}
        <span className="flex items-center gap-2 text-xs text-[var(--t3)]">
          <span className="max-lg:hidden">{formatDate(memo.createdAt.slice(0, 10))}</span>
          <span className="truncate lg:hidden">
            {linkedGoal?.title ?? "연결 없음"} · {memoWhen(memo.createdAt)}
          </span>
          {linkedGoal ? (
            <span className="inline-flex h-5 min-w-0 items-center gap-1 truncate rounded-full border border-[var(--border)] px-2 text-[var(--t2)] max-lg:hidden">
              <Target size={12} aria-hidden />
              {linkedGoal.title}
            </span>
          ) : null}
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
        width={280}
        align="end"
        role="listbox"
      >
        <div className="flex max-h-80 flex-col overflow-y-auto">
          {projects.map((item) => (
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
