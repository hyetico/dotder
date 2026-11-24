import StatusBadge from "@/components/ui/badge/StatusBadge";

import {
  getGoalStatusColorKey,
  getGoalStatusLabel,
  getGoalVisualStatus,
} from "@/features/goals/utils/goalUtils";

import { getStatusTone } from "@/lib/statusColors";

import type { GoalStatus } from "@/features/goals/types/goal";

type GoalStatusBadgeProps = {
  status: GoalStatus;
  /** 마감이 지났는지. 완료가 아니면 상태 옆에 「지연」 뱃지를 붙인다. */
  delayed?: boolean;
  className?: string;
};

/**
 * 목표 상태 뱃지. `StatusBadge` 위에 상태 이름과 색만 정한다.
 *
 * @example
 * <GoalStatusBadge status="IN_PROGRESS" delayed />
 */
export default function GoalStatusBadge({
  status,
  delayed = false,
  className = "",
}: GoalStatusBadgeProps) {
  const isDelayed = getGoalVisualStatus(status, delayed) === "DELAYED";

  return (
    <span className={`inline-flex shrink-0 items-center gap-1 ${className}`}>
      <StatusBadge
        label={getGoalStatusLabel(status)}
        tone={getStatusTone(getGoalStatusColorKey(status))}
      />
      {isDelayed ? <StatusBadge label="지연" tone="danger" showDot={false} /> : null}
    </span>
  );
}
