type ProjectProgressMeterProps = {
  progress: number;
  gradient: string;
  layout?: "inline" | "stacked" | "wide";
};

/**
 * ProjectProgressMeter
 *
 * 프로젝트 진행률을 막대와 퍼센트로 표시합니다.
 *
 * @param props - ProjectProgressMeter 컴포넌트 Props
 * @param props.progress - 0부터 100 사이의 진행률
 * @param props.gradient - 막대에 칠할 그라데이션
 * @param props.layout - inline은 막대와 숫자를 한 줄에, stacked는 숫자를 막대 위에, wide는 막대를 가로로 늘립니다
 */
export default function ProjectProgressMeter({
  progress,
  gradient,
  layout = "inline",
}: ProjectProgressMeterProps) {
  const width = Math.min(100, Math.max(0, progress));

  const bar = (
    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--color-hover)]">
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          backgroundImage: gradient,
        }}
      />
    </div>
  );

  const value = (
    <span className="text-caption shrink-0 font-semibold text-[var(--color-text)] tabular-nums">
      {width}%
    </span>
  );

  if (layout === "wide") {
    return (
      <div className="flex w-full min-w-0 items-center gap-3">
        {bar}
        {value}
      </div>
    );
  }

  if (layout === "stacked") {
    return (
      <div className="min-w-0">
        <div className="mb-1.5">{value}</div>
        <div className="flex">{bar}</div>
      </div>
    );
  }

  return (
    <div className="flex w-[6.5rem] shrink-0 items-center gap-2">
      {bar}
      {value}
    </div>
  );
}
