import { AppIcon, Info } from "@/components/ui/icon";

import type { ReactNode } from "react";

const noticeClassName = "text-caption flex min-h-5 items-center gap-1";
const dangerClassName = "mt-1 text-[var(--color-field-error)]";
const defaultClassName = "mt-2 text-[var(--color-text-secondary)]";

type FieldNoticeProps = {
  children: ReactNode;
  tone?: "default" | "danger";
  className?: string;
};

/**
 * FieldNotice
 *
 * 입력 항목 아래에 12px 안내 문구를 보여줍니다.
 * 일반 안내만 정보 아이콘을 붙이고, 오류 문구는 글자만 보여줍니다.
 *
 * @param props - FieldNotice 컴포넌트 Props
 * @param props.children - 표시할 안내 문구
 * @param props.tone - 안내 색. danger는 경고 색입니다. 기본값은 default
 * @param props.className - 문구 줄에 더할 클래스
 */
export default function FieldNotice({
  children,
  tone = "default",
  className = "",
}: FieldNoticeProps) {
  const danger = tone === "danger";

  return (
    <p
      className={[noticeClassName, danger ? dangerClassName : defaultClassName, className].join(
        " ",
      )}
    >
      {danger ? null : (
        <span
          aria-hidden
          className="inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] leading-none text-[var(--color-primary)]"
        >
          <AppIcon icon={Info} size="xs" className="block" />
        </span>
      )}

      <span className="flex min-h-[18px] min-w-0 items-center">{children}</span>
    </p>
  );
}
