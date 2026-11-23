import {
  buttonIconOnlyClassName,
  buttonLabelClassName,
  buttonSizeClassName,
  type ButtonSize,
} from "@/components/ui/button/buttonSize";
import IconTitle from "@/components/ui/IconTitle";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  size?: ButtonSize;
  tone?: "default" | "danger";
  hideIconOnMobile?: boolean;
};

const toneClassName = {
  default: `
    border-[var(--color-border)]
    bg-white
    text-[var(--color-text)]
    hover:bg-[var(--color-hover-soft)]
  `,
  danger: `
    border-red-200
    bg-white
    text-red-600
    hover:border-red-300
    hover:bg-red-50
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
