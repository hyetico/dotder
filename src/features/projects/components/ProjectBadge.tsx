import { Check, Circle, Crown, Folder, ListTodo, Star } from "@/components/ui/icon";

import {
  getProjectTintColor,
  getProjectTintInkColor,
  getProjectTintLineColor,
} from "@/features/projects/utils/projectColors";

import type { ProjectStatus } from "@/features/projects/types/project";

const badgeSizes = {
  xxs: {
    box: "h-3.5 w-3.5",
    icon: 8,
  },
  xs: {
    box: "h-[22px] w-[22px]",
    icon: 12,
  },
  sm: {
    box: "h-9 w-9",
    icon: 16,
  },
  md: {
    box: "h-12 w-12",
    icon: 20,
  },
  lg: {
    box: "h-[60px] w-[60px] md:h-16 md:w-16",
    icon: 26,
  },
  xl: {
    box: "h-[84px] w-[84px]",
    icon: 34,
  },
} as const;

export type ProjectBadgeMark = "folder" | "main" | "favorite" | "radio" | "check" | "task";

type ProjectBadgeGlyphProps = {
  mark: ProjectBadgeMark;
  selected: boolean;
  iconSize: number;
};

/**
 * ProjectBadgeGlyph
 *
 * 폴더, 메인, 즐겨찾기, 라디오, 체크, 태스크 중 배지에 올릴 표시를 고릅니다.
 *
 * @param props - ProjectBadgeGlyph 컴포넌트 Props
 * @param props.mark - 폴더, 메인, 즐겨찾기, 라디오, 체크, 태스크 중 표시 종류
 * @param props.selected - 라디오나 체크가 선택된 상태인지 여부
 * @param props.iconSize - 표시 아이콘 크기
 */
function ProjectBadgeGlyph({ mark, selected, iconSize }: ProjectBadgeGlyphProps) {
  if (mark === "radio") {
    return (
      <span className="relative inline-flex items-center justify-center">
        <Circle size={iconSize} />
        {selected ? (
          <span
            className="absolute rounded-full bg-current"
            style={{
              width: Math.max(4, Math.round(iconSize * 0.38)),
              height: Math.max(4, Math.round(iconSize * 0.38)),
            }}
          />
        ) : null}
      </span>
    );
  }

  if (mark === "check") {
    if (!selected) {
      return <Folder size={iconSize} />;
    }

    return <Check size={iconSize} />;
  }

  if (mark === "task") {
    return <ListTodo size={iconSize} />;
  }

  if (mark === "main") {
    return <Crown size={iconSize} className="fill-current" />;
  }

  if (mark === "favorite") {
    return <Star size={iconSize} className="fill-current" />;
  }

  return <Folder size={iconSize} />;
}

type ProjectBadgeProps = {
  color: string | null;
  size?: keyof typeof badgeSizes;
  className?: string;
  selected?: boolean;
  mark?: ProjectBadgeMark;
  isFavorite?: boolean;
  isMain?: boolean;
  status?: ProjectStatus;
  delayed?: boolean;
  mainRingClassName?: string;
};

/**
 * ProjectBadge
 *
 * 프로젝트 색상 뱃지에 폴더·메인·즐겨찾기·선택 표시를 올립니다.
 *
 * @param props - ProjectBadge 컴포넌트 Props
 * @param props.color - 뱃지 배경색
 * @param props.size - 뱃지 크기
 * @param props.className - 뱃지에 더할 클래스
 * @param props.selected - 선택 상태인지 여부
 * @param props.mark - 뱃지 안 표시 종류
 * @param props.isFavorite - 즐겨찾기된 프로젝트인지 여부
 * @param props.isMain - 메인 프로젝트인지 여부
 */
export default function ProjectBadge({
  color,
  size = "sm",
  className = "",
  selected = false,
  mark,
  isFavorite = false,
  isMain = false,
}: ProjectBadgeProps) {
  const config = badgeSizes[size];

  const hasColor = Boolean(color?.trim());

  const resolvedMark =
    mark ?? (selected ? "check" : isMain ? "main" : isFavorite ? "favorite" : "folder");

  const badge = (
    <span
      className={`flex shrink-0 items-center justify-center rounded-[var(--radius-sm)] ${
        hasColor
          ? "border"
          : "border border-dashed border-[var(--color-border)] bg-[var(--color-muted)] text-[var(--color-text-muted)]"
      } ${config.box} ${className} `}
      style={
        hasColor
          ? {
              backgroundColor: getProjectTintColor(color),
              borderColor: getProjectTintLineColor(color),
              color: getProjectTintInkColor(color ?? ""),
            }
          : undefined
      }
    >
      <ProjectBadgeGlyph mark={resolvedMark} selected={selected} iconSize={config.icon} />
    </span>
  );

  return badge;
}
