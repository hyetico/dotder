"use client";

import { useId, type ReactNode } from "react";

import ExpandablePreviewText from "@/components/ui/ExpandablePreviewText";
import GoalTag from "@/features/goals/components/GoalTag";
import ProjectBadge from "@/features/projects/components/ProjectBadge";
import ProjectStatusBadge from "@/features/projects/components/ProjectStatusBadge";
import Modal from "@/components/ui/modal/Modal";

import { formatProjectDate, formatProjectDateRange } from "@/features/projects/utils/projectUtils";

import type { ProjectStatus } from "@/features/projects/types/project";

type ProjectPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  name: string;
  description: string;
  color: string | null;
  isMain: boolean;
  status: ProjectStatus;
  delayed?: boolean;
  startDate: string;
  endDate: string;
  teamLabel: string;
  adminName: string;
  tags: string[];
};

/**
 * PreviewPeriod
 *
 * 시작일과 마감일을 미리보기 기간 문구로 바꿉니다.
 *
 * @param startDate - 시작일
 * @param endDate - 마감일
 * @returns 기간 문구. 날짜가 없으면 빈 문자열
 */
function formatPreviewPeriod(startDate: string, endDate: string) {
  if (startDate && endDate) {
    return formatProjectDateRange(startDate, endDate);
  }

  if (startDate) {
    return `${formatProjectDate(startDate)} ~`;
  }

  if (endDate) {
    return formatProjectDate(endDate);
  }

  return "";
}

/**
 * PreviewRow
 *
 * 프로젝트 미리보기에서 항목 이름과 값을 한 줄로 보여 줍니다.
 *
 * @param props - PreviewRow 컴포넌트 Props
 * @param props.label - 항목 이름
 * @param props.children - 항목 값
 * @param props.align - 항목 이름과 값의 세로 정렬. 기본값은 center
 * @param props.bordered - 위쪽 구분선을 둘지 여부. 기본값은 true
 */
function PreviewRow({
  label,
  children,
  align = "center",
  bordered = true,
}: {
  label: string;
  children: ReactNode;
  align?: "center" | "start";
  bordered?: boolean;
}) {
  return (
    <div
      className={`flex gap-2 px-[10px] py-2 md:px-4 ${
        align === "start" ? "items-start" : "items-center"
      } ${bordered ? `border-t border-[var(--color-border)]` : ""} `}
    >
      <p className="text-caption flex h-4 shrink-0 items-center whitespace-nowrap text-[var(--color-text-muted)]">
        {label}
      </p>

      <div
        className={`text-caption min-w-0 flex-1 ${align === "start" ? "" : "flex items-center"} `}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * ProjectPreviewModal
 *
 * 작성 중인 프로젝트 이름, 상태, 설명, 기간, 팀, 태그를 모달에서 확인합니다.
 *
 * @param props - ProjectPreviewModal 컴포넌트 Props
 * @param props.isOpen - 모달을 열지 여부
 * @param props.onClose - 모달을 닫을 때 실행되는 함수
 * @param props.name - 프로젝트 이름
 * @param props.description - 프로젝트 설명
 * @param props.color - 프로젝트 색상
 * @param props.isMain - 메인 프로젝트 여부
 * @param props.status - 프로젝트 상태
 * @param props.delayed - 진행 중 프로젝트가 마감일을 넘겼는지 여부
 * @param props.startDate - 시작일
 * @param props.endDate - 마감일
 * @param props.teamLabel - 팀 이름
 * @param props.adminName - 관리자 이름
 * @param props.tags - 목표 태그
 */
export default function ProjectPreviewModal({
  isOpen,
  onClose,
  name,
  description,
  color,
  isMain,
  status,
  delayed = false,
  startDate,
  endDate,
  teamLabel,
  adminName,
  tags,
}: ProjectPreviewModalProps) {
  const titleId = useId();

  const period = formatPreviewPeriod(startDate, endDate);

  const trimmedName = name.trim();

  const trimmedDescription = description.trim();

  const descriptionText = trimmedDescription || "설명을 입력하세요";

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy={titleId} maxWidthClassName="max-w-[480px]">
      <Modal.Header id={titleId} title="프로젝트 미리보기" onClose={onClose} />

      <Modal.Body className="!pt-0">
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <PreviewRow label="프로젝트 색상" bordered={false}>
            <ProjectBadge color={color} isMain={isMain} size="xs" className="!h-5 !w-5" />
          </PreviewRow>

          <PreviewRow label="프로젝트 이름">
            <p
              className={`text-caption break-words ${
                trimmedName
                  ? "font-medium text-[var(--color-text)]"
                  : "text-[var(--color-text-muted)]"
              } `}
            >
              {trimmedName || "이름을 입력하세요"}
            </p>
          </PreviewRow>

          <PreviewRow label="프로젝트 상태">
            <ProjectStatusBadge status={status} delayed={delayed} className="!h-5" />
          </PreviewRow>

          <PreviewRow label="프로젝트 설명" align="start">
            <ExpandablePreviewText
              text={descriptionText}
              muted={!trimmedDescription}
              clampClassName="line-clamp-4"
              showFade={false}
              textClassName={
                trimmedDescription
                  ? "text-caption text-[var(--color-text-secondary)]"
                  : "text-caption"
              }
            />
          </PreviewRow>

          <PreviewRow label="기간">
            <p
              className={`text-caption break-words ${
                period ? "font-medium text-[var(--color-text)]" : "text-[var(--color-text-muted)]"
              } `}
            >
              {period || "기간을 선택하세요"}
            </p>
          </PreviewRow>

          <PreviewRow label="팀">
            <p className="text-caption font-medium break-words text-[var(--color-text)]">
              {teamLabel}
            </p>
          </PreviewRow>

          <PreviewRow label="프로젝트 관리자">
            <p className="text-caption font-medium break-words text-[var(--color-text)]">
              {adminName}
            </p>
          </PreviewRow>

          <PreviewRow label="목표 태그">
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <GoalTag key={tag} tag={tag} />
                ))}
              </div>
            ) : (
              <p className="text-caption text-[var(--color-text-muted)]">태그 없음</p>
            )}
          </PreviewRow>
        </div>
      </Modal.Body>
    </Modal>
  );
}
