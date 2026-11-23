"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { HeaderActionLink, HeaderActions } from "@/components/layout/Header/HeaderActions";
import PageHeading from "@/components/layout/pages/Page/PageHeading";
import PageInset from "@/components/layout/pages/Page/PageInset";
import { Plus } from "@/components/ui/icon";

import { getProjectListItems } from "@/features/projects/api/projects";
import ProjectsScopeTabs, {
  type ProjectsScopeTab,
} from "@/features/projects/components/ProjectsScopeTabs";
import MainProjectStatBoxes from "@/features/projects/content/MainProjectStatBoxes";

import { getFavoriteProjectsPath } from "@/lib/projectRoutes";
import { projectQueryKeys } from "@/lib/queryKeys";

const mainProjectsPageShellClassName = "min-w-0";
const mainProjectsPageFrameClassName = "project-board-width @container";

/**
 * MainProjectsPageContent
 *
 * 메인 프로젝트 탭의 범위 탭, 제목, 상태 박스를 표시합니다.
 *
 * @returns 메인 프로젝트 탭 화면
 */
export default function MainProjectsPageContent() {
  const router = useRouter();
  const { data: projects = [], isLoading } = useQuery({
    queryKey: [...projectQueryKeys.all, "list"],
    queryFn: getProjectListItems,
  });
  const mainProject = useMemo(
    () => projects.find((project) => project.isMain) ?? null,
    [projects],
  );
  const mainCount = mainProject ? 1 : 0;

  const changeScope = (next: ProjectsScopeTab) => {
    if (next === "favorites") {
      router.push(getFavoriteProjectsPath());
      return;
    }

    if (next === "main") {
      return;
    }

    router.push("/projects");
  };

  return (
    <>
      <HeaderActions>
        <HeaderActionLink href="/projects/new" label="새 프로젝트" icon={Plus} tone="primary" />
      </HeaderActions>
      <div className={mainProjectsPageShellClassName}>
        <ProjectsScopeTabs
          value="main"
          mainDisabled={!isLoading && mainProject == null}
          onChange={changeScope}
        />
        <PageInset>
          <div className={mainProjectsPageFrameClassName}>
            <PageHeading
              title="메인 프로젝트"
              description="메인 프로젝트를 확인하고 관리하세요."
              count={isLoading ? null : mainCount}
              countTitle={`메인 프로젝트 ${mainCount}개`}
            />
            {mainProject ? <MainProjectStatBoxes project={mainProject} /> : null}
          </div>
        </PageInset>
      </div>
    </>
  );
}
