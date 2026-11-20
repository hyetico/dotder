"use client";

import { AppIcon, Pencil } from "@/components/ui/icon";

type EditTaskButtonProps = {
  onClick: () => void;
};

export default function EditTaskButton({ onClick }: EditTaskButtonProps) {
  return (
    <button
      type="button"
      onPointerDown={(event) => {
        /*
         * 카드 Drag 이벤트로
         * 전달되지 않도록 막음
         */
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();

        onClick();
      }}
      className="text-body-sm flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-left font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)]"
    >
      <AppIcon icon={Pencil} size="sm" />

      <span>수정</span>
    </button>
  );
}
