"use client";

import { useState } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import DropdownMenu from "@/components/ui/DropdownMenu";
import { AppIcon, GripVertical, Trash2 } from "@/components/ui/icon";

import EditTaskButton from "@/features/tasks/components/board/EditTaskButton";
import EditTaskModal from "@/features/tasks/modals/EditTaskModal";

import type { Task } from "@/features/tasks/types/task";

type TaskCardProps = {
  task: Task;
  projectName?: string;

  onDelete: (taskId: number) => void;

  onUpdate: (task: Task) => void;
};

export default function TaskCard({ task, projectName, onDelete, onUpdate }: TaskCardProps) {
  /*
   * =========================================================
   * Drag & Drop
   * =========================================================
   */
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
  });

  /*
   * =========================================================
   * Edit Modal 상태
   * =========================================================
   *
   * Modal 상태를 TaskCard가 관리하기 때문에
   * 메뉴가 닫혀도 Modal은 사라지지 않음
   */
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  /*
   * TODO:
   * 로그인 구현 후 실제 사용자 비교
   *
   * task.createdBy === currentUser.id
   */
  const isMine = true;

  /*
   * Drag 이동 스타일
   */
  const style = {
    transform: CSS.Transform.toString(transform),

    transition,
  };

  /*
   * Priority Badge 색상
   */
  const priorityStyle = {
    HIGH: `
      bg-red-50
      text-red-500
    `,

    MEDIUM: `
      bg-orange-50
      text-orange-500
    `,

    LOW: `
      bg-emerald-50
      text-emerald-600
    `,
  };

  /*
   * Priority 표시 이름
   */
  const priorityLabel = {
    HIGH: "High",
    MEDIUM: "Medium",
    LOW: "Low",
  };

  /*
   * =========================================================
   * Edit Modal 열기
   * =========================================================
   */
  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  /*
   * Edit Modal 닫기
   */
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  /*
   * 삭제
   */
  const handleDelete = () => {
    onDelete(task.id);
  };

  return (
    <>
      {/*
       * =====================================================
       * Task Card
       * =====================================================
       */}
      <article
        ref={setNodeRef}
        style={style}
        className={`group relative rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 ease-out hover:border-gray-300 hover:shadow-md md:p-4 ${
          isDragging ? `z-50 scale-[1.02] border-gray-300 shadow-xl` : ""
        } `}
      >
        {/*
         * ===================================================
         * Card Header
         * ===================================================
         */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {projectName && (
              <p className="text-caption mb-1 truncate font-medium text-[var(--color-primary)]">
                {projectName}
              </p>
            )}

            <h3 className="text-card-title text-[var(--color-text)]">{task.title}</h3>
          </div>

          {/*
           * 오른쪽 버튼 영역
           */}
          <div className="flex shrink-0 items-center gap-2">
            {/*
             * =================================================
             * Drag Button
             * =================================================
             */}
            <button
              ref={setActivatorNodeRef}
              type="button"
              {...listeners}
              {...attributes}
              aria-label={`${task.title} 이동`}
              className="flex h-8 w-8 cursor-grab touch-none items-center justify-center rounded-[var(--radius-sm)] border border-transparent text-[var(--color-text-muted)] transition-colors select-none hover:border-gray-200 hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)] active:cursor-grabbing"
            >
              <AppIcon icon={GripVertical} size="md" />
            </button>

            {/*
             * =================================================
             * Menu
             * =================================================
             *
             * 본인이 작성한 Task에서만 표시
             */}
            {isMine && (
              <DropdownMenu label={`${task.title} 메뉴 열기`} stopPropagation>
                {(close) => (
                  <>
                    <EditTaskButton
                      onClick={() => {
                        close();

                        handleOpenEditModal();
                      }}
                    />

                    <button
                      type="button"
                      onPointerDown={(event) => {
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();

                        close();

                        handleDelete();
                      }}
                      className="text-body-sm flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-red-500 transition-colors hover:bg-red-50"
                    >
                      <AppIcon icon={Trash2} size="sm" />

                      <span>삭제</span>
                    </button>
                  </>
                )}
              </DropdownMenu>
            )}
          </div>
        </div>

        {/*
         * ===================================================
         * Description
         * ===================================================
         */}
        {task.description && (
          <p className="text-body-sm mt-2 line-clamp-2 whitespace-pre-line text-[var(--color-text-secondary)]">
            {task.description}
          </p>
        )}

        {/*
         * ===================================================
         * Priority
         * ===================================================
         */}
        <div className="mt-3">
          <span
            className={`text-badge inline-flex h-5 items-center rounded-md px-2 py-0 leading-none ${
              priorityStyle[task.priority]
            } `}
          >
            {priorityLabel[task.priority]}
          </span>
        </div>

        {/*
         * ===================================================
         * Footer
         * ===================================================
         */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3 md:pt-4">
          {/*
           * 임시 담당자
           */}
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-[var(--color-text-secondary)]"
            title="담당자"
          >
            김
          </div>

          {/*
           * 마감일
           */}
          <div className="text-caption text-[var(--color-text-muted)]">{task.dueDate}</div>
        </div>
      </article>

      {/*
       * =====================================================
       * Edit Modal
       * =====================================================
       *
       * 중요:
       *
       * article 또는 Dropdown 안에 있는 게 아니라
       * TaskCard의 별도 형제로 존재함.
       *
       * 그래서 메뉴가 닫혀도
       * Modal이 유지된다.
       */}
      <EditTaskModal
        isOpen={isEditModalOpen}
        task={task}
        onClose={handleCloseEditModal}
        onUpdate={onUpdate}
      />
    </>
  );
}
