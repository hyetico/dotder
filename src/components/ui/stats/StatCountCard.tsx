import { AppIcon, type LucideIcon } from "@/components/ui/icon";

type StatCountPair = {
  label: string;
  count: number;
  className?: string;
};

type StatCountCardProps = {
  label: string;
  count: number;
  icon: LucideIcon;
  iconClassName: string;
  unit?: string;
  pair?: StatCountPair;
};

type StatCountSideProps = {
  label: string;
  count: number;
  unit: string;
  icon?: LucideIcon;
  iconClassName?: string;
  textClassName?: string;
};

/**
 * StatCountSide
 *
 * 상태 카드 한쪽에 아이콘과 이름, 개수를 표시합니다.
 * 모바일에서만 아이콘을 숨깁니다.
 *
 * @param props - StatCountSide 컴포넌트 Props
 * @param props.label - 표시 이름
 * @param props.count - 표시할 개수
 * @param props.unit - 개수 뒤에 붙는 단위
 * @param props.icon - 왼쪽 아이콘. 없으면 이름과 개수만 표시합니다
 * @param props.iconClassName - 아이콘 색
 * @param props.textClassName - 이름과 개수 색. 기본값은 본문 색
 */
function StatCountSide({
  label,
  count,
  unit,
  icon,
  iconClassName,
  textClassName = "text-[var(--color-text)]",
}: StatCountSideProps) {
  const iconWrapClassName = `hidden shrink-0 items-center justify-center md:flex ${iconClassName ?? ""}`;
  const labelClassName = `text-xs ${textClassName}`;
  const countClassName = `mt-0.5 text-sm font-semibold ${textClassName}`;

  return (
    <div className="flex items-center gap-3">
      {icon ? (
        <span className={iconWrapClassName}>
          <AppIcon icon={icon} size="md" className="h-[24px] w-[24px]" />
        </span>
      ) : null}
      <div>
        <p className={labelClassName}>{label}</p>
        <p className={countClassName}>
          <span className="tabular-nums">{count}</span>
          {unit}
        </p>
      </div>
    </div>
  );
}

/**
 * StatCountCard
 *
 * 프로젝트, 목표, 태스크 등의 개수를 아이콘과 함께 카드로 표시하는 공용 컴포넌트입니다.
 *
 * @param props - StatCountCard 컴포넌트 Props
 * @param props.label - 카드 이름
 * @param props.count - 표시할 개수
 * @param props.icon - 왼쪽 아이콘
 * @param props.iconClassName - 아이콘 색
 * @param props.unit - 개수 뒤에 붙는 단위. 기본값은 "개"
 * @param props.pair - 가운데 점으로 나란히 둘 상태
 */
export default function StatCountCard({
  label,
  count,
  icon,
  iconClassName,
  unit = "개",
  pair,
}: StatCountCardProps) {
  return (
    <div className="flex h-full min-w-0 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 md:px-4">
      <StatCountSide
        label={label}
        count={count}
        unit={unit}
        icon={icon}
        iconClassName={iconClassName}
      />
      {pair ? (
        <>
          <span className="shrink-0 px-2 text-sm text-[var(--color-text)]">·</span>
          <StatCountSide
            label={pair.label}
            count={pair.count}
            unit={unit}
            textClassName={pair.className}
          />
        </>
      ) : null}
    </div>
  );
}
