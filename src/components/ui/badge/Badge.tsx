import type { ReactNode } from "react";

export type BadgeSize = "sm" | "md" | "mobile";

type BadgeShape = "pill" | "rounded" | "square";

export const badgeIconSize: Record<BadgeSize, number> = {
  sm: 10,
  mobile: 12,
  md: 12,
};

const badgeSizeClass: Record<Exclude<BadgeSize, "mobile">, string> = {
  sm: "text-badge-sm gap-0.5",
  md: "text-badge gap-1 leading-[18px]",
};

const mobileBadgeClass: Record<BadgeShape, string> = {
  pill: `
    text-badge-sm-mobile

    h-5
    gap-0.5
    rounded-full
    px-1.5
    [&_svg]:size-2.5

    lg:gap-1
    lg:px-2
    lg:[&_svg]:size-3
  `,
  rounded: `
    text-badge-sm-mobile

    border-0

    h-5
    gap-0.5
    rounded
    px-1.5
    [&_svg]:size-2.5

    lg:h-6
    lg:gap-1
    lg:rounded-[6px]
    lg:px-2
    lg:[&_svg]:size-3
  `,
  square: `
    text-badge-sm-mobile

    justify-center
    border-0
    p-0

    size-5
    gap-0.5
    rounded
    [&_svg]:size-2.5

    lg:size-6
    lg:gap-1
    lg:rounded-[6px]
    lg:[&_svg]:size-3
  `,
};

const badgeShapeClass: Record<Exclude<BadgeSize, "mobile">, Record<BadgeShape, string>> = {
  sm: {
    pill: "h-4 rounded-full px-1.5",
    rounded: "h-4 rounded border-0 px-1.5",
    square: "size-4 justify-center rounded border-0 p-0",
  },
  md: {
    pill: "h-5 rounded-full px-2",
    rounded: "h-6 rounded-[6px] border-0 px-2",
    square: "size-6 justify-center rounded-[6px] border-0 p-0",
  },
};

type BadgeProps = {
  children: ReactNode;

  className?: string;

  title?: string;

  ariaLabel?: string;

  shape?: BadgeShape;

  size?: BadgeSize;
};

/**
 * Badge
 *
 * 아이콘과 글자를 뱃지로 감싸는 컴포넌트입니다.
 * 기본 크기는 글자 12px이고, sm은 글자 10px에 맞춰 높이와 여백을 줄입니다.
 * mobile은 모바일과 태블릿에서 글자 10px·높이 20이고, 1024px부터는 기본 크기입니다.
 * 기본 모양은 알약이고, rounded는 기본 높이 24·반경 6, square는 24 정사각입니다.
 *
 * @param props - Badge 컴포넌트 Props
 * @param props.children - 뱃지 안에 넣을 아이콘과 글자
 * @param props.className - 배경색과 글자색. 없으면 크기와 간격만 적용합니다
 * @param props.title - 마우스를 올렸을 때 보이는 설명
 * @param props.ariaLabel - 스크린 리더가 읽는 이름. 없으면 title을 사용합니다
 * @param props.shape - 뱃지 모양. pill은 기본 알약, rounded는 높이 24·반경 6, square는 24 정사각
 * @param props.size - 뱃지 크기. md는 글자 12, sm은 글자 10, mobile은 모바일·태블릿에서 글자 10·높이 20
 */
export default function Badge({
  children,
  className = "",
  title,
  ariaLabel,
  shape = "pill",
  size = "md",
}: BadgeProps) {
  return (
    <span
      title={title}
      aria-label={ariaLabel ?? title}
      className={`inline-flex shrink-0 items-center py-0 ${
        size === "mobile"
          ? mobileBadgeClass[shape]
          : `${badgeSizeClass[size]} ${badgeShapeClass[size][shape]}`
      } ${className} `}
    >
      {children}
    </span>
  );
}
