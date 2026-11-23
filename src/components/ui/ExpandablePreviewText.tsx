"use client";

import { useEffect, useRef, useState } from "react";

import { AppIcon, ChevronDown } from "@/components/ui/icon";
import IconTitle from "@/components/ui/IconTitle";

type ExpandablePreviewTextProps = {
  text: string;
  muted?: boolean;
  clampClassName: string;
  textClassName: string;
  fadeFromClassName?: string;
  showFade?: boolean;
};

/**
 * isPreviewTextOverflowing
 *
 * 접힌 미리보기 문구가 보이는 칸보다 긴지 확인합니다.
 *
 * @param element - 줄 수를 제한한 문구 요소
 * @returns 접히지 않은 높이가 보이는 높이보다 크면 true
 */
function isPreviewTextOverflowing(element: HTMLParagraphElement) {
  const width = element.clientWidth;

  if (width === 0) {
    return false;
  }

  const clone = element.cloneNode(true) as HTMLParagraphElement;

  clone.style.position = "absolute";
  clone.style.visibility = "hidden";
  clone.style.pointerEvents = "none";
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";
  clone.style.webkitLineClamp = "unset";
  clone.style.display = "block";
  clone.style.width = `${width}px`;

  element.parentElement?.appendChild(clone);

  const fullHeight = clone.getBoundingClientRect().height;

  clone.remove();

  return fullHeight > element.clientHeight + 1;
}

/**
 * ExpandablePreviewText
 *
 * 미리보기 문구를 몇 줄만 보여주고, 길면 펼치거나 접습니다.
 * 칸 안에서 스크롤하지 않습니다.
 *
 * @param props - ExpandablePreviewText 컴포넌트 Props
 * @param props.text - 표시할 문구
 * @param props.muted - 안내 문구처럼 흐리게 표시할지 여부
 * @param props.clampClassName - 접혀 있을 때 줄 수를 제한하는 클래스
 * @param props.textClassName - 문구 글자 클래스
 * @param props.fadeFromClassName - 접힌 문구 아래 그라데이션 시작색. 기본값은 흐린 배경
 * @param props.showFade - 접힌 문구 아래 흐림을 표시할지 여부. 기본값은 true
 */
export default function ExpandablePreviewText({
  text,
  muted = false,
  clampClassName,
  textClassName,
  fadeFromClassName = "from-[var(--color-muted)]",
  showFade = true,
}: ExpandablePreviewTextProps) {
  const textRef = useRef<HTMLParagraphElement>(null);

  const [expanded, setExpanded] = useState(false);

  const [canExpand, setCanExpand] = useState(false);

  useEffect(() => {
    const element = textRef.current;

    if (!element || expanded) {
      return;
    }

    const measure = () => {
      if (element.clientWidth === 0) {
        return;
      }

      setCanExpand(isPreviewTextOverflowing(element));
    };

    measure();

    const observer = new ResizeObserver(measure);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [text, expanded, clampClassName]);

  return (
    <div className="flex min-w-0 flex-col">
      <div className="relative">
        <p
          ref={textRef}
          className={`break-words whitespace-pre-line ${textClassName} ${
            expanded ? "" : clampClassName
          } ${muted ? "text-[var(--color-text-muted)]" : ""} `}
        >
          {text}
        </p>

        {showFade && !expanded && canExpand ? (
          <span
            aria-hidden
            className={`pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t ${fadeFromClassName} to-transparent`}
          />
        ) : null}
      </div>

      {canExpand ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-1 self-end"
        >
          <IconTitle
            size="sm"
            iconPosition="end"
            className="font-medium text-[var(--color-text)]"
            icon={
              <AppIcon
                icon={ChevronDown}
                size="sm"
                className={expanded ? "rotate-180 transition-transform" : "transition-transform"}
              />
            }
          >
            {expanded ? "접기" : "더보기"}
          </IconTitle>
        </button>
      ) : null}
    </div>
  );
}
