"use client";

import { useState } from "react";

import { AppIcon, UserRoundPen } from "@/components/ui/icon";

import SecondaryButton from "@/components/ui/button/SecondaryButton";
import TeamScopeModal from "@/features/projects/modals/TeamScopeModal";

import type { TeamMember } from "@/lib/mock/teamMembers";
import type { ProjectTeamOption } from "@/features/projects/utils/projectTeam";

const adminChangeLabel = "관리자 변경";

type AdminSelectProps = {
  teamValue: string;
  options: ProjectTeamOption[];
  selectedMemberId?: number;
  showIconOnMobile?: boolean;
  onChange: (member: TeamMember) => void;
};

/**
 * AdminSelect
 *
 * 같은 팀 멤버 중에서 프로젝트 관리자를 고르는 버튼과 선택 창입니다.
 *
 * @param props - AdminSelect 컴포넌트 Props
 * @param props.teamValue - 현재 연결된 팀 값
 * @param props.options - 연결된 팀을 표시할 팀 목록
 * @param props.selectedMemberId - 현재 관리자의 멤버 아이디
 * @param props.showIconOnMobile - 모바일에서도 버튼 아이콘을 보여줄지 여부
 * @param props.onChange - 관리자를 확정할 때 실행되는 함수
 */
export default function AdminSelect({
  teamValue,
  options,
  selectedMemberId,
  showIconOnMobile = false,
  onChange,
}: AdminSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => {
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  return (
    <>
      <SecondaryButton
        onClick={open}
        aria-label={adminChangeLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        hideIconOnMobile={!showIconOnMobile}
        icon={<AppIcon icon={UserRoundPen} size="sm" />}
      >
        변경
      </SecondaryButton>

      <TeamScopeModal
        isOpen={isOpen}
        onClose={close}
        title={adminChangeLabel}
        closeLabel="관리자 변경 닫기"
        icon={<AppIcon icon={UserRoundPen} size="sm" />}
        mode="admin"
        options={options}
        teamValue={teamValue}
        selectedMemberId={selectedMemberId}
        onConfirm={onChange}
      />
    </>
  );
}
