import type { ReactNode } from "react";

type PageInsetTop = "page" | "header" | "none";

type PageInsetProps = {
  children: ReactNode;
  className?: string;
  top?: PageInsetTop;
  bottom?: boolean;
};

/**
 * PageInset
 *
 * 페이지 본문의 좌우·아래 여백을 화면 크기에 맞춰 한곳에서 적용합니다.
 * 1440px부터는 그 안쪽 본문을 1280px로 맞춥니다.
 *
 * @param props - PageInset 컴포넌트 Props
 * @param props.children - 페이지 본문
 * @param props.className - 여백 외에 더할 클래스
 * @param props.top - 위 여백. page는 제목 위 32px, header는 헤더 아래 상세, none은 없음
 * @param props.bottom - 아래 페이지 여백을 둘지 여부
 */
export default function PageInset({
  children,
  className,
  top = "page",
  bottom = true,
}: PageInsetProps) {
  const topClassName =
    top === "header"
      ? "pt-[calc(var(--header-height)+0.75rem)] md:pt-[calc(var(--header-height)+1.5rem)]"
      : top === "page"
        ? "pt-[var(--page-title-above)]"
        : "";

  const insetClassName = [
    "px-[var(--page-padding-x)]",
    topClassName,
    bottom ? "pb-[var(--page-padding)]" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const frameClassName = ["page-frame", className ?? ""].filter(Boolean).join(" ");

  return (
    <div className={insetClassName}>
      <div className={frameClassName}>{children}</div>
    </div>
  );
}
