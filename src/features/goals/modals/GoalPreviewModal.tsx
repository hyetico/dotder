"use client";

import { useId, type ReactNode } from "react";

import ExpandablePreviewText from "@/components/ui/ExpandablePreviewText";
import Modal from "@/components/ui/modal/Modal";

import GoalBadge from "@/features/goals/components/GoalBadge";
import GoalStatusBadge from "@/features/goals/components/GoalStatusBadge";
import GoalTag from "@/features/goals/components/GoalTag";
import ProjectBadge from "@/features/projects/components/ProjectBadge";

import { formatDateRange } from "@/lib/date";

import type { GoalStatus } from "@/features/goals/types/goal";
import type { ProjectColorKey } from "@/lib/projectPalette";

type GoalPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  color: ProjectColorKey | null;
  status: GoalStatus;
  delayed?: boolean;
  startDate: string;
  endDate: string;
  projectName: string;
  projectEmptyLabel: string;
  projectColor: ProjectColorKey | null;
  projectIsMain?: boolean;
  authorName: string;
  tags: string[];
};

/**
 * PreviewRow
 *
 * 목표 미리보기에서 항목 이름과 값을 한 줄로 보여 줍니다.
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
 * GoalPreviewModal
 *
 * 작성 중인 목표 이름, 상태, 설명, 기간, 프로젝트, 태그를 모달에서 확인합니다.
 *
 * @param props - GoalPreviewModal 컴포넌트 Props
 * @param props.isOpen - 모달을 열지 여부
 * @param props.onClose - 모달을 닫을 때 실행되는 함수
 * @param props.title - 목표 이름
 * @param props.description - 목표 설명
 * @param props.color - 목표 색상
 * @param props.status - 목표 상태
 * @param props.delayed - 연결된 프로젝트가 지연인지 여부
 * @param props.startDate - 시작일
 * @param props.endDate - 마감일
 * @param props.projectName - 연결된 프로젝트 이름. 없으면 빈 문자열
 * @param props.projectEmptyLabel - 프로젝트가 없을 때 보여줄 문구
 * @param props.projectColor - 연결된 프로젝트 색상
 * @param props.projectIsMain - 연결된 프로젝트가 메인인지 여부
 * @param props.authorName - 작성자 이름
 * @param props.tags - 선택한 태그
 */
export default function GoalPreviewModal({
  isOpen,
  onClose,
  title,
  description,
  color,
  status,
  delayed = false,
  startDate,
  endDate,
  projectName,
  projectEmptyLabel,
  projectColor,
  projectIsMain = false,
  authorName,
  tags,
}: GoalPreviewModalProps) {
  const titleId = useId();

  const period = formatDateRange(startDate, endDate);

  const trimmedTitle = title.trim();

  const trimmedDescription = description.trim();

  const descriptionText = trimmedDescription || "목표에 대한 설명을 입력하세요";

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy={titleId}>
      <Modal.Header id={titleId} title="목표 미리보기" onClose={onClose} />

      <Modal.Body className="!pt-0">
        <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <PreviewRow label="목표 색상" bordered={false}>
            <GoalBadge color={color} size="xs" />
          </PreviewRow>

          <PreviewRow label="목표 이름">
            <p
              className={`text-caption break-words ${
                trimmedTitle
                  ? "font-medium text-[var(--color-text)]"
                  : "text-[var(--color-text-muted)]"
              } `}
            >
              {trimmedTitle || "목표 이름을 입력하세요"}
            </p>
          </PreviewRow>

          <PreviewRow label="목표 상태">
            <GoalStatusBadge status={status} delayed={delayed} />
          </PreviewRow>

          <PreviewRow label="목표 설명" align="start">
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

          <PreviewRow label="프로젝트">
            {projectName ? (
              <div className="flex min-w-0 items-center gap-2">
                <ProjectBadge color={projectColor} isMain={projectIsMain} size="xs" />

                <p className="text-caption min-w-0 truncate font-medium text-[var(--color-text)]">
                  {projectName}
                </p>
              </div>
            ) : (
              <p className="text-caption text-[var(--color-text-muted)]">{projectEmptyLabel}</p>
            )}
          </PreviewRow>

          <PreviewRow label="태그">
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

          <PreviewRow label="작성자">
            <p className="text-caption font-medium break-words text-[var(--color-text)]">
              {authorName}
            </p>
          </PreviewRow>
        </div>
      </Modal.Body>
    </Modal>
  );
}
