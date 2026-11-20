export const PROJECT_TAG_PRESETS = ["기획", "개발", "디자인", "데이터"] as const;

export const PROJECT_TAG_LIMIT = 10;

export function isGlobalProjectTag(tag: string) {
  return (PROJECT_TAG_PRESETS as readonly string[]).includes(tag);
}
