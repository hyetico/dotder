import { type ReactNode } from "react";

import {
  iconSize,
  ArrowRightLeft,
  Ban,
  CalendarDays,
  Crown,
  Flag,
  Folder,
  KeyRound,
  Shield,
  Tag,
  TagPlus,
  Tags,
  Minus,
  UserRoundPen,
  Users,
} from "@/components/ui/icon";
import { type InfoTooltipItem } from "@/components/ui/InfoTooltip";

import ProjectStatusIcon from "@/features/projects/components/ProjectStatusIcon";
import { type ProjectStatus } from "@/features/projects/types/project";
import { projectTeamGuideItems } from "@/features/projects/utils/projectTeam";

import { PROJECT_STATUS_COLOR_SCALES } from "@/lib/statusColors";

function GuideIcon({ color, children }: { color: string; children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-[22px] w-[22px] shrink-0 items-center justify-center"
      style={{ color }}
    >
      {children}
    </span>
  );
}

function guideIcon(color: string, icon: ReactNode) {
  return <GuideIcon color={color}>{icon}</GuideIcon>;
}

const guideIconProps = {
  size: iconSize.sm,
} as const;

export function getProjectGoalTagGuideItems(color: string): InfoTooltipItem[] {
  return [
    {
      label: "기본 태그",
      description:
        "기획, 개발, 디자인, 데이터는 기본으로 들어 있습니다. 겹친 태그 아이콘으로 구분합니다.",
      icon: guideIcon(color, <Tags {...guideIconProps} />),
    },
    {
      label: "추가한 태그",
      description: "직접 입력한 태그는 더하기 태그 아이콘으로, 추가된 태그 영역에 모입니다.",
      icon: guideIcon(color, <TagPlus {...guideIconProps} />),
    },
    {
      label: "목표에서 사용",
      description:
        "기본 태그와 추가한 태그 모두 목표를 만들 때 사용할 수 있습니다. 태그는 최대 10개입니다.",
      icon: guideIcon(color, <Tag {...guideIconProps} />),
    },
  ];
}

export function getProjectMainGuideItems(color: string): InfoTooltipItem[] {
  return [
    {
      label: "하나의 프로젝트",
      description: "메인 설정은 1개의 프로젝트만 할 수 있습니다.",
      icon: guideIcon(color, <Crown {...guideIconProps} />),
    },
    {
      label: "내용 사용",
      description:
        "메인 설정이 되면 모든 내용이 설정된 메인 프로젝트의 내용으로 사용할 수 있습니다.",
      icon: guideIcon(color, <Folder {...guideIconProps} />),
    },
    {
      label: "메인 변경",
      description:
        "다른 프로젝트에 메인 설정이 되어 있다면 해제되고, 현재 설정된 프로젝트로 변경됩니다.",
      icon: guideIcon(color, <ArrowRightLeft {...guideIconProps} />),
    },
  ];
}

export function getProjectAdminGuideItems(color: string): InfoTooltipItem[] {
  return [
    {
      label: "관리자",
      description: "관리자는 프로젝트를 생성한 사람으로 지정됩니다.",
      icon: guideIcon(color, <Shield {...guideIconProps} />),
    },
    {
      label: "관리자 변경",
      description: "현재 관리자는 다른 사람을 관리자로 지정해 권한을 넘길 수 있습니다.",
      icon: guideIcon(color, <UserRoundPen {...guideIconProps} />),
    },
    {
      label: "프로젝트 권한",
      description: "모든 프로젝트 권한은 관리자에게 있습니다.",
      icon: guideIcon(color, <KeyRound {...guideIconProps} />),
    },
  ];
}

const teamGuideIcons = [Minus, Users] as const;

export function getTeamSelectionGuideItems(color: string): InfoTooltipItem[] {
  return projectTeamGuideItems.map((item, index) => {
    const Icon = teamGuideIcons[index] ?? Users;

    return {
      label: item.label,
      description: item.description,
      note: item.note,
      action: item.action,
      icon: guideIcon(color, <Icon {...guideIconProps} />),
    };
  });
}

export function getProjectStatusGuideItems(
  isCreating: boolean,
  currentStatus: ProjectStatus,
  plannedLocked = false,
  isDelayed = false,
): InfoTooltipItem[] {
  return [
    {
      label: "계획",
      description: plannedLocked
        ? "진행 중이거나 보류인 프로젝트는 계획으로 되돌릴 수 없습니다."
        : "아직 시작하지 않은 프로젝트입니다. 목표와 태스크를 미리 추가해 진행을 준비할 수 있습니다.",
      current: currentStatus === "PLANNED",
      icon: guideIcon(
        PROJECT_STATUS_COLOR_SCALES.PLANNED.progress,
        <ProjectStatusIcon status="PLANNED" {...guideIconProps} />,
      ),
    },
    {
      label: "진행 중",
      description: isCreating
        ? [
            "목표와 태스크를 추가하고 작업을 진행할 수 있습니다.",
            "진행 중을 선택한 뒤 프로젝트를 생성하면 계획으로 되돌릴 수 없습니다. 보류로 바꿔도 계획은 선택할 수 없습니다.",
          ]
        : "목표와 태스크를 추가하고 작업을 진행할 수 있습니다.",
      current: currentStatus === "IN_PROGRESS" && !isDelayed,
      icon: guideIcon(
        PROJECT_STATUS_COLOR_SCALES.IN_PROGRESS.progress,
        <ProjectStatusIcon status="IN_PROGRESS" {...guideIconProps} />,
      ),
    },
    {
      label: "보류",
      description: isCreating
        ? [
            "진행이 잠시 멈춰 있는 프로젝트입니다. 진행 중으로 변경하면 다시 이어서 진행할 수 있습니다.",
            "프로젝트를 처음 생성할 때는 보류 상태를 선택할 수 없습니다.",
          ]
        : "진행이 멈춰 있는 프로젝트입니다. 목표를 추가하거나 마감일을 변경할 수 없습니다. 다시 진행하려면 진행 중으로 변경해주세요.",
      current: currentStatus === "ON_HOLD",
      icon: guideIcon(
        PROJECT_STATUS_COLOR_SCALES.ON_HOLD.progress,
        <ProjectStatusIcon status="ON_HOLD" {...guideIconProps} />,
      ),
    },
    {
      label: "지연",
      description:
        "마감일을 넘긴 진행 중 프로젝트입니다. 상태를 변경할 수 없고, 새로운 목표와 태스크를 추가하려면 마감일을 변경해주세요.",
      current: isDelayed,
    },
    {
      label: "완료",
      description: isCreating
        ? "프로젝트를 처음 생성할 때는 완료 상태를 선택할 수 없습니다."
        : "목표와 태스크 진행이 끝난 프로젝트입니다.",
      current: currentStatus === "DONE",
      icon: guideIcon(
        PROJECT_STATUS_COLOR_SCALES.DONE.progress,
        <ProjectStatusIcon status="DONE" {...guideIconProps} />,
      ),
    },
  ];
}

function getProjectStartDateGuideItems(color: string): InfoTooltipItem[] {
  return [
    {
      label: "시작일",
      description: "시작일은 한 번 설정하면 프로젝트 수정할 때 변경할 수 없습니다.",
      icon: guideIcon(color, <CalendarDays {...guideIconProps} />),
    },
  ];
}

export function getProjectPeriodGuideItems(color: string): InfoTooltipItem[] {
  return [...getProjectStartDateGuideItems(color), ...getProjectDeadlineGuideItems(color)];
}

function getProjectDeadlineGuideItems(color: string): InfoTooltipItem[] {
  const delayedColor = PROJECT_STATUS_COLOR_SCALES.DELAYED.progress;

  return [
    {
      label: "마감일",
      description: ["프로젝트를 완료해야 하는 날짜입니다.", "시작일 이후로 선택할 수 있습니다."],
      icon: guideIcon(color, <Flag {...guideIconProps} />),
    },
    {
      label: "지연 상태",
      description: "마감일을 넘기면 프로젝트 상태가 지연으로 변경됩니다.",
    },
    {
      label: "추가 제한",
      description: [
        "지연 상태에서는 새로운 목표와 태스크를 추가할 수 없습니다.",
        "다시 추가하려면 마감일을 변경해주세요.",
      ],
      icon: guideIcon(delayedColor, <Ban {...guideIconProps} />),
    },
  ];
}
