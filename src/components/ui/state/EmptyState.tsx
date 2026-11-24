import { AppIcon } from "@/components/ui/icon";

import type { LucideIcon } from "@/components/ui/icon/icons";
import type { ReactNode } from "react";

type EmptyStateProps = {
  /** 가운데 56 상자 안 아이콘. 목록의 종류 아이콘(프로젝트 · 목표 · 태스크 · 메모)을 넘긴다. */
  icon: LucideIcon;
  /** 제목 한 줄. 예: "목표가 없어요" */
  title: string;
  /** 제목 아래 한 줄 설명. 없으면 숨긴다. */
  description?: string;
  /** 아래 버튼. 최대 2개, 주 버튼은 1개만 (Components 12). */
  actions?: ReactNode;
  /** `error`면 테두리를 빨간 기운으로 바꾼다. 직접 쓰지 말고 `ErrorState`를 쓴다. */
  tone?: "empty" | "error";
  className?: string;
};

const emptyStateClassName =
  "flex flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-dashed px-4 py-14 text-center";

/**
 * 목록이 비었을 때 보여주는 점선 상자 (Components 12 「빈 상태」).
 *
 * 화면 글은 부르는 쪽이 넘긴다. 여기서 문구를 만들지 않는다.
 *
 * @example
 * <EmptyState icon={Target} title="목표가 없어요" actions={<PrimaryButton>추가</PrimaryButton>} />
 */
export default function EmptyState({
  icon,
  title,
  description,
  actions,
  tone = "empty",
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`${emptyStateClassName} ${
        tone === "error" ? "border-[var(--color-error-border)]" : "border-[var(--color-border)]"
      } ${className}`}
    >
      <span
        aria-hidden
        className={`mb-2 inline-flex size-14 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--color-hover-soft)] ${
          tone === "error" ? "text-[var(--color-danger-text)]" : "text-[var(--color-text-muted)]"
        }`}
      >
        <AppIcon icon={icon} size="xl" />
      </span>
      <p className="text-section-title text-[var(--color-text)]">{title}</p>
      {description ? (
        <p className="text-body text-[var(--color-text-secondary)]">{description}</p>
      ) : null}
      {actions ? <div className="mt-3 flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
