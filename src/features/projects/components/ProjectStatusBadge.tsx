import StatusBadge from "@/components/ui/badge/StatusBadge";

import ProjectStatusIcon from "@/features/projects/components/ProjectStatusIcon";
import {
  getProjectStatusLabel,
  getProjectStatusStyles,
  getProjectVisualStatus,
} from "@/features/projects/utils/projectUtils";

import { getStatusTone } from "@/lib/statusColors";

import type { ProjectStatus } from "@/features/projects/types/project";

const statusIconSize = 20;
const statusIconMarkClassName = "inline-flex h-5 w-5 shrink-0 items-center justify-center";

/**
 * ProjectStatusIconMark
 *
 * 상태 뱃지 대신 상태 아이콘만 보여 줍니다. 진행률 숫자 줄 높이에 맞춥니다.
 *
 * @param props - ProjectStatusIconMark 컴포넌트 Props
 * @param props.status - 표시할 프로젝트 상태
 * @returns 상태 아이콘
 */
export function ProjectStatusIconMark({ status }: { status: ProjectStatus }) {
  const label = getProjectStatusLabel(status);
  const className = [statusIconMarkClassName, getProjectStatusStyles(status).text].join(" ");

  return (
    <span title={label} aria-label={label} className={className}>
      <ProjectStatusIcon status={status} size={statusIconSize} />
    </span>
  );
}

type ProjectStatusBadgeProps = {
  status: ProjectStatus;
  /** 마감이 지났는지. 진행 중일 때만 상태 옆에 「지연」 뱃지를 붙인다. */
  delayed?: boolean;
  className?: string;
};

/**
 * 프로젝트 상태 뱃지. `StatusBadge` 위에 상태 이름과 색만 정한다.
 *
 * @example
 * <ProjectStatusBadge status="IN_PROGRESS" delayed />
 */
export default function ProjectStatusBadge({
  status,
  delayed = false,
  className = "",
}: ProjectStatusBadgeProps) {
  const isDelayed = getProjectVisualStatus(status, delayed) === "DELAYED";

  return (
    <span className={`inline-flex shrink-0 items-center gap-1 ${className}`}>
      <StatusBadge label={getProjectStatusLabel(status)} tone={getStatusTone(status)} />
      {isDelayed ? <StatusBadge label="지연" tone="danger" showDot={false} /> : null}
    </span>
  );
}
