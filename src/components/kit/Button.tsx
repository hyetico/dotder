import Link from "next/link";

import { cn } from "@/lib/cn";

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

export type ButtonVariant =
  "primary" | "secondary" | "secondaryDanger" | "ghost" | "ghostText" | "danger" | "onToast";
export type ButtonSize = "lg" | "md" | "sm" | "xs";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  /** 모양. 기본 secondary (보드 5-1). onToast는 토스트 안 「되돌리기」 전용 */
  variant?: ButtonVariant;
  /** 크기 3종: md 40/16 · sm 36/12 · xs 28/8. 기본 md */
  size?: ButtonSize;
  /** 아이콘만 있는 정사각형 버튼. `aria-label`을 꼭 넘긴다 */
  iconOnly?: boolean;
  /** 툴팁 글. 호버 · 키보드 초점 때만 보이고 터치 기기에서는 숨긴다. 예: "닫기 · Esc" */
  tip?: string;
  /** 툴팁 자리. `right`는 오른쪽 · 세로 가운데 (접힌 사이드바 · REBUILD 6) */
  tipSide?: "right";
  /** 넘기면 `<a>`(next/link)로 그린다 */
  href?: string;
  /** 시트 푸터처럼 남은 폭을 채운다 */
  grow?: boolean;
  /** 아직 동작이 없는 버튼. 흐리게 막고 올리거나 초점이 가면 「준비 중」 툴팁 (11.25) */
  pending?: boolean;
  ref?: Ref<HTMLButtonElement>;
  children?: ReactNode;
};

const PENDING_TIP = "준비 중";

// 크기는 토큰만 쓴다 (globals.css `--btn-h-*` · `--btn-px-*`). 화면에서 높이 · 패딩을 덧대지 않는다.
const sizeClassName: Record<ButtonSize, string> = {
  // 커버 화면만 (보드 00)
  lg: "h-[var(--btn-h-lg)] px-[var(--btn-px-lg)] rounded-[var(--radius-sm)] text-base",
  md: "h-[var(--btn-h-md)] px-[var(--btn-px-md)] rounded-[var(--radius-sm)] text-sm",
  sm: "h-[var(--btn-h-sm)] px-[var(--btn-px-sm)] rounded-[var(--radius-sm)] text-sm",
  xs: "h-[var(--btn-h-xs)] px-[var(--btn-px-xs)] rounded-[var(--radius-xs)] text-xs",
};
const lgSecondaryClassName =
  "h-[var(--btn-h-lg)] px-[var(--btn-px-lg-secondary)] rounded-[var(--radius-sm)] text-base";
const iconOnlyClassName: Record<ButtonSize, string> = {
  lg: "size-[var(--btn-h-lg)] rounded-[var(--radius-sm)]",
  md: "size-[var(--btn-h-md)] rounded-[var(--radius-sm)]",
  sm: "size-[var(--btn-h-sm)] rounded-[var(--radius-sm)]",
  xs: "size-[var(--btn-h-xs)] rounded-[var(--radius-xs)]",
};
const variantClassName: Record<ButtonVariant, string> = {
  // 못 누를 때는 흐리게 하지 않고 --s3 바탕 · --t4 글자 (REBUILD 5-3 [저장] · [추가])
  primary:
    "border-[var(--btn-primary)] bg-[var(--btn-primary)] text-[var(--btn-primary-fg)] hover:border-[var(--btn-primary-h)] hover:bg-[var(--btn-primary-h)] disabled:border-[var(--s3)] disabled:bg-[var(--s3)] disabled:text-[var(--t4)] aria-disabled:border-[var(--s3)] aria-disabled:bg-[var(--s3)] aria-disabled:text-[var(--t4)]",
  secondary:
    "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] hover:border-[var(--btn-secondary-line-h)] hover:bg-[var(--s2)] active:bg-[var(--s3)] disabled:opacity-40 aria-disabled:opacity-40",
  // 보조 버튼 모양 + 빨간 글자 (보드 02-c 「즐겨찾기에서 빼기」)
  secondaryDanger:
    "border-[var(--border)] bg-[var(--surface)] text-[var(--bad)] hover:border-[var(--btn-secondary-line-h)] hover:bg-[var(--s2)] active:bg-[var(--s3)] disabled:opacity-40 aria-disabled:opacity-40",
  ghost:
    "border-transparent text-[var(--t2)] hover:bg-[var(--s3)] hover:text-[var(--text)] disabled:opacity-40 aria-disabled:opacity-40",
  // 본문 글자색 ghost (카드 ⋯ · 보드 01: --text + 투명도 0.7은 부르는 쪽)
  ghostText:
    "border-transparent text-[var(--text)] hover:bg-[var(--s3)] disabled:opacity-40 aria-disabled:opacity-40",
  // 토스트(어두운 바탕) 안 글자 버튼 「되돌리기」
  onToast:
    "border-transparent text-[var(--toast-fg)] hover:bg-[var(--toast-hover)] disabled:opacity-40 aria-disabled:opacity-40",
  danger:
    "border-[var(--bad)] bg-[var(--bad)] text-[var(--btn-danger-fg)] hover:border-[var(--btn-danger-h)] hover:bg-[var(--btn-danger-h)] disabled:opacity-40 aria-disabled:opacity-40",
};

/** 버튼 공통 모양. 링크처럼 버튼이 아닌 요소에 같은 모양을 줄 때도 쓴다. */
export function buttonClassName({
  variant = "secondary",
  size = "md",
  iconOnly = false,
  grow = false,
}: Pick<ButtonProps, "variant" | "size" | "iconOnly" | "grow">) {
  return cn(
    "kit-focus relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 border font-medium whitespace-nowrap transition-[background-color,border-color,color,translate] duration-120 select-none active:translate-y-px disabled:pointer-events-none aria-disabled:pointer-events-none",
    iconOnly
      ? iconOnlyClassName[size]
      : // 큰 보조 버튼은 좌우 20 (보드 00 [예시로 둘러보기])
        size === "lg" && variant === "secondary"
        ? lgSecondaryClassName
        : sizeClassName[size],
    variantClassName[variant],
    grow && "flex-1",
  );
}

/**
 * 버튼 (Components 07 · REBUILD 5-1). 모양 4가지 × 크기 3가지.
 *
 * 높이 · 좌우 패딩은 크기 토큰으로만 정해진다. 아이콘 16 · 아이콘–글자 6 · 테두리 1.
 * 키보드 초점은 2px 띄운 2px 링, 누르면 1px 내려가고, 못 누르면 40%.
 *
 * @example
 * <Button variant="primary">추가</Button>
 * <Button variant="ghost" size="sm" iconOnly aria-label="닫기" tip="닫기 · Esc"><X size={18} /></Button>
 */
export default function Button({
  variant = "secondary",
  size = "md",
  iconOnly = false,
  tip,
  tipSide,
  href,
  grow = false,
  pending = false,
  className,
  type = "button",
  ref,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(buttonClassName({ variant, size, iconOnly, grow }), className);

  if (pending) {
    // 막힌 버튼은 호버를 받지 못해 툴팁은 감싼 칸이 띄운다
    return (
      <span data-tip={PENDING_TIP} className={cn("inline-flex", grow && "flex-1")}>
        <button
          ref={ref}
          type="button"
          aria-disabled="true"
          className={classes}
          aria-label={props["aria-label"]}
        >
          {children}
        </button>
      </span>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        data-tip={tip}
        data-tip-side={tipSide}
        aria-label={props["aria-label"]}
        onClick={props.onClick as never}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      data-tip={tip}
      data-tip-side={tipSide}
      {...props}
    >
      {children}
    </button>
  );
}
