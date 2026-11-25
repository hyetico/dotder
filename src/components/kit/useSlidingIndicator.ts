"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

export type IndicatorPlace = { left: number; width: number };

/**
 * 고른 칸의 위치 · 폭을 재서 선택 표시를 그 자리로 옮긴다 (DOC3 14 탭 · Segmented 0.15초).
 * 처음 재기 전에는 null이라, 부르는 쪽은 그동안 고른 칸에 표시를 직접 그린다.
 *
 * @param containerRef - 칸들을 감싼 요소 (`position: relative`)
 * @param selector - 고른 칸을 찾는 선택자. 예: `[aria-selected="true"]`
 * @param key - 고른 값. 바뀌면 다시 잰다
 *
 * @example
 * const place = useSlidingIndicator(listRef, '[aria-checked="true"]', value);
 */
export function useSlidingIndicator(
  containerRef: RefObject<HTMLElement | null>,
  selector: string,
  key: string,
): IndicatorPlace | null {
  const [place, setPlace] = useState<IndicatorPlace | null>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const measure = () => {
      const active = container.querySelector<HTMLElement>(selector);
      setPlace((current) => {
        if (!active) {
          return null;
        }
        const next = { left: active.offsetLeft, width: active.offsetWidth };
        return current && current.left === next.left && current.width === next.width
          ? current
          : next;
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef, selector, key]);

  return place;
}
