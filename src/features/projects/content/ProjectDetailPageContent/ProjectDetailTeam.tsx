"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AppIcon, ListTodo, Settings, Shield, Users } from "@/components/ui/icon";
import SearchInput from "@/components/ui/input/SearchInput";
import List, { type ListColumn, type ListRow } from "@/components/ui/list/List";
import MemberAvatar from "@/components/ui/MemberAvatar";
import Select from "@/components/ui/select/Select";

import SectionHeader from "@/features/projects/components/SectionHeader";

import { getMemberInitial, type TeamMember } from "@/lib/mock/teamMembers";

import type { Goal } from "@/features/goals/types/goal";
import type { ProjectListItem } from "@/features/projects/types/project";
import type { Task } from "@/features/tasks/types/task";

type ProjectDetailTeamProps = {
  project: ProjectListItem;
  goals: Goal[];
  tasks: Task[];
  members: TeamMember[];
};

const panelClassName = `
  rounded-[var(--radius-md)]
  border
  border-[var(--color-border)]
  bg-[var(--color-surface)]
  shadow-[var(--shadow-card)]
`;

const columns: ListColumn[] = [
  {
    id: "name",
    header: "팀원",
    width: 22,
    align: "start",
    mobile: "title",
  },
  {
    id: "teamRole",
    header: "팀내역할",
    width: 14,
    mobile: "meta",
  },
  {
    id: "projectRole",
    header: "프로젝트역할",
    width: 16,
    mobile: "meta",
  },
  {
    id: "goal",
    header: "담당목표",
    width: 22,
    align: "start",
    mobile: "meta",
  },
  {
    id: "active",
    header: "진행중태스크",
    width: 13,
    mobile: "meta",
  },
  {
    id: "done",
    header: "완료태스크",
    width: 13,
    mobile: "meta",
  },
];

const roleGuide = [
  {
    role: "프로젝트 담당자",
    access: "프로젝트 설정, 일정, 목표, 태스크",
  },
  {
    role: "팀 관리자",
    access: "팀원 관리, 담당 목표와 일정",
  },
  {
    role: "참여자",
    access: "담당 태스크의 진행 상태",
  },
];

/**
 * projectRole
 *
 * 팀 역할과 프로젝트 담당자 여부로 프로젝트 역할을 정합니다.
 *
 * @param member - 팀 멤버
 * @param ownerName - 프로젝트 담당자 이름
 * @returns 프로젝트 역할
 */
function projectRole(member: TeamMember, ownerName: string) {
  if (member.name === ownerName) {
    return "프로젝트 담당자";
  }

  if (member.role === "관리자") {
    return "팀 관리자";
  }

  return "참여자";
}

/**
 * ProjectDetailTeam
 *
 * 프로젝트 3의 팀 탭입니다.
 * 담당자, 팀원, 맡은 목표와 태스크 수를 표시합니다.
 *
 * @param props - ProjectDetailTeam 컴포넌트 Props
 * @param props.project - 표시할 프로젝트
 * @param props.goals - 담당 목표를 찾을 목표
 * @param props.tasks - 태스크 수를 계산할 태스크
 * @param props.members - 팀 멤버
 */
export default function ProjectDetailTeam({
  project,
  goals,
  tasks,
  members,
}: ProjectDetailTeamProps) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const manager = members.find((member) => member.role === "관리자") ?? null;
  const activeTaskCount = tasks.filter((task) => task.status === "IN_PROGRESS").length;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return members.filter((member) => {
      const assigned = projectRole(member, project.creatorName);

      if (role !== "all" && assigned !== role) {
        return false;
      }

      if (!needle) {
        return true;
      }

      return (
        member.name.toLowerCase().includes(needle) || member.role.toLowerCase().includes(needle)
      );
    });
  }, [members, query, role, project.creatorName]);

  const unassignedGoals = goals.filter((goal) => goal.assigneeIds.length === 0);
  const idleMembers = members.filter(
    (member) => !goals.some((goal) => goal.assigneeIds.includes(member.id)),
  );

  const rows: ListRow[] = visible.map((member) => {
    const assignedGoals = goals.filter((goal) => goal.assigneeIds.includes(member.id));
    const goalIds = new Set(assignedGoals.map((goal) => goal.id));
    const assignedTasks = tasks.filter((task) => task.goalId != null && goalIds.has(task.goalId));

    return {
      id: String(member.id),
      cells: {
        name: {
          content: (
            <span className="flex min-w-0 items-center gap-2">
              <MemberAvatar
                label={getMemberInitial(member.name)}
                title={member.name}
                tone={member.role === "관리자" ? "primary" : "neutral"}
                bordered={false}
              />
              <span className="truncate font-medium">{member.name}</span>
            </span>
          ),
          align: "start",
        },
        teamRole: member.role,
        projectRole: projectRole(member, project.creatorName),
        goal: assignedGoals[0]?.title ?? "미배정",
        active: String(assignedTasks.filter((task) => task.status === "IN_PROGRESS").length),
        done: String(assignedTasks.filter((task) => task.status === "DONE").length),
      },
    };
  });

  return (
    <div className="space-y-4">
      <section className={`${panelClassName} p-[10px] md:p-5`}>
        <SectionHeader
          icon={<AppIcon icon={Users} size="md" />}
          title={project.isPersonal ? "개인 프로젝트" : project.teamName}
          titleClassName="text-[15px] leading-5 font-semibold"
          plain
          actions={
            <span className="flex items-center gap-2">
              <Link
                href="/teams"
                className="text-body-sm inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 font-medium hover:bg-[var(--color-hover-soft)]"
              >
                <AppIcon icon={Settings} size="sm" />팀 관리
              </Link>
            </span>
          }
        />
        <p className="mt-2 text-[13px] leading-[21px] text-[var(--color-text-secondary)]">
          팀 태스크와 일정을 함께 관리합니다.
        </p>
        <div className="mt-4 grid gap-4 border-t border-[var(--color-border)] pt-3 sm:grid-cols-2 md:pt-4">
          <div>
            <p className="text-[13px] leading-5 font-medium text-[var(--color-text-secondary)]">프로젝트 담당자</p>
            <p className="mt-1 text-[14px] leading-5 font-medium">{project.creatorName}</p>
          </div>
          <div>
            <p className="text-[13px] leading-5 font-medium text-[var(--color-text-secondary)]">팀 관리자</p>
            <p className="mt-1 text-[14px] leading-5 font-medium">{manager?.name ?? "없음"}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className={`${panelClassName} flex items-center gap-3 p-[10px] md:p-4`}>
          <AppIcon icon={Users} size="md" color="#111827" />
          <div>
            <p className="text-[13px] leading-5 font-medium text-[var(--color-text-secondary)]">참여 팀원</p>
            <p className="text-[20px] leading-7 font-bold tabular-nums">{members.length}명</p>
          </div>
        </section>
        <section className={`${panelClassName} flex items-center gap-3 p-[10px] md:p-4`}>
          <AppIcon icon={ListTodo} size="md" color="#111827" />
          <div>
            <p className="text-[13px] leading-5 font-medium text-[var(--color-text-secondary)]">진행중 태스크</p>
            <p className="text-[20px] leading-7 font-bold tabular-nums">{activeTaskCount}개</p>
          </div>
        </section>
      </div>

      <section className={`${panelClassName} overflow-hidden`}>
        <div className="flex flex-col gap-2 px-[10px] py-[10px] md:flex-row md:px-5 md:py-4">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="팀원 검색 (이름, 직무 등)"
            className="min-w-0 flex-1"
          />
          <Select
            value={role}
            onChange={setRole}
            size="sm"
            className="w-full md:w-44"
            options={[
              {
                value: "all",
                label: "프로젝트 역할 전체",
              },
              {
                value: "프로젝트 담당자",
                label: "프로젝트 담당자",
              },
              {
                value: "팀 관리자",
                label: "팀 관리자",
              },
              { value: "참여자", label: "참여자" },
            ]}
          />
        </div>
        {project.isPersonal || members.length === 0 ? (
          <p className="px-5 py-8 text-center text-[13px] leading-[21px] text-[var(--color-text-secondary)]">
            {project.isPersonal ? "개인 프로젝트에는 팀 멤버가 없습니다." : "팀 멤버가 없습니다."}
          </p>
        ) : (
          <List
            columns={columns}
            rows={rows}
            headerHeight={40}
            rowHeight={56}
            minWidth={760}
            showAction={false}
          />
        )}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className={`${panelClassName} p-[10px] md:p-5`}>
          <SectionHeader
            icon={<AppIcon icon={ListTodo} size="md" />}
            title="태스크 배정 확인"
            titleClassName="text-[15px] leading-5 font-semibold"
            plain
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[var(--radius-sm)] bg-[var(--color-hover-soft)] px-3 py-3">
              <p className="text-[13px] leading-5 font-medium text-[var(--color-text-secondary)]">미배정 목표</p>
              <p className="mt-1 text-[20px] leading-7 font-bold tabular-nums">{unassignedGoals.length}건</p>
            </div>
            <div className="rounded-[var(--radius-sm)] bg-[var(--color-hover-soft)] px-3 py-3">
              <p className="text-[13px] leading-5 font-medium text-[var(--color-text-secondary)]">담당목표 없는 팀원</p>
              <p className="mt-1 text-[20px] leading-7 font-bold tabular-nums">{idleMembers.length}명</p>
            </div>
          </div>
          <p className="mt-3 text-[13px] leading-[21px] text-[var(--color-text-secondary)]">
            참여역할을 확인한 뒤 필요한 목표를 배정해주세요.
          </p>
        </section>

        <section className={`${panelClassName} p-[10px] md:p-5`}>
          <SectionHeader
            icon={<AppIcon icon={Shield} size="md" />}
            title="접근 권한 안내"
            titleClassName="text-[15px] leading-5 font-semibold"
            plain
          />
          <table className="mt-4 w-full">
            <thead>
              <tr className="text-left text-[13px] leading-5 font-medium text-[var(--color-text-secondary)]">
                <th className="pb-2 font-medium">역할</th>
                <th className="pb-2 font-medium">주요 권한</th>
              </tr>
            </thead>
            <tbody>
              {roleGuide.map((item) => (
                <tr key={item.role} className="border-t border-[var(--color-border)]">
                  <td className="py-2 pr-3 text-[14px] leading-5 font-medium">{item.role}</td>
                  <td className="py-2 text-[13px] leading-[21px] text-[var(--color-text-secondary)]">{item.access}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
