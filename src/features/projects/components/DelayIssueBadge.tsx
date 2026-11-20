type DelayIssueBadgeProps = {
  days: number;
  size?: "sm" | "md";
};

const delayTextClassName = "shrink-0 font-medium text-[#EF4444] tabular-nums";
const delayTextSizeClassName = {
  sm: "text-xs leading-4",
  md: "text-[13px] leading-5",
} as const;

/**
 * DelayIssueBadge
 *
 * 마감일을 넘긴 프로젝트를 며칠 지연 글자로 표시합니다.
 *
 * @param props - DelayIssueBadge 컴포넌트 Props
 * @param props.days - 마감일 이후 지난 일수
 * @param props.size - 글자 크기. sm은 더 작은 글자입니다
 */
export default function DelayIssueBadge({ days, size = "md" }: DelayIssueBadgeProps) {
  const label = `${days}일 지연`;

  return (
    <span className={[delayTextClassName, delayTextSizeClassName[size]].join(" ")} title={label}>
      {label}
    </span>
  );
}
