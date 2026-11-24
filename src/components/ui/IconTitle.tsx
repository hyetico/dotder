import type { ReactNode } from "react";

const sizeClassName = {
  sm: "gap-1.5 text-caption",
  md: "gap-2 text-body",
} as const;

type IconTitleProps = {
  icon?: ReactNode;
  children: ReactNode;
  size?: keyof typeof sizeClassName;
  iconPosition?: "start" | "end";
  align?: "center" | "start";
  hideIconOnMobile?: boolean;
  className?: string;
};

/**
 * IconTitle
 *
 * 아이콘과 제목을 한 줄로 붙입니다.
 * 12px 제목은 아이콘과 gap-1.5, 14px 제목은 왼쪽 아이콘과 gap-2를 씁니다.
 *
 * @param props - IconTitle 컴포넌트 Props
 * @param props.icon - 제목 옆에 두는 아이콘
 * @param props.children - 제목
 * @param props.size - 제목 크기. sm은 12px, md는 14px. 기본값은 md
 * @param props.iconPosition - 아이콘을 제목 앞에 둘지 뒤에 둘지. 기본값은 start
 * @param props.align - 아이콘과 제목의 세로 정렬. 기본값은 center
 * @param props.hideIconOnMobile - 좁은 화면에서 아이콘을 숨길지 여부
 * @param props.className - 줄에 더할 클래스
 */
export default function IconTitle({
  icon,
  children,
  size = "md",
  iconPosition = "start",
  align = "center",
  hideIconOnMobile = false,
  className = "",
}: IconTitleProps) {
  const iconNode = icon ? (
    <span className={`inline-flex shrink-0 ${hideIconOnMobile ? "max-md:hidden" : ""} `}>
      {icon}
    </span>
  ) : null;

  return (
    <span
      className={`inline-flex min-w-0 ${
        align === "start" ? "items-start" : "items-center"
      } ${sizeClassName[size]} ${className} `}
    >
      {iconPosition === "start" ? iconNode : null}

      {children}

      {iconPosition === "end" ? iconNode : null}
    </span>
  );
}
