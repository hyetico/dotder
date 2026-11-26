"use client";

import { useEffect, useRef, useState } from "react";

export type CompleteStage = "idle" | "checked" | "collapsing";

/**
 * 체크하면 바로 끝내지 않고 「체크 + 취소선 → 1초 뒤 0.2초 접힘 → 완료」 순서로 보여 준다 (보드 S5 · REBUILD 6).
 * 움직임 줄이기 설정이면 바로 완료한다.
 *
 * @param onComplete - 접힘이 끝난 뒤 부른다 (상태 저장 · 되돌리기 토스트)
 * @returns `stage`(줄 모양에 씀)와 `start`(체크할 때 부름)
 *
 * @example
 * const { stage, start } = useDelayedComplete(() => complete(task));
 */
export function useDelayedComplete(onComplete: () => void) {
  const [stage, setStage] = useState<CompleteStage>("idle");
  const timers = useRef<number[]>([]);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const start = () => {
    if (stage !== "idle") {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onCompleteRef.current();
      return;
    }
    setStage("checked");
    timers.current.push(
      window.setTimeout(() => setStage("collapsing"), 1000),
      window.setTimeout(() => {
        setStage("idle");
        onCompleteRef.current();
      }, 1200),
    );
  };

  return { stage, start };
}

/** 접히는 줄 (grid 행 높이 1fr → 0fr · 0.2초). 안쪽 요소에 `min-h-0 overflow-hidden`을 준다 */
export const collapseClassName = (stage: CompleteStage) =>
  stage === "collapsing"
    ? "grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200"
    : "grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-200";
