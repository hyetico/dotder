"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import PageHeading from "@/components/layout/pages/Page/PageHeading";
import PageInset from "@/components/layout/pages/Page/PageInset";
import Badge from "@/components/ui/badge/Badge";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import { AppIcon, FileText, Folder } from "@/components/ui/icon";
import SearchInput from "@/components/ui/input/SearchInput";
import { useAlert } from "@/components/ui/modal/AlertModal";
import Select from "@/components/ui/select/Select";

import { createMemo, deleteMemo, readMemos } from "@/features/memos/api/memos";
import MemoArchiveList from "@/features/memos/components/MemoArchiveList";
import { MemoAddCard, MemoCard, MemoComposeCard } from "@/features/memos/components/MemoCards";
import MemoRegisterDrawer from "@/features/memos/components/MemoRegisterDrawer";
import MemosScopeTabs, { type MemosScopeTab } from "@/features/memos/components/MemosScopeTabs";
import { splitMemoText } from "@/features/memos/utils/memoDisplay";
import { getProjects } from "@/features/projects/api/projects";
import SectionHeader from "@/features/projects/components/SectionHeader";

import { mockProjects } from "@/lib/mock/projects";
import {
  getFavoriteMemosPath,
  getMainMemosPath,
  isFavoriteMemosPath,
  isMainMemosPath,
} from "@/lib/projectRoutes";
import {
  getFavoriteProjectIdsServerSnapshot,
  getFavoriteProjectIdsSnapshot,
  subscribeFavoriteProjectIds,
} from "@/lib/projectSwitcherPreferences";
import { memoQueryKeys, projectQueryKeys } from "@/lib/queryKeys";

import type { Memo } from "@/features/memos/types/memo";

const memoPageShellClassName = "min-w-0";
const memoPageFrameClassName = "project-board-width @container";
const memoBodyClassName = "flex min-w-0 flex-col gap-8";
const memoGridClassName = "mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4";
const memoToolbarClassName =
  "grid w-full grid-cols-1 gap-2 @[900px]:flex @[900px]:w-auto @[900px]:flex-wrap @[900px]:items-center @[900px]:justify-end";
const memoSearchWrapClassName = "w-full @[900px]:w-[220px]";
const memoFilterClassName = "w-full @[900px]:w-[180px]";
const memoActionsClassName = "w-full min-w-0 @[900px]:w-auto";
const includeOffClassName = "w-full justify-center @[900px]:w-auto";
const memoCountBadgeClassName =
  "h-6! bg-gray-100 px-2.5! text-sm! text-[var(--color-text-secondary)]";
const includeOnClassName =
  "w-full justify-center border-[var(--color-primary)]! bg-[var(--color-primary-soft)]! text-[var(--color-primary)]! @[900px]:w-auto";
const memoDescription = "생각을 기록하고, 필요할 때 목표나 태스크로 등록하세요.";
const memoHintClassName = "mt-3 text-xs leading-5 text-[var(--color-text-secondary)]";

type MemosPageContentProps = {
  projectId?: number;
};

/**
 * compareMemos
 *
 * 메모를 화면 순서대로 정렬합니다.
 *
 * @param left - 앞에 둘지 비교할 메모
 * @param right - 뒤에 둘지 비교할 메모
 * @returns 정렬 차이
 */
function compareMemos(left: Memo, right: Memo) {
  return left.sortRank - right.sortRank || left.id - right.id;
}

/**
 * MemosPageContent
 *
 * 메모를 빠른 기록과 이전 메모로 나누어 보여 줍니다.
 * 등록한 메모는 기본 목록에서 숨기고, 등록됨 포함에서 다시 보여 줍니다.
 *
 * @param props - MemosPageContent 컴포넌트 Props
 * @param props.projectId - 한 프로젝트 메모만 볼 때 그 프로젝트 번호
 * @returns 메모 목록 화면
 */
export default function MemosPageContent({ projectId }: MemosPageContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { alert, confirm } = useAlert();
  const composeRef = useRef<HTMLTextAreaElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [includeRegistered, setIncludeRegistered] = useState(false);
  const [archiveExpanded, setArchiveExpanded] = useState(false);
  const [registerId, setRegisterId] = useState<number | null>(null);
  const isFixedProject = projectId != null;
  const isFavorites = !isFixedProject && isFavoriteMemosPath(pathname);
  const isMain = !isFixedProject && isMainMemosPath(pathname);
  const scopeTab: MemosScopeTab = isFavorites ? "favorites" : isMain ? "main" : "all";
  const scopeTitle = isFixedProject
    ? "메모"
    : isFavorites
      ? "즐겨찾기 프로젝트 메모"
      : isMain
        ? "메인 프로젝트 메모"
        : "전체 메모";
  const storedFavoriteIds = useSyncExternalStore(
    subscribeFavoriteProjectIds,
    getFavoriteProjectIdsSnapshot,
    getFavoriteProjectIdsServerSnapshot,
  );
  const { data: memos = [] } = useQuery({
    queryKey: memoQueryKeys.all,
    queryFn: readMemos,
    initialData: readMemos,
  });
  const { data: loadedProjects = [], isSuccess: isProjectsReady } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
  const projects = isProjectsReady ? loadedProjects : mockProjects;
  const mainProject = projects.find((project) => project.isMain) ?? null;
  const favoriteProjectIds = useMemo(() => {
    if (storedFavoriteIds == null) {
      return [];
    }

    const mainId = mainProject?.id ?? null;

    return storedFavoriteIds.filter(
      (id) => id !== mainId && projects.some((project) => project.id === id),
    );
  }, [mainProject, projects, storedFavoriteIds]);
  const scopeProjects = projects.filter((project) => {
    if (isFixedProject) {
      return project.id === projectId;
    }

    if (isMain) {
      return project.id === mainProject?.id;
    }

    if (isFavorites) {
      return favoriteProjectIds.includes(project.id);
    }

    return true;
  });
  const fixedProject = isFixedProject
    ? (projects.find((project) => project.id === projectId) ?? null)
    : null;
  const projectMissing = isFixedProject && isProjectsReady && fixedProject == null;
  const keyword = searchQuery.trim().toLowerCase();
  const visibleMemos = memos
    .filter((memo) => {
      if (!includeRegistered && memo.registration) {
        return false;
      }

      if (isFixedProject && memo.projectId !== projectId) {
        return false;
      }

      if (isMain && memo.projectId !== mainProject?.id) {
        return false;
      }

      if (isFavorites && !favoriteProjectIds.includes(memo.projectId ?? -1)) {
        return false;
      }

      if (projectFilter !== "all" && memo.projectId !== Number(projectFilter)) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return `${memo.title} ${memo.body}`.toLowerCase().includes(keyword);
    })
    .sort(compareMemos);
  const quickMemos = visibleMemos.filter((memo) => memo.zone === "quick");
  const archiveMemos = visibleMemos.filter((memo) => memo.zone === "archive");
  const hiddenRegisteredCount = memos.filter((memo) => memo.registration).length;
  const showRegisteredHint =
    !includeRegistered &&
    hiddenRegisteredCount > 0 &&
    quickMemos.length === 0 &&
    archiveMemos.length === 0 &&
    !keyword;
  const composeProjectId = (() => {
    if (isFixedProject) {
      return projectId ?? null;
    }

    if (projectFilter !== "all") {
      return Number(projectFilter);
    }

    if (isMain) {
      return mainProject?.id ?? null;
    }

    if (isFavorites) {
      return favoriteProjectIds[0] ?? null;
    }

    return null;
  })();
  const composeDisabled =
    projectMissing ||
    (isMain && isProjectsReady && mainProject == null) ||
    (isFavorites && isProjectsReady && favoriteProjectIds.length === 0);
  const registerMemo = memos.find((memo) => memo.id === registerId) ?? null;
  const refreshMemos = async () => {
    await queryClient.invalidateQueries({ queryKey: memoQueryKeys.all });
  };
  const create = useMutation({
    mutationFn: createMemo,
    onSuccess: refreshMemos,
    onError: (error: Error) => {
      void alert({
        title: "메모를 저장하지 못했습니다.",
        description: error.message,
      });
    },
  });
  const remove = useMutation({
    mutationFn: deleteMemo,
    onSuccess: refreshMemos,
    onError: (error: Error) => {
      void alert({
        title: "메모를 삭제하지 못했습니다.",
        description: error.message,
      });
    },
  });

  const changeScope = (next: MemosScopeTab) => {
    setProjectFilter("all");
    setArchiveExpanded(false);

    if (next === "favorites") {
      router.push(getFavoriteMemosPath());
      return;
    }

    if (next === "main") {
      router.push(getMainMemosPath());
      return;
    }

    router.push("/memos");
  };

  const saveCompose = (text: string) => {
    const memoText = splitMemoText(text);

    if (!memoText || composeDisabled) {
      return;
    }

    create.mutate({
      title: memoText.title,
      body: memoText.body,
      projectId: composeProjectId,
    });
  };

  const deleteSelectedMemo = async (memo: Memo) => {
    const confirmed = await confirm({
      title: "메모를 삭제할까요?",
      description: "메모만 삭제됩니다. 이미 등록한 목표나 태스크는 그대로 둡니다.",
      confirmLabel: "삭제",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    if (registerId === memo.id) {
      setRegisterId(null);
    }

    remove.mutate(memo.id);
  };

  const projectOptions = [
    { value: "all", label: "전체 프로젝트" },
    ...scopeProjects.map((project) => ({
      value: String(project.id),
      label: project.name,
    })),
  ];
  const toolbar = (
    <div className={memoToolbarClassName}>
      <div className={memoSearchWrapClassName}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="메모 검색"
          ariaLabel="메모 검색"
        />
      </div>
      {isFixedProject ? null : (
        <Select
          size="sm"
          className={memoFilterClassName}
          value={projectFilter}
          options={projectOptions}
          onChange={(value) => {
            setProjectFilter(value);
            setArchiveExpanded(false);
          }}
        />
      )}
      <SecondaryButton
        icon={<AppIcon icon={Folder} size="sm" />}
        aria-pressed={includeRegistered}
        className={includeRegistered ? includeOnClassName : includeOffClassName}
        onClick={() => {
          setIncludeRegistered((current) => !current);
          setArchiveExpanded(false);
        }}
      >
        등록됨 포함
      </SecondaryButton>
    </div>
  );

  return (
    <>
      <div className={memoPageShellClassName}>
        {isFixedProject ? null : <MemosScopeTabs value={scopeTab} onChange={changeScope} />}
        <PageInset>
          <div className={memoPageFrameClassName}>
            <PageHeading title={scopeTitle} description={memoDescription} />
            {projectMissing ? (
              <p className="text-caption text-[var(--color-text-secondary)]">
                프로젝트를 찾을 수 없습니다.
              </p>
            ) : (
              <div className={memoBodyClassName}>
                <section>
                  <SectionHeader
                    icon={<AppIcon icon={FileText} size="md" />}
                    title="빠른 기록"
                    badge={
                      <Badge
                        className={memoCountBadgeClassName}
                        title={`빠른 기록 ${quickMemos.length}개`}
                      >
                        {quickMemos.length}
                      </Badge>
                    }
                    actions={toolbar}
                    actionsClassName={memoActionsClassName}
                  />
                  {isFavorites && isProjectsReady && favoriteProjectIds.length === 0 ? (
                    <p className={memoHintClassName}>즐겨찾기한 프로젝트가 없습니다.</p>
                  ) : null}
                  <div className={memoGridClassName}>
                    <MemoComposeCard
                      inputRef={composeRef}
                      disabled={composeDisabled}
                      onSave={saveCompose}
                    />
                    {quickMemos.map((memo) => (
                      <MemoCard
                        key={memo.id}
                        memo={memo}
                        project={projects.find((project) => project.id === memo.projectId) ?? null}
                        registeredProject={
                          projects.find((project) => project.id === memo.registration?.projectId) ??
                          null
                        }
                        onOpen={(item) => setRegisterId(item.id)}
                        onDelete={(item) => {
                          void deleteSelectedMemo(item);
                        }}
                      />
                    ))}
                    <MemoAddCard
                      disabled={composeDisabled}
                      onClick={() => {
                        composeRef.current?.focus();
                      }}
                    />
                  </div>
                  {showRegisteredHint ? (
                    <p className={memoHintClassName}>
                      등록한 메모는 등록됨 포함에서 다시 볼 수 있습니다.
                    </p>
                  ) : null}
                  {keyword && quickMemos.length === 0 ? (
                    <p className={memoHintClassName}>빠른 기록에서 찾는 메모가 없습니다.</p>
                  ) : null}
                </section>
                <section className="flex flex-col gap-4">
                  <h2 className="text-section-title text-[var(--color-text)]">이전 메모</h2>
                  <MemoArchiveList
                    memos={archiveMemos}
                    projects={projects}
                    expanded={archiveExpanded}
                    onToggle={() => setArchiveExpanded((current) => !current)}
                    onOpen={(memo) => setRegisterId(memo.id)}
                    onDelete={(memo) => {
                      void deleteSelectedMemo(memo);
                    }}
                  />
                </section>
              </div>
            )}
          </div>
        </PageInset>
      </div>
      <MemoRegisterDrawer
        memo={registerMemo}
        isOpen={registerMemo != null}
        projects={projects}
        onClose={() => setRegisterId(null)}
      />
    </>
  );
}
