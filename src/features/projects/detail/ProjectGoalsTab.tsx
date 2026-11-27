"use client";

import { useRef, useState } from "react";

import Button from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { DeleteConfirmDialog } from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";
import { Funnel, ListFilter, Plus, Target } from "@/components/ui/icon";
import { PickRow } from "@/components/ui/Menu";
import Popover from "@/components/ui/Popover";
import Segmented from "@/components/ui/Segmented";
import { useToast } from "@/components/ui/Toast";

import { TOAST_TEXT } from "@/content/ui";
import GoalAddDrawer from "@/features/goals/drawers/GoalAddDrawer";
import GoalDetailDrawer from "@/features/goals/drawers/GoalDetailDrawer";
import { useGoalMutations } from "@/features/goals/hooks/useGoalMutations";
import GoalFilterPopover from "@/features/goals/list/GoalFilterPopover";
import {
  GOAL_SORT_LABEL,
  getGoalStats,
  selectGoals,
  type GoalSort,
  type GoalStatusFilter,
} from "@/features/goals/list/goalListModel";
import GoalRow from "@/features/goals/list/GoalRow";

import type { Goal } from "@/features/goals/types/goal";
import type { Project } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

type ProjectGoalsTabProps = {
  project: Project;
  goals: Goal[];
  tasks: Task[];
  today: string;
};

const SORTS: GoalSort[] = ["due", "name", "updated"];

/**
 * 상세 목표 탭 (보드 04 · 04-a ~ 04-e · T · M 04).
 * 웹: 상태 칸(전체 · 진행 중 · 계획 · 완료 + 숫자) · 필터(태그 280) · ─ · 정렬(200) · [+ 추가] → 목표 줄(사이 8).
 * 태블릿 · 모바일은 도구 줄 없이 목표 줄만 (보드 T · M 04).
 */
export default function ProjectGoalsTab({ project, goals, tasks, today }: ProjectGoalsTabProps) {
  const toast = useToast();
  const filterRef = useRef<HTMLButtonElement>(null);
  const sortRef = useRef<HTMLButtonElement>(null);
  const [status, setStatus] = useState<GoalStatusFilter>("all");
  const [tags, setTags] = useState<string[]>([]);
  const [sort, setSort] = useState<GoalSort>("due");
  const [panel, setPanel] = useState<"filter" | "sort" | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [openGoalId, setOpenGoalId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const { updateGoalAsync, deleteGoalAsync, restoreGoalAsync } = useGoalMutations();

  const count = (key: GoalStatusFilter) =>
    goals.filter((goal) => key === "all" || goal.status === key).length;
  const visible = selectGoals(goals, { status, tags, sort });
  const openGoal = goals.find((goal) => goal.id === openGoalId) ?? null;
  const isFiltered = status !== "all" || tags.length > 0;
  // 이 프로젝트에 목표가 0개면 거를 것이 없다: 도구 줄을 못 누르게 하고 조건은 기본값으로 ([+ 추가]는 살아 있음)
  const isEmpty = goals.length === 0;
  if (isEmpty && (isFiltered || sort !== "due" || panel != null)) {
    setStatus("all");
    setTags([]);
    setSort("due");
    setPanel(null);
  }

  const complete = async (goal: Goal) => {
    await updateGoalAsync({ ...goal, status: "COMPLETED", teamId: project.teamId });
    toast(TOAST_TEXT.goalCompleted, {
      undo: () => void updateGoalAsync({ ...goal, teamId: project.teamId }),
    });
  };

  const remove = async (goal: Goal) => {
    const removed = await deleteGoalAsync(goal.id);
    toast(TOAST_TEXT.deleted, { undo: () => void restoreGoalAsync(removed) });
  };

  return (
    <>
      <div className="flex items-center gap-2 max-lg:hidden">
        <Segmented
          label="목표 상태"
          value={status}
          onChange={setStatus}
          disabled={isEmpty}
          items={[
            { value: "all", label: "전체", count: count("all") },
            { value: "IN_PROGRESS", label: "진행 중", count: count("IN_PROGRESS") },
            { value: "NOT_STARTED", label: "계획", count: count("NOT_STARTED") },
            { value: "COMPLETED", label: "완료", count: count("COMPLETED") },
          ]}
        />
        <Chip
          ref={filterRef}
          selected={tags.length > 0}
          icon={<Funnel size={16} aria-hidden />}
          count={tags.length || undefined}
          aria-haspopup="dialog"
          aria-expanded={panel === "filter"}
          onClick={() => setPanel(panel === "filter" ? null : "filter")}
          disabled={isEmpty}
        >
          필터
        </Chip>
        <span className="flex-1" />
        <Button
          ref={sortRef}
          variant="ghost"
          size="sm"
          aria-haspopup="listbox"
          aria-expanded={panel === "sort"}
          aria-disabled={isEmpty || undefined}
          onClick={() => setPanel(panel === "sort" ? null : "sort")}
        >
          <ListFilter size={16} aria-hidden />
          정렬: {GOAL_SORT_LABEL[sort]}
        </Button>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} aria-hidden />
          추가
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<Target size={24} />}
          title={goals.length ? "조건에 맞는 목표가 없어요" : "아직 목표가 없어요"}
          text={
            goals.length
              ? "필터를 바꿔 보세요."
              : "목표를 추가하면 태스크를 묶어서 진행률을 볼 수 있어요."
          }
          actions={
            isFiltered ? (
              <Button
                onClick={() => {
                  setStatus("all");
                  setTags([]);
                }}
              >
                필터 초기화
              </Button>
            ) : (
              <Button variant="primary" onClick={() => setIsAddOpen(true)}>
                <Plus size={16} aria-hidden />
                목표 추가
              </Button>
            )
          }
        />
      ) : (
        <ul className="flex flex-col lg:gap-2">
          {visible.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              stats={getGoalStats(goal, tasks, today)}
              onOpen={() => setOpenGoalId(goal.id)}
              onComplete={() => void complete(goal)}
              onDelete={() => setDeleteTarget(goal)}
            />
          ))}
        </ul>
      )}

      <GoalFilterPopover
        isOpen={panel === "filter"}
        onClose={() => setPanel(null)}
        anchorRef={filterRef}
        goals={goals}
        tags={tags}
        onTagsChange={setTags}
        resultCount={visible.length}
      />

      <Popover
        isOpen={panel === "sort"}
        onClose={() => setPanel(null)}
        anchorRef={sortRef}
        title="정렬"
        width={200}
        align="end"
        role="listbox"
      >
        {SORTS.map((key) => (
          <PickRow
            key={key}
            selected={sort === key}
            onSelect={() => {
              setSort(key);
              setPanel(null);
            }}
          >
            {GOAL_SORT_LABEL[key]}
          </PickRow>
        ))}
      </Popover>

      <GoalAddDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        projectId={project.id}
      />
      <GoalDetailDrawer goal={openGoal} tasks={tasks} onClose={() => setOpenGoalId(null)} />
      <DeleteConfirmDialog
        target="목표"
        isOpen={deleteTarget != null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          const target = deleteTarget;
          setDeleteTarget(null);
          if (target) {
            void remove(target);
          }
        }}
      />
    </>
  );
}
