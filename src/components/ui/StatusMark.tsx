import type { ReactNode } from "react";

const markSizes = {
  xs: {
    box: "h-3 w-3",
    icon: 7,
  },
  sm: {
    box: "h-5 w-5",
    icon: 11,
  },
  md: {
    box: "h-6 w-6",
    icon: 13,
  },
} as const;

type StatusMarkSize = keyof typeof markSizes;

type StatusMarkProps = {
  color: string;
  label: string;
  size?: StatusMarkSize;
  className?: string;
  children: ReactNode;
};

export function getStatusMarkIconSize(size: StatusMarkSize = "sm") {
  return markSizes[size].icon;
}

export default function StatusMark({
  color,
  label,
  size = "sm",
  className = "",
  children,
}: StatusMarkProps) {
  const config = markSizes[size];

  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex shrink-0 items-center justify-center rounded-full text-white ${config.box} ${className} `}
      style={{
        backgroundColor: color,
      }}
    >
      {children}
    </span>
  );
}
