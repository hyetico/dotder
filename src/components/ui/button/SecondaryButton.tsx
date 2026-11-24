import {
  buttonIconOnlyClassName,
  buttonLabelClassName,
  buttonSizeClassName,
  type ButtonSize,
} from "@/components/ui/button/buttonSize";
import IconTitle from "@/components/ui/IconTitle";

import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** 초점을 돌려줄 때 쓴다 (팝오버를 닫은 뒤 등) */
  ref?: Ref<HTMLButtonElement>;
  icon?: ReactNode;
  size?: ButtonSize;
  tone?: "default" | "danger";
  hideIconOnMobile?: boolean;
};

const toneClassName = {
  default: `
    border-[var(--color-border)]
    bg-[var(--color-surface)]
    text-[var(--color-text)]
    hover:bg-[var(--color-hover-soft)]
  `,
  danger: `
    border-[var(--color-danger)]/40
    bg-[var(--color-surface)]
    text-[var(--color-danger-text)]
    hover:border-[var(--color-danger)]/40
    hover:bg-[var(--color-danger-soft)]
  `,
};

export default function SecondaryButton({
  className = "",
  children,
  icon,
  size = "sm",
  tone = "default",
  hideIconOnMobile = false,
  type = "button",
  ...props
}: SecondaryButtonProps) {
  const iconOnly = icon != null && (children == null || children === false);

  return (
    <button
      type={type}
      className={` ${buttonLabelClassName} ${
        iconOnly ? buttonIconOnlyClassName[size] : buttonSizeClassName[size]
      } inline-flex shrink-0 items-center rounded-[var(--radius-sm)] border ${toneClassName[tone]} font-medium whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className} `}
      {...props}
    >
      {icon && children != null ? (
        <IconTitle
          size="sm"
          className="font-medium"
          icon={icon}
          hideIconOnMobile={hideIconOnMobile}
        >
          {children}
        </IconTitle>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
