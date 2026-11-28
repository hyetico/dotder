import Link from "next/link";

import { Crown, Plus } from "@/components/ui/icon";

import { cn } from "@/lib/cn";
import { projectColorVar, type ProjectColorKey } from "@/lib/projectPalette";

import type { CSSProperties, ReactNode, Ref } from "react";

// 보드 01 탭 경로 그대로 (180 × 31). 직접 그리거나 clip-path로 흉내 내지 않는다 (REBUILD 5)
const FOLDER_TAB_PATH =
  "M16 0.5 H128 Q137 0.5 142 6 L160 25 Q165 30.5 174 30.5 H180 V31 H0 V16 Q0 0.5 16 0.5 Z";

type FolderCardProps = {
  color: ProjectColorKey;
  /** 탭에 「메인 프로젝트」(왕관 12)를 쓴다. 아니면 빈 탭 */
  isMain?: boolean;
  /** 이름. 16/24 600 · 두 줄까지 (두 줄 높이를 늘 차지한다) */
  title: string;
  /** 이름 줄 오른쪽 (⋯ 메뉴 · xs 28) */
  titleAction?: ReactNode;
  /** 이름 앞 (즐겨찾기 선택 모드 체크박스, 보드 02-c) */
  leading?: ReactNode;
  /** 상태 줄 (상태 · 지연). 12/18 */
  status?: ReactNode;
  /** 기간 · 목표 · 태스크 · 진행률 줄. 자르지 않고 두 줄까지 줄바꿈 */
  meta?: ReactNode;
  /** 넘기면 카드 전체가 링크 (이름 링크가 카드를 덮는다) */
  href?: string;
  /** 아래 내용 (모자이크) */
  children?: ReactNode;
};

/**
 * 폴더 카드 (보드 01). 탭 SVG(180 × 31)를 몸통 위 −30에 1px 겹쳐 붙여 틈 · 선이 없다.
 * 몸통: 모서리 0 · 16 · 16 · 16 · 안쪽 20/22 · 사이 12 · 바탕 프로젝트 tint(탭과 같은 색), 테두리 없음.
 * 카드 그림자는 탭과 몸통을 한 덩어리로 감싸는 drop-shadow(--shadow-card). 호버 · 키보드 초점은 위로 2 + 한 단계 진한
 * 그림자(--shadow-card-hover) · 160ms ease-out, 키보드 초점은 카드 전체에 2 테두리(4 띄움), 움직임 줄이기면 그림자만 (보드 S5).
 *
 * @example
 * <FolderCard color="plum" isMain title="스토어 출시 준비" status={…} meta="~ 2026.08.20 · 진행률 50%" href="/projects/2"><Mosaic … /></FolderCard>
 */
export default function FolderCard({
  color,
  isMain = false,
  title,
  titleAction,
  leading,
  status,
  meta,
  href,
  children,
}: FolderCardProps) {
  const tint = projectColorVar(color, "tint");
  const style = {
    "--folder-tint": tint,
    "--folder-ink": projectColorVar(color, "ink"),
  } as CSSProperties;

  const body = (
    <>
      <div className="flex min-w-0 items-start gap-2">
        {leading ? <span className="relative z-10 mt-0.75 flex shrink-0">{leading}</span> : null}
        <h3
          title={title}
          className="line-clamp-2 min-h-12 min-w-0 flex-1 text-base font-semibold tracking-[-0.02em] text-[var(--text)]"
        >
          {href ? (
            // 이름 링크가 카드 전체를 덮는다 (⋯ 버튼은 그 위에 따로 눌린다)
            <Link
              href={href}
              className="outline-none after:absolute after:inset-0 after:rounded-[var(--radius-lg)] after:rounded-tl-none after:content-['']"
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h3>
        {titleAction ? (
          <span className="relative z-10 -mt-0.5 -mr-1.5 shrink-0">{titleAction}</span>
        ) : null}
      </div>
      {status ? <div className="-mt-1 flex items-center gap-2.5 text-xs">{status}</div> : null}
      {meta ? (
        <p className="line-clamp-2 text-xs text-[var(--folder-ink)] tabular-nums">{meta}</p>
      ) : null}
      {children}
    </>
  );

  const bodyClassName =
    "relative flex min-w-0 flex-1 flex-col gap-3 rounded-[var(--radius-lg)] rounded-tl-none bg-[var(--folder-tint)] px-5.5 py-5 text-[var(--text)]";

  return (
    <article
      className="relative flex h-full min-w-0 cursor-pointer flex-col rounded-[var(--radius-lg)] pt-7.5 drop-shadow-[var(--shadow-card)] transition-[translate,filter] duration-160 ease-out hover:-translate-y-0.5 hover:drop-shadow-[var(--shadow-card-hover)] has-[a:focus-visible]:-translate-y-0.5 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-4 has-[a:focus-visible]:outline-[var(--primary)] has-[a:focus-visible]:drop-shadow-[var(--shadow-card-hover)] motion-reduce:translate-y-0!"
      style={style}
    >
      <span aria-hidden className="pointer-events-none absolute top-0 left-0 z-10">
        <svg width="180" height="31" viewBox="0 0 180 31" className="block">
          <path d={FOLDER_TAB_PATH} fill={tint} />
        </svg>
        {isMain ? (
          <span className="absolute top-1.75 left-4 inline-flex items-center gap-1 text-xs font-medium whitespace-nowrap text-[var(--folder-ink)]">
            <Crown size={12} className="fill-current" />
            메인 프로젝트
          </span>
        ) : null}
      </span>
      {isMain ? <span className="sr-only">메인 프로젝트</span> : null}
      <div className={bodyClassName}>{body}</div>
    </article>
  );
}

type FolderAddCardProps = {
  /** 굵은 글. 예: 「즐겨찾기 추가」 */
  title: string;
  /** 아래 작은 글 (12 · --t3). 비활성이면 그 이유 */
  description: string;
  /** 못 누름 (선택 모드). 모양은 그대로, 제목만 --folder-add-off-fg · Tab으로 들어오지 않는다 (보드 02-c) */
  disabled?: boolean;
  /** + 아이콘 원. 팝오버 기준점으로 쓴다 */
  iconRef?: Ref<HTMLSpanElement>;
  /** 연 팝오버가 열려 있는지 (`aria-expanded`) */
  expanded?: boolean;
  onClick?: () => void;
};

/**
 * 폴더 모양 「추가」 카드 (보드 02 · 02-c). FolderCard와 같은 탭(180 × 31) + 몸통(모서리 0 · 16 · 16 · 16 · 안쪽 20/22 · 사이 6),
 * 면 --folder-add-bg(라이트 --s3 · 다크 --s2) · 점선 · 그림자 없음. + 원 40(--folder-add-icon-bg · 아이콘 20 --t2) · 제목 --text · 설명 12 --t3.
 * 같은 줄 카드 높이를 채우고, 혼자면 --folder-card-min-h.
 *
 * @example
 * <FolderAddCard title="즐겨찾기 추가" description="1개 더 추가할 수 있어요" iconRef={plusRef} onClick={open} />
 */
export function FolderAddCard({
  title,
  description,
  disabled = false,
  iconRef,
  expanded,
  onClick,
}: FolderAddCardProps) {
  return (
    <article className="relative flex h-full min-h-[var(--folder-card-min-h)] min-w-0 flex-col pt-7.5">
      <span aria-hidden className="pointer-events-none absolute top-0 left-0">
        <svg width="180" height="31" viewBox="0 0 180 31" className="block">
          <path d={FOLDER_TAB_PATH} fill="var(--folder-add-bg)" />
        </svg>
      </span>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={expanded}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        onClick={disabled ? undefined : onClick}
        className={cn(
          "kit-focus relative flex flex-1 flex-col items-center justify-center gap-1.5 rounded-[var(--radius-lg)] rounded-tl-none bg-[var(--folder-add-bg)] px-5.5 py-5 text-sm text-[var(--t3)]",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <span
          ref={iconRef}
          className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--folder-add-icon-bg)] text-[var(--t2)]"
        >
          <Plus size={20} aria-hidden />
        </span>
        <strong
          className={cn(
            "font-semibold",
            disabled ? "text-[var(--folder-add-off-fg)]" : "text-[var(--text)]",
          )}
        >
          {title}
        </strong>
        <span className="text-xs text-[var(--t3)]">{description}</span>
      </button>
    </article>
  );
}
