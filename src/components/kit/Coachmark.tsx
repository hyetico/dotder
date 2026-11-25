"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

type Rect = { top: number; left: number; width: number; height: number };

type CoachmarkProps = {
  /** 비출 요소의 CSS 선택자. 화면에 보이는 첫 요소를 쓴다 (데이터를 읽는 동안은 기다린다) */
  target: string;
  /** 단계 표시 「n / 전체」 */
  step: number;
  total: number;
  title: string;
  text: string;
  /** 「다음」 */
  onNext: () => void;
  /** 「건너뛰기」 · Esc */
  onSkip: () => void;
};

// 말풍선 폭 300 · 대상과 사이 22 (보드 E01)
const BUBBLE_W = 300;
const GAP = 22;
const SIDE = 16;

const findVisible = (selector: string) =>
  [...document.querySelectorAll<HTMLElement>(selector)].find(
    (element) => element.getClientRects().length > 0 && element.offsetWidth > 0,
  );

/**
 * 코치마크 (보드 E01 · 예시로 둘러보기). 대상에 링 4 + 나머지 어둡게, 옆(공간이 없으면 아래 · 위)에 다크 말풍선 300.
 * 단계 「n / 4」 · 제목 16 · 설명 14/22 · 「건너뛰기」 · [다음]. Esc는 건너뛰기.
 *
 * @example
 * <Coachmark target='[data-tour="project-card"]' step={1} total={4} title="…" text="…" onNext={next} onSkip={skip} />
 */
export default function Coachmark({
  target,
  step,
  total,
  title,
  text,
  onNext,
  onSkip,
}: CoachmarkProps) {
  const [rect, setRect] = useState<Rect | null>(null);

  useLayoutEffect(() => {
    let element: HTMLElement | undefined;
    let frame = 0;
    let scrolled = false;
    const measure = () => {
      element = element?.isConnected ? element : findVisible(target);
      if (element && !scrolled) {
        scrolled = true;
        element.scrollIntoView({ block: "center" });
      }
      const box = element?.getBoundingClientRect();
      setRect((current) => {
        if (!box) return null;
        if (
          current &&
          current.top === box.top &&
          current.left === box.left &&
          current.width === box.width &&
          current.height === box.height
        ) {
          return current;
        }
        return { top: box.top, left: box.left, width: box.width, height: box.height };
      });
      frame = requestAnimationFrame(measure);
    };
    frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onSkip();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSkip]);

  if (!rect || typeof document === "undefined") {
    return null;
  }

  const viewportW = window.innerWidth;
  const viewportH = window.innerHeight;
  const fitsRight = rect.left + rect.width + GAP + BUBBLE_W + SIDE <= viewportW;
  const placeBelow = !fitsRight && rect.top + rect.height + GAP + 180 <= viewportH;
  const width = Math.min(BUBBLE_W, viewportW - SIDE * 2);
  const bubbleLeft = fitsRight
    ? rect.left + rect.width + GAP
    : Math.min(Math.max(rect.left, SIDE), viewportW - width - SIDE);
  const arrowLeft = Math.min(Math.max(rect.left + 24 - bubbleLeft, 16), width - 28);
  const bubbleStyle = fitsRight
    ? { left: bubbleLeft, top: Math.max(rect.top + 18, SIDE), width }
    : placeBelow
      ? { left: bubbleLeft, top: rect.top + rect.height + GAP, width }
      : { left: bubbleLeft, bottom: viewportH - rect.top + GAP, width };

  return createPortal(
    <div className="fixed inset-0 z-[var(--z-overlay)]">
      {/* 링 4 + 나머지 어둡게 (보드 E01). 누르는 것은 막아 둔다 */}
      <div
        aria-hidden
        className="pointer-events-none fixed rounded-[var(--radius-lg)] shadow-[0_0_0_4px_var(--tour-ring),0_0_0_9999px_var(--overlay)] transition-[top,left,width,height] duration-200"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed flex flex-col gap-2 rounded-[var(--radius-lg)] bg-[var(--tip-bg)] p-4 text-[var(--tip-fg)] shadow-[var(--shadow-pop)]"
        style={bubbleStyle}
      >
        <i
          aria-hidden
          className={cn(
            "absolute size-3 rotate-45 bg-[var(--tip-bg)]",
            fitsRight ? "top-6 -left-1.5" : placeBelow ? "-top-1.5" : "-bottom-1.5",
          )}
          style={fitsRight ? undefined : { left: arrowLeft }}
        />
        <span className="text-xs font-semibold text-[var(--tip-muted)]">
          {step} / {total}
        </span>
        <strong className="text-base">{title}</strong>
        <span className="text-sm text-[var(--tip-body)]">{text}</span>
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="kit-focus cursor-pointer rounded-[var(--radius-xs)] text-xs text-[var(--tip-muted)] transition-colors duration-120 hover:text-[var(--tip-fg)]"
          >
            건너뛰기
          </button>
          <span className="flex-1" />
          <button
            type="button"
            autoFocus
            onClick={onNext}
            className="kit-focus inline-flex h-[var(--btn-h-xs)] cursor-pointer items-center rounded-[var(--radius-sm)] bg-[var(--tip-fg)] px-[var(--btn-px-xs)] text-xs font-semibold text-[var(--tip-bg)]"
          >
            다음
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
