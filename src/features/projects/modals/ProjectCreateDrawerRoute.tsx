"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { useQuery } from "@tanstack/react-query";

import { getProjects } from "@/features/projects/api/projects";
import ProjectCreateDrawer from "@/features/projects/modals/ProjectCreateDrawer";

import { NEW_PROJECT_PARAM } from "@/lib/projectRoutes";
import { projectQueryKeys } from "@/lib/queryKeys";

function ProjectCreateDrawerFromQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get(NEW_PROJECT_PARAM) === "1";

  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(NEW_PROJECT_PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return (
    <ProjectCreateDrawer
      isOpen={isOpen}
      mainProject={projects.find((project) => project.isMain) ?? null}
      onClose={close}
    />
  );
}

/**
 * 주소에 `?new=1`이 있으면 프로젝트 만들기 드로어를 연다 (PRD IA `/projects?new=1`).
 * 닫으면 주소에서 `new`를 뺀다. 프로젝트 목록 화면에 한 번 둔다.
 */
export default function ProjectCreateDrawerRoute() {
  return (
    <Suspense fallback={null}>
      <ProjectCreateDrawerFromQuery />
    </Suspense>
  );
}
