import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ className = "", children, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={`cursor-pointer rounded-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className} `}
    >
      {children}
    </button>
  );
}
