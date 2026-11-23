import { fieldPaddingClassName } from "@/components/ui/fieldControl";
import IconTitle from "@/components/ui/IconTitle";

import type { ReactNode } from "react";

type ProfileSummaryProps = {
  name: string;
  role?: string;
  image?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * ProfileSummary
 *
 * 프로필 사진과 14px 이름, 역할을 한 줄 상자에 표시합니다.
 *
 * @param props - ProfileSummary 컴포넌트 Props
 * @param props.name - 표시할 이름
 * @param props.role - 이름 아래 역할
 * @param props.image - 프로필 사진 주소
 * @param props.action - 상자 오른쪽에 두는 버튼
 * @param props.className - 상자에 더할 클래스
 */
export default function ProfileSummary({ name, role, image, action, className = "" }: ProfileSummaryProps) {
  const avatar = image ? (
    <span className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-200">
      <img src={image} alt={`${name} 프로필`} className="h-full w-full object-cover" />
    </span>
  ) : (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-sm font-semibold text-[var(--color-primary)]">
      {name.slice(0, 1)}
    </span>
  );

  return (
    <div
      className={`flex h-[70px] min-w-0 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-field-border)] bg-[var(--color-field)] ${fieldPaddingClassName} ${className}`}
    >
      <IconTitle size="md" className="min-w-0 flex-1" icon={avatar}>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-[var(--color-text)]">{name}</span>

          {role ? (
            <span className="text-caption mt-0.5 block truncate text-[var(--color-text-muted)]">
              {role}
            </span>
          ) : null}
        </span>
      </IconTitle>

      {action}
    </div>
  );
}
