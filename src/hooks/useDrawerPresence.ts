import { useEffect, useState } from "react";

/** 드로어가 미끄러져 들어오고 나가는 시간 (Drawer의 duration과 같다) */
const DRAWER_SLIDE_MS = 400;

/**
 * 드로어를 열고 닫을 때 들어오기 · 나가기 움직임이 끝날 때까지 화면에 남겨 둔다.
 *
 * @param isOpen - 열려 있어야 하는지
 * @returns `isPresent`(그릴지) · `isEntered`(화면 안에 들어왔는지, `Drawer`의 `isEntered`)
 *
 * @example
 * const { isPresent, isEntered } = useDrawerPresence(isOpen);
 * if (!isPresent) return null;
 * return <Drawer isEntered={isEntered} … />;
 */
export function useDrawerPresence(isOpen: boolean) {
  const [isPresent, setIsPresent] = useState(isOpen);
  const [phase, setPhase] = useState<"enter" | "open" | "leave">(isOpen ? "enter" : "leave");

  if (isOpen && (!isPresent || phase === "leave")) {
    setIsPresent(true);
    setPhase("enter");
  } else if (!isOpen && isPresent && phase !== "leave") {
    setPhase("leave");
  }

  useEffect(() => {
    if (!isPresent || phase === "open") {
      return;
    }

    if (phase === "enter") {
      let innerFrame = 0;
      const outerFrame = window.requestAnimationFrame(() => {
        innerFrame = window.requestAnimationFrame(() => {
          setPhase("open");
        });
      });

      return () => {
        window.cancelAnimationFrame(outerFrame);
        window.cancelAnimationFrame(innerFrame);
      };
    }

    const timeout = window.setTimeout(() => {
      setIsPresent(false);
    }, DRAWER_SLIDE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isPresent, phase]);

  return { isPresent, isEntered: phase === "open" };
}
