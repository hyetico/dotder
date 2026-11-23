import Badge from "@/components/ui/badge/Badge";

import type { ReactNode } from "react";

type PageHeadingProps = {
  title: ReactNode;
  description: ReactNode;
  count?: number | null;
  countLabel?: string;
  countTitle?: string;
};

/**
 * PageHeading
 *
 * 목록 화면 맨 위의 제목과 설명을 표시합니다.
 * 제목과 설명은 8px, 제목 영역 아래는 32px입니다.
 * 통계 카드에 전체 개수 카드가 없는 좁은 폭에서는 제목 옆에 개수 뱃지를 보여줍니다.
 *
 * @param props - PageHeading 컴포넌트 Props
 * @param props.title - 페이지 제목
 * @param props.description - 제목 아래 한 줄 설명
 * @param props.count - 제목 옆에 보여줄 전체 개수. 없으면 뱃지를 숨김
 * @param props.countLabel - 개수 대신 뱃지에 그대로 보여줄 문구
 * @param props.countTitle - 개수 뱃지의 툴팁 문구
 */
export default function PageHeading({
  title,
  description,
  count = null,
  countLabel,
  countTitle,
}: PageHeadingProps) {
  const countBadgeClassName =
    "h-6! bg-gray-100 px-2.5! text-sm! text-[var(--color-text-secondary)] @[640px]:hidden";

  return (
    <div className="@container mb-[var(--page-title-below)] min-w-0">
      <h1 className="text-page-title flex items-center gap-2 text-[var(--color-text)]">
        {title}
        {count == null ? null : (
          <Badge className={countBadgeClassName} title={countTitle}>
            {countLabel ?? `${count}개`}
          </Badge>
        )}
      </h1>
      <p className="text-body mt-[var(--page-title-gap)] text-[var(--color-text-secondary)]">
        {description}
      </p>
    </div>
  );
}
