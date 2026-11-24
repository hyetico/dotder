import { forwardRef, type CSSProperties } from "react";

import {
  CheckCircle2,
  Circle,
  PauseCircle,
  TriangleAlert,
  iconStroke,
  type LucideIcon,
} from "@/components/ui/icon";

import type { ProjectStatusColorKey } from "@/lib/statusColors";

type ProjectInProgressIconProps = {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  className?: string;
  style?: CSSProperties;
};

/**
 * ProjectInProgressIcon
 *
 * 프로젝트 진행 중 아이콘입니다.
 * 원은 아이콘 색으로 채우고, 재생 삼각형과 테두리는 흰색입니다.
 *
 * @param props - ProjectInProgressIcon 컴포넌트 Props
 * @param props.size - 아이콘 크기
 * @param props.color - 아이콘 색
 * @param props.strokeWidth - 선 굵기
 * @param props.className - 아이콘에 더할 클래스
 * @param props.style - 아이콘에 더할 스타일
 * @returns 원이 채워진 진행 중 아이콘
 */
export const ProjectInProgressIcon = forwardRef<SVGSVGElement, ProjectInProgressIconProps>(
  function ProjectInProgressIcon(
    { size = 24, color, strokeWidth = iconStroke, className, style },
    ref,
  ) {
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        color={color}
        style={style}
        aria-hidden
      >
        <circle cx="12" cy="12" r="10" fill="currentColor" />
        <path d="M9.8 8 L16.5 12 L9.8 16 Z" fill="#fff" stroke="#fff" strokeLinejoin="miter" />
      </svg>
    );
  },
) as LucideIcon;

const PROJECT_STATUS_ICONS: Record<ProjectStatusColorKey, LucideIcon> = {
  PLANNED: Circle,
  IN_PROGRESS: ProjectInProgressIcon,
  ON_HOLD: PauseCircle,
  DONE: CheckCircle2,
  DELAYED: TriangleAlert,
};

type ProjectStatusIconProps = {
  status: ProjectStatusColorKey;
  size?: number;
  className?: string;
};

export default function ProjectStatusIcon({
  status,
  size = 12,
  className = "",
}: ProjectStatusIconProps) {
  const Icon = PROJECT_STATUS_ICONS[status] ?? Circle;

  return <Icon size={size} strokeWidth={iconStroke} aria-hidden className={className} />;
}
