import { cn } from "@/lib/cn";

import type { ReactNode } from "react";

type TourBannerProps = {
  /** 왼쪽 안내 글. 모바일에서는 첫 문장만 보인다 */
  text: string;
  /** 「 · 」 뒤 덧붙임 (md 이상) */
  detail?: string;
  /** 왼쪽 작은 그림 */
  mark?: ReactNode;
  /** 테두리 버튼 「둘러보기 끝내기」 */
  secondaryLabel: string;
  onSecondary: () => void;
  /** 채운 버튼 「내 기록 시작하기」 */
  primaryLabel: string;
  onPrimary: () => void;
};

const bannerButtonClassName =
  "kit-focus inline-flex h-[var(--btn-h-xs)] shrink-0 cursor-pointer items-center rounded-[var(--radius-sm)] px-[var(--btn-px-xs)] text-xs whitespace-nowrap transition-colors duration-120";

/**
 * 화면 맨 위 안내 띠 (보드 E01 「예시 데이터로 둘러보는 중이에요」). 높이 44 · 다크 · 좌우 24(모바일 16).
 *
 * @example
 * <TourBanner text="예시 데이터로 둘러보는 중이에요" secondaryLabel="둘러보기 끝내기" onSecondary={end} primaryLabel="내 기록 시작하기" onPrimary={start} />
 */
export default function TourBanner({
  text,
  detail,
  mark,
  secondaryLabel,
  onSecondary,
  primaryLabel,
  onPrimary,
}: TourBannerProps) {
  return (
    <div
      role="region"
      aria-label={text}
      className="sticky top-0 z-[var(--z-header)] flex h-11 items-center gap-3 bg-[var(--tip-bg)] px-4 text-sm text-[var(--tip-fg)] md:px-6"
    >
      {mark ? <span className="max-md:hidden">{mark}</span> : null}
      <span className="min-w-0 flex-1 truncate">
        {text}
        {detail ? <span className="max-md:hidden"> · {detail}</span> : null}
      </span>
      <button
        type="button"
        onClick={onSecondary}
        className={cn(
          bannerButtonClassName,
          "border border-[var(--tip-line)] hover:bg-[var(--tip-line)]",
        )}
      >
        {secondaryLabel}
      </button>
      <button
        type="button"
        onClick={onPrimary}
        className={cn(
          bannerButtonClassName,
          "bg-[var(--tip-fg)] font-semibold text-[var(--tip-bg)]",
        )}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
