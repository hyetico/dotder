import type { CSSProperties } from "react";

import { iconSize, iconStroke, type IconSize } from "@/components/ui/icon/iconSize";
import type { LucideIcon } from "@/components/ui/icon/icons";

type AppIconProps = {
  icon: LucideIcon;
  size?: IconSize;
  className?: string;
  color?: string;
  style?: CSSProperties;
};

/**
 * AppIcon
 *
 * 화면에서 쓰는 아이콘의 크기와 선 굵기를 맞춰 그립니다.
 *
 * @param props - AppIcon 컴포넌트 Props
 * @param props.icon - 그릴 아이콘
 * @param props.size - 아이콘 크기. xs 12, sm 14, md 18, lg 18, xl 28. 기본값은 md
 * @param props.className - 아이콘에 더할 클래스
 * @param props.color - 아이콘 색
 * @param props.style - 아이콘에 더할 스타일
 */
export default function AppIcon({
  icon: Icon,
  size = "md",
  className,
  color,
  style,
}: AppIconProps) {
  return (
    <Icon
      size={iconSize[size]}
      strokeWidth={iconStroke}
      className={className}
      color={color}
      style={style}
      aria-hidden
    />
  );
}
