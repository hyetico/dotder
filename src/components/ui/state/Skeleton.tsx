type SkeletonProps = {
  /** 크기와 모양. 예: `h-16 w-full`. 모서리는 기본 `--radius-md`. */
  className?: string;
};

/**
 * 불러오는 중 자리 표시 막대. 1.2초마다 천천히 깜빡이고, 움직임 줄이기 설정이면 멈춘다.
 *
 * 화면 읽기 프로그램에는 숨긴다. 감싸는 쪽에 `aria-busy="true"`를 단다.
 *
 * @example
 * <div aria-busy="true" className="space-y-2">
 *   <Skeleton className="h-16" />
 *   <Skeleton className="h-16" />
 * </div>
 */
export default function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`skeleton-pulse rounded-[var(--radius-md)] bg-[var(--color-skeleton)] ${className}`}
    />
  );
}
