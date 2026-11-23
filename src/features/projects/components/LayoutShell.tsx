"use client";

import { usePathname } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { getProjects } from "@/features/projects/api/projects";
import CreateProjectPrompt from "@/features/projects/components/CreateProjectPrompt";

import { isMemosListPath, isGoalsListPath, isProjectsListPath } from "@/lib/projectRoutes";
import { projectQueryKeys } from "@/lib/queryKeys";

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

  if (!isProjectsListPath(pathname) && !isGoalsListPath(pathname) && !isMemosListPath(pathname)) {
    return page;
  }

  return <div className="min-h-[calc(100dvh-var(--header-height))] bg-white">{page}</div>;
}
