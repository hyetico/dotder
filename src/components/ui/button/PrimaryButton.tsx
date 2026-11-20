import type { ButtonHTMLAttributes, ReactNode } from "react";

import { buttonLabelClassName, type ButtonSize } from "@/components/ui/button/buttonSize";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  size?: ButtonSize;
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: `
    h-[calc(var(--button-height-xs)-2px)]
    px-[var(--button-px-xs)]
    gap-1

    text-[length:var(--button-font-xs)]!
    leading-[var(--button-line-xs)]!
  `,
  sm: `
    h-[calc(var(--button-height)-2px)]
    px-[var(--button-px)]
    gap-1.5
  `,
  md: `
    h-[calc(var(--button-height-action)-2px)]
    px-[var(--button-px-action)]
    min-w-[112px]
    gap-2
  `,
  modal: `
    h-[calc(var(--button-height-modal)-2px)]
    px-[var(--button-px-modal)]
    gap-1.5
  `,
  title: `
    h-[var(--button-height-title)]
    px-[var(--button-px-title)]
    gap-1.5
  `,
};

export default function PrimaryButton({
  className = "",
  children,
  icon,
  size = "sm",
  type = "button",
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      type={type}
      className={`bg-primary-gradient inline-flex shrink-0 items-center rounded-[var(--radius-sm)] ${buttonLabelClassName} font-medium whitespace-nowrap text-white transition-[filter,opacity] duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${className} `}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
