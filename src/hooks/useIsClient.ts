"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * 브라우저에서 그리는 중인지 알려준다.
 *
 * 서버 렌더와 하이드레이션 첫 렌더에서는 `false`, 그 뒤로는 `true`다.
 * `document.body`에 포털을 붙이는 드로어·모달처럼 서버에서 그릴 수 없는 UI를 막을 때 쓴다.
 *
 * @example
 * const isClient = useIsClient();
 * if (!isClient || !isOpen) return null;
 * return createPortal(panel, document.body);
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
