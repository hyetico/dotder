/**
 * v1에서 보이는 범위 (PRD 5-4). 숨긴 기능의 코드는 지우지 않고 이 값으로만 가린다.
 */

/** 팀 메뉴 · 팀 선택 · 관리자(멤버) 선택. v1은 혼자 쓰는 개인용이라 숨긴다. */
export const TEAM_FEATURES_VISIBLE = false;

/** 플레이그라운드 메뉴. 개발 환경에서만 보인다. */
export const PLAYGROUND_VISIBLE = process.env.NODE_ENV === "development";
