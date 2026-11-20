"use client";

import { useState, type ReactNode } from "react";

import Link from "next/link";

import Badge from "@/components/ui/badge/Badge";
import DelayIssueBadge from "@/features/projects/components/DelayIssueBadge";
import ProjectStatusBadge from "@/features/projects/components/ProjectStatusBadge";
import CrownBadge from "@/components/ui/badge/CrownBadge";
import ScheduleBadge, {
  getScheduleBadgeClassName,
} from "@/features/projects/components/ScheduleBadge";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import DetailTitle from "@/features/projects/components/DetailTitle";
import ExpandablePreviewText from "@/components/ui/ExpandablePreviewText";
import {
  AppIcon,
  Calendar,
  CalendarDays,
  ArrowRight,
  ChevronDown,
  Clock,
  Info,
  UserRound,
  Users,
} from "@/components/ui/icon";
import type { LucideIcon } from "@/components/ui/icon/icons";
import { getProjectDeadlineChanges } from "@/lib/mock/projectDeadlineChanges";
import { getUserName } from "@/lib/mock/users";
import { getProjectDetailPath } from "@/lib/projectRoutes";
import { getProjectTeamLabel } from "@/features/projects/utils/projectTeam";
import {
  formatProjectDateRange,
  getProjectScheduleMark,
  getProjectScheduleSnapshot,
  getProjectStatusStyles,
  isProjectDelayed,
} from "@/features/projects/utils/projectUtils";

import type { Project, ProjectListItem } from "@/features/projects/types/project";

type ProjectSummaryBoxProps = {
  project: Project | ProjectListItem;
  defaultOpen?: boolean;
  showDetailLink?: boolean;
  compact?: boolean;
  framed?: boolean;
  titleClassName?: string;
};

type Fact = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const compactLabelClassName = "text-[13px] leading-5 font-medium text-[var(--color-text-secondary)]";
const compactValueClassName = "min-w-0 text-right text-[14px] leading-5 font-medium break-words text-[var(--color-text)] tabular-nums";
const detailLinkClassName = `
  text-body-sm

  ml-auto
  inline-flex
  shrink-0
  items-center
  gap-1

  font-medium
  whitespace-nowrap
  text-[var(--color-text-secondary)]

  transition-colors

  hover:text-[var(--color-text)]

  md:text-body
  md:h-8
  md:gap-1.5
  md:rounded-[var(--radius-sm)]
  md:border
  md:border-[var(--color-border)]
  md:bg-white
  md:px-3.5
  md:text-[var(--color-text)]
  md:hover:bg-[var(--color-hover-soft)]
  md:hover:text-[var(--color-text)]
`;

/**
 * formatUpdatedAt
 *
 * 마감일 변경 시각을 최종 수정 표기용 날짜와 시각으로 바꿉니다.
 *
 * @param value - ISO 형식의 변경 시각
 * @returns `2026.10.15 14:50` 형태의 문구
 */
function formatUpdatedAt(value: string) {
  const [date = "", time = ""] = value.split("T");
  const clock = time.slice(0, 5);
  const day = date.replace(/-/g, ".");

  if (!clock) {
    return day;
  }

  return `${day} ${clock}`;
}

/**
 * previewDescription
 *
 * 설명 앞의 두 문장만 골라 이미지와 같은 요약으로 보여 줍니다.
 *
 * @param text - 프로젝트 설명 전체
 * @returns 두 문장 이내의 요약
 */
function previewDescription(text: string) {
  const sentences = text.match(/.*?[.。](?:\s|$)/g)?.map((sentence) => sentence.trim()) ?? [];

  if (sentences.length === 0) {
    return text;
  }

  return sentences.slice(0, 2).join(" ");
}

/**
 * CompactFact
 *
 * 왼쪽 카드에서 항목 제목과 값을 한 줄에 나란히 표시합니다.
 *
 * @param props - CompactFact 컴포넌트 Props
 * @param props.label - 항목 제목
 * @param props.value - 항목 값
 */
function CompactFact({
  label,
  value,
  align = "end",
}: {
  label: string;
  value: ReactNode;
  align?: "start" | "end";
}) {
  const rowClassName = "grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-3";
  const valueClassName = align === "end" ? compactValueClassName : "min-w-0 text-left text-[13px] leading-[21px] font-normal break-words text-[var(--color-text)]";

  return (
    <div className={rowClassName}>
      <dt className={`pt-0.5 ${compactLabelClassName}`}>{label}</dt>
      <dd className={valueClassName}>{value}</dd>
    </div>
  );
}

/**
 * ProjectSummaryBox
 *
 * 프로젝트 이름, 상태, 접을 수 있는 정보를 상단 박스에 표시합니다.
 * 프로젝트 상세와 목표 화면이 같은 박스를 씁니다.
 *
 * @param props - ProjectSummaryBox 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.defaultOpen - 프로젝트 정보를 펼친 채로 시작할지 여부. 기본값은 true
 * @param props.showDetailLink - 펼친 정보에 프로젝트 상세 링크를 둘지 여부. 기본값은 false
 * @param props.compact - 왼쪽 칸처럼 좁은 너비에 맞춰 정보를 세로로 둘지 여부
 * @param props.titleClassName - 프로젝트 이름에 쓸 글자 크기 클래스. 기본값은 24px
 */
export default function ProjectSummaryBox({
  project,
  defaultOpen = true,
  showDetailLink = false,
  compact = false,
  framed = true,
  titleClassName = "text-[24px] leading-[34px] font-bold",
}: ProjectSummaryBoxProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const delayed = isProjectDelayed(project);
  const schedule = getProjectScheduleMark(project);
  const snapshot = getProjectScheduleSnapshot(project);
  const description = project.description.trim();
  const latestChange = getProjectDeadlineChanges(project.id)[0];
  const facts: Fact[] = [
    {
      icon: Users,
      label: "팀",
      value: project.isPersonal ? "개인 프로젝트" : getProjectTeamLabel(project),
    },
    {
      icon: UserRound,
      label: "담당자",
      value: getUserName(project.creatorId),
    },
    {
      icon: Calendar,
      label: "기간",
      value: formatProjectDateRange(project.startDate, project.endDate),
    },
  ];

  if (!compact) {
    facts.push({
      icon: CalendarDays,
      label: "총 일수",
      value: `${snapshot.totalDays}일`,
    });
  }

  if (latestChange) {
    facts.push({
      icon: Clock,
      label: "최종 수정",
      value: formatUpdatedAt(latestChange.changedAt),
    });
  }

  const stats = "completedTasks" in project ? project : null;
  const descriptionSummary = previewDescription(description);
  const descriptionText = descriptionOpen ? description : descriptionSummary;
  const showDescriptionToggle = descriptionText !== description || descriptionOpen;

  if (compact) {
    return (
      <section className="flex h-full min-h-0 flex-col overflow-auto px-5 pt-4 pb-5">
        <h2 className="text-[20px] leading-7 font-bold text-[var(--color-text)]">프로젝트 정보</h2>
        <dl className="mt-4 flex flex-col gap-3">
          <CompactFact label="이름" value={project.name} />
          <CompactFact
            label="상태"
            value={
              <span className="inline-flex flex-wrap items-center justify-end gap-1.5">
                <ProjectStatusBadge status={project.status} icon={null} />
                {delayed ? (
                  <Badge shape="rounded" className={getProjectStatusStyles("DELAYED").badge}>
                    {snapshot.overdueDays}일 지연
                  </Badge>
                ) : null}
              </span>
            }
          />
          {stats ? <CompactFact label="진행률" value={`${stats.progress}%`} /> : null}
          {stats ? (
            <CompactFact label="목표" value={`${stats.completedGoals} / ${stats.totalGoals} 완료`} />
          ) : null}
          {stats ? (
            <CompactFact label="태스크" value={`${stats.completedTasks} / ${stats.totalTasks} 완료`} />
          ) : null}
          {facts.map((fact) => (
            <CompactFact key={fact.label} label={fact.label} value={fact.value} />
          ))}
          <CompactFact
            label="설명"
            align="start"
            value={
              description ? (
                <span className="flex flex-col gap-1.5">
                  <span>{descriptionText}</span>
                  {showDescriptionToggle ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 self-end text-[13px]! leading-[21px]! font-medium! text-[var(--color-text-secondary)]"
                      onClick={() => setDescriptionOpen((current) => !current)}
                    >
                      {descriptionOpen ? "설명 접기" : "설명 전체 보기"}
                      <AppIcon icon={ArrowRight} size="sm" />
                    </button>
                  ) : null}
                </span>
              ) : (
                "설명이 없습니다."
              )
            }
          />
        </dl>
      </section>
    );
  }

  return (
    <DetailTitle
      title={project.name}
      titleClassName={titleClassName}
      accentColor={project.color}
      framed={framed}
      meta={
        (
          <div className="flex flex-wrap items-center gap-1">
            {project.isMain ? <CrownBadge variant="label" /> : null}
            <ProjectStatusBadge status={project.status} />
            {delayed && schedule?.tone === "delayed" ? (
              <DelayIssueBadge days={schedule.days} />
            ) : null}
            {schedule &&
            !delayed &&
            schedule.tone !== "delayed" &&
            project.status !== "IN_PROGRESS" ? (
              <ScheduleBadge
                label={schedule.label}
                description={schedule.description}
                className={getScheduleBadgeClassName(schedule.tone)}
              />
            ) : null}
          </div>
        )
      }
      descriptionDivider={false}
      footerClassName="pt-[10px] pb-3 md:pb-4"
      footer={
          <div>
            <div className="flex w-full items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-sm leading-5 font-medium text-[var(--color-text)]">
                <AppIcon icon={Info} size="sm" className="text-[var(--color-text-secondary)]" />
                프로젝트 정보
              </span>
              <SecondaryButton
                aria-expanded={open}
                aria-label={open ? "프로젝트 정보 접기" : "프로젝트 정보 펼치기"}
                onClick={() => setOpen((current) => !current)}
                className="!size-5 !justify-center !border-0 !px-0"
                icon={
                  <AppIcon
                    icon={ChevronDown}
                    size="sm"
                    className={`transition-transform ${open ? "rotate-180" : ""}`}
                  />
                }
              />
            </div>
            {open ? (
              <div className="mt-[10px]">
                {description ? (
                  <div className="border-b border-[var(--color-border)] pb-[10px]">
                    <ExpandablePreviewText
                      text={description}
                      clampClassName="line-clamp-4"
                      textClassName="text-sm font-normal leading-[22px] text-[var(--color-text-secondary)]"
                      showFade={false}
                    />
                  </div>
                ) : null}
                <dl
                  className={`flex min-w-0 flex-col gap-2 ${description ? "pt-[10px]" : ""} xl:flex-row xl:flex-wrap xl:items-center xl:gap-y-3`}
                >
                  {facts.map((fact, index) => (
                    <div
                      key={fact.label}
                      className={`flex items-center justify-between gap-3 xl:justify-start xl:gap-2 ${fact.label === "최종 수정" ? "xl:ml-auto" : ""} ${index > 0 ? "xl:border-l xl:border-[var(--color-border)] xl:px-6" : "xl:pr-6"}`}
                    >
                      <AppIcon
                        icon={fact.icon}
                        size="md"
                        className="hidden shrink-0 text-[var(--color-text-secondary)] xl:block"
                      />
                      <div className="flex min-w-0 flex-1 items-center justify-between gap-3 xl:block">
                        <dt className="shrink-0 text-[12px] leading-[18px] font-normal text-[var(--color-text-secondary)]">
                          {fact.label}
                        </dt>
                        <dd className="text-right text-sm leading-5 font-semibold text-[var(--color-text)] tabular-nums xl:mt-0.5 xl:text-left xl:font-medium">
                          {fact.value}
                        </dd>
                      </div>
                    </div>
                  ))}
                </dl>
                {showDetailLink ? (
                  <div className="mt-[10px] flex justify-end border-t border-[var(--color-border)] pt-[10px]">
                    <Link href={getProjectDetailPath(project.id)} className={detailLinkClassName}>
                      프로젝트 페이지로 이동하기
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
      }
    />
  );
}
