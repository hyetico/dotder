import { buttonIconHitClassName } from "@/components/ui/button/buttonSize";
import AppIcon from "@/components/ui/icon/AppIcon";
import { X } from "@/components/ui/icon/icons";

import type { ButtonHTMLAttributes } from "react";

type CloseButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  label?: string;
};

/**
 * CloseButton
 *
 * 모달, 검색, 드로어를 닫는 버튼입니다.
 *
 * @param props - CloseButton 컴포넌트 Props
 * @param props.label - 버튼 이름. 기본값은 닫기
 * @param props.className - 버튼에 더할 클래스
 */
export default function CloseButton({
  label = "닫기",
  className = "",
  type = "button",
  ...props
}: CloseButtonProps) {
  return (
    <button
      {...props}
      type={type}
      aria-label={label}
      className={` ${buttonIconHitClassName} flex size-[var(--button-icon)] shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-primary)] transition-colors hover:bg-gray-100 hover:text-[var(--color-primary)] ${className} `}
    >
      <AppIcon icon={X} size="md" />
    </button>
  );
}
