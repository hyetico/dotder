import { cn } from "@/lib/cn";

import type { ReactNode } from "react";

type EmptyStateProps = {
  /** 아이콘 (24). 56 상자 안 가운데 */
  icon: ReactNode;
  title: string;
  text?: ReactNode;
  /** 아래 버튼들 (사이 8) */
  actions?: ReactNode;
  className?: string;
};

/**
 * 빈 상태 (프로토타입 empty). 점선 테두리 --border · 모서리 16 · 안쪽 56/16,
 * 아이콘 상자 56(모서리 16 · --s2 · --t3) · 제목 16 · 설명 12 --t2.
 *
 * @example
 * <EmptyState icon={<Folder size={24} />} title="프로젝트가 없어요" text="첫 프로젝트를 만들어 보세요" actions={<Button variant="primary">추가</Button>} />
 */
export default function EmptyState({ icon, title, text, actions, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border-[length:var(--line-dash)] border-dashed border-[var(--border)] px-4 py-14 text-center",
        className,
      )}
    >
      <span
        aria-hidden
        className="mb-2 inline-flex size-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--s2)] text-[var(--t3)]"
      >
        {icon}
      </span>
      <strong className="text-base font-semibold text-[var(--text)]">{title}</strong>
      {text ? <span className="text-xs text-[var(--t2)]">{text}</span> : null}
      {actions ? <div className="mt-3 flex gap-2">{actions}</div> : null}
    </div>
  );
}
