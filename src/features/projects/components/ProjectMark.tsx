import { Crown } from "@/components/ui/icon";

import { getProjectAccentColor } from "@/features/projects/utils/projectColors";

import type { ProjectColorKey } from "@/lib/projectPalette";
import type { CSSProperties } from "react";

type ProjectMarkProps = {
  /** 프로젝트 색 키. 없으면 회색 점. */
  color: ProjectColorKey | null;
  /** 메인 프로젝트면 점 대신 프로젝트 색 왕관. */
  isMain?: boolean;
  className?: string;
};

/**
 * 고르는 목록 · 프로젝트 전환에서 이름 앞에 두는 프로젝트 표시.
 *
 * 색 점 10, 메인은 같은 자리에 프로젝트 색 왕관 14 (채움 · 읽는 이름 「메인」, Components 04 · handoff B8).
 * 색은 팔레트 변수(`var(--project-<키>)`)라 다크에서는 다크 값이 된다.
 *
 * @example
 * <ProjectMark color={project.color} isMain={project.isMain} />
 */
export default function ProjectMark({ color, isMain = false, className = "" }: ProjectMarkProps) {
  const style = color
    ? ({ "--project-mark-color": getProjectAccentColor(color) } as CSSProperties)
    : undefined;

  // 점 10과 왕관 14가 같은 자리(가운데)에 오도록 14 칸 안에 둔다
  return (
    <span
      className={`project-mark inline-flex size-3.5 shrink-0 items-center justify-center ${className}`}
      style={style}
    >
      {isMain ? (
        <Crown size={14} role="img" aria-label="메인" className="fill-current" />
      ) : (
        <span aria-hidden className="size-2.5 rounded-full bg-current" />
      )}
    </span>
  );
}
