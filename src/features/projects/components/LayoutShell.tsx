"use client";

import { usePathname } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import CreateProjectPrompt from "@/features/projects/components/CreateProjectPrompt";

import { getProjects } from "@/features/projects/api/projects";

import { projectQueryKeys } from "@/lib/queryKeys";

import { isBacklogListPath, isGoalsListPath, isProjectsListPath } from "@/lib/projectRoutes";

type LayoutShellProps = {
  children: React.ReactNode;
};

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const showCreatePage = !isLoading && isProjectsListPath(pathname) && projects.length === 0;

  const page = showCreatePage ? <CreateProjectPrompt /> : children;

  if (!isProjectsListPath(pathname) && !isGoalsListPath(pathname) && !isBacklogListPath(pathname)) {
    return page;
  }

  return <div className="min-h-[calc(100dvh-var(--header-height))] bg-white">{page}</div>;
}
