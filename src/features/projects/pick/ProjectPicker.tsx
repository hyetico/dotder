"use client";

import { useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { MenuSeparator, PickRow } from "@/components/kit/Menu";
import Popover from "@/components/kit/Popover";
import { ChevronDown } from "@/components/ui/icon";

import { getProjects } from "@/features/projects/api/projects";

import { cn } from "@/lib/cn";
import { projectColorVar } from "@/lib/projectPalette";
import { projectQueryKeys } from "@/lib/queryKeys";

type ProjectPickerProps = {
  /** 고른 프로젝트 id. null은 「프로젝트 없음」 */
  value: number | null;
  onChange: (projectId: number | null) => void;
  /** field: 입력칸 모양 (보드 04-a) · row: 상세 드로어 속성 줄 (보드 04-b, 넘치면 … · ▾ 오른쪽 끝) */
  variant?: "field" | "row";
  id?: string;
};

const Dot = ({ color, small }: { color: string; small?: boolean }) => (
  <span
    aria-hidden
    className={cn("shrink-0 rounded-full", small ? "size-2" : "size-2.5")}
    style={{ background: color }}
  />
);

/**
 * 프로젝트 고르기 (프로토타입 projSelectBtn · pickProject). 누르면 기준 칸 폭의 목록(모바일 시트)에서
 * 프로젝트 · 「프로젝트 없음」을 고른다.
 */
export default function ProjectPicker({
  value,
  onChange,
  variant = "field",
  id,
}: ProjectPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { data: projects = [] } = useQuery({
    queryKey: projectQueryKeys.all,
    queryFn: getProjects,
  });
  const current = projects.find((project) => project.id === value) ?? null;
  const pick = (projectId: number | null) => {
    onChange(projectId);
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        title={current?.name}
        className={cn(
          "kit-focus flex w-full min-w-0 cursor-pointer items-center gap-2 text-left text-sm",
          variant === "field"
            ? "h-10 rounded-[var(--radius-sm)] border border-[var(--input-line)] bg-[var(--surface)] px-3 hover:border-[var(--input-line-h)] max-md:h-12"
            : "-ml-2.5 min-h-9 rounded-[var(--radius-sm)] pl-2.5 hover:bg-[var(--s3)]",
        )}
      >
        {current ? (
          <>
            <Dot color={projectColorVar(current.color)} small={variant === "row"} />
            <span className="min-w-0 flex-1 truncate">{current.name}</span>
          </>
        ) : (
          <span className="min-w-0 flex-1 truncate text-[var(--t3)]">프로젝트 없음</span>
        )}
        <ChevronDown size={16} aria-hidden className="shrink-0 text-[var(--t3)]" />
      </button>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        anchorRef={buttonRef}
        title="프로젝트"
        width="anchor"
        role="listbox"
      >
        <div className="flex max-h-80 flex-col overflow-y-auto [&>*]:shrink-0">
          {projects.map((project) => (
            <PickRow
              key={project.id}
              selected={project.id === value}
              onSelect={() => pick(project.id)}
              leading={<Dot color={projectColorVar(project.color)} />}
            >
              {project.name}
            </PickRow>
          ))}
          <MenuSeparator />
          <PickRow selected={value == null} onSelect={() => pick(null)}>
            프로젝트 없음
          </PickRow>
        </div>
      </Popover>
    </>
  );
}
