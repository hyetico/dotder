import Button from "@/components/kit/Button";

type TourBannerProps = {
  /** 왼쪽 안내 글. 모바일에서는 이 첫 문장만 보인다 */
  text: string;
  /** 「 · 」 뒤 덧붙임 (md 이상) */
  detail?: string;
  /** 보조 버튼 「둘러보기 끝내기」 */
  secondaryLabel: string;
  onSecondary: () => void;
  /** 주 버튼 「내 기록 시작하기」 */
  primaryLabel: string;
  onPrimary: () => void;
};

// xs 28 · 최소 너비 104 · 글자 줄 높이 1로 세로 정중앙 (kit의 1px 내림 보정은 하지 않는다)
const bannerButtonClassName = "min-w-26 pt-0! leading-none";

/**
 * 화면 맨 위 안내 띠 (예시 모드에서만, 보드 E01 「예시 데이터로 둘러보는 중이에요」).
 * 높이 44 · 화면 모드를 따라가는 바탕 --s2 · 글자 --text · 아래 선 --border · 좌우 24(모바일 16).
 * 코치마크 막보다 위(--z-tour-banner)라 안내 중에도 「둘러보기 끝내기」를 누를 수 있다.
 *
 * @example
 * <TourBanner text="예시 데이터로 둘러보는 중이에요" detail="바꿔도 내 기록에는 남지 않아요" secondaryLabel="둘러보기 끝내기" onSecondary={end} primaryLabel="내 기록 시작하기" onPrimary={start} />
 */
export default function TourBanner({
  text,
  detail,
  secondaryLabel,
  onSecondary,
  primaryLabel,
  onPrimary,
}: TourBannerProps) {
  return (
    <div
      role="region"
      aria-label={text}
      className="sticky top-0 z-[var(--z-tour-banner)] flex h-11 items-center gap-3 border-b border-[var(--border)] bg-[var(--s2)] px-4 text-sm text-[var(--text)] md:px-6"
    >
      <span className="min-w-0 flex-1 truncate">
        {text}
        {detail ? <span className="max-md:hidden"> · {detail}</span> : null}
      </span>
      <Button size="xs" variant="secondary" onClick={onSecondary} className={bannerButtonClassName}>
        {secondaryLabel}
      </Button>
      <Button size="xs" variant="primary" onClick={onPrimary} className={bannerButtonClassName}>
        {primaryLabel}
      </Button>
    </div>
  );
}
