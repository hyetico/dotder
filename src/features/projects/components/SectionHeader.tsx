import type { ReactNode } from "react";

import InfoTooltip, { type InfoTooltipItem } from "@/components/ui/InfoTooltip";

import { getProjectStatusIconSurface } from "@/features/projects/constants/projectStatusColors";

type SectionHeaderProps = {
  icon: ReactNode;
  title: string;
  tooltip?: string | readonly string[];
  tooltipTitle?: string;
  tooltipItems?: readonly InfoTooltipItem[];
  tooltipCentered?: boolean;
  badge?: ReactNode;
  actions?: ReactNode;
  actionsClassName?: string;
  titleClassName?: string;
  iconBoxClassName?: string;
  accentColor?: string;
  plain?: boolean;
};

/**
 * SectionHeader
 *
 * 아이콘, 제목, 안내 툴팁, 오른쪽 액션을 한 줄로 표시하는 컴포넌트입니다.
 * 프로젝트와 목표 상세의 구역 제목이 같은 구성을 공유합니다.
 *
 * @param props - SectionHeader 컴포넌트 Props
 * @param props.icon - 제목 왼쪽 아이콘
 * @param props.title - 구역 제목
 * @param props.tooltip - 제목 옆 안내 문구. 배열이면 문단으로 나눕니다
 * @param props.tooltipTitle - 안내 팝오버 제목. 없으면 구역 제목을 씁니다
 * @param props.tooltipItems - 안내 팝오버에 나열할 항목. 있으면 tooltip 문구는 항목 아래에 표시합니다
 * @param props.tooltipCentered - 안내 문구를 가운데 정렬합니다
 * @param props.badge - 제목 옆에 붙는 뱃지
 * @param props.actions - 오른쪽 끝에 두는 버튼
 * @param props.actionsClassName - 오른쪽 액션 줄에 더할 클래스
 * @param props.titleClassName - 제목 글자 클래스. 기본값은 text-card-title
 * @param props.iconBoxClassName - 아이콘 칸 크기. 기본값은 40px
 * @param props.accentColor - 아이콘 칸 배경에 쓰는 강조색
 * @param props.plain - 아이콘 칸 배경 없이 기본 색으로 표시합니다
 */
export default function SectionHeader({
  icon,
  title,
  tooltip,
  tooltipTitle,
  tooltipItems,
  tooltipCentered = false,
  badge,
  actions,
  actionsClassName = "",
  titleClassName = "text-card-title",
  iconBoxClassName = "h-10 w-10",
  accentColor,
  plain = false,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className={`flex min-w-0 items-center ${plain ? "gap-2" : "gap-3"} `}>
        {plain ? (
          <span className="flex shrink-0 items-center justify-center text-[var(--color-text)]">
            {icon}
          </span>
        ) : (
          <span
            className={`flex ${iconBoxClassName} shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${
              accentColor ? "" : "bg-[var(--color-primary-soft)] text-[var(--color-primary)]"
            } `}
            style={accentColor ? getProjectStatusIconSurface(accentColor) : undefined}
          >
            {icon}
          </span>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className={`text-[var(--color-text)] ${titleClassName} `}>{title}</h2>

            {badge}

            {(tooltip || tooltipItems) && (
              <InfoTooltip
                title={tooltipTitle ?? title}
                description={tooltip}
                items={tooltipItems}
                centered={tooltipCentered}
                maxWidthClassName={tooltipItems ? "max-w-[480px]" : "max-w-[400px]"}
              />
            )}
          </div>
        </div>
      </div>

      {actions ? (
        <div className={`flex shrink-0 flex-wrap items-center gap-2 ${actionsClassName}`}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
