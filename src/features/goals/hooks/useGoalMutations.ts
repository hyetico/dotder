"use client";

import { useRouter } from "next/navigation";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  createGoal,
  updateGoal,
  type CreateGoalInput,
  type UpdateGoalInput,
} from "@/features/goals/api/goals";
import { useCurrentProjectScope } from "@/features/projects/hooks/useCurrentProjectScope";

import { buildScopedViewPath } from "@/lib/projectRoutes";
import { goalQueryKeys } from "@/lib/queryKeys";

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

  return {
    createGoal: createGoalMutation.mutate,
    createGoalAsync: createGoalMutation.mutateAsync,
    isCreating: createGoalMutation.isPending,
    updateGoal: updateGoalMutation.mutate,
    updateGoalAsync: updateGoalMutation.mutateAsync,
    isUpdating: updateGoalMutation.isPending,
  };
}
