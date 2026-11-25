"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import { Search } from "@/components/ui/icon";

import { getGoals } from "@/features/goals/api/goals";
import { getProjects } from "@/features/projects/api/projects";
import IntegratedSearchModal from "@/features/search/modals/IntegratedSearchModal";
import { getTasks } from "@/features/tasks/api/tasks";

import { recordRecentProjectId } from "@/lib/projectSwitcherPreferences";
import { goalQueryKeys, projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

/**
 * 헤더 검색 (보드 01 헤더). 웹: secondary sm 200 「검색」 + ⌘K, 태블릿 · 모바일: 아이콘 ghost sm.
 * ⌘K / Ctrl+K로도 연다. 통합 검색 창 자체(01-e · 01-f)는 아직 옛 화면을 쓴다 (3번 묶음 뒤에 바꿈).
 */
export default function ShellSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* 보조 버튼 sm 모양이지만 글은 --t3 · 왼쪽 정렬 · 폭 200 (보드 01) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="kit-focus inline-flex h-[var(--btn-h-sm)] w-50 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-[var(--btn-px-sm)] text-sm font-medium text-[var(--t3)] transition-colors hover:border-[var(--btn-secondary-line-h)] hover:bg-[var(--s2)] max-lg:hidden"
      >
        <Search size={16} aria-hidden />
        검색
      </button>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label="검색"
        onClick={() => setIsOpen(true)}
        className="lg:hidden"
      >
        <Search size={18} aria-hidden />
      </Button>
      <IntegratedSearchModal
        isOpen={isOpen}
        projects={projects}
        goals={goals}
        tasks={tasks}
        onNavigate={(href, projectId) => {
          if (projectId != null) {
            recordRecentProjectId(projectId);
          }

          setIsOpen(false);
          router.push(href);
        }}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
