type MemberAvatarProps = {
  label: string;
  title?: string;
  tone?: "neutral" | "primary";
  bordered?: boolean;
};

const toneClassName = {
  neutral: "bg-gray-100 text-[var(--color-text-secondary)]",
  primary: "bg-[var(--color-primary-soft)] text-[var(--color-primary)]",
} as const;

export default function MemberAvatar({
  label,
  title,
  tone = "neutral",
  bordered = true,
}: MemberAvatarProps) {
  return (
    <span
      title={title}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${toneClassName[tone]} ${
        bordered ? "border-2 border-white" : ""
      } `}
    >
      {label}
    </span>
  );
}
