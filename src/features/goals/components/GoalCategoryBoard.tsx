"use client";

import { useMemo, useState, type ReactNode } from "react";

import Badge from "@/components/ui/badge/Badge";
import { AppIcon, Check, iconSize, Plus, Tag, Target } from "@/components/ui/icon";
import SearchInput from "@/components/ui/input/SearchInput";
import StatusFilterBar from "@/components/ui/StatusFilterBar";

import GoalBoardList from "@/features/goals/components/GoalBoardList";
import GoalStatusIcon from "@/features/goals/components/GoalStatusIcon";
import { isGoalShownDelayed } from "@/features/goals/utils/goalProjectDelay";
import { getGoalStatusLabel } from "@/features/goals/utils/goalUtils";
import HoldAddNotice from "@/features/projects/components/HoldAddNotice";

import type { StatusFilterChipItem } from "@/components/ui/StatusFilterChips";
import type { Goal } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";

type GoalBoardFilter = "all" | "IN_PROGRESS" | "COMPLETED" | "NOT_STARTED" | "DELAYED";

type GoalCategoryBoardProps = {
  goals: Goal[];
  projects: Project[];
  showProject?: boolean;
  showPopularTags?: boolean;
  holdNotice?: boolean;
  banner?: ReactNode;
  emptyLabel?: string;
  onSelectGoal: (goal: Goal) => void;
  selectedGoalId?: number | null;
  draftGoal?: Goal | null;
};

type PopularGoalTag = {
  tag: string;
  count: number;
};

const goalToolbarClassName = "flex min-w-0 flex-col gap-4 @[900px]:col-start-1";
const goalListSectionClassName =
  "@container min-w-0 space-y-4 border-t border-[var(--color-border)] pt-5 @[900px]:col-span-2";
const popularTagLimit = 5;
const popularTagTitleClassName =
  "inline-flex h-8 shrink-0 items-center gap-1.5 text-xs leading-none font-semibold text-[var(--color-text)]";
const popularTagRowClassName =
  "flex min-w-0 flex-1 items-center gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const popularTagButtonClassName =
  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-2 rounded-[8px] border px-2.5 text-xs! leading-none! font-semibold! text-[var(--color-text)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";
const popularTagCountClassName =
  "text-xs leading-none font-medium text-[var(--color-text-muted)] tabular-nums";
const popularTagMoreClassName =
  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-[8px] border border-[var(--color-border)] bg-white px-2.5 text-xs! leading-none! font-semibold! text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";
const popularTagResetClassName =
  "ml-auto shrink-0 cursor-pointer text-xs! leading-none! font-medium! text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]";

/**
 * matchesStatusFilter
 *
 * 목표가 고른 상태 필터에 들어가는지 확인합니다.
 *
 * @param goal - 확인할 목표
 * @param projects - 지연 판단에 쓰는 프로젝트
 * @param statusFilter - 고른 상태
 * @returns 목록에 남기면 true
 */
function matchesStatusFilter(goal: Goal, projects: Project[], statusFilter: GoalBoardFilter) {
  const delayed = isGoalShownDelayed(goal, projects);

  if (statusFilter === "all") {
    return true;
  }

  if (statusFilter === "DELAYED") {
    return delayed;
  }

  return goal.status === statusFilter;
}

/**
 * matchesGoalQuery
 *
 * 목표가 검색어에 맞는지 확인합니다.
 *
 * @param goal - 확인할 목표
 * @param query - 소문자로 맞춘 검색어
 * @param projectName - 프로젝트 id와 이름
 * @returns 목록에 남기면 true
 */
function matchesGoalQuery(goal: Goal, query: string, projectName: Map<number, string>) {
  if (!query) {
    return true;
  }

  const projectLabel = goal.projectId == null ? "" : (projectName.get(goal.projectId) ?? "");

  return (
    goal.title.toLowerCase().includes(query) ||
    goal.description.toLowerCase().includes(query) ||
    projectLabel.toLowerCase().includes(query) ||
    goal.tags.some((tag) => tag.toLowerCase().includes(query))
  );
}

/**
 * matchesTagFilter
 *
 * 목표가 고른 태그 중 하나라도 가지고 있는지 확인합니다.
 *
 * @param goal - 확인할 목표
 * @param tags - 고른 태그. 없으면 모두 통과
 * @returns 목록에 남기면 true
 */
function matchesTagFilter(goal: Goal, tags: string[]) {
  if (tags.length === 0) {
    return true;
  }

  return tags.some((tag) => goal.tags.some((item) => item.trim() === tag));
}

/**
 * getPopularGoalTags
 *
 * 목표에 붙은 태그를 많이 쓰인 순으로 셉니다.
 * 개수가 같으면 이름 순으로 둡니다.
 *
 * @param goals - 태그를 셀 목표
 * @returns 많이 쓰인 태그
 */
function getPopularGoalTags(goals: Goal[]) {
  const counts = new Map<string, number>();

  for (const goal of goals) {
    const seen = new Set<string>();

    for (const tag of goal.tags) {
      const name = tag.trim();

      if (!name || seen.has(name)) {
        continue;
      }

      seen.add(name);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count;
      }

      return left.tag.localeCompare(right.tag, "ko");
    });
}

/**
 * popularTagButtonClass
 *
 * 태그 칩이 선택됐을 때와 아닐 때의 클래스를 한 줄로 합칩니다.
 *
 * @param selected - 이 태그가 선택됐는지 여부
 * @returns 태그 칩 클래스
 */
function popularTagButtonClass(selected: boolean) {
  return [
    popularTagButtonClassName,
    selected
      ? "border-transparent bg-[var(--color-hover)]"
      : "border-[var(--color-border)] bg-white hover:bg-[var(--color-hover-soft)]",
  ].join(" ");
}

/**
 * GoalPopularTags
 *
 * 많이 쓰인 태그를 골라 목표 목록을 좁힙니다.
 * 여러 태그를 함께 고를 수 있고, 고른 태그에는 체크가 붙습니다.
 *
 * @param props - GoalPopularTags 컴포넌트 Props
 * @param props.tags - 많이 쓰인 순서로 보여줄 태그
 * @param props.value - 지금 고른 태그
 * @param props.onChange - 고른 태그가 바뀔 때 실행되는 함수
 */
function GoalPopularTags({
  tags,
  value,
  onChange,
}: {
  tags: PopularGoalTag[];
  value: string[];
  onChange: (tags: string[]) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (tags.length === 0) {
    return null;
  }

  const selected = new Set(value);
  const collapsed = tags.slice(0, popularTagLimit);
  const visible = expanded
    ? tags
    : [
        ...collapsed,
        ...tags.filter(
          (item) => selected.has(item.tag) && !collapsed.some((chip) => chip.tag === item.tag),
        ),
      ];
  const hasMore = tags.length > popularTagLimit;

  return (
    <div className="flex min-w-0 items-center gap-4">
      <span className={popularTagTitleClassName}>
        <AppIcon icon={Tag} size="sm" />
        태그
      </span>
      <div role="group" aria-label="많이 쓴 태그" className={popularTagRowClassName}>
        {visible.map((item) => {
          const pressed = selected.has(item.tag);

          return (
            <button
              key={item.tag}
              type="button"
              aria-pressed={pressed}
              onClick={() =>
                onChange(pressed ? value.filter((tag) => tag !== item.tag) : [...value, item.tag])
              }
              className={popularTagButtonClass(pressed)}
            >
              {pressed ? <AppIcon icon={Check} size="xs" /> : null}
              {item.tag}
              <span className={popularTagCountClassName}>{item.count}</span>
            </button>
          );
        })}
        {hasMore ? (
          <button
            type="button"
            aria-expanded={expanded}
            onClick={() => setExpanded((open) => !open)}
            className={popularTagMoreClassName}
          >
            {expanded ? (
              "접기"
            ) : (
              <>
                <AppIcon icon={Plus} size="xs" />더 보기
              </>
            )}
          </button>
        ) : null}
      </div>
      {value.length > 0 ? (
        <button type="button" onClick={() => onChange([])} className={popularTagResetClassName}>
          초기화
        </button>
      ) : null}
    </div>
  );
}

/**
 * sortGoals
 *
 * 목표를 마감일이 빠른 순으로 정렬합니다.
 *
 * @param goals - 정렬할 목표
 * @returns 정렬된 목표
 */
function sortGoals(goals: Goal[]) {
  return [...goals].sort((left, right) => {
    const byDate = left.endDate.localeCompare(right.endDate);

    if (byDate !== 0) {
      return byDate;
    }

    return left.id - right.id;
  });
}

/**
 * GoalCategoryBoard
 *
 * 목표를 검색, 상태 필터, 카드 그리드로 표시합니다.
 * 넓은 화면은 상태 칩과 필터 아이콘을 한 알약에 두고, 좁은 화면은 필터 아이콘과 현재 상태를 한 알약에 둡니다.
 *
 * @param props - GoalCategoryBoard 컴포넌트 Props
 * @param props.goals - 표시할 목표
 * @param props.projects - 지연과 프로젝트 이름에 쓰는 프로젝트
 * @param props.showProject - 목표명 아래에 프로젝트 이름을 보여줄지
 * @param props.showPopularTags - 상태 필터 아래에 많이 쓴 태그를 보여줄지
 * @param props.holdNotice - 보류 중이라 목표를 추가할 수 없을 때 안내를 보여줄지
 * @param props.emptyLabel - 목표가 없을 때 보여 주는 문구
 * @param props.onSelectGoal - 목표 카드를 눌렀을 때 실행되는 함수
 * @param props.selectedGoalId - 선택 테두리를 둘 목표 번호
 * @param props.draftGoal - 작성 중이라 목록 앞에 보여주는 목표
 */
export default function GoalCategoryBoard({
  goals,
  projects,
  showProject = false,
  showPopularTags = false,
  holdNotice = false,
  banner = null,
  emptyLabel = "등록된 목표가 없습니다.",
  onSelectGoal,
  selectedGoalId = null,
  draftGoal = null,
}: GoalCategoryBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<GoalBoardFilter>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const projectName = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project.name]));
  }, [projects]);

  const searchedGoals = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return goals.filter((goal) => matchesGoalQuery(goal, query, projectName));
  }, [goals, projectName, searchQuery]);

  const counts = useMemo(
    () => ({
      all: searchedGoals.length,
      notStarted: searchedGoals.filter((goal) => matchesStatusFilter(goal, projects, "NOT_STARTED"))
        .length,
      inProgress: searchedGoals.filter((goal) => matchesStatusFilter(goal, projects, "IN_PROGRESS"))
        .length,
      completed: searchedGoals.filter((goal) => matchesStatusFilter(goal, projects, "COMPLETED"))
        .length,
      delayed: searchedGoals.filter((goal) => matchesStatusFilter(goal, projects, "DELAYED"))
        .length,
    }),
    [projects, searchedGoals],
  );

  const filterItems: StatusFilterChipItem<GoalBoardFilter>[] = [
    {
      id: "all",
      label: "전체",
      count: counts.all,
      iconColor: "var(--color-text-muted)",
      icon: <AppIcon icon={Target} size="sm" />,
    },
    {
      id: "NOT_STARTED",
      label: getGoalStatusLabel("NOT_STARTED"),
      count: counts.notStarted,
      iconColor: "var(--color-neutral-text)",
      icon: <GoalStatusIcon status="NOT_STARTED" size={iconSize.sm} />,
    },
    {
      id: "IN_PROGRESS",
      label: getGoalStatusLabel("IN_PROGRESS"),
      count: counts.inProgress,
      iconColor: "var(--color-info-text)",
      icon: <GoalStatusIcon status="IN_PROGRESS" size={iconSize.sm} />,
    },
    {
      id: "COMPLETED",
      label: getGoalStatusLabel("COMPLETED"),
      count: counts.completed,
      iconColor: "var(--color-success-text)",
      icon: <GoalStatusIcon status="COMPLETED" size={iconSize.sm} />,
    },
    {
      id: "DELAYED",
      label: "마감 초과",
      count: counts.delayed,
      iconColor: "var(--color-danger-text)",
      icon: <GoalStatusIcon status="DELAYED" size={iconSize.sm} />,
    },
  ];

  const popularTags = useMemo(() => {
    if (!showPopularTags) {
      return [];
    }

    return getPopularGoalTags(goals);
  }, [goals, showPopularTags]);

  const visibleGoals = useMemo(
    () =>
      sortGoals(
        searchedGoals.filter(
          (goal) =>
            matchesStatusFilter(goal, projects, statusFilter) &&
            matchesTagFilter(goal, selectedTags),
        ),
      ),
    [projects, searchedGoals, selectedTags, statusFilter],
  );

  const hasFilters =
    searchQuery.trim().length > 0 || statusFilter !== "all" || selectedTags.length > 0;

  return (
    <>
      <div className={goalToolbarClassName}>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder={
            showProject ? "목표명 또는 프로젝트명으로 검색하세요." : "목표명으로 검색하세요."
          }
          ariaLabel="목표 검색"
        />

        <div className="flex items-center">
          <StatusFilterBar
            items={filterItems}
            value={statusFilter}
            onChange={setStatusFilter}
            label="목표 필터"
            title="목표 필터"
            sectionLabel="목표 상태"
            resetValue="all"
          />
        </div>

        {showPopularTags ? (
          <GoalPopularTags tags={popularTags} value={selectedTags} onChange={setSelectedTags} />
        ) : null}
      </div>

      <div className={goalListSectionClassName}>
        {banner}
        <div className="flex items-center gap-2">
          <h2 className="text-section-title text-[var(--color-text)]">목표 목록</h2>
          <Badge
            className="h-6! bg-gray-100 px-2.5! text-sm! text-[var(--color-text-secondary)]"
            title={`목표 목록 ${visibleGoals.length}개`}
          >
            {visibleGoals.length}개
          </Badge>
        </div>
        <GoalBoardList
          goals={visibleGoals}
          projects={projects}
          showProject={showProject}
          onSelect={onSelectGoal}
          selectedGoalId={selectedGoalId}
          draft={draftGoal}
          empty={
            hasFilters && goals.length > 0 ? (
              "조건에 맞는 목표가 없습니다."
            ) : holdNotice ? (
              <HoldAddNotice />
            ) : (
              emptyLabel
            )
          }
        />
      </div>
    </>
  );
}
