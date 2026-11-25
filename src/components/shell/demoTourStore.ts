import { useSyncExternalStore } from "react";

/**
 * 예시로 둘러보기 상태 (보드 E01). 탭을 닫으면 끝나도록 sessionStorage에 둔다.
 * step 1 ~ 3: 코치마크 · 4: 시작 선택 · 0: 코치마크를 건너뛴 채 둘러보는 중.
 */
export type DemoStep = 0 | 1 | 2 | 3 | 4;

const KEY = "dotder:demo";
const listeners = new Set<() => void>();

function read(): DemoStep | null {
  try {
    const value = sessionStorage.getItem(KEY);
    return value == null ? null : (Number(value) as DemoStep);
  } catch {
    return null;
  }
}

/** 둘러보기 단계를 바꾼다. null이면 둘러보기를 끝낸다 */
export function setDemoStep(step: DemoStep | null) {
  try {
    if (step == null) {
      sessionStorage.removeItem(KEY);
    } else {
      sessionStorage.setItem(KEY, String(step));
    }
  } catch {
    // 저장이 막힌 브라우저에서는 이번 화면에서만 끝난다
  }
  listeners.forEach((listener) => listener());
}

/**
 * 지금 둘러보기 단계. 둘러보는 중이 아니면 null.
 *
 * @example
 * const step = useDemoStep(); // 1 | 2 | 3 | 4 | 0 | null
 */
export function useDemoStep() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    read,
    () => null,
  );
}
