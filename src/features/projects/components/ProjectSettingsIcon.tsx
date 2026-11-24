import { AppIcon, Folder, Settings } from "@/components/ui/icon";

type ProjectSettingsIconProps = {
  className?: string;
  badgeClassName?: string;
};

/**
 * ProjectSettingsIcon
 *
 * 프로젝트 폴더 아이콘 위에 설정 표시를 겹쳐 그립니다.
 *
 * @param props - ProjectSettingsIcon 컴포넌트 Props
 * @param props.className - 아이콘 묶음에 더할 클래스
 * @param props.badgeClassName - 설정 표시 배경에 더할 클래스
 */
export default function ProjectSettingsIcon({
  className = "",
  badgeClassName = "bg-[var(--color-surface)]",
}: ProjectSettingsIconProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative flex size-[18px] shrink-0 items-center justify-center ${className} `}
    >
      <AppIcon icon={Folder} size="lg" />
      <span
        className={`absolute -right-1 -bottom-[2px] flex size-[11px] items-center justify-center rounded-full ${badgeClassName} `}
      >
        <Settings size={9} />
      </span>
    </span>
  );
}
