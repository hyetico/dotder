import { cn } from "@/lib/cn";

import type { HTMLAttributes, ReactNode, Ref } from "react";

type CardProps = HTMLAttributes<HTMLElement> & {
  /** 그릴 요소. 목록 안이면 li */
  as?: "div" | "li" | "article" | "section";
  /** 누를 수 있는 카드(목표 · 메모 · 태스크): 호버 때 그림자 한 단계 · 선 --border-2 · 0.16초, 이동 없음 (DOC3 14) */
  interactive?: boolean;
  /** 고치는 중(메모 바로 고치기 · 보드 07-a): 선 --primary + 1 링 */
  selected?: boolean;
  ref?: Ref<HTMLElement>;
  children: ReactNode;
};

/**
 * 카드 (보드 .card). 선 --border · 모서리 12 · 바탕 --surface. 안쪽 여백은 쓰는 쪽이 준다.
 * 안의 z-index가 바깥으로 새지 않게 따로 쌓는다(isolate).
 *
 * @example
 * <Card as="li" interactive className="p-4">…</Card>
 */
export default function Card({
  as: Tag = "div",
  interactive = false,
  selected = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <Tag
      className={cn(
        "relative isolate rounded-[var(--radius-md)] border bg-[var(--surface)]",
        selected
          ? "border-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]"
          : "border-[var(--border)]",
        interactive &&
          !selected &&
          "transition-[box-shadow,border-color] duration-160 ease-out hover:border-[var(--border-2)] hover:shadow-[var(--shadow-card)] has-[:focus-visible]:shadow-[var(--shadow-card)]",
        className,
      )}
      {...(props as HTMLAttributes<HTMLElement>)}
    >
      {children}
    </Tag>
  );
}
