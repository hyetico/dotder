import { AppIcon, CheckCircle2, Circle, Clock, type LucideIcon } from "@/components/ui/icon";

import { getGoalStatusLabel } from "@/features/goals/utils/goalUtils";

import type { GoalStatus } from "@/features/goals/types/goal";

const goalStatusLabelClassName =
  "inline-flex shrink-0 items-center gap-1.5 text-xs leading-5 font-semibold";

const goalStatusTheme: Record<GoalStatus, { icon: LucideIcon; className: string }> = {
  COMPLETED: { icon: CheckCircle2, className: "text-[#16a34a]" },
  IN_PROGRESS: { icon: Clock, className: "text-[#2563eb]" },
  NOT_STARTED: { icon: Circle, className: "text-[#9ca3af]" },
};

type GoalStatusLabelProps = {
  status: GoalStatus;
};

/**
 * GoalStatusLabel
 *
 * 목표 카드와 같은 상태 아이콘과 글자를 표시합니다.
 *
 * @param props - GoalStatusLabel 컴포넌트 Props
 * @param props.status - 표시할 목표 상태
 */
export default function GoalStatusLabel({ status }: GoalStatusLabelProps) {
  const theme = goalStatusTheme[status];

  return (
    <span className={`${goalStatusLabelClassName} ${theme.className}`}>
      <AppIcon icon={theme.icon} size="sm" />
      {getGoalStatusLabel(status)}
    </span>
  );
}
