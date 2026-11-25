export type ThemeMode = "light" | "dark" | "system";

/** 테마를 이 기기에 저장하는 키 (보드 12 「이 기기에만 저장돼요」) */
export const THEME_KEY = "dotder:theme";

/**
 * 첫 그림 전에 `<html data-theme>`를 정하는 스크립트 (깜빡임 방지). 루트 레이아웃 `<head>`에 넣는다.
 * 시스템이면 기기 설정(prefers-color-scheme)을 따른다.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var m=localStorage.getItem("${THEME_KEY}")||"system";var d=m==="dark"||(m==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);if(d)document.documentElement.setAttribute("data-theme","dark");}catch(e){}})();`;

/** 저장된 테마. 없거나 읽을 수 없으면 시스템 */
export function readThemeMode(): ThemeMode {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

/**
 * 테마를 저장하고 바로 적용한다.
 *
 * @example
 * applyThemeMode("dark");
 */
export function applyThemeMode(mode: ThemeMode) {
  try {
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    // 저장이 막혀도 이번 화면에는 적용한다
  }
  const isDark =
    mode === "dark" ||
    (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  if (isDark) {
    document.documentElement.setAttribute("data-theme", "dark");
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}
