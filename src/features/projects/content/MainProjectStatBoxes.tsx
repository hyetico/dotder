import {
  AppIcon,
  BarChart3,
  Calendar,
  CheckCircle2,
  Circle,
  PauseCircle,
  Target,
  type LucideIcon,
} from "@/components/ui/icon";
import StatCountGrid from "@/components/ui/stats/StatCountGrid";

import { ProjectInProgressIcon } from "@/features/projects/components/ProjectStatusIcon";
import {
  getProjectScheduleSnapshot,
  getProjectStatusLabel,
  getProjectStatusStyles,
} from "@/features/projects/utils/projectUtils";

import type { ProjectListItem, ProjectStatus } from "@/features/projects/types/project";

const statBoxClassName =
  "flex h-full min-w-0 items-center rounded-[4px] border border-[var(--color-border)] bg-white px-3 py-3 md:px-4";
const statLabelClassName = "text-xs text-[var(--color-text)]";
const statValueClassName = "mt-0.5 text-sm font-semibold tabular-nums";

const statusIcons: Record<ProjectStatus, LucideIcon> = {
  PLANNED: Circle,
  IN_PROGRESS: ProjectInProgressIcon,
  ON_HOLD: PauseCircle,
  DONE: CheckCircle2,
};

type MainProjectStatBoxProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName: string;
  valueClassName: string;
};

/**
 * MainProjectStatBox
 *
 * 메인 프로젝트의 항목 하나를 상태 박스로 표시합니다.
 *
 * @param props - MainProjectStatBox 컴포넌트 Props
 * @param props.label - 박스 이름
 * @param props.value - 표시할 값
 * @param props.icon - 왼쪽 아이콘
 * @param props.iconClassName - 아이콘 색
 * @param props.valueClassName - 값 색
 */
function MainProjectStatBox({
  label,
  value,
  icon,
  iconClassName,
  valueClassName,
}: MainProjectStatBoxProps) {
  const iconWrapClassName = ["hidden shrink-0 items-center justify-center md:flex", iconClassName].join(" ");
  const numberClassName = [statValueClassName, valueClassName].join(" ");

  return (
    <div className={statBoxClassName}>
      <div className="flex min-w-0 items-center gap-3">
        <span className={iconWrapClassName}>
          <AppIcon icon={icon} size="md" className="h-[24px] w-[24px]" />
        </span>
        <div className="min-w-0">
          <p className={statLabelClassName}>{label}</p>
          <p className={numberClassName}>{value}</p>
        </div>
      </div>
    </div>
  );
}

type MainProjectStatBoxesProps = {
  project: ProjectListItem;
};

/**
 * MainProjectStatBoxes
 *
 * 메인 프로젝트의 상태, 진행률, 목표, 태스크, 지연을 상태 박스로 표시합니다.
 *
 * @param props - MainProjectStatBoxes 컴포넌트 Props
 * @param props.project - 표시할 메인 프로젝트
 */
export default function MainProjectStatBoxes({ project }: MainProjectStatBoxesProps) {
  const schedule = getProjectScheduleSnapshot(project);
  const percent = Math.min(100, Math.max(0, project.progress));
  const overdue = schedule.tone === "overdue";
  const items = [
    {
      label: "상태",
      value: getProjectStatusLabel(project.status),
      icon: statusIcons[project.status],
      iconClassName: getProjectStatusStyles(project.status).text,
      valueClassName: "text-[var(--color-text)]",
    },
    {
      label: "전체 진행률",
      value: `${percent}%`,
      icon: BarChart3,
      iconClassName: "text-[var(--color-text)]",
      valueClassName: "text-[var(--color-text)]",
    },
    {
      label: "목표",
      value: `${project.completedGoals}/${project.totalGoals} 완료`,
      icon: Target,
      iconClassName: "text-[var(--color-text)]",
      valueClassName: "text-[var(--color-text)]",
    },
    {
      label: "태스크",
      value: `${project.completedTasks}/${project.totalTasks} 완료`,
      icon: CheckCircle2,
      iconClassName: "text-[var(--color-text)]",
      valueClassName: "text-[var(--color-text)]",
    },
    {
      label: "지연",
      value: `${overdue ? schedule.overdueDays : 0}일`,
      icon: Calendar,
      iconClassName: overdue ? "text-red-600" : "text-[var(--color-text)]",
      valueClassName: overdue ? "text-red-600" : "text-[var(--color-text)]",
    },
  ];

  return (
    <StatCountGrid>
      {items.map((item) => (
        <MainProjectStatBox key={item.label} {...item} />
      ))}
    </StatCountGrid>
  );
}
