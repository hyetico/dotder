import Link from "next/link";
import type { ReactNode } from "react";

type MenuLinkProps = {
  href: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  "data-active"?: boolean;
};

export default function MenuLink({
  href,
  children,
  onClick,
  className = "",
  "data-active": dataActive,
}: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      data-active={dataActive ? "true" : undefined}
      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)] ${className} `}
    >
      {children}
    </Link>
  );
}
