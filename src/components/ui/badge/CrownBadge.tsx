import Badge, { badgeIconSize, type BadgeSize } from "@/components/ui/badge/Badge";
import { Crown } from "@/components/ui/icon";

type CrownBadgeProps = {
  size?: BadgeSize;
  className?: string;
  title?: string;
  label?: string;
  muted?: boolean;
  overlay?: boolean;
  variant?: "icon" | "label";
};

export default function CrownBadge({
  size = "md",
  className = "",
  title,
  label,
  muted = false,
  overlay = false,
  variant = "icon",
}: CrownBadgeProps) {
  const resolvedLabel = label ?? (variant === "label" || overlay ? "메인 프로젝트" : "메인");
  const resolvedTitle = title ?? (variant === "label" || overlay ? "메인 프로젝트" : undefined);
  const badgeClassName = `
    font-medium
    text-[var(--color-text-inverse)]

    ${muted ? "bg-[var(--color-neutral)]" : "bg-accent-gradient"}

    ${className}
  `;

  if (variant === "label") {
    return (
      <Badge
        title={resolvedTitle}
        ariaLabel={resolvedLabel}
        shape="rounded"
        size={size}
        className={badgeClassName}
      >
        <Crown size={badgeIconSize[size]} className="hidden fill-white md:block" />
        <span className="md:hidden">메인</span>
        <span className="hidden md:inline">{resolvedLabel}</span>
      </Badge>
    );
  }

  return (
    <Badge
      title={resolvedTitle}
      ariaLabel={resolvedLabel}
      shape="square"
      size={size}
      className={badgeClassName}
    >
      <Crown size={badgeIconSize[size]} className="block fill-white" />
    </Badge>
  );
}
