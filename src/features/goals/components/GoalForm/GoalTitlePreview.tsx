"use client";

import GoalBadge from "@/features/goals/components/GoalBadge";
import SplitTitlePreview from "@/components/ui/SplitTitlePreview";

import { isGoalDelayed } from "@/features/goals/utils/goalUtils";

import type { GoalStatus } from "@/features/goals/types/goal";

type GoalTitlePreviewProps = {
  title: string;
  description: string;
  color: string | null;
  status: GoalStatus;
  projectDelayed?: boolean;
};

/**
 * GoalTitlePreview
 *
 * 목표 생성·수정 폼 상단에 뱃지, 이름, 설명을 미리 보여주는 컴포넌트입니다.
 * 이름이나 설명이 비어 있으면 안내 문구를 흐리게 표시합니다.
 *
 * @param props - GoalTitlePreview 컴포넌트 Props
 * @param props.title - 입력 중인 목표 이름
 * @param props.description - 입력 중인 목표 설명
 * @param props.color - 선택한 목표 색상
 * @param props.status - 선택한 목표 상태
 * @param props.projectDelayed - 연결된 프로젝트가 지연 상태인지 여부. 기본값은 false
 */
export default function GoalTitlePreview({
  title,
  description,
  color,
  status,
  projectDelayed = false,
}: GoalTitlePreviewProps) {
  const trimmedTitle = title.trim();

  const trimmedDescription = description.trim();

  const delayed = isGoalDelayed({ status }, projectDelayed);

  return (
    <SplitTitlePreview
      title={trimmedTitle || "목표 이름을 입력하세요"}
      titleMuted={!trimmedTitle}
      description={trimmedDescription || "목표에 대한 설명을 입력하세요"}
      descriptionMuted={!trimmedDescription}
      mobileBadge={
        <GoalBadge
          color={color}
          status={status}
          delayed={delayed}
          size="lg"
          className="!h-16 !w-16"
        />
      }
      desktopBadge={<GoalBadge color={color} status={status} delayed={delayed} size="xl" />}
    />
  );
}
