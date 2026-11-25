"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createGoal,
  deleteGoal,
  restoreGoal,
  updateGoal,
  type CreateGoalInput,
  type UpdateGoalInput,
} from "@/features/goals/api/goals";
import { useCurrentProjectScope } from "@/features/projects/hooks/useCurrentProjectScope";

import { buildScopedViewPath } from "@/lib/projectRoutes";
import { goalQueryKeys, projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

import type { Goal } from "@/features/goals/types/goal";

export function useGoalMutations() {
  const queryClient = useQueryClient();

  const router = useRouter();

  const projectScope = useCurrentProjectScope();

  const invalidateGoals = async () => {
    await queryClient.invalidateQueries({
      queryKey: goalQueryKeys.all,
    });
  };

  const createGoalMutation = useMutation({
    mutationFn: (input: CreateGoalInput) => createGoal(input),

    onSuccess: async () => {
      await invalidateGoals();

      router.push(buildScopedViewPath(projectScope, "goals"));
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: (input: UpdateGoalInput) => updateGoal(input),

    onSuccess: async () => {
      await invalidateGoals();
    },
  });

  // 상세 화면에서 만들 때는 주소를 옮기지 않는다 (보드 04-a)
  const addGoalMutation = useMutation({
    mutationFn: (input: CreateGoalInput) => createGoal(input),

    onSuccess: async () => {
      await Promise.all([
        invalidateGoals(),
        queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
      ]);
    },
  });

  // 지우면 태스크 연결이 풀리고 프로젝트 목표 수가 바뀐다
  const invalidateAfterRemove = async () => {
    await Promise.all([
      invalidateGoals(),
      queryClient.invalidateQueries({ queryKey: taskQueryKeys.all }),
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.all }),
    ]);
  };

  const deleteGoalMutation = useMutation({
    mutationFn: (goalId: number) => deleteGoal(goalId),
    onSuccess: invalidateAfterRemove,
  });

  const restoreGoalMutation = useMutation({
    mutationFn: (goal: Goal) => restoreGoal(goal),
    onSuccess: invalidateAfterRemove,
  });

  return {
    /** 만들고 머문다 (상세 목표 탭) */
    addGoalAsync: addGoalMutation.mutateAsync,
    isAdding: addGoalMutation.isPending,
    deleteGoalAsync: deleteGoalMutation.mutateAsync,
    /** 삭제 되돌리기 */
    restoreGoalAsync: restoreGoalMutation.mutateAsync,
    createGoal: createGoalMutation.mutate,
    createGoalAsync: createGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    updateGoal: updateGoalMutation.mutate,
    updateGoalAsync: updateGoalMutation.mutateAsync,
    isUpdating: updateGoalMutation.isPending,
  };
}
