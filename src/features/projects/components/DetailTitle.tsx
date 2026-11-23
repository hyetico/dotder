import ProjectFolder from "@/features/projects/components/ProjectFolder";

import type { ReactNode } from "react";

type DetailTitleProps = {
  title: string;
  titleMuted?: boolean;
  leading?: ReactNode;
  meta?: ReactNode;
  description?: ReactNode;
  descriptionPlacement?: "below" | "column";
  descriptionDivider?: boolean;
  footer?: ReactNode;
  actions?: ReactNode;
  accentColor?: string | null;
  compact?: boolean;
  fill?: boolean;
  framed?: boolean;
  titleLabel?: string;
  titleClassName?: string;
  footerClassName?: string;
};

/**
 * DetailTitle
 *
 * 상세 화면 상단 타이틀의 틀입니다.
 * 배지와 제목, 제목 칸의 동작, 제목 아래 상태, 아래쪽 설명을 프로젝트 폴더 안에 둡니다.
 *
 * @param props - DetailTitle 컴포넌트 Props
 * @param props.title - 표시할 제목
 * @param props.titleMuted - 제목을 흐린 색으로 표시할지 여부
 * @param props.leading - 제목 왼쪽 배지
 * @param props.meta - 제목 아래 상태
 * @param props.description - 제목 칸 아래 설명
 * @param props.descriptionPlacement - 설명을 제목 칸 안 또는 구분선 아래에 둡니다. 기본값은 below
 * @param props.descriptionDivider - 제목과 설명 사이 구분선. 기본값은 true
 * @param props.footer - 설명 아래, 같은 폴더 안에 두는 내용
 * @param props.actions - 제목 오른쪽 동작. 없으면 버튼을 숨깁니다
 * @param props.accentColor - 폴더 색으로 쓸 프로젝트 색. 없으면 회색 폴더
 * @param props.compact - 왼쪽 칸처럼 좁은 너비에 맞출지 여부
 * @param props.fill - 폴더가 바깥 칸 높이를 채울지 여부
 * @param props.titleLabel - 제목 위에 다는 작은 이름
 * @param props.titleClassName - 제목 글자 클래스. 없으면 기본 상세 제목 크기를 씁니다
 * @param props.footerClassName - 아래쪽 내용 칸의 위아래 패딩 클래스. 없으면 py-3 md:py-5를 씁니다
 */
export default function DetailTitle({
  title,
  titleMuted = false,
  leading,
  meta,
  description,
  descriptionPlacement = "below",
  descriptionDivider = true,
  footer,
  actions,
  accentColor,
  compact = false,
  fill = false,
  framed = true,
  titleLabel,
  titleClassName,
  footerClassName = "py-3 md:py-5",
}: DetailTitleProps) {
  const descriptionInColumn = descriptionPlacement === "column";
  const frame = (
    <div className={`flex w-full min-w-0 flex-col ${fill ? "min-h-0 flex-1" : ""}`}>
      <div
        className={`flex min-w-0 items-start gap-2.5 px-3 pt-3 md:px-4 md:pt-4 ${compact ? "" : "xl:px-8"} ${descriptionInColumn ? "pb-3 md:pb-4" : compact ? "pb-4" : "pb-[10px]"} `}
      >
        {" "}
        {leading ? <div className="hidden shrink-0 md:block">{leading}</div> : null}
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              {titleLabel ? (
                <p className="text-caption mb-1.5 font-medium text-[var(--color-text-secondary)]">
                  {titleLabel}
                </p>
              ) : null}
              <h1
                className={`min-w-0 tracking-[-0.02em] break-words ${
                  titleClassName ??
                  `text-lg leading-7 font-semibold tracking-[-0.015em] md:text-2xl md:leading-8 md:font-bold md:tracking-[-0.02em]`
                } ${titleMuted ? "text-[var(--color-text-muted)]" : "text-[var(--color-text)]"} `}
              >
                {title}
              </h1>
            </div>

            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>

          {meta ? <div className="mt-2">{meta}</div> : null}

          {description && descriptionInColumn ? <div className="mt-2">{description}</div> : null}
        </div>
      </div>

      {(description && !descriptionInColumn) || footer ? (
        <div
          className={`px-3 md:px-4 ${fill ? "flex min-h-0 flex-1 flex-col" : ""} ${!compact && (descriptionInColumn || footer) ? "xl:px-8" : ""} `}
        >
          {description && !descriptionInColumn ? (
            <>
              {descriptionDivider ? (
                <div className="border-t border-[var(--color-border)]" />
              ) : null}

              <div className="py-2.5 md:py-4">{description}</div>
            </>
          ) : null}

          {footer ? (
            <>
              <div className="border-t border-[var(--color-border)]" />

              <div className={`${footerClassName} ${fill ? "flex min-h-0 flex-1 flex-col" : ""}`}>
                {footer}
              </div>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <header className={`flex w-full min-w-0 flex-col ${fill ? "h-full" : ""}`}>
      {framed ? (
        <ProjectFolder color={accentColor} fill={fill}>
          {frame}
        </ProjectFolder>
      ) : (
        frame
      )}
    </header>
  );
}
