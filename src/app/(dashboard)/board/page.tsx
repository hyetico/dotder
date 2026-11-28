"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import { getProjects } from "@/features/projects/api/projects";

import { projectQueryKeys } from "@/lib/queryKeys";

// 옛 주소 /board: 메인 프로젝트의 태스크 탭으로, 메인이 없으면 전체 태스크로.
// 메인은 브라우저 저장 데이터라 서버에서 알 수 없어 화면에서 옮긴다
export default function BoardRedirectPage() {
  const router = useRouter();
  const { data: projects } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  useEffect(() => {
    if (!projects) {
      return;
    }
    const main = projects.find((project) => project.isMain);
    router.replace(main ? `/projects/${main.id}?tab=tasks` : "/tasks");
  }, [projects, router]);

  return null;
}
