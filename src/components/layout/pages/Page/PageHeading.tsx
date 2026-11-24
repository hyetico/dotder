import Badge from "@/components/ui/badge/Badge";

import type { ReactNode } from "react";

type PageHeadingProps = {
  title: ReactNode;
  /** 제목 아래 한 줄 설명. */
  description?: ReactNode;
  /**
   * `page`: 목록 화면. 제목·설명 사이 8, 아래 32.
   * `form`: 수정·생성 페이지 위 제목. 제목·설명 사이 4, 아래 여백 없음(감싼 쪽이 정한다).
   */
  variant?: "page" | "form";
  /** 가운데 정렬. 폼 페이지에서 쓴다. */
  align?: "start" | "center";
  /** 제목 앞 아이콘. `AppIcon`을 넘긴다. */
  icon?: ReactNode;
  /** 제목 옆에 보여줄 전체 개수. 없으면 뱃지를 숨긴다. */
  count?: number | null;
  /** 개수 대신 뱃지에 그대로 보여줄 문구. */
  countLabel?: string;
  /** 개수 뱃지의 툴팁 문구. */
  countTitle?: string;
  /** 바깥 칸에 더할 클래스 (보이기·여백). */
  className?: string;
};

/**
 * 페이지 제목과 설명. 화면의 `<h1>`은 이것 하나만 쓴다.
 *
 * 목록 화면(`page`)은 통계 카드에 전체 개수 카드가 없는 좁은 폭에서 제목 옆에 개수 뱃지를 보여준다.
 *
 * @example
 * <PageHeading title="전체 프로젝트" description="프로젝트를 한곳에서 확인하고 관리하세요." count={15} />
 * <PageHeading variant="form" align="center" title="프로젝트 수정" description="…" />
 */
export default function PageHeading({
  title,
  description,
  variant = "page",
  align = "start",
  icon,
  count = null,
  countLabel,
  countTitle,
  className = "",
}: PageHeadingProps) {
  const countBadgeClassName =
    "h-6! bg-[var(--color-hover)] px-2.5! text-sm! text-[var(--color-text-secondary)] @[640px]:hidden";
  const isForm = variant === "form";
  const frameClassName = isForm ? "min-w-0" : "@container mb-[var(--page-title-below)] min-w-0";
  const titleClassName = `text-page-title flex items-center gap-2 text-[var(--color-text)] ${
    align === "center" ? "justify-center" : ""
  }`;
  const descriptionClassName = `text-body text-[var(--color-text-secondary)] ${
    isForm ? "mt-1" : "mt-[var(--page-title-gap)]"
  }`;

  return (
    <div className={`${frameClassName} ${align === "center" ? "text-center" : ""} ${className}`}>
      <h1 className={titleClassName}>
        {icon}
        {title}
        {count == null || isForm ? null : (
          <Badge className={countBadgeClassName} title={countTitle}>
            {countLabel ?? `${count}개`}
          </Badge>
        )}
      </h1>
      {description ? <p className={descriptionClassName}>{description}</p> : null}
    </div>
  );
}
