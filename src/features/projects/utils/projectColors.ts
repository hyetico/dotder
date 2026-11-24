import {
  PROJECT_COLOR_KEYS,
  PROJECT_PALETTE,
  projectColorVar,
  toProjectColorKey,
  type ProjectColorKey,
} from "@/lib/projectPalette";

import type { CSSProperties } from "react";

/**
 * 색 고르기 칸 목록 (Components 04 순서). 값은 색 키이고, 색 값은 `lib/projectPalette.ts`에만 있다.
 */
export const PROJECT_COLOR_OPTIONS = PROJECT_COLOR_KEYS.map((key) => ({
  value: key,
  label: PROJECT_PALETTE[key].label,
}));

/**
 * 프로젝트 색(점 · 막대 · 모자이크 · 왕관)을 CSS 값으로 돌려준다. 다크는 팔레트 다크 값.
 *
 * @param color - 색 키. 옛 값이 와도 키로 바꿔 쓴다. 비면 목표처럼 「색 없음」이라 회색
 * @returns `var(--project-<키>)`
 *
 * @example
 * getProjectAccentColor("teal") // "var(--project-teal)"
 */
export function getProjectAccentColor(color: ProjectColorKey | string | null | undefined) {
  return color ? projectColorVar(toProjectColorKey(color)) : "var(--color-neutral)";
}

/**
 * 폴더 카드 바탕 · 탭 · 작은 뱃지 바탕 (프로젝트 색을 색마다 정한 %로 옅게 섞은 값).
 *
 * @param color - 색 키. 비면 회색 바탕
 */
export function getProjectTintColor(color: ProjectColorKey | string | null | undefined) {
  return color ? projectColorVar(toProjectColorKey(color), "tint") : "var(--color-hover)";
}

/**
 * 옅은 바탕 둘레 선. 폴더 윤곽선과 뱃지 테두리에 같이 쓴다.
 *
 * @param color - 색 키. 비면 회색 선
 */
export function getProjectTintLineColor(color: ProjectColorKey | string | null | undefined) {
  return color ? projectColorVar(toProjectColorKey(color), "line") : "var(--color-hover-strong)";
}

/**
 * 옅은 바탕 위 아이콘 · 글자 색.
 *
 * @param color - 색 키. 비면 보조 글자색
 */
export function getProjectTintInkColor(color: ProjectColorKey | string | null | undefined) {
  return color ? projectColorVar(toProjectColorKey(color), "ink") : "var(--color-text-secondary)";
}

/**
 * 작은 폴더 아이콘 호버 바탕.
 *
 * @param color - 색 키. 비면 회색
 */
export function getProjectTintHoverColor(color: ProjectColorKey | string | null | undefined) {
  return color ? projectColorVar(toProjectColorKey(color), "hover") : "var(--color-hover-strong)";
}

/**
 * 메인 왕관 뱃지(`bg-accent-gradient`)가 프로젝트 색 한 가지를 쓰게 하는 변수.
 * 버튼 · 탭 · 배지에는 프로젝트 색을 쓰지 않는다 (Design Guide 12) — 왕관만 쓴다.
 *
 * @param color - 색 키. 비면 undefined (기본색)
 */
export function getProjectAccentStyle(
  color: ProjectColorKey | string | null | undefined,
): CSSProperties | undefined {
  if (!color) {
    return undefined;
  }

  return {
    "--accent-primary": projectColorVar(toProjectColorKey(color)),
    "--accent-gradient": "none",
  } as CSSProperties;
}
