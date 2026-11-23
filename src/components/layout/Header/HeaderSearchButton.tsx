"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { headerIconButtonClassName } from "@/components/layout/Header/HeaderActions";
import { AppIcon, Search } from "@/components/ui/icon";

import { getGoals } from "@/features/goals/api/goals";
import { getProjects } from "@/features/projects/api/projects";
import IntegratedSearchModal from "@/features/search/modals/IntegratedSearchModal";
import { getTasks } from "@/features/tasks/api/tasks";

import { recordRecentProjectId } from "@/lib/projectSwitcherPreferences";
import { goalQueryKeys, projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

/**
 * HeaderSearchButton
 *
 * 헤더 오른쪽의 검색 아이콘입니다. 누르면 프로젝트·목표·태스크를 한 번에 찾는 통합 검색을 엽니다.
 * 검색 결과를 고르면 해당 화면으로 이동하고, 프로젝트가 있으면 최근 프로젝트에 기록합니다.
 */
export default function HeaderSearchButton() {
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

  const handleNavigate = (href: string, projectId: number | null) => {
    if (projectId != null) {
      recordRecentProjectId(projectId);
    }

    setIsOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        aria-label="통합 검색"
        title="통합 검색"
        onClick={() => setIsOpen(true)}
        className={headerIconButtonClassName()}
      >
        <AppIcon icon={Search} size="md" />
      </button>

      <IntegratedSearchModal
        isOpen={isOpen}
        projects={projects}
        goals={goals}
        tasks={tasks}
        onNavigate={handleNavigate}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
