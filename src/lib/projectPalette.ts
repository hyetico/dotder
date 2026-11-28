/**
 * 프로젝트 색 팔레트 — 색 값은 이 파일 한 곳에만 둔다 (Components 04 · Design Guide 12, 2026-11-24 10색).
 *
 * - 프로젝트 · 목표에는 hex가 아니라 색 키(`ProjectColorKey`)를 저장한다.
 * - 화면은 `var(--project-<키>)` 같은 CSS 변수로만 색을 쓴다. 변수는 `buildProjectPaletteCss`가
 *   이 표에서 만들어 루트 레이아웃에 넣는다 (라이트 · 다크 값이 테마에 따라 바뀐다).
 * - 색을 바꿀 때는 아래 `PROJECT_PALETTE`만 고친다.
 */

export const PROJECT_COLOR_KEYS = [
  "mustard",
  "lime",
  "olive",
  "teal",
  "slate",
  "sky",
  "indigo",
  "purple",
  "berry",
  "brown",
] as const;

export type ProjectColorKey = (typeof PROJECT_COLOR_KEYS)[number];

type ProjectPaletteEntry = {
  /** 화면 이름 */
  label: string;
  /** 라이트 모드 색 */
  light: string;
  /** 다크 모드 색 (라이트 색에 흰색 30%를 섞은 값) */
  dark: string;
  /** 폴더 카드 바탕 · 탭 진하기(%). `--bg` 위에 섞는다 (라이트 #fff · 다크 #16181c) */
  tint: { light: number; dark: number };
  /** 다크 모드 폴더 글자(`-ink`: 메인 라벨 · 카드 메타). 없으면 `dark` (컬러 가이드 v1) */
  darkInk?: string;
};

export const PROJECT_PALETTE: Record<ProjectColorKey, ProjectPaletteEntry> = {
  mustard: { label: "머스터드", light: "#c9a233", dark: "#d9be70", tint: { light: 28, dark: 20 } },
  lime: { label: "라임", light: "#abbf4e", dark: "#c4d283", tint: { light: 34, dark: 20 } },
  olive: {
    label: "올리브",
    light: "#6b6f23",
    dark: "#979a65",
    tint: { light: 18, dark: 20 },
    darkInk: "#9b9e6b",
  },
  teal: {
    label: "틸",
    light: "#007f70",
    dark: "#4ca59b",
    tint: { light: 18, dark: 20 },
    darkInk: "#4ea89e",
  },
  slate: {
    label: "슬레이트",
    light: "#12484c",
    dark: "#597f82",
    tint: { light: 18, dark: 20 },
    darkInk: "#729b9f",
  },
  sky: { label: "스카이", light: "#44a0bd", dark: "#7cbcd1", tint: { light: 23, dark: 20 } },
  indigo: {
    label: "인디고",
    light: "#3a418d",
    dark: "#757aaf",
    tint: { light: 18, dark: 20 },
    darkInk: "#8e92be",
  },
  purple: {
    label: "퍼플",
    light: "#8b55b2",
    dark: "#ae88c9",
    tint: { light: 18, dark: 20 },
    darkInk: "#b08ccb",
  },
  berry: {
    label: "베리",
    light: "#b34771",
    dark: "#ca7e9c",
    tint: { light: 18, dark: 20 },
    darkInk: "#cd85a2",
  },
  brown: {
    label: "브라운",
    light: "#774c1f",
    dark: "#a08262",
    tint: { light: 18, dark: 20 },
    darkInk: "#ac9277",
  },
};

/** 다크 커버 조각에서만 바꾸는 색 (보드 PR-DW-00 · DM-00) */
const COVER_DARK_COLORS: Partial<Record<ProjectColorKey, string>> = {
  slate: "#597f82",
  lime: "#5d6b2e",
};

/** 새 프로젝트의 기본 색, 알 수 없는 옛 값의 대체 색 */
export const DEFAULT_PROJECT_COLOR: ProjectColorKey = "indigo";

/** 밝은 색 위 아이콘 · 글자는 더 어둡게 섞는다 */
const LIGHT_COLOR_KEYS: readonly ProjectColorKey[] = ["mustard", "lime"];

/**
 * 라이트 폴더 글자(`-ink`)를 만들 때 색을 남기는 비율(나머지는 검정). 밝은 두 색은 50%,
 * 스카이는 65% (컬러 가이드 v1 · 대비), 나머지는 82%.
 */
const lightInkPercent = (key: ProjectColorKey) =>
  LIGHT_COLOR_KEYS.includes(key) ? 50 : key === "sky" ? 65 : 82;

/**
 * 옛 색(이름 · hex) → 새 키. 2026-11-24 9색 → 10색 교체 (사용자 확정 매핑).
 * Ivory · Ink는 그 전에 없앤 색이라 로고 규칙(베이지 → 라임, 잉크 → 슬레이트)을 따른다.
 */
const LEGACY_COLOR_KEYS: Record<string, ProjectColorKey> = {
  plum: "indigo",
  "#6b2d5b": "indigo",
  lavender: "purple",
  "#a78bfa": "purple",
  gold: "mustard",
  "#c4a574": "mustard",
  blue: "sky",
  "#3b82f6": "sky",
  "#6f4e37": "brown",
  coral: "berry",
  "#ef7f6b": "berry",
  sage: "teal",
  "#2f6b5a": "teal",
  gray: "slate",
  grey: "slate",
  "#9ca3af": "slate",
  violet: "olive",
  "#6d28d9": "olive",
  ivory: "lime",
  "#e7ddd0": "lime",
  ink: "slate",
  "#2a2430": "slate",
};

/**
 * 저장된 값이 새 색 키인지 확인한다.
 *
 * @example
 * isProjectColorKey("teal") // true
 */
export function isProjectColorKey(value: unknown): value is ProjectColorKey {
  return typeof value === "string" && (PROJECT_COLOR_KEYS as readonly string[]).includes(value);
}

/**
 * 옛 데이터(이름 · hex · 키)를 새 색 키로 바꾼다. 읽어 들일 때 한 번 부르고 결과를 저장한다.
 *
 * @param value - 저장돼 있던 색. 비어 있으면 옛 「색 없음」(회색)이라 슬레이트
 * @returns 새 색 키. 알 수 없는 값은 기본 인디고
 *
 * @example
 * toProjectColorKey("#6B2D5B") // "indigo"
 */
export function toProjectColorKey(value: string | null | undefined): ProjectColorKey {
  const normalized = value?.trim().toLowerCase() ?? "";

  if (!normalized) {
    return LEGACY_COLOR_KEYS.gray;
  }

  if (isProjectColorKey(normalized)) {
    return normalized;
  }

  return LEGACY_COLOR_KEYS[normalized] ?? DEFAULT_PROJECT_COLOR;
}

/**
 * 목표처럼 「색 없음」을 고를 수 있는 곳의 옛 값을 바꾼다. 비어 있으면 그대로 `null`.
 *
 * @example
 * toOptionalProjectColorKey(null) // null
 */
export function toOptionalProjectColorKey(
  value: string | null | undefined,
): ProjectColorKey | null {
  return value?.trim() ? toProjectColorKey(value) : null;
}

/** 프로젝트 색 CSS 변수 이름. `part`가 없으면 색 자체(점 · 막대 · 모자이크 · 왕관). */
export function projectColorVar(
  key: ProjectColorKey,
  part?: "tint" | "line" | "ink" | "hover" | "fixed",
): string {
  return `var(--project-${key}${part ? `-${part}` : ""})`;
}

/**
 * 팔레트에서 CSS 변수를 만든다. 루트 레이아웃이 `<style>`로 넣는다.
 *
 * - `--project-<키>`: 색 (라이트 · 다크 값)
 * - `--project-<키>-tint`: 폴더 카드 바탕 · 탭
 * - `--project-<키>-line`: 바탕 둘레 선 (바탕보다 8% 진하게)
 * - `--project-<키>-hover`: 작은 폴더 아이콘 호버 (바탕보다 4% 진하게)
 * - `--project-<키>-ink`: 바탕 위 아이콘 · 글자
 * - `--project-<키>-fixed`: 커버 · 404 조각 (라이트 값, 다크는 두 색만 바꿈)
 */
export function buildProjectPaletteCss(): string {
  const block = (mode: "light" | "dark") =>
    PROJECT_COLOR_KEYS.map((key) => {
      const entry = PROJECT_PALETTE[key];
      const color = entry[mode];
      const tint = entry.tint[mode];
      const base = "var(--bg)";
      const ink =
        mode === "dark"
          ? (entry.darkInk ?? color)
          : `color-mix(in srgb, ${color} ${lightInkPercent(key)}%, black)`;

      return [
        `--project-${key}: ${color};`,
        `--project-${key}-tint: color-mix(in srgb, ${color} ${tint}%, ${base});`,
        `--project-${key}-line: color-mix(in srgb, ${color} ${tint + 8}%, ${base});`,
        `--project-${key}-hover: color-mix(in srgb, ${color} ${tint + 4}%, ${base});`,
        `--project-${key}-ink: ${ink};`,
        // 커버 · 404 조각 (보드 00 · 13): 늘 라이트 값, 다크에서는 어두운 바탕에 묻히는 두 색만 바꾼다
        `--project-${key}-fixed: ${mode === "dark" ? (COVER_DARK_COLORS[key] ?? entry.light) : color};`,
      ].join("");
    }).join("");

  return `:root{${block("light")}}:root[data-theme="dark"]{${block("dark")}}`;
}
