"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import ConfirmDialog from "@/components/kit/ConfirmDialog";
import { useToast } from "@/components/kit/Toast";

import { TOAST_TEXT } from "@/content/ui";

import { toDateKey } from "@/lib/date";
import { clearProjectPreferences } from "@/lib/projectSwitcherPreferences";
import { clearAllData, exportData } from "@/lib/storage/dotderData";
import { setMode } from "@/lib/storage/dotderMode";

type Counts = { projects: number; goals: number; tasks: number; memos: number };

/**
 * 설정 → 데이터의 「내보내기」 · 「모두 지우기」 동작과 지우기 확인창.
 *
 * @returns `exportJson` · `requestClear`와 화면에 함께 그릴 `dialog`
 */
export function useDataActions() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [counts, setCounts] = useState<Counts | null>(null);

  const exportJson = async () => {
    const data = await exportData();
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `dotder-${toDateKey(new Date())}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const requestClear = async () => {
    const data = await exportData();
    setCounts({
      projects: data.projects.length,
      goals: data.goals.length,
      tasks: data.tasks.length,
      memos: data.memos.length,
    });
  };

  const confirmClear = async () => {
    setCounts(null);
    // 지우는 것은 내 기록 (예시를 보던 중이어도 내 기록으로 돌아온다)
    setMode("mine");
    await clearAllData();
    clearProjectPreferences();
    await queryClient.invalidateQueries();
    toast(TOAST_TEXT.allCleared);
    // 첫 화면으로 (저장된 내 기록이 없으니 [시작하기] · 예시로 둘러보기를 누르면 예시가 다시 보인다)
    router.push("/");
  };

  // 문구는 프로토타입 wipe (설정 12)
  const dialog = (
    <ConfirmDialog
      isOpen={counts != null}
      onClose={() => setCounts(null)}
      onConfirm={() => void confirmClear()}
      tone="danger"
      title="모든 데이터를 삭제할까요?"
      text={
        counts
          ? `프로젝트 ${counts.projects}개 · 목표 ${counts.goals}개 · 태스크 ${counts.tasks}개 · 메모 ${counts.memos}개가 이 기기에서 지워져요. 되돌릴 수 없어요.`
          : undefined
      }
      confirmLabel="모두 지우기"
    />
  );

  return { exportJson, requestClear, dialog };
}
