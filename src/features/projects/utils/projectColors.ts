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
