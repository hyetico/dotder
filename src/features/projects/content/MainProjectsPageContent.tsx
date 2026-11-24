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
import ProjectCreateDrawerRoute from "@/features/projects/modals/ProjectCreateDrawerRoute";
import { computeProjectStats } from "@/features/projects/utils/projectUtils";

import { getFavoriteProjectsPath, getNewProjectPath } from "@/lib/projectRoutes";
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
  const mainProject = useMemo(() => projects.find((project) => project.isMain) ?? null, [projects]);
  // 머리는 전체 · 즐겨찾기 탭과 같다 (ProjectsPageContent). 탭을 바꿔도 위치가 튀지 않게.
  const stats = computeProjectStats(projects);

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
      <ProjectCreateDrawerRoute />
      <HeaderActions>
        <HeaderActionLink href={getNewProjectPath()} label="추가" icon={Plus} tone="primary" />
      </HeaderActions>
      <div className={mainProjectsPageShellClassName}>
        <PageInset>
          <div className={mainProjectsPageFrameClassName}>
            <PageHeading
              title="프로젝트"
              description={
                isLoading ? null : (
                  <>
                    {stats.total}개 중 {stats.inProgress}개 진행 중
                    {stats.delayed > 0 ? (
                      <>
                        {" · "}
                        <span className="text-[var(--color-danger-text)]">
                          {stats.delayed}개 마감 지남
                        </span>
                      </>
                    ) : null}
                  </>
                )
              }
            />
            <ProjectsScopeTabs
              placement="page"
              value="main"
              mainDisabled={!isLoading && mainProject == null}
              onChange={changeScope}
            />
            {mainProject ? <MainProjectStatBoxes project={mainProject} /> : null}
          </div>
        </PageInset>
      </div>
    </>
  );
}
