import {
  formPaneClassName,
  formPaneScrollClassName,
} from "@/components/layout/pages/CreatePage/formSpacing";

/**
 * getProjectFormLayout
 *
 * 프로젝트 폼의 좌우 분할 여부와 영역별 클래스를 계산합니다.
 *
 * @param params - getProjectFormLayout에 필요한 값
 * @param params.pageLayout - 지정한 페이지 레이아웃. 없으면 생성 화면만 분할
 * @param params.isCreating - 새 프로젝트를 만드는 중인지 여부
 * @param params.fillViewport - 분할 화면이 화면 높이를 채울지 여부
 * @returns 분할 여부와 영역별 클래스
 */
export function getProjectFormLayout({
  pageLayout,
  isCreating,
  fillViewport,
}: {
  pageLayout?: "card" | "split";
  isCreating: boolean;
  fillViewport: boolean;
}) {
  const splitLayout = pageLayout === "split" || (pageLayout === undefined && isCreating);

  const splitFillsViewport = splitLayout && fillViewport;

  const createShell = splitLayout;

  const formPanelClassName = splitLayout
    ? `
        flex
        flex-col
        gap-4
      `
    : "space-y-4 md:space-y-6";

  const splitScrollClassName = splitFillsViewport ? formPaneScrollClassName : formPaneClassName;

  const splitCardClassName = `
    flex
    min-w-0
    flex-col

    rounded-[var(--radius-lg)]

    border
    border-[var(--color-border)]

    bg-[var(--color-surface)]

    px-3
    py-3

    md:h-full
    md:min-h-0
    md:overflow-y-auto
    md:px-5
    md:py-6

    [scrollbar-width:none]
    [-ms-overflow-style:none]
    [&::-webkit-scrollbar]:hidden
  `;

  return {
    splitLayout,
    splitFillsViewport,
    createShell,
    formPanelClassName,
    splitScrollClassName,
    splitCardClassName,
  };
}

export type ProjectFormLayout = ReturnType<typeof getProjectFormLayout>;
