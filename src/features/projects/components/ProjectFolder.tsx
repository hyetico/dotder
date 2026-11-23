"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import {
  getProjectTintColor,
  getProjectTintLineColor,
} from "@/features/projects/utils/projectColors";

type ProjectFolderProps = {
  color?: string | null;
  children: ReactNode;
  className?: string;
  fill?: boolean;
  white?: boolean;
  tabLabel?: string;
  wideTab?: boolean;
  tabs?: ReactNode;
  detail?: boolean;
};

const tabActionsClassName =
  "flex h-full min-w-0 flex-1 items-end overflow-x-auto pr-[14px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
const tabActionsInnerClassName = "ml-auto flex items-end";
const detailTabsClassName = "absolute z-0 flex h-[50px] items-stretch";
const detailBodyClassName = "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col p-6";
const detailTabCoverClassName =
  "pointer-events-none absolute inset-x-0 top-0 h-4 bg-[var(--folder-fill)]";
const detailTabDrop = 10;
const detailFolderShadowClassName =
  "drop-shadow-[0_2px_5px_rgb(0_0_0/12%)] drop-shadow-[0_8px_18px_rgb(0_0_0/8%)]";
const detailTabHeight = 44;
const detailTabLabelClassName =
  "absolute inset-y-0 left-0 flex items-center px-6 text-[18px] leading-none font-bold tracking-[-0.03em] text-[var(--color-text)]";
const detailOuterRadius = 28;
const cardOuterRadius = 16;
const detailLayoutQuery = "(min-width: 1024px)";

/**
 * clamp
 *
 * 값을 최소와 최대 사이로 제한합니다.
 *
 * @param value - 제한할 값
 * @param min - 최솟값
 * @param max - 최댓값
 * @returns 범위 안의 값
 */
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const tabLabelClassName =
  "absolute inset-y-0 left-0 flex shrink-0 items-center px-3 text-[12px] leading-4 font-medium whitespace-nowrap text-[var(--color-text-secondary)]";
const tabTopRatio = 0.62;

/**
 * getTabSize
 *
 * 본체 너비에 맞춰 탭 크기를 계산합니다.
 * 라벨이 있으면 글자가 줄지 않도록 탭을 늘립니다.
 *
 * @param width - 카드 너비
 * @param labelWidth - 탭 글자의 실제 너비. 없으면 0
 * @param wide - 글자용으로 기본 탭을 넓힐지 여부
 * @param withTabs - 오른쪽 서브폴더 탭이 있어 왼쪽 탭을 글자 너비에 맞출지 여부
 * @param detail - 넓은 화면의 상세 폴더인지 여부. 메인 탭은 너비의 46%, 높이는 84px
 * @param folderHeight - 폴더 전체 높이. 카드 탭 높이를 본문 비율에 맞출 때 씁니다
 * @returns 탭 너비와 높이
 */
function getTabSize(
  width: number,
  labelWidth: number,
  wide: boolean,
  withTabs = false,
  detail = false,
  folderHeight = 0,
) {
  if (withTabs && detail) {
    const fitted = labelWidth > 0 ? labelWidth / 0.58 + 28 : 280;

    return {
      width: Math.min(Math.max(fitted, 248), width * 0.42),
      height: detailTabHeight,
    };
  }

  if (withTabs) {
    const fitted = labelWidth > 0 ? labelWidth / tabTopRatio + 12 : 160;

    return {
      width: Math.min(Math.max(148, fitted), width * 0.55),
      height: 48,
    };
  }

  const shoulder = width * 0.5;
  const byAspect = shoulder / 5.5;
  const byCard = folderHeight > 120 ? folderHeight * 0.105 : byAspect;
  const base = wide
    ? { width: Math.min(224, width * 0.7), height: 36 }
    : { width: shoulder, height: clamp(Math.round(Math.max(byAspect, byCard)), 24, 30) };

  if (labelWidth <= 0) return base;

  const fitted = (labelWidth + 6) / tabTopRatio;

  return {
    width: Math.max(base.width, Math.min(width * 0.6, fitted)),
    height: base.height,
  };
}

/**
 * getFolderPath
 *
 * 탭과 본체를 하나의 경로로 그립니다.
 *
 * @param width - 카드 너비
 * @param height - 카드 높이
 * @param tabWidth - 탭 너비
 * @param tabHeight - 탭 높이
 * @param outerRadius - 바깥 모서리 곡률. 카드는 16, 상세 폴더는 28
 * @param topRightRadius - 몸통 오른쪽 위 곡률. 없으면 다른 모서리와 같습니다
 * @returns 폴더 실루엣 경로
 */
function getFolderPath(
  width: number,
  height: number,
  tabWidth: number,
  tabHeight: number,
  outerRadius = cardOuterRadius,
  topRightRadius?: number,
) {
  const inset = topRightRadius === 0 ? 0 : 0.5;
  const left = inset;
  const top = inset;
  const right = width - inset;
  const bottom = height - inset;
  const bodyTop = top + tabHeight;

  const bodyRadius = Math.max(0, Math.min(outerRadius, (right - left) / 2, (bottom - bodyTop) / 2));
  const topRight = Math.max(0, Math.min(topRightRadius ?? bodyRadius, (right - left) / 2));

  const tabRadius = Math.min(outerRadius === detailOuterRadius ? detailOuterRadius : 18, tabHeight);

  const x = (ratio: number) => left + tabWidth * ratio;
  const y = (ratio: number) => top + tabHeight * ratio;

  return [
    // 왼쪽 탭
    `M ${left} ${bodyTop}`,
    `V ${top + tabRadius}`,
    `Q ${left} ${top} ${left + tabRadius} ${top}`,
    // 탭 상단
    `H ${x(tabTopRatio)}`,
    // 상단 수평선에서 사선으로 연결
    `C ${x(0.72)} ${top}, ${x(0.74)} ${y(0.15)}, ${x(0.79)} ${y(0.4)}`,
    // 짧고 완만한 사선
    `L ${x(0.86)} ${y(0.75)}`,
    // 사선에서 본체 상단으로 연결
    `C ${x(0.91)} ${bodyTop}, ${x(0.94)} ${bodyTop}, ${x(1)} ${bodyTop}`,
    // 본체 오른쪽 위
    topRight > 0 ? `H ${right - topRight}` : `H ${right}`,
    topRight > 0 ? `Q ${right} ${bodyTop} ${right} ${bodyTop + topRight}` : `V ${bodyTop}`,
    // 본체 오른쪽 아래
    `V ${bottom - bodyRadius}`,
    `Q ${right} ${bottom} ${right - bodyRadius} ${bottom}`,
    // 본체 왼쪽 아래
    `H ${left + bodyRadius}`,
    `Q ${left} ${bottom} ${left} ${bottom - bodyRadius}`,
    // 왼쪽 외곽선
    `V ${bodyTop}`,
    "Z",
  ].join(" ");
}

/**
 * getProjectFolderColors
 *
 * 프로젝트 색으로 폴더 바탕색과 윤곽선 색 변수를 만듭니다.
 * 색이 없으면 회색 폴더를 쓰고, 흰색을 고르면 바탕만 흰색으로 둡니다.
 *
 * @param color - 프로젝트 색상. 없으면 null입니다
 * @param white - 폴더 바탕을 흰색으로 칠할지 여부
 * @returns 폴더 CSS 변수
 */
function getProjectFolderColors(color: string | null | undefined, white = false): CSSProperties {
  const line = white ? getProjectTintLineColor(null) : getProjectTintLineColor(color);

  return {
    "--folder-fill": white ? "#ffffff" : getProjectTintColor(color),
    "--folder-line": line,
    "--folder-shell": line,
  } as CSSProperties;
}

/**
 * ProjectFolder
 *
 * 왼쪽 위 둥근 탭이 몸통으로 부드럽게 이어지는 폴더 틀입니다.
 * 프로젝트 색의 옅은 바탕과 윤곽선으로 칠하고, 안에 넣은 내용은 그대로 보여 줍니다.
 *
 * @param props - ProjectFolder 컴포넌트 Props
 * @param props.color - 프로젝트 색상. 없으면 회색 폴더
 * @param props.children - 폴더 몸통 안에 둘 내용
 * @param props.className - 폴더 바깥 틀에 더할 클래스
 * @param props.fill - 바깥 칸 높이를 폴더가 채울지 여부
 * @param props.white - 폴더 바탕을 흰색으로 칠할지 여부. 윤곽선은 회색으로 둡니다
 * @param props.tabLabel - 왼쪽 위 탭에 넣을 글자
 * @param props.wideTab - 글자가 있을 때 탭을 넓힐지 여부. 없으면 넓힙니다
 * @param props.tabs - 폴더 어깨 오른쪽에 둘 서브폴더 탭
 * @param props.detail - 상세 화면용 큰 폴더 틀을 쓸지 여부
 */
export default function ProjectFolder({
  color,
  children,
  className = "",
  fill = false,
  white = false,
  tabLabel,
  wideTab,
  tabs,
  detail = false,
}: ProjectFolderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [labelWidth, setLabelWidth] = useState(0);
  const [paneEdge, setPaneEdge] = useState({ left: 0, right: 0 });

  const hasTabs = Boolean(tabs);
  const detailShell = detail || hasTabs;
  const [detailLayout, setDetailLayout] = useState(false);
  const wide = wideTab ?? Boolean(tabLabel);
  const tab = getTabSize(
    size.width || 400,
    labelWidth,
    wide,
    detailShell,
    detailLayout,
    size.height,
  );
  const sheetClassName =
    "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-[18px] bg-[var(--color-surface)] [clip-path:inset(0_round_18px)]";
  const cardBodyClassName = [
    "relative flex min-h-0 min-w-0 flex-1 flex-col rounded-[16px] rounded-tl-none",
    fill ? "overflow-hidden" : "",
  ]
    .filter(Boolean)
    .join(" ");

  useLayoutEffect(() => {
    const element = containerRef.current;

    if (!element) return;

    const updateSize = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      const nextLabelWidth = labelRef.current
        ? Math.ceil(labelRef.current.getBoundingClientRect().width)
        : 0;
      const nextDetail = detailShell && window.matchMedia(detailLayoutQuery).matches;
      const pane = element.querySelector("[data-folder-pane='right']");
      const folderBox = element.getBoundingClientRect();
      const paneBox = pane?.getBoundingClientRect();
      const nextPane = paneBox
        ? {
            left: Math.round(paneBox.left - folderBox.left),
            right: Math.round(folderBox.right - paneBox.right),
          }
        : { left: 0, right: 0 };

      setSize((previous) =>
        previous.width === width && previous.height === height ? previous : { width, height },
      );
      setLabelWidth((previous) => (previous === nextLabelWidth ? previous : nextLabelWidth));
      setDetailLayout((previous) => (previous === nextDetail ? previous : nextDetail));
      setPaneEdge((previous) =>
        previous.left === nextPane.left && previous.right === nextPane.right ? previous : nextPane,
      );
      const align = element.closest("[data-folder-align]");

      if (align instanceof HTMLElement) {
        const nextTab = getTabSize(
          width || 400,
          nextLabelWidth,
          wide,
          detailShell,
          nextDetail,
          height,
        );

        align.style.setProperty("--folder-tab-height", `${nextTab.height}px`);
      }
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    const pane = element.querySelector("[data-folder-pane='right']");
    if (pane) observer.observe(pane);
    let active = true;
    void document.fonts?.ready.then(() => {
      if (active) updateSize();
    });

    return () => {
      active = false;
      observer.disconnect();
    };
  }, [detailLayout, detailShell, tabLabel, wide]);

  const path =
    size.width > 1 && size.height > tab.height + 1
      ? getFolderPath(
          size.width,
          size.height,
          tab.width,
          tab.height,
          detailShell ? detailOuterRadius : cardOuterRadius,
          hasTabs ? 0 : undefined,
        )
      : "";

  return (
    <div
      ref={containerRef}
      style={getProjectFolderColors(color, white)}
      className={[
        "relative isolate flex min-w-0 flex-col",
        fill ? "h-full" : "",
        detailShell ? detailFolderShadowClassName : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* 탭과 본체가 이어진 단일 배경 */}
      <svg
        aria-hidden="true"
        focusable="false"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        {path ? (
          <path
            d={path}
            fill="var(--folder-fill)"
            stroke={detailShell ? "none" : "var(--folder-line)"}
            strokeWidth={detailShell ? 0 : 1}
            strokeLinejoin="round"
          />
        ) : null}
      </svg>

      {/* 본체 비율에 맞춘 탭 공간 */}
      <div className="relative z-0 flex w-full shrink-0" style={{ height: tab.height }}>
        {tabLabel ? (
          <span
            ref={labelRef}
            className={detailLayout ? detailTabLabelClassName : tabLabelClassName}
          >
            {tabLabel}
          </span>
        ) : null}
        {detailLayout && tabs ? (
          <div
            className={detailTabsClassName}
            style={{
              left: paneEdge.left || tab.width + 8,
              right: 0,
              bottom: -detailTabDrop,
            }}
          >
            {tabs}
          </div>
        ) : tabs ? (
          <>
            <div aria-hidden className="shrink-0" style={{ width: tab.width + 12 }} />
            <div className={tabActionsClassName}>
              <div className={tabActionsInnerClassName}>{tabs}</div>
            </div>
          </>
        ) : null}
      </div>

      {detailShell ? (
        <div className={detailBodyClassName}>
          {hasTabs ? <div aria-hidden="true" className={detailTabCoverClassName} /> : null}
          <div className={sheetClassName}>{children}</div>
        </div>
      ) : (
        <div className={cardBodyClassName}>{children}</div>
      )}
    </div>
  );
}
