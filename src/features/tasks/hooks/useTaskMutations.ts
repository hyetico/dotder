"use client";

/*
 * =========================================================
 * useTaskMutations
 * =========================================================
 *
 * [왜 이 hook이 필요한가?]
 *
 * Task를 "만들기 / 수정 / 삭제"하는 코드는
 * Board, List, Calendar 뷰 모두에서 똑같이 필요합니다.
 *
 * 각 컴포넌트마다 useMutation을 복붙하면:
 * - 코드가 3배로 늘어남
 * - 한 곳만 고치면 다른 뷰는 안 바뀜 (버그)
 * - Query Key가 달라지면 캐시가 따로 놀아서 화면이 안 맞음
 *
 * 그래서 "Task 변경 로직"만 이 hook에 모아두고,
 * 각 뷰에서는 이 hook만 호출해서 씁니다.
 *
 * ---------------------------------------------------------
 * useQuery vs useMutation (한 줄 요약)
 * ---------------------------------------------------------
 *
 * useQuery  → 서버에서 데이터 "가져오기" (GET)
 *             예: getTasks()로 Task 목록 조회
 *
 * useMutation → 서버에 데이터 "보내기" (POST / PUT / DELETE)
 *               예: createTask, updateTask, deleteTask
 *
 * mutate()를 호출하면 → mutationFn 실행 → 성공/실패 후 onSuccess 등 콜백
 *
 * ---------------------------------------------------------
 * queryClient란?
 * ---------------------------------------------------------
 *
 * TanStack Query가 서버 데이터를 저장해 두는 "캐시 창고"입니다.
 *
 * useQuery로 getTasks()를 호출하면 결과가 queryClient 안에 저장되고,
 * mutation 후에는 invalidateQueries()로 "이 데이터 낡았으니 다시 가져와"
 * 라고 알려서 Board / List / Calendar가 같은 최신 목록을 보게 합니다.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTask, deleteTask, restoreTask, updateTask } from "@/features/tasks/api/tasks";

import { projectQueryKeys, taskQueryKeys } from "@/lib/queryKeys";

import type { Task } from "@/features/tasks/types/task";
import type { ProjectScope } from "@/lib/projectRoutes";

export function useTaskMutations(projectScope: ProjectScope) {
  /*
   * queryClient: 캐시에 직접 접근할 때 사용
   * (invalidate, getQueryData, setQueryData 등)
   */
  const queryClient = useQueryClient();

  /*
   * Query Key = 캐시에 저장된 데이터의 "주소"
   *
   * taskQueryKeys.list()로 Board / List / Calendar가
   * 같은 주소를 바라보므로 한 곳에서 수정하면 세 뷰가 같이 반영됨
   *
   * projectScope 예:
   * - 1        → 프로젝트 1번 Task만
   * - "all"    → 전체 프로젝트 Task
   */
  const tasksQueryKey = taskQueryKeys.list(projectScope);

  /*
   * =====================================================
   * 1. Task 생성 (create)
   * =====================================================
   *
   * 흐름:
   * handleCreateTask() → createTaskMutation.mutate()
   *   → createTask() API 호출
   *   → onSuccess: 캐시 무효화 → useQuery가 목록 다시 fetch
   */
  const createTaskMutation = useMutation({
    mutationFn: createTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey,
      });
      // 저장하면 활동 표시가 남으니 활동 모자이크도 다시 읽는다
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.activity });
    },
  });

  /*
   * =====================================================
   * 2. Task 수정 (update) — Optimistic Update 포함
   * =====================================================
   *
   * Board에서 카드 드래그·수정할 때
   * 서버 응답을 기다리면 화면이 늦게 바뀌어 답답합니다.
   *
   * Optimistic Update:
   *   서버 응답 전에 화면(캐시)을 먼저 바꿔 두고,
   *   실패하면 원래대로 되돌립니다.
   *
   * 실행 순서:
   *   1. onMutate   — 요청 보내기 직전, 캐시를 먼저 수정 + 백업
   *   2. mutationFn — 실제 updateTask() API 호출
   *   3. onError    — 실패 시 백업으로 롤백
   *   4. onSettled  — 성공/실패 관계없이 서버와 최종 동기화
   */
  const updateTaskMutation = useMutation({
    mutationFn: updateTask,

    onMutate: async (updatedTask: Task) => {
      /*
       * 진행 중인 tasks refetch를 잠시 멈춤
       * → refetch가 끼어들어 optimistic 변경을 덮어쓰는 것 방지
       */
      await queryClient.cancelQueries({
        queryKey: tasksQueryKey,
      });

      /*
       * 롤백용: 지금 캐시에 있는 목록을 복사해 둠
       */
      const previousTasks = queryClient.getQueryData<Task[]>(tasksQueryKey);

      /*
       * 화면을 먼저 바꿈 (서버 응답 기다리지 않음)
       */
      queryClient.setQueryData<Task[]>(tasksQueryKey, (oldTasks = []) =>
        oldTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );

      /*
       * onError에서 쓸 백업 데이터
       * (useMutation이 context로 넘겨줌)
       */
      return {
        previousTasks,
      };
    },

    onError: (_error, _updatedTask, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(tasksQueryKey, context.previousTasks);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey,
      });
      // 저장하면 활동 표시가 남으니 활동 모자이크도 다시 읽는다
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.activity });
    },
  });

  /*
   * =====================================================
   * 3. Task 삭제 (delete)
   * =====================================================
   *
   * create와 동일하게:
   * mutate → deleteTask() → onSuccess → 캐시 무효화
   */
  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tasksQueryKey,
      });
      // 저장하면 활동 표시가 남으니 활동 모자이크도 다시 읽는다
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.activity });
    },
  });

  // 삭제 되돌리기: 만들기와 달리 활동으로 세지 않는다 (restoreTask)
  const restoreTaskMutation = useMutation({
    mutationFn: restoreTask,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKey });
      queryClient.invalidateQueries({ queryKey: projectQueryKeys.activity });
    },
  });

  /*
   * =====================================================
   * handle* 함수 — 컴포넌트에서 쓰기 편한 wrapper
   * =====================================================
   *
   * 컴포넌트는 mutation 객체 대신
   * handleCreateTask / handleUpdateTask / handleDeleteTask 만
   * 넘기면 됩니다.
   *
   * (.mutate, .isPending 같은 건 mutation 객체에서 직접 써도 됨)
   */

  const handleCreateTask = (newTask: Task) => {
    /*
     * 새 Task는 같은 status 컬럼 맨 아래에 붙음
     * → order = 그 컬럼에 이미 있는 Task 개수
     *
     * 캐시에서 현재 목록을 읽어 계산 (별도 props 불필요)
     */
    const tasks = queryClient.getQueryData<Task[]>(tasksQueryKey) ?? [];

    const sameStatusTasks = tasks.filter((task) => task.status === newTask.status);

    createTaskMutation.mutate({
      ...newTask,
      order: sameStatusTasks.length,
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    updateTaskMutation.mutate(updatedTask);
  };

  const handleDeleteTask = (taskId: number) => {
    deleteTaskMutation.mutate(taskId);
  };

  return {
    tasksQueryKey,
    createTaskMutation,
    updateTaskMutation,
    deleteTaskMutation,
    restoreTaskMutation,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
  };
}
