import { buttonIconHitClassName } from "@/components/ui/button/buttonSize";

import type { ButtonHTMLAttributes, ReactNode } from "react";

const iconButtonClassName =
  "flex size-[var(--button-icon)] cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-hover-soft)] disabled:cursor-not-allowed disabled:opacity-50";
const iconFitButtonClassName =
  "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-xs)] transition-colors hover:bg-[rgba(0,0,0,0.05)] disabled:cursor-not-allowed disabled:opacity-50";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
  hoverSize?: "button" | "icon";
};

export default function IconButton({
  children,
  label,
  className = "",
  disabled,
  hoverSize = "button",
  ...props
}: IconButtonProps) {
  const buttonClassName =
    hoverSize === "icon"
      ? iconFitButtonClassName
      : `${buttonIconHitClassName} ${iconButtonClassName}`;

  return (
    <button
      {...props}
      type="button"
      disabled={disabled}
      aria-label={label}
      className={`${buttonClassName} ${className}`}
    >
      {children}
    </button>
  );
}
