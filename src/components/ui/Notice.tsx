import { Info } from "@/components/ui/icon";
import { iconStroke } from "@/components/ui/icon/iconSize";

import type { ReactNode } from "react";

type NoticeProps = {
  /** 안내 한 줄. 행동이 필요하면 글 끝에 링크 1개를 넣는다. */
  children: ReactNode;
  className?: string;
};

/**
 * 화면 안에 계속 보이는 한 줄 안내 (Components 12 「Notice」).
 *
 * i 아이콘 16 + 글자 14/20, 둘 다 보조 글자색. 바탕 · 테두리 · 닫기 없음.
 * 툴바 바로 아래(목록 위)에 8 간격으로 둔다. 잠깐 알리는 것은 `Toast`를 쓴다.
 *
 * @example
 * <Notice>보류 중인 프로젝트에는 목표 · 태스크를 추가할 수 없어요.</Notice>
 */
export default function Notice({ children, className = "" }: NoticeProps) {
  return (
    <p
      role="status"
      className={`text-body flex items-start gap-1.5 text-[var(--color-text-secondary)] ${className}`}
    >
      <Info size={16} strokeWidth={iconStroke} aria-hidden className="mt-0.5 shrink-0" />
      <span className="min-w-0">{children}</span>
    </p>
  );
}
