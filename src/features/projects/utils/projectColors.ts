import type { CSSProperties } from "react";

/**
 * 사용자가 고르는 프로젝트 색 (style-guide 1-8). "색상 없음"(회색)은 따로 고른다.
 * 없앤 색 Ivory #E7DDD0 · Ink #2A2430은 이미 저장된 값만 남아 있을 수 있다 (tech-debt S-12).
 */
export const PROJECT_COLOR_OPTIONS = [
  { value: "#2F6B5A", label: "세이지" },
  { value: "#3B82F6", label: "블루" },
  { value: "#C4A574", label: "골드" },
  { value: "#A78BFA", label: "라벤더" },
  { value: "#6D28D9", label: "바이올렛" },
  { value: "#6B2D5B", label: "플럼" },
  { value: "#6F4E37", label: "브라운" },
  { value: "#EF7F6B", label: "코랄" },
] as const;

export const PROJECT_NEUTRAL_ACCENT = "#9CA3AF";

/**
 * getProjectAccentColor
 *
 * 프로젝트 색상이 있으면 그 색을 쓰고, 없으면 화면 강조에 쓸 기본색을 돌려줍니다.
 *
 * @param color - 프로젝트 색상. 없으면 null입니다
 * @returns 아이콘과 태그에 쓸 강조색
 */
export function getProjectAccentColor(color: string | null | undefined) {
  const value = color?.trim();

  if (value) {
    return value;
  }

  return PROJECT_NEUTRAL_ACCENT;
}

/**
 * getProjectTintColor
 *
 * 프로젝트 색을 바탕에 옅게 섞어(--project-tint, 라이트 18% · 다크 20%) 폴더 바탕색과 뱃지 바탕색으로 씁니다.
 * 색이 없으면 회색을 돌려줍니다.
 *
 * @param color - 프로젝트 색상. 없으면 null입니다
 * @returns 옅은 바탕색
 */
export function getProjectTintColor(color: string | null | undefined) {
  const value = color?.trim();

  if (!value) {
    return "var(--color-hover)";
  }

  return `color-mix(in srgb, ${value} var(--project-tint), var(--color-surface))`;
}

/**
 * getProjectTintLineColor
 *
 * 옅은 바탕색 둘레에 두를 윤곽선 색을 만듭니다. 폴더 윤곽선과 뱃지 테두리에 같이 씁니다.
 * 색이 없으면 회색을 돌려줍니다.
 *
 * @param color - 프로젝트 색상. 없으면 null입니다
 * @returns 윤곽선 색
 */
export function getProjectTintLineColor(color: string | null | undefined) {
  const value = color?.trim();

  if (!value) {
    return "var(--color-hover-strong)";
  }

  return `color-mix(in srgb, ${value} 26%, var(--color-surface))`;
}

/**
 * getProjectTintInkColor
 *
 * 옅은 바탕 위에 올리는 아이콘과 글자 색을 만듭니다.
 * 밝은 프로젝트 색은 어두운 갈색을 쓰고, 나머지는 프로젝트 색을 조금 어둡게 씁니다.
 *
 * @param color - 프로젝트 색상
 * @returns 아이콘 색
 */
export function getProjectTintInkColor(color: string) {
  if (isLightProjectColor(color)) {
    return "#3F3A34";
  }

  return `color-mix(in srgb, ${color.trim()} 82%, black)`;
}

export function isLightProjectColor(color: string | null | undefined) {
  const value = color?.replace("#", "").trim();

  if (!value) {
    return false;
  }

  if (value.length !== 6) {
    return false;
  }

  const channel = (start: number) => Number.parseInt(value.slice(start, start + 2), 16);

  const red = channel(0);
  const green = channel(2);
  const blue = channel(4);

  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.72;
}

/**
 * getProjectAccentStyle
 *
 * 프로젝트 색으로 왕관 뱃지와 주요 버튼에 쓸 그라데이션 변수를 만듭니다.
 * 색이 없으면 화면의 기본색을 그대로 씁니다.
 *
 * @param color - 프로젝트 색상. 없으면 null입니다
 * @returns 테마 변수를 덮어쓸 스타일. 색이 없으면 undefined
 */
export function getProjectAccentStyle(color: string | null | undefined): CSSProperties | undefined {
  const value = color?.trim() ?? "";

  if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return undefined;
  }

  const light = isLightProjectColor(value);
  const glow = light
    ? `color-mix(in srgb, ${value} 55%, #6d6256)`
    : `color-mix(in srgb, ${value} 88%, white)`;
  const face = light ? `color-mix(in srgb, ${value} 38%, #4a433c)` : value;
  const edge = light
    ? `color-mix(in srgb, ${value} 16%, #231f1c)`
    : `color-mix(in srgb, ${value} 30%, #1b1e24)`;
  const hoverGlow = light ? face : `color-mix(in srgb, ${value} 92%, black)`;
  const hoverFace = light
    ? `color-mix(in srgb, ${value} 28%, #3a342e)`
    : `color-mix(in srgb, ${value} 82%, black)`;
  const hoverEdge = `color-mix(in srgb, ${edge} 70%, black)`;

  return {
    "--accent-primary": light ? `color-mix(in srgb, ${value} 42%, #3f3a34)` : value,
    "--accent-primary-hover": hoverFace,
    "--accent-gradient": `linear-gradient(135deg, ${glow} 0%, ${face} 46%, ${edge} 100%)`,
    "--accent-gradient-hover": `linear-gradient(135deg, ${hoverGlow} 0%, ${hoverFace} 46%, ${hoverEdge} 100%)`,
  } as CSSProperties;
}
