import { useSyncExternalStore } from "react";

/**
 * 앱 데이터 모드. `mine`은 내 기록(이 브라우저에 저장), `demo`는 예시(저장하지 않음).
 *
 * 로그인을 붙이면 「내 기록」 앞에 로그인 · 가입을 넣고, 첫 로그인 때 이 브라우저 기록을 계정으로 옮긴다.
 */
export type DotderMode = "mine" | "demo";

const MODE_KEY = "dotder:mode";
const listeners = new Set<() => void>();

/** 지금 모드. 정한 적이 없거나 읽을 수 없으면 내 기록(`mine`) */
export function readMode(): DotderMode {
  if (typeof window === "undefined") {
    return "mine";
  }
  try {
    return window.localStorage.getItem(MODE_KEY) === "demo" ? "demo" : "mine";
  } catch {
    return "mine";
  }
}

/**
 * 모드를 바꾼다. 데이터는 다음 api 호출 때 그 모드 것으로 바뀌므로, 부른 쪽은 쿼리를 다시 읽는다.
 *
 * @example
 * setMode("demo");
 * await queryClient.invalidateQueries();
 */
export function setMode(mode: DotderMode) {
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch {
    // 저장이 막힌 브라우저에서는 기본값(내 기록)으로 돌아간다
  }
  listeners.forEach((listener) => listener());
}

/** 모드가 바뀌면 알림을 받는다. @returns 구독을 끊는 함수 */
export function subscribeMode(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * 지금 모드를 화면에서 읽는다. 서버에서 그릴 때는 `mine`.
 *
 * @example
 * const isDemo = useMode() === "demo";
 */
export function useMode() {
  return useSyncExternalStore(subscribeMode, readMode, () => "mine" as DotderMode);
}
