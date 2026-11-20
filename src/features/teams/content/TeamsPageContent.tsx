"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import PageInset from "@/components/layout/pages/Page/PageInset";
import ProjectBadge from "@/features/projects/components/ProjectBadge";
import MemberAvatar from "@/components/ui/MemberAvatar";
import SearchInput from "@/components/ui/input/SearchInput";
import Select from "@/components/ui/select/Select";

import { getProjects } from "@/features/projects/api/projects";
import { getMemberInitial, getTeamMembers } from "@/lib/mock/teamMembers";
import { mockTeams } from "@/lib/mock/teams";
import { getProjectDetailPath } from "@/lib/projectRoutes";
import { projectQueryKeys } from "@/lib/queryKeys";

const sortOptions = [
  { value: "name", label: "이름" },
  { value: "members", label: "멤버" },
  { value: "projects", label: "프로젝트" },
];

/**
 * TeamsPageContent
 *
 * 팀 목록을 프로젝트 목록과 같은 검색과 카드로 표시합니다.
 * 카드 안에서 멤버와 이 팀이 맡은 프로젝트를 보여 줍니다.
 *
 * @returns 팀 목록 화면
 */
export default function TeamsPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortValue, setSortValue] = useState("name");
  const { data: projects = [], isPending } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });

  const teams = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    const next = mockTeams
      .map((team) => {
        const members = getTeamMembers(team.id);
        const teamProjects = projects.filter((project) => project.teamId === team.id);

        return {
          ...team,
          members,
          projects: teamProjects,
        };
      })
      .filter((team) => {
        if (!keyword) {
          return true;
        }

        return (
          team.name.toLowerCase().includes(keyword) ||
          team.members.some((member) => member.name.toLowerCase().includes(keyword)) ||
          team.projects.some((project) => project.name.toLowerCase().includes(keyword))
        );
      });

    return [...next].sort((a, b) => {
      if (sortValue === "members") {
        return b.members.length - a.members.length;
      }

      if (sortValue === "projects") {
        return b.projects.length - a.projects.length;
      }

      return a.name.localeCompare(b.name, "ko");
    });
  }, [projects, searchQuery, sortValue]);

  return (
    <PageInset top="none" className="space-y-4 pt-3 md:space-y-6 md:pt-6">
      <div className="flex w-full min-w-0 flex-col gap-4">
        <SearchInput value={searchQuery} onChange={setSearchQuery} placeholder="팀 검색..." />

        <div className="flex justify-end">
          <Select
            value={sortValue}
            onChange={setSortValue}
            options={sortOptions}
            size="sm"
            className="w-[6.5rem] shrink-0"
          />
        </div>
      </div>

      {isPending ? (
        <p className="text-body-sm py-12 text-center text-[var(--color-text-secondary)]">
          팀을 불러오는 중...
        </p>
      ) : teams.length > 0 ? (
        <section className="grid min-w-0 grid-cols-1 gap-5 pt-2 md:grid-cols-2 md:pt-4 xl:grid-cols-3">
          {teams.map((team) => (
            <article
              key={team.id}
              className="flex min-w-0 flex-col gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] md:p-4"
            >
              <div className="min-w-0">
                <h2 className="text-card-title truncate text-[var(--color-text)]">{team.name}</h2>
                <p className="text-body-sm mt-1 text-[var(--color-text-secondary)]">
                  멤버 {team.members.length}명 · 프로젝트 {team.projects.length}개
                </p>
              </div>

              <ul className="space-y-2">
                {team.members.map((member) => (
                  <li key={member.id} className="flex min-w-0 items-center gap-2">
                    <MemberAvatar
                      label={getMemberInitial(member.name)}
                      title={member.name}
                      tone={member.role === "관리자" ? "primary" : "neutral"}
                      bordered={false}
                    />
                    <span className="text-body-sm min-w-0 flex-1 truncate text-[var(--color-text)]">
                      {member.name}
                    </span>
                    <span className="text-caption shrink-0 text-[var(--color-text-secondary)]">
                      {member.role}
                    </span>
                  </li>
                ))}
              </ul>

              {team.projects.length > 0 ? (
                <ul className="space-y-2 border-t border-[var(--color-border)] pt-3">
                  {team.projects.map((project) => (
                    <li key={project.id}>
                      <Link
                        href={getProjectDetailPath(project.id)}
                        className="text-body-sm flex min-w-0 items-center gap-2 rounded-sm text-[var(--color-text)] hover:text-[var(--color-primary)]"
                      >
                        <ProjectBadge color={project.color} size="xxs" />
                        <span className="min-w-0 truncate">{project.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-body-sm border-t border-[var(--color-border)] pt-3 text-[var(--color-text-secondary)]">
                  맡은 프로젝트가 없습니다.
                </p>
              )}
            </article>
          ))}
        </section>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] bg-white px-6 py-16 text-center">
          <p className="text-body-sm text-[var(--color-text-secondary)]">
            조건에 맞는 팀이 없습니다.
          </p>
        </div>
      )}
    </PageInset>
  );
}
