import type { TabItemState, TabMenuAppearance } from "@/components/ui/tab/types";

const defaultTabListClassName = "flex gap-1";
const defaultTabItemClassName = "inline-flex items-center gap-1.5 px-3 py-2 text-sm leading-5";
const defaultTabLabelClassName = "inline-flex items-center gap-1";

const lineTabListClassName =
  "[scrollbar-width:none] overflow-y-hidden border-b border-[var(--color-border)] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";
const lineTabStackListClassName =
  "grid gap-0 overflow-x-visible md:flex md:gap-1 md:overflow-x-auto";
const lineTabRowListClassName = "flex gap-1 overflow-x-auto";
const lineTabItemClassName =
  "relative rounded-none! border-b-2 border-transparent text-sm leading-5 disabled:opacity-100!";
const lineTabStackItemClassName =
  "flex w-full flex-col items-center justify-center gap-1 px-1 py-2 md:inline-flex md:h-[var(--tab-height)] md:w-auto md:shrink-0 md:flex-row md:justify-start md:gap-1.5 md:px-3 md:py-0";
const lineTabRowItemClassName =
  "inline-flex h-[var(--tab-height)] shrink-0 items-center gap-1.5 px-3";
const lineTabStackMarkClassName =
  "md:bg-primary-gradient pointer-events-none absolute -bottom-0.5 left-1/2 h-[3px] w-8 -translate-x-1/2 bg-[var(--color-text)] md:inset-x-0 md:-bottom-0.5 md:left-0 md:h-0.5 md:w-auto md:translate-x-0";
const lineTabMarkClassName =
  "bg-primary-gradient pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5";
const lineTabStackIconClassName = "max-md:size-[18px]";
const lineTabStackSelectedIconClassName = "max-md:size-[18px] md:text-[var(--color-primary)]";
const lineTabStackLabelClassName = "inline-flex items-center gap-1 md:contents";

/**
 * getTabTextClassName
 *
 * 선택과 비활성 상태에 맞는 글자색 클래스를 돌려줍니다.
 *
 * @param state - 탭의 선택, 비활성 상태
 * @returns 글자색 클래스
 */
export function getTabTextClassName(state: TabItemState) {
  if (state.disabled) {
    return "text-[var(--color-nav-disabled)]";
  }

  if (state.selected) {
    return "text-[var(--color-text)]";
  }

  return "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]";
}

/**
 * tabFontClassName
 *
 * 선택된 탭은 굵게, 그 외에는 보통 굵기로 돌려줍니다.
 *
 * @param state - 탭의 선택, 비활성 상태
 * @param important - Tailwind important 표시를 붙일지 여부
 * @returns 글자 굵기 클래스
 */
function tabFontClassName(state: TabItemState, important = false) {
  const selected = state.selected && !state.disabled;
  const weight = selected ? "font-semibold" : "font-normal";

  return important ? `${weight}!` : weight;
}

/**
 * defaultTabAppearance
 *
 * 기본 탭을 버튼 모양으로 돌려줍니다.
 *
 * @returns 기본 버튼 탭 모양
 */
export function defaultTabAppearance(): TabMenuAppearance {
  return {
    listClassName: defaultTabListClassName,
    item: (state) => ({
      itemClassName: [
        defaultTabItemClassName,
        tabFontClassName(state),
        getTabTextClassName(state),
      ].join(" "),
      labelClassName: defaultTabLabelClassName,
    }),
  };
}

/**
 * lineTabIconClassName
 *
 * 좁은 화면 밑줄 탭의 아이콘 클래스를 돌려줍니다.
 *
 * @param state - 탭의 선택, 비활성 상태
 * @param stackOnMobile - 좁은 화면에서 아이콘을 위에 쌓을지 여부
 * @returns 아이콘 클래스. 넓은 화면이면 없습니다
 */
function lineTabIconClassName(state: TabItemState, stackOnMobile: boolean) {
  if (!stackOnMobile) {
    return undefined;
  }

  return state.selected && !state.disabled
    ? lineTabStackSelectedIconClassName
    : lineTabStackIconClassName;
}

/**
 * lineTabSelectedMarkClassName
 *
 * 선택된 밑줄 탭의 표시선 클래스를 돌려줍니다.
 *
 * @param state - 탭의 선택, 비활성 상태
 * @param stackOnMobile - 좁은 화면에서 아이콘을 위에 쌓을지 여부
 * @returns 표시선 클래스. 선택되지 않았으면 없습니다
 */
function lineTabSelectedMarkClassName(state: TabItemState, stackOnMobile: boolean) {
  if (!state.selected || state.disabled) {
    return undefined;
  }

  return stackOnMobile ? lineTabStackMarkClassName : lineTabMarkClassName;
}

/**
 * lineTabAppearance
 *
 * 밑줄 탭에 입힐 모양을 돌려줍니다.
 *
 * @param stackOnMobile - 좁은 화면에서 아이콘을 위에 쌓을지 여부
 * @param count - 칸을 나눌 탭 개수
 * @returns 밑줄 탭 모양
 */
export function lineTabAppearance(stackOnMobile: boolean, count: number): TabMenuAppearance {
  return {
    listClassName: [
      lineTabListClassName,
      stackOnMobile ? lineTabStackListClassName : lineTabRowListClassName,
    ].join(" "),
    listStyle: stackOnMobile
      ? { gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }
      : undefined,
    item: (state) => ({
      itemClassName: [
        lineTabItemClassName,
        tabFontClassName(state, true),
        stackOnMobile ? lineTabStackItemClassName : lineTabRowItemClassName,
        getTabTextClassName(state),
      ].join(" "),
      iconClassName: lineTabIconClassName(state, stackOnMobile),
      iconStyle:
        state.selected && !state.disabled && !stackOnMobile
          ? { color: "var(--color-primary)" }
          : undefined,
      labelClassName: stackOnMobile ? lineTabStackLabelClassName : "contents",
      markClassName: lineTabSelectedMarkClassName(state, stackOnMobile),
    }),
  };
}
