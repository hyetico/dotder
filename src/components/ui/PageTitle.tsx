import { cn } from "@/lib/cn";

import type { ReactNode } from "react";

type PageTitleProps = {
  /** 제목 글. `<h1>`이 된다 (반응형으로 둘을 두면 한쪽은 숨긴다) */
  children: ReactNode;
  /** 제목 아래 요약 줄. 14 · --t2 (예: 「15개 중 5개 진행 중 · 3개 마감 지남」) */
  summary?: ReactNode;
  /** 제목 오른쪽 끝 (예: 「보관함 n」 버튼). 넘기면 제목 묶음과 아래 끝을 맞춘다 */
  aside?: ReactNode;
  /**
   * `page`: 목록 · 상세 · 설정 제목 24 · 굵게 (기본).
   * `display`: 시작 화면 · 404의 큰 제목. 크기 · 행간 · 자간은 `titleClassName`으로 보드 값을 넘긴다
   */
  size?: "page" | "display";
  /** h1에 더할 글자 클래스 (`display`의 크기 · 자간). `page`에서는 크기를 다시 넘기지 않는다 */
  titleClassName?: string;
  /** 바깥 묶음 클래스 (예: `max-lg:hidden` · `sr-only`) */
  className?: string;
};

/**
 * 페이지 제목 (`<h1>` + 선택 요약 줄 · 오른쪽 끝).
 *
 * @example
 * <PageTitle summary={`오늘 할 일 ${today}개`} className="max-lg:hidden">태스크</PageTitle>
 * <PageTitle aside={<Button …>보관함 2</Button>}>프로젝트</PageTitle>
 * <PageTitle size="display" titleClassName="text-4xl tracking-[-0.035em] md:text-6xl">조각을 이어</PageTitle>
 */
export default function PageTitle({
  children,
  summary,
  aside,
  size = "page",
  titleClassName,
  className,
}: PageTitleProps) {
  const heading = (
    <div className={cn("flex min-w-0 flex-col gap-1", aside == null ? className : "flex-1")}>
      <h1
        className={cn(
          "font-bold [overflow-wrap:anywhere]",
          size === "page" && "text-2xl",
          titleClassName,
        )}
      >
        {children}
      </h1>
      {summary != null ? <p className="text-sm text-[var(--t2)]">{summary}</p> : null}
    </div>
  );

  if (aside == null) {
    return heading;
  }

  return (
    <div className={cn("flex items-end gap-4", className)}>
      {heading}
      {aside}
    </div>
  );
}
