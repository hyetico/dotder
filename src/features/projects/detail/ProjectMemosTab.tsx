"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import EmptyState from "@/components/ui/EmptyState";
import { Inbox } from "@/components/ui/icon";
import QuickAddInput from "@/components/ui/QuickAddInput";
import { useToast } from "@/components/ui/Toast";

import { QUICK_ADD_PLACEHOLDER, TOAST_TEXT } from "@/content/ui";
import { createMemo } from "@/features/memos/api/memos";
import { MemoCard, MemoComposer } from "@/features/memos/list/MemoParts";

import { memoQueryKeys, projectQueryKeys } from "@/lib/queryKeys";

import type { Goal } from "@/features/goals/types/goal";
import type { Memo } from "@/features/memos/types/memo";
import type { Project } from "@/features/projects/types/project";

type ProjectMemosTabProps = {
  project: Project;
  memos: Memo[];
  goals: Goal[];
};

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
        placeholder="이 프로젝트에 대한 생각…"
        onSave={(title) => create.mutateAsync(title).catch(() => toast(TOAST_TEXT.saveFailed))}
      />
      {memos.length === 0 ? (
        <EmptyState
          icon={<Inbox size={24} />}
          title="아직 메모가 없어요"
          text="위 입력칸에 메모를 추가해 보세요."
        />
      ) : (
        <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3 lg:gap-4">
          {memos.map((memo) => (
            <MemoCard key={memo.id} memo={memo} goals={goals} link="goal" onChanged={refresh} />
          ))}
        </ul>
      )}
    </>
  );
}
