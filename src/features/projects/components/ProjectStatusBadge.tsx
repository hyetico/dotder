import Badge, { badgeIconSize, type BadgeSize } from "@/components/ui/badge/Badge";

import ProjectStatusIcon from "@/features/projects/components/ProjectStatusIcon";
import {
  getProjectStatusLabel,
  getProjectStatusStyles,
  getProjectVisualStatus,
} from "@/features/projects/utils/projectUtils";

import type { ProjectStatus } from "@/features/projects/types/project";
import type { ReactNode } from "react";

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
  delayed?: boolean;
  icon?: ReactNode | null;
  count?: number;
  size?: BadgeSize;
  className?: string;
};

export default function ProjectStatusBadge({
  status,
  delayed = false,
  icon,
  count,
  size = "md",
  className = "",
}: ProjectStatusBadgeProps) {
  const appearance = getProjectVisualStatus(status, delayed);

  const styles = getProjectStatusStyles(appearance);
  const hideIconOnMobile = appearance === "IN_PROGRESS";
  const statusIcon =
    appearance === "DELAYED" ? null : icon === undefined ? (
      <ProjectStatusIcon status={appearance} size={badgeIconSize[size]} />
    ) : (
      icon
    );

  return (
    <Badge className={`${styles.badge} ${className}`} shape="rounded" size={size}>
      {statusIcon ? (
        <span className={`inline-flex ${hideIconOnMobile ? "max-md:hidden" : ""} `}>
          {statusIcon}
        </span>
      ) : null}
      {getProjectStatusLabel(appearance)}
      {count != null ? <span className="tabular-nums">{count > 99 ? "+99" : count}</span> : null}
    </Badge>
  );
}
