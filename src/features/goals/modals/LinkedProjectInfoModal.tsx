"use client";

import { useId, type ReactNode } from "react";

import CrownBadge from "@/components/ui/badge/CrownBadge";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import ExpandablePreviewText from "@/components/ui/ExpandablePreviewText";
import FieldNotice from "@/components/ui/FieldNotice";
import Modal from "@/components/ui/modal/Modal";

import GoalTag from "@/features/goals/components/GoalTag";
import ProjectBadge from "@/features/projects/components/ProjectBadge";
import ProjectStatusBadge from "@/features/projects/components/ProjectStatusBadge";
import { getProjectTeamLabel } from "@/features/projects/utils/projectTeam";
import { isProjectDelayed } from "@/features/projects/utils/projectUtils";

import { getUserName } from "@/lib/mock/users";

import type { ProjectStatus } from "@/features/projects/types/project";

type LinkedProject = {
  name: string;
  description: string;
  color: string | null;
  isMain: boolean;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  tags: string[];
  teamId: number | null;
  isPersonal: boolean;
  creatorId: number;
};

type LinkedProjectInfoModalProps = {
  isOpen: boolean;
  onClose: () => void;
  project: LinkedProject | null;
};

/**
 * formatLinkedProjectDate
 *
 * 연결 프로젝트 날짜를 목표 기간 입력과 같은 표기로 바꿉니다.
 *
 * @param value - `YYYY-MM-DD` 날짜
 * @returns `2026. 08. 01.` 형태의 문구. 날짜가 없으면 빈 문자열
 */
function formatLinkedProjectDate(value: string) {
  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${year}. ${month}. ${day}.`;
}

/**
 * formatLinkedProjectPeriod
 *
 * 시작일과 마감일을 연결 프로젝트 기간 문구로 바꿉니다.
 *
 * @param startDate - 시작일
 * @param endDate - 마감일
 * @returns 기간 문구. 날짜가 없으면 빈 문자열
 */
function formatLinkedProjectPeriod(startDate: string, endDate: string) {
  const start = formatLinkedProjectDate(startDate);
  const end = formatLinkedProjectDate(endDate);

  if (start && end) {
    return `${start} ~ ${end}`;
  }

  return start || end;
}

/**
 * LinkedProjectInfoRow
 *
 * 연결 프로젝트 정보에서 항목 이름과 값을 한 줄로 보여 줍니다.
 *
 * @param props - LinkedProjectInfoRow 컴포넌트 Props
 * @param props.label - 항목 이름
 * @param props.children - 항목 값
 * @param props.align - 항목 이름과 값의 세로 정렬. 기본값은 center
 */
function LinkedProjectInfoRow({
  label,
  children,
  align = "center",
}: {
  label: string;
  children: ReactNode;
  align?: "center" | "start";
}) {
  return (
    <div
      className={`grid grid-cols-[6.75rem_minmax(0,1fr)] gap-3 ${
        align === "start" ? "items-start" : "items-center"
      } `}
    >
      <dt className="text-body-sm text-[var(--color-text-secondary)]">{label}</dt>

      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

/**
 * LinkedProjectInfoModal
 *
 * 목표에 연결된 프로젝트의 이름, 상태, 기간, 담당자, 팀, 태그를 모달에서 확인합니다.
 *
 * @param props - LinkedProjectInfoModal 컴포넌트 Props
 * @param props.isOpen - 모달을 열지 여부
 * @param props.onClose - 모달을 닫을 때 실행되는 함수
 * @param props.project - 연결된 프로젝트. 없으면 없음으로 보여 줍니다
 */
export default function LinkedProjectInfoModal({
  isOpen,
  onClose,
  project,
}: LinkedProjectInfoModalProps) {
  const titleId = useId();

  const description = project?.description.trim() ?? "";

  const period = project ? formatLinkedProjectPeriod(project.startDate, project.endDate) : "";

  const delayed = project ? isProjectDelayed(project) : false;

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledBy={titleId} maxWidthClassName="max-w-[520px]">
      <Modal.Header id={titleId} title="연결 프로젝트 정보" onClose={onClose} />

      <Modal.Body className="!pt-1">
        {project ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-2">
              <ProjectBadge color={project.color} size="md" />

              <div className="min-w-0 flex-1">
                <p className="text-card-title break-words text-[var(--color-text)]">
                  {project.name}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {project.isMain ? (
                    <CrownBadge variant="label" label="메인프로젝트" title="메인프로젝트" />
                  ) : null}

                  <ProjectStatusBadge status={project.status} delayed={delayed} />
                </div>
              </div>
            </div>

            {description ? (
              <ExpandablePreviewText
                text={description}
                clampClassName="line-clamp-2"
                showFade={false}
                textClassName="text-body text-[var(--color-text-secondary)]"
              />
            ) : null}

            <dl className="flex flex-col gap-3 border-t border-[var(--color-border)] pt-4">
              <LinkedProjectInfoRow label="프로젝트 기간">
                <p className="text-body font-medium break-words text-[var(--color-text)] tabular-nums">
                  {period || "없음"}
                </p>
              </LinkedProjectInfoRow>

              <LinkedProjectInfoRow label="담당자">
                <p className="text-body font-medium break-words text-[var(--color-text)]">
                  {getUserName(project.creatorId)}
                </p>
              </LinkedProjectInfoRow>

              <LinkedProjectInfoRow label="참여 팀">
                <p className="text-body font-medium break-words text-[var(--color-text)]">
                  {getProjectTeamLabel(project)}
                </p>
              </LinkedProjectInfoRow>

              <LinkedProjectInfoRow label="프로젝트 태그" align="start">
                {project.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <GoalTag key={tag} tag={tag} />
                    ))}
                  </div>
                ) : (
                  <p className="text-body text-[var(--color-text-secondary)]">없음</p>
                )}
              </LinkedProjectInfoRow>
            </dl>

            <div className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-muted)] px-3 py-2.5">
              <FieldNotice className="mt-0!">
                목표 기간은 연결 프로젝트의 기간에 맞춰 자동 적용됩니다.
              </FieldNotice>
            </div>
          </div>
        ) : (
          <p className="text-body text-[var(--color-text-secondary)]">없음</p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <PrimaryButton size="modal" onClick={onClose}>
          닫기
        </PrimaryButton>
      </Modal.Footer>
    </Modal>
  );
}
