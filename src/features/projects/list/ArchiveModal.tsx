"use client";

import { useQuery } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import EmptyState from "@/components/kit/EmptyState";
import Modal from "@/components/kit/Modal";
import ProjectMarker from "@/components/kit/ProjectMarker";
import { Archive } from "@/components/ui/icon";

import { getArchivedProjectListItems } from "@/features/projects/api/projects";
import ProjectCardMenu from "@/features/projects/list/ProjectCardMenu";
import { useProjectActions } from "@/features/projects/list/useProjectActions";

import { formatDate } from "@/lib/date";
import { projectQueryKeys } from "@/lib/queryKeys";

/** 보관한 프로젝트 목록 (01-h). 보관함 버튼의 숫자에도 쓴다. */
export function useArchivedProjects() {
  return useQuery({ queryKey: projectQueryKeys.archived, queryFn: getArchivedProjectListItems });
}

/**
 * 보관함 (보드 01-h). 모달 480(Components 11.23 바로잡음) · 헤더 아래 선 · 줄 최소 60:
 * 색 점 · 이름 500 · 「2025.12.20 보관 · 태스크 12/12」 · [되돌리기] · ⋯(삭제).
 * 아래 안내 「보관한 프로젝트는 목록 · 검색 · 사이드바에 안 보여요. 되돌리면 그대로 돌아와요.」
 */
export default function ArchiveModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data: projects = [] } = useArchivedProjects();
  const actions = useProjectActions();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="보관된 프로젝트"
      titleCount={projects.length}
      headerDivider
      footerNote
      footer="보관한 프로젝트는 목록 · 검색 · 사이드바에 안 보여요. 되돌리면 그대로 돌아와요."
    >
      {projects.length === 0 ? (
        <EmptyState
          className="my-2"
          icon={<Archive size={24} />}
          title="보관한 프로젝트가 없어요"
          text="⋯ 메뉴의 ‘보관하기’로 목록에서 숨길 수 있어요."
        />
      ) : (
        <ul className="flex flex-col">
          {projects.map((project, index) => (
            <li
              key={project.id}
              className={`flex min-h-15 items-center gap-3 ${index > 0 ? "border-t border-[var(--divider)]" : ""}`}
            >
              <ProjectMarker color={project.color} />
              <div className="flex min-w-0 flex-1 flex-col">
                <strong className="truncate text-sm font-medium">{project.name}</strong>
                <span className="text-xs text-[var(--t3)] tabular-nums">
                  {formatDate(project.archivedAt)} 보관 · 태스크 {project.completedTasks}/
                  {project.totalTasks}
                </span>
              </div>
              <Button onClick={() => void actions.restore(project)}>되돌리기</Button>
              <ProjectCardMenu project={project} variant="archived" />
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
