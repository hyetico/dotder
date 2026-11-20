"use client";

import { useCallback, useLayoutEffect, useRef } from "react";

const scrollRoots = new Set<HTMLElement>();

let lockCount = 0;

let restoreDocumentScroll: (() => void) | null = null;

let touchStartX = 0;
let touchStartY = 0;

function canElementScroll(element: HTMLElement, axis: "x" | "y", delta: number) {
  if (delta === 0) {
    return false;
  }

  const style = window.getComputedStyle(element);

  const overflow = axis === "y" ? style.overflowY : style.overflowX;

  if (overflow !== "auto" && overflow !== "scroll" && overflow !== "overlay") {
    return false;
  }

  const remaining =
    axis === "y"
      ? delta < 0
        ? element.scrollTop
        : element.scrollHeight - element.clientHeight - element.scrollTop
      : delta < 0
        ? element.scrollLeft
        : element.scrollWidth - element.clientWidth - element.scrollLeft;

  return remaining > 1;
}

function toPixels(delta: number, deltaMode: number) {
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return delta * 16;
  }

  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return delta * window.innerHeight;
  }

  return delta;
}

function findScrollable(
  root: HTMLElement,
  target: EventTarget | null,
  deltaX: number,
  deltaY: number,
) {
  if (!(target instanceof Node) || !root.contains(target)) {
    return null;
  }

  const vertical = Math.abs(deltaY) >= Math.abs(deltaX);

  let element: HTMLElement | null = target instanceof HTMLElement ? target : target.parentElement;

  while (element) {
    if (canElementScroll(element, vertical ? "y" : "x", vertical ? deltaY : deltaX)) {
      return element;
    }

    if (element === root) {
      break;
    }

    element = element.parentElement;
  }

  return null;
}

function scrollWithinModal(target: EventTarget | null, deltaX: number, deltaY: number) {
  for (const root of scrollRoots) {
    const scroller = findScrollable(root, target, deltaX, deltaY);

    if (!scroller) {
      continue;
    }

    const vertical = Math.abs(deltaY) >= Math.abs(deltaX);

    if (vertical) {
      scroller.scrollTop += deltaY;
    } else {
      scroller.scrollLeft += deltaX;
    }

    return true;
  }

  return false;
}

function handleWheel(event: WheelEvent) {
  if (event.ctrlKey) {
    return;
  }

  const deltaX = toPixels(event.deltaX, event.deltaMode);
  const deltaY = toPixels(event.deltaY, event.deltaMode);

  event.preventDefault();

  scrollWithinModal(event.target, deltaX, deltaY);
}

function handleTouchStart(event: TouchEvent) {
  const touch = event.touches[0];

  if (!touch) {
    return;
  }

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}

function handleTouchMove(event: TouchEvent) {
  const touch = event.touches[0];

  if (!touch) {
    return;
  }

  const deltaX = touchStartX - touch.clientX;
  const deltaY = touchStartY - touch.clientY;

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;

  event.preventDefault();

  scrollWithinModal(event.target, deltaX, deltaY);
}

function lockDocumentScroll() {
  const html = document.documentElement;
  const body = document.body;

  const previous = {
    htmlOverflow: html.style.overflow,
    bodyOverflow: body.style.overflow,
    htmlOverscroll: html.style.overscrollBehavior,
    bodyOverscroll: body.style.overscrollBehavior,
    bodyPaddingRight: body.style.paddingRight,
  };

  const scrollbarWidth = window.innerWidth - html.clientWidth;

  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  html.style.overscrollBehavior = "none";
  body.style.overscrollBehavior = "none";

  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }

  document.addEventListener("wheel", handleWheel, {
    capture: true,
    passive: false,
  });

  document.addEventListener("touchstart", handleTouchStart, {
    capture: true,
    passive: true,
  });

  document.addEventListener("touchmove", handleTouchMove, {
    capture: true,
    passive: false,
  });

  restoreDocumentScroll = () => {
    html.style.overflow = previous.htmlOverflow;
    body.style.overflow = previous.bodyOverflow;
    html.style.overscrollBehavior = previous.htmlOverscroll;
    body.style.overscrollBehavior = previous.bodyOverscroll;
    body.style.paddingRight = previous.bodyPaddingRight;

    document.removeEventListener("wheel", handleWheel, true);

    document.removeEventListener("touchstart", handleTouchStart, true);

    document.removeEventListener("touchmove", handleTouchMove, true);
  };
}

function acquireDocumentLock() {
  lockCount += 1;

  if (lockCount === 1) {
    lockDocumentScroll();
  }

  return () => {
    lockCount = Math.max(0, lockCount - 1);

    if (lockCount === 0 && restoreDocumentScroll) {
      restoreDocumentScroll();
      restoreDocumentScroll = null;
    }
  };
}

export function useModalScrollLock(isOpen: boolean) {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }

    return acquireDocumentLock();
  }, [isOpen]);

  return useCallback((node: HTMLElement | null) => {
    if (rootRef.current) {
      scrollRoots.delete(rootRef.current);
    }

    rootRef.current = node;

    if (!node) {
      return;
    }

    node.setAttribute("data-scroll-lock", "");

    scrollRoots.add(node);
  }, []);
}
