"use client";

import type { ReactNode } from "react";

import ExpandablePreviewText from "@/components/ui/ExpandablePreviewText";
import { fieldPaddingClassName } from "@/components/ui/fieldControl";

type SplitTitlePreviewProps = {
  title: string;
  description: string;
  titleMuted?: boolean;
  descriptionMuted?: boolean;
  mobileBadge?: ReactNode;
  desktopBadge?: ReactNode;
  meta?: ReactNode;
  mobilePreview?: boolean;
};

/**
 * SplitTitlePreview
 *
 * 뱃지와 제목을 왼쪽, 설명을 오른쪽에 두는 폼 상단 미리보기입니다.
 * 좁은 화면에서는 제목 아래 설명을 두고, 설명은 네 줄 이후 펼칩니다.
 *
 * @param props - SplitTitlePreview 컴포넌트 Props
 * @param props.title - 표시할 제목
 * @param props.description - 표시할 설명
 * @param props.titleMuted - 제목을 안내 문구처럼 흐리게 표시할지 여부
 * @param props.descriptionMuted - 설명을 안내 문구처럼 흐리게 표시할지 여부
 * @param props.mobileBadge - 좁은 화면에서 제목 옆에 둘 뱃지
 * @param props.desktopBadge - 넓은 화면에서 제목 옆에 둘 뱃지
 * @param props.meta - 제목 아래에 둘 부가 정보
 * @param props.mobilePreview - 화면 너비와 관계없이 좁은 화면 배치를 쓸지 여부
 */
export default function SplitTitlePreview({
  title,
  description,
  titleMuted = false,
  descriptionMuted = false,
  mobileBadge,
  desktopBadge,
  meta,
  mobilePreview = false,
}: SplitTitlePreviewProps) {
  const titleColor = titleMuted ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]";

  const descriptionColor = descriptionMuted
    ? "text-[var(--color-text-muted)]"
    : "text-[var(--color-text-secondary)]";

  return (
    <header
      className={`relative flex w-full min-w-0 flex-col gap-4 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-muted)] ${
        mobilePreview ? "" : "md:h-full md:min-h-0 md:flex-row md:gap-0"
      } `}
    >
      <div className={mobilePreview ? "flex flex-col" : `flex flex-col md:hidden`}>
        <div className={`flex min-w-0 items-start gap-2.5 py-3 ${fieldPaddingClassName} `}>
          {mobileBadge ? <div className="shrink-0">{mobileBadge}</div> : null}

          <p className={`text-section-title min-w-0 flex-1 break-words ${titleColor} `}>{title}</p>
        </div>

        <div className={`border-t border-[var(--color-border)] py-3 ${fieldPaddingClassName} `}>
          <ExpandablePreviewText
            text={description}
            muted={descriptionMuted}
            clampClassName="line-clamp-4"
            textClassName={
              descriptionMuted
                ? "text-body leading-6"
                : "text-body leading-6 text-[var(--color-text-secondary)]"
            }
          />
        </div>
      </div>

      <div className={mobilePreview ? "hidden" : "hidden md:contents"}>
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-10 hidden h-[70px] w-px -translate-x-1/2 -translate-y-1/2 bg-[var(--color-border)] md:block"
        />

        <div className="w-full min-w-0 md:h-full md:min-h-0 md:w-1/2">
          <div className="flex h-full min-h-[118px] w-full min-w-0 items-center">
            {desktopBadge ? <div className="shrink-0 pr-2.5 pl-4">{desktopBadge}</div> : null}

            <div className="min-w-0 flex-1">
              <div className="flex h-[118px] min-h-[118px] flex-col overflow-y-auto py-4 pr-4">
                <div className="my-auto w-full">
                  <p className={`text-section-title break-words ${titleColor} `}>{title}</p>
                </div>
              </div>

              {meta ? <div className="mt-2 min-w-0">{meta}</div> : null}
            </div>
          </div>
        </div>

        <div className="w-full min-w-0 md:h-full md:min-h-0 md:w-1/2">
          <div className="flex h-full min-h-[118px] w-full min-w-0 items-center">
            <div className="flex h-[118px] min-h-[118px] min-w-0 flex-1 flex-col overflow-y-auto p-4">
              <div className="my-auto w-full">
                <p className={`text-body break-words whitespace-pre-line ${descriptionColor} `}>
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
