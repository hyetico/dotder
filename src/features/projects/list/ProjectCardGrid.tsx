import type { ReactNode } from "react";

/**
 * 프로젝트 카드 목록 틀 (보드 01 · 02 · REBUILD 5). 전체 · 메인 · 즐겨찾기 탭이 같이 쓴다.
 * repeat(auto-fill, minmax(min(300px, 100%), 1fr)) · 가로 32 · 세로 40 → 768 · 1024 2열, 1280 이상 3열.
 *
 * @example
 * <ProjectCardGrid>{projects.map((project) => <li key={project.id}>…</li>)}</ProjectCardGrid>
 */
export default function ProjectCardGrid({ children }: { children: ReactNode }) {
  return (
    <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(--spacing(75),100%),1fr))] gap-x-8 gap-y-10">
      {children}
    </ul>
  );
}
