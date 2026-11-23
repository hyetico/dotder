"use client";

import { useState } from "react";

import {
  HeaderActionLink,
  HeaderActions,
  HeaderMoreMenu,
} from "@/components/layout/Header/HeaderActions";
import PageInset from "@/components/layout/pages/Page/PageInset";
import { LayoutDashboard, ListTodo, Target, Users } from "@/components/ui/icon";
import LineTabMenu from "@/components/ui/tab/LineTabMenu";

import { getGoalStatusLabel } from "@/features/goals/utils/goalUtils";
import ProjectFolder from "@/features/projects/components/ProjectFolder";
import ProjectSummaryBox from "@/features/projects/components/ProjectSummaryBox";
import ProjectDetailStatus, {
  type ProjectDetailSection,
} from "@/features/projects/content/ProjectDetailPageContent/ProjectDetailStatus/ProjectDetailStatus";
import ProjectDetailTeam from "@/features/projects/content/ProjectDetailPageContent/ProjectDetailTeam";
import { formatProjectDate } from "@/features/projects/utils/projectUtils";
import { getTaskStatusLabel } from "@/features/tasks/utils/taskUtils";

import { getTeamMembers } from "@/lib/mock/teamMembers";
import { getProjectEditPath } from "@/lib/projectRoutes";

import type { Goal } from "@/features/goals/types/goal";
import type { ProjectListItem } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

type ProjectDetailTab = "status" | "goals" | "tasks" | "team";

type ProjectDetailPageContentProps = {
  project: ProjectListItem;
  goals: Goal[];
  tasks: Task[];
};

const columnClassName = "flex min-h-0 min-w-0 flex-col px-5 pt-4 pb-5";
const secondaryTabClassName =
  "inline-flex h-8 items-center border-b-2 px-1 text-[13px]! leading-[18px]!";

/**
 * DetailRecordList
 *
 * 목표나 태스크 이름을 상태와 함께 보더 없이 나열합니다.
 *
 * @param props - DetailRecordList 컴포넌트 Props
 * @param props.items - 제목과 오른쪽 보조 문구
 */
function DetailRecordList({ items }: { items: { id: string; title: string; meta: string }[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm leading-5 text-[var(--color-text-secondary)]">
        표시할 항목이 없습니다.
      </p>
    );
  }

  return (
    <ul className="flex flex-col">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] py-2.5 last:border-b-0"
        >
          <span className="min-w-0 truncate text-[14px] leading-5 font-medium text-[var(--color-text)]">
            {item.title}
          </span>
          <span className="shrink-0 text-[13px] leading-5 font-medium text-[var(--color-text-secondary)]">
            {item.meta}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * OverviewSectionTabs
 *
 * 개요 안의 요약, 타임라인, 변경 이력을 1차 탭보다 작게 보여 줍니다.
 *
 * @param props - OverviewSectionTabs 컴포넌트 Props
 * @param props.value - 현재 선택된 구역
 * @param props.onChange - 구역을 바꿀 때 실행되는 함수
 */
function OverviewSectionTabs({
  value,
  onChange,
}: {
  value: ProjectDetailSection;
  onChange: (value: ProjectDetailSection) => void;
}) {
  const items: { id: ProjectDetailSection; label: string }[] = [
    { id: "summary", label: "요약" },
    { id: "timeline", label: "타임라인" },
    { id: "history", label: "변경 이력" },
  ];

  return (
    <div role="tablist" aria-label="개요 구역" className="flex flex-wrap items-center gap-4">
      {items.map((item) => {
        const selected = value === item.id;
        const className = [
          secondaryTabClassName,
          selected
            ? "border-[var(--color-text)] font-semibold! text-[var(--color-text)]"
            : "border-transparent font-medium! text-[var(--color-text-secondary)]",
        ].join(" ");

        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={className}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * ProjectDetailPageContent
 *
 * 프로젝트 상세 폴더 안에 정보와 개요를 표시합니다.
 *
 * @param props - ProjectDetailPageContent 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.goals - 프로젝트 목표
 * @param props.tasks - 프로젝트 태스크
 */
export default function ProjectDetailPageContent({
  project,
  goals,
  tasks,
}: ProjectDetailPageContentProps) {
  const [tab, setTab] = useState<ProjectDetailTab>("status");
  const [section, setSection] = useState<ProjectDetailSection>("summary");
  const members = project.isPersonal ? [] : getTeamMembers(project.teamId);

  return (
    <>
      <HeaderActions>
        <HeaderActionLink
          href={getProjectEditPath(project.id)}
          label="프로젝트 관리"
          className="max-md:hidden"
        />
        <HeaderMoreMenu
          className="md:hidden"
          label="프로젝트 메뉴"
          items={[
            {
              href: getProjectEditPath(project.id),
              label: "프로젝트 관리",
            },
          ]}
        />
      </HeaderActions>
      <PageInset top="header">
        <div className="lg:h-[calc(100dvh-var(--header-height)-1.5rem-var(--page-padding))]">
          <ProjectFolder
            color={project.color}
            fill
            detail
            tabLabel={project.isMain ? "메인프로젝트" : "프로젝트"}
          >
            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
              <aside className="min-h-0 min-w-0 overflow-hidden lg:flex lg:h-full lg:w-[440px] lg:shrink-0 lg:flex-col">
                <ProjectSummaryBox project={project} compact framed={false} />
              </aside>
              <div
                data-folder-pane="right"
                className={`${columnClassName} w-full flex-1 border-t border-[var(--color-border)] lg:w-auto lg:border-t-0 lg:border-l`}
              >
                <LineTabMenu
                  ariaLabel="프로젝트 상세 메뉴"
                  value={tab}
                  onChange={setTab}
                  itemClassName="text-[14px]! leading-5!"
                  items={[
                    { id: "status", label: "개요", icon: LayoutDashboard },
                    { id: "goals", label: "목표", count: goals.length, icon: Target },
                    { id: "tasks", label: "태스크", count: tasks.length, icon: ListTodo },
                    { id: "team", label: "팀", count: members.length, icon: Users },
                  ]}
                />
                <div className="mt-4 min-h-0 flex-1 overflow-auto">
                  {tab === "status" ? (
                    <div className="flex flex-col gap-3">
                      <div>
                        <h2 className="text-[22px] leading-8 font-bold text-[var(--color-text)]">
                          프로젝트 개요
                        </h2>
                        <p className="mt-1 text-[13px] leading-[21px] text-[var(--color-text-secondary)]">
                          프로젝트의 진행 상태와 주요 일정을 한눈에 확인합니다.
                        </p>
                      </div>
                      <OverviewSectionTabs value={section} onChange={setSection} />
                      <ProjectDetailStatus
                        project={project}
                        goals={goals}
                        tasks={tasks}
                        section={section}
                      />
                    </div>
                  ) : null}
                  {tab === "goals" ? (
                    <DetailRecordList
                      items={goals.map((goal) => ({
                        id: String(goal.id),
                        title: goal.title,
                        meta: getGoalStatusLabel(goal.status),
                      }))}
                    />
                  ) : null}
                  {tab === "tasks" ? (
                    <DetailRecordList
                      items={tasks.map((task) => ({
                        id: String(task.id),
                        title: task.title,
                        meta: `${getTaskStatusLabel(task.status)} · ${formatProjectDate(task.dueDate)}`,
                      }))}
                    />
                  ) : null}
                  {tab === "team" ? (
                    <ProjectDetailTeam
                      project={project}
                      goals={goals}
                      tasks={tasks}
                      members={members}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </ProjectFolder>
        </div>
      </PageInset>
    </>
  );
}
