"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import DrawerFavoriteRow from "@/components/layout/Sidebar/drawers/SidebarDrawer/comp/DrawerFavoriteRow";
import DrawerRecentCard from "@/components/layout/Sidebar/drawers/SidebarDrawer/comp/DrawerRecentCard";
import Badge from "@/components/ui/badge/Badge";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import { AppIcon, Clock, Crown, Star, type LucideIcon } from "@/components/ui/icon";
import InfoTooltip from "@/components/ui/InfoTooltip";
import SearchInput from "@/components/ui/input/SearchInput";
import Modal, { modalSidePaddingClassName } from "@/components/ui/modal/Modal";
import LineTabMenu, { type TabMenuItem } from "@/components/ui/tab/LineTabMenu";

import { getGoals } from "@/features/goals/api/goals";
import { clearMainProject, setMainProject } from "@/features/projects/api/projects";
import ProjectBoardCard from "@/features/projects/components/ProjectBoardCard";
import FavoriteProjectsModal from "@/features/projects/modals/FavoriteProjectsModal";
import MainProjectModal from "@/features/projects/modals/MainProjectModal";
import {
  computeProjectTaskStats,
  enrichProject,
  resolveProjectProgress,
} from "@/features/projects/utils/projectUtils";
import { getTasks } from "@/features/tasks/api/tasks";

import { useIsClient } from "@/hooks/useIsClient";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { type ProjectScope } from "@/lib/projectRoutes";
import {
  getFavoriteProjectIds,
  getRecentProjectEntries,
  recordRecentProjectId,
  MAX_FAVORITES,
  setFavoriteProjectIds,
  toggleFavoriteProjectId,
  type RecentProjectEntry,
} from "@/lib/projectSwitcherPreferences";
import { goalQueryKeys, projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

import type { Project, ProjectListItem } from "@/features/projects/types/project";

type ProjectFilterTab = "main" | "favorites" | "recent";

type SidebarDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  selectedProjectScope: ProjectScope;
  onProjectChange: (scope: ProjectScope) => void;
};

const filterTabs: TabMenuItem<ProjectFilterTab>[] = [
  {
    id: "main",
    label: "메인",
    icon: Crown,
  },
  {
    id: "favorites",
    label: "즐겨찾기",
    icon: Star,
  },
  {
    id: "recent",
    label: "최근",
    icon: Clock,
  },
];

type DrawerSectionHeadingProps = {
  icon: LucideIcon;
  title: string;
  countLabel?: string;
  description?: string;
  iconClassName?: string;
  info?: ReactNode;
  action?: ReactNode;
};

/**
 * DrawerSectionHeading
 *
 * 드로어 구역의 아이콘, 제목, 개수, 오른쪽 버튼을 한 줄로 표시합니다.
 * 버튼이 있든 없든 제목 줄 높이가 같아서 구역마다 제목 위치가 어긋나지 않습니다.
 *
 * @param props - DrawerSectionHeading 컴포넌트 Props
 * @param props.icon - 제목 왼쪽 아이콘
 * @param props.title - 구역 제목
 * @param props.countLabel - 제목 옆에 붙일 개수 문구. 없으면 생략합니다
 * @param props.description - 제목 아래 설명. 없으면 생략합니다
 * @param props.iconClassName - 아이콘에 더할 클래스
 * @param props.info - 제목 옆에 두는 설명
 * @param props.action - 제목 줄 오른쪽에 두는 버튼
 */
function DrawerSectionHeading({
  icon,
  title,
  countLabel,
  description,
  iconClassName = "text-[var(--color-text)]",
  info,
  action,
}: DrawerSectionHeadingProps) {
  return (
    <div>
      <div className="flex h-[var(--button-height-title)] items-center gap-1.5">
        <AppIcon icon={icon} size="sm" className={`shrink-0 ${iconClassName}`} />
        <h3 className="text-card-title min-w-0 truncate text-[var(--color-text)]">{title}</h3>
        {countLabel ? (
          <span className="text-caption shrink-0 font-medium text-[var(--color-text-secondary)]">
            {countLabel}
          </span>
        ) : null}
        {info}
        {action ? <div className="ml-auto flex shrink-0 items-center gap-2">{action}</div> : null}
      </div>
      {description ? (
        <p className="text-caption text-[var(--color-text-secondary)]">{description}</p>
      ) : null}
    </div>
  );
}

type MainProjectPanelProps = {
  project: ProjectListItem | null;
  hasProjects: boolean;
  onOpen?: () => void;
  onSelect?: () => void;
};

/**
 * MainProjectPanel
 *
 * 메인 프로젝트가 없으면 안내와 지정 버튼을, 있으면 모바일 프로젝트 목록과 같은 보드 카드를 보여 줍니다.
 *
 * @param props - MainProjectPanel 컴포넌트 Props
 * @param props.project - 현재 메인 프로젝트. 없으면 null
 * @param props.hasProjects - 고를 수 있는 프로젝트가 있는지 여부
 * @param props.onOpen - 메인 프로젝트 카드를 열 때 실행되는 함수
 * @param props.onSelect - 메인 프로젝트를 정하는 모달을 열 때 실행되는 함수
 */
function MainProjectPanel({ project, hasProjects, onOpen, onSelect }: MainProjectPanelProps) {
  if (!project) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)] px-5 py-8 text-center">
        <AppIcon icon={Crown} size="xl" className="mx-auto text-[var(--color-text-secondary)]" />
        <p className="text-body mt-4 font-semibold! text-[var(--color-text)]">
          아직 메인 프로젝트가 설정되지 않았습니다.
        </p>
        <p className="text-caption mx-auto mt-1.5 max-w-[18rem] text-[var(--color-text-secondary)]">
          {hasProjects
            ? "자주 사용하는 프로젝트를 메인으로 설정하여 빠르게 확인하고 관리할 수 있습니다."
            : "프로젝트를 만든 뒤 메인 프로젝트로 설정해주세요."}
        </p>
        {hasProjects && onSelect ? (
          <PrimaryButton size="modal" className="mt-4" onClick={onSelect}>
            메인 프로젝트 정하기
          </PrimaryButton>
        ) : null}
      </div>
    );
  }

  return <ProjectBoardCard project={project} onClick={onOpen} />;
}

type ProjectListBlockProps = {
  projects: Project[];
  progressById: Map<number, number>;
  favoriteIds: number[];
  emptyLabel: string;
  showFavorite?: boolean;
  allowFavorite?: boolean;
  onOpen: (projectId: number) => void;
  onToggleFavorite: (projectId: number) => void;
};

/**
 * ProjectListBlock
 *
 * 즐겨찾기나 검색 결과를 진행률 행으로 나열합니다.
 *
 * @param props - ProjectListBlock 컴포넌트 Props
 * @param props.projects - 표시할 프로젝트 목록
 * @param props.progressById - 프로젝트 아이디별 진행률
 * @param props.favoriteIds - 즐겨찾기된 프로젝트 아이디
 * @param props.emptyLabel - 목록이 비었을 때 보여줄 문구
 * @param props.showFavorite - 즐겨찾기 버튼을 항상 보일지 여부
 * @param props.allowFavorite - 즐겨찾기 버튼을 둘지 여부
 * @param props.onOpen - 프로젝트를 열 때 실행되는 함수
 * @param props.onToggleFavorite - 즐겨찾기를 바꿀 때 실행되는 함수
 */
function ProjectListBlock({
  projects,
  progressById,
  favoriteIds,
  emptyLabel,
  showFavorite = false,
  allowFavorite = false,
  onOpen,
  onToggleFavorite,
}: ProjectListBlockProps) {
  if (projects.length === 0) {
    return (
      <p className="text-caption px-1 py-6 text-center text-[var(--color-text-secondary)]">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div>
      {projects.map((project) => (
        <DrawerFavoriteRow
          key={project.id}
          project={project}
          progress={progressById.get(project.id) ?? 0}
          isFavorite={favoriteIds.includes(project.id)}
          showFavorite={showFavorite}
          onOpen={() => onOpen(project.id)}
          onToggleFavorite={allowFavorite ? () => onToggleFavorite(project.id) : undefined}
        />
      ))}
    </div>
  );
}

function withoutMainProject(projectIds: number[], mainProjectId: number | null) {
  return mainProjectId == null ? projectIds : projectIds.filter((id) => id !== mainProjectId);
}

export default function SidebarDrawer({ isOpen, onClose, projects }: SidebarDrawerProps) {
  const pathname = usePathname();

  const queryClient = useQueryClient();

  const setScrollRoot = useModalScrollLock(isOpen);

  const [activeTab, setActiveTab] = useState<ProjectFilterTab>("main");

  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const [recentEntries, setRecentEntries] = useState<RecentProjectEntry[]>([]);

  const isClient = useIsClient();

  const [isMainOpen, setIsMainOpen] = useState(false);

  const [isFavoriteManageOpen, setIsFavoriteManageOpen] = useState(false);

  const [favoriteQuery, setFavoriteQuery] = useState("");

  const { data: tasks = [] } = useQuery({
    queryKey: taskQueryKeys.list("all"),
    queryFn: () => getTasks("all"),
    enabled: isOpen,
  });

  const { data: goals = [] } = useQuery({
    queryKey: goalQueryKeys.list("all"),
    queryFn: () => getGoals("all"),
    enabled: isOpen,
  });

  const previousPathname = useRef(pathname);

  // 열린 채로 다른 페이지로 이동하면 닫는다.
  useEffect(() => {
    if (pathname === previousPathname.current) {
      return;
    }

    previousPathname.current = pathname;

    if (isOpen) {
      onClose();
    }
  }, [pathname, isOpen, onClose]);

  const mainProjectId = projects.find((project) => project.isMain)?.id ?? null;

  // 드로어가 열리는 순간에 저장된 즐겨찾기·최근 목록을 다시 읽고 화면 상태를 처음으로 돌린다.
  const [wasOpen, setWasOpen] = useState(false);

  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);

    if (isOpen) {
      setFavoriteIds(withoutMainProject(getFavoriteProjectIds(), mainProjectId));
      setRecentEntries(getRecentProjectEntries());
      setActiveTab("main");
      setIsMainOpen(false);
      setIsFavoriteManageOpen(false);
      setFavoriteQuery("");
    }
  }

  // 메인 프로젝트가 즐겨찾기에 남아 있으면 저장값에서도 뺀다.
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const storedFavoriteIds = getFavoriteProjectIds();
    const nextFavoriteIds = withoutMainProject(storedFavoriteIds, mainProjectId);

    if (nextFavoriteIds.length !== storedFavoriteIds.length) {
      setFavoriteProjectIds(nextFavoriteIds);
    }
  }, [isOpen, mainProjectId]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented) {
        return;
      }

      if (isMainOpen || isFavoriteManageOpen) {
        return;
      }

      onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, isMainOpen, isFavoriteManageOpen, onClose]);

  const progressById = useMemo(() => {
    const map = new Map<number, number>();

    projects.forEach((project) => {
      const stats = computeProjectTaskStats(project.id, tasks);

      map.set(project.id, resolveProjectProgress(project.status, stats.calculatedProgress));
    });

    return map;
  }, [projects, tasks]);

  const favoriteProjects = useMemo(
    () => projects.filter((project) => !project.isMain && favoriteIds.includes(project.id)),
    [projects, favoriteIds],
  );

  const filteredFavoriteProjects = useMemo(() => {
    const normalized = favoriteQuery.trim().toLowerCase();

    if (!normalized) {
      return favoriteProjects;
    }

    return favoriteProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(normalized) ||
        project.description.toLowerCase().includes(normalized),
    );
  }, [favoriteProjects, favoriteQuery]);

  const recentProjects = useMemo(
    () =>
      recentEntries
        .map((entry) => {
          const project = projects.find((item) => item.id === entry.id);

          if (!project) {
            return null;
          }

          return {
            project,
            openedAt: entry.openedAt,
          };
        })
        .filter(
          (
            item,
          ): item is {
            project: Project;
            openedAt: string;
          } => item !== null,
        ),
    [recentEntries, projects],
  );

  const mainProject = useMemo(() => {
    const project = projects.find((item) => item.isMain) ?? null;

    if (!project) {
      return null;
    }

    return enrichProject(project, tasks, goals);
  }, [projects, tasks, goals]);

  const handleOpenProject = (projectId: number) => {
    recordRecentProjectId(projectId);
    setRecentEntries(getRecentProjectEntries());
    onClose();
  };

  const handleToggleFavorite = (projectId: number) => {
    const project = projects.find((item) => item.id === projectId);

    if (project?.isMain) {
      return;
    }

    toggleFavoriteProjectId(projectId);
    setFavoriteIds(getFavoriteProjectIds());
  };

  const handleApplyMain = async (projectId: number | null) => {
    if (projectId == null) {
      await clearMainProject();
    } else {
      await setMainProject(projectId);

      if (getFavoriteProjectIds().includes(projectId)) {
        setFavoriteProjectIds(getFavoriteProjectIds().filter((id) => id !== projectId));
        setFavoriteIds(getFavoriteProjectIds());
      }
    }

    await queryClient.invalidateQueries({
      queryKey: projectQueryKeys.all,
    });
  };

  const handleApplyFavorites = (projectIds: number[]) => {
    const mainId = projects.find((project) => project.isMain)?.id ?? null;

    setFavoriteProjectIds(mainId == null ? projectIds : projectIds.filter((id) => id !== mainId));
    setFavoriteIds(getFavoriteProjectIds());
  };

  if (!isClient || !isOpen) {
    return null;
  }

  let body: ReactNode;

  if (activeTab === "favorites") {
    body = (
      <section>
        <DrawerSectionHeading
          icon={Star}
          title="즐겨찾기 프로젝트"
          info={
            <Badge size="sm" className="bg-gray-100 font-medium text-[var(--color-text-secondary)]">
              {favoriteProjects.length}/{MAX_FAVORITES}
            </Badge>
          }
          action={
            <SecondaryButton size="title" onClick={() => setIsFavoriteManageOpen(true)}>
              관리
            </SecondaryButton>
          }
          description={`메인 프로젝트를 제외하고 최대 ${MAX_FAVORITES}개까지 추가할 수 있어요.`}
        />

        <SearchInput
          value={favoriteQuery}
          onChange={setFavoriteQuery}
          placeholder="즐겨찾기 프로젝트 검색..."
          ariaLabel="즐겨찾기 프로젝트 검색"
          className="mt-2"
        />

        <div className="mt-2">
          <ProjectListBlock
            projects={filteredFavoriteProjects}
            progressById={progressById}
            favoriteIds={favoriteIds}
            emptyLabel={
              favoriteQuery.trim() ? "검색 결과가 없습니다." : "즐겨찾는 프로젝트가 없습니다."
            }
            showFavorite
            allowFavorite
            onOpen={handleOpenProject}
            onToggleFavorite={handleToggleFavorite}
          />
        </div>
      </section>
    );
  } else if (activeTab === "recent") {
    body = (
      <section>
        <DrawerSectionHeading
          icon={Clock}
          title="최근 프로젝트"
          description="최근에 열어본 프로젝트를 최대 10개까지 자동으로 보여줘요."
          info={
            <InfoTooltip
              title="최근 프로젝트"
              description="최근에 연 프로젝트를 상대 시간으로 다시 확인할 수 있습니다."
              label="최근 프로젝트 설명"
            />
          }
        />
        {recentProjects.length === 0 ? (
          <p className="text-caption px-1 py-6 text-center text-[var(--color-text-secondary)]">
            최근 프로젝트가 없습니다.
          </p>
        ) : (
          <div className="mt-2">
            {recentProjects.map(({ project, openedAt }) => (
              <DrawerRecentCard
                key={project.id}
                project={project}
                openedAt={openedAt}
                isFavorite={favoriteIds.includes(project.id)}
                onOpen={() => handleOpenProject(project.id)}
                onToggleFavorite={() => handleToggleFavorite(project.id)}
              />
            ))}
          </div>
        )}
      </section>
    );
  } else {
    body = (
      <section>
        <DrawerSectionHeading
          icon={Crown}
          title="메인 프로젝트"
          info={
            <InfoTooltip
              title="메인 프로젝트"
              description="자주 사용하는 프로젝트를 메인으로 지정하면 사이드 메뉴에서 바로 열고 관리할 수 있습니다."
              label="메인 프로젝트 설명"
            />
          }
          action={
            mainProject ? (
              <SecondaryButton size="title" onClick={() => setIsMainOpen(true)}>
                변경
              </SecondaryButton>
            ) : null
          }
        />

        <div className="mt-1">
          <MainProjectPanel
            project={mainProject}
            hasProjects={projects.length > 0}
            onOpen={mainProject ? () => handleOpenProject(mainProject.id) : undefined}
            onSelect={() => setIsMainOpen(true)}
          />
        </div>
      </section>
    );
  }

  return createPortal(
    <div ref={setScrollRoot} className="fixed inset-0 z-[120]" role="presentation">
      <button
        type="button"
        aria-label="내 프로젝트 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/20 transition-opacity duration-300"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="내 프로젝트"
        className="absolute top-0 right-0 flex h-full w-[min(100vw,480px)] flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-dropdown)] transition-transform duration-300 ease-out"
      >
        <Modal.Header
          title="내 프로젝트"
          description="메인 프로젝트를 정하고, 즐겨찾기와 최근 프로젝트로 빠르게 이동하세요."
          onClose={onClose}
          closeLabel="내 프로젝트 닫기"
        />

        <LineTabMenu
          className={`shrink-0 ${modalSidePaddingClassName} `}
          ariaLabel="내 프로젝트 구역"
          value={activeTab}
          items={filterTabs}
          onChange={setActiveTab}
        />

        <Modal.Body className="flex-1 overscroll-none">{body}</Modal.Body>
      </aside>

      <MainProjectModal
        isOpen={isMainOpen}
        projects={projects}
        mainProjectId={mainProject?.id ?? null}
        onApply={handleApplyMain}
        onClose={() => setIsMainOpen(false)}
      />
      <FavoriteProjectsModal
        isOpen={isFavoriteManageOpen}
        projects={projects}
        favoriteIds={favoriteIds}
        onApply={handleApplyFavorites}
        onClose={() => setIsFavoriteManageOpen(false)}
      />
    </div>,
    document.body,
  );
}
