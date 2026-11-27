import { PROJECT_COLOR_KEYS, PROJECT_PALETTE } from "@/lib/projectPalette";

/**
 * 색 고르기 칸 목록 (Components 04 순서). 값은 색 키이고, 색 값은 `lib/projectPalette.ts`에만 있다.
 */
export const PROJECT_COLOR_OPTIONS = PROJECT_COLOR_KEYS.map((key) => ({
  value: key,
  label: PROJECT_PALETTE[key].label,
}));
