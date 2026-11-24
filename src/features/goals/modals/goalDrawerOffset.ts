"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";

const GOAL_DRAWER_PUSH_QUERY = "(min-width: 1024px)";

let pushCount = 0;

/**
 * subscribeGoalDrawerPush
 *
 * 본문을 줄일 수 있는 화면 너비 변화를 구독합니다.
 *
 * @param onStoreChange - 너비 조건이 바뀔 때 실행되는 함수
 * @returns 구독을 해제하는 함수
 */
function subscribeGoalDrawerPush(onStoreChange: () => void) {
  const media = window.matchMedia(GOAL_DRAWER_PUSH_QUERY);

  media.addEventListener("change", onStoreChange);

  return () => media.removeEventListener("change", onStoreChange);
}

/**
 * getGoalDrawerPushSnapshot
 *
 * 지금 화면에서 목표 드로어가 본문을 밀어내는지 확인합니다.
 *
 * @returns 1024px 이상이면 true
 */
function getGoalDrawerPushSnapshot() {
  return window.matchMedia(GOAL_DRAWER_PUSH_QUERY).matches;
}

/**
 * applyGoalDrawerOffset
 *
 * 열린 목표 드로어가 있으면 본문을 드로어 너비만큼 줄입니다.
 */
function applyGoalDrawerOffset() {
  document.documentElement.style.setProperty(
    "--drawer-offset",
    pushCount > 0 ? "var(--drawer-width)" : "0px",
  );
}

/**
 * useGoalDrawerPushesPage
 *
 * 넓은 화면에서 목표 드로어가 본문을 밀어내는지 반환합니다.
 *
 * @returns 1024px 이상이면 true
 */
export function useGoalDrawerPushesPage() {
  return useSyncExternalStore(subscribeGoalDrawerPush, getGoalDrawerPushSnapshot, () => false);
}

/**
 * useGoalDrawerOffset
 *
 * 목표 드로어가 열린 동안 넓은 화면의 본문을 드로어 너비만큼 줄입니다.
 * 새 목표와 목표 상세가 겹쳐도 닫히는 쪽이 너비를 먼저 되돌리지 않습니다.
 *
 * @param active - 본문을 줄일지 여부
 */
export function useGoalDrawerOffset(active: boolean) {
  useLayoutEffect(() => {
    if (!active) {
      return;
    }

    pushCount += 1;
    applyGoalDrawerOffset();

    return () => {
      pushCount = Math.max(0, pushCount - 1);
      applyGoalDrawerOffset();
    };
  }, [active]);
}
