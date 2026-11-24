"use client";

import { ArrowRightLeft, Plus, iconStroke } from "@/components/ui/icon";

import ProjectFolder from "@/features/projects/components/ProjectFolder";

const favoriteAddCardClassName =
  "group block h-full min-h-[268px] w-full min-w-0 cursor-pointer text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-text)]";
const favoriteAddFolderClassName =
  "h-full min-h-[268px] w-full transition-[filter] group-hover:drop-shadow-[0_6px_10px_rgb(0_0_0/10%)]";
const favoriteAddFaceClassName =
  "flex min-h-0 flex-1 -translate-y-2 flex-col items-center justify-center gap-[10px] text-[var(--color-text)]";
const favoriteAddLabelClassName = "text-base leading-6 font-semibold";
const favoriteAddHintClassName = "text-xs leading-5 font-medium text-[var(--color-text-secondary)]";

type FavoriteAddCardProps = {
  onClick: () => void;
  remaining: number;
  replace?: boolean;
};

/**
 * FavoriteAddCard
 *
 * 즐겨찾기 카드 옆에 두는 폴더 모양 버튼입니다.
 * 자리가 있으면 추가하고, 한도에 닿으면 지금 고른 프로젝트를 바꿔 고릅니다.
 *
 * @param props - FavoriteAddCard 컴포넌트 Props
 * @param props.onClick - 버튼을 눌렀을 때 실행되는 함수
 * @param props.remaining - 더 추가할 수 있는 즐겨찾기 수
 * @param props.replace - 한도에 닿아 즐겨찾기를 바꿀지 여부
 */
export default function FavoriteAddCard({
  onClick,
  remaining,
  replace = false,
}: FavoriteAddCardProps) {
  const label = replace ? "즐겨찾기 변경" : "즐겨찾기 추가";
  const hint = replace ? "최대 3개" : `${remaining}개 더 추가할 수 있어요`;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${label}. ${hint}`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") {
          return;
        }

        event.preventDefault();
        onClick();
      }}
      className={favoriteAddCardClassName}
    >
      <ProjectFolder white wideTab={false} fill className={favoriteAddFolderClassName}>
        <div className={favoriteAddFaceClassName}>
          {replace ? (
            <ArrowRightLeft size={32} strokeWidth={iconStroke} aria-hidden />
          ) : (
            <Plus size={32} strokeWidth={iconStroke} aria-hidden />
          )}
          <span className="flex flex-col items-center gap-1">
            <span className={favoriteAddLabelClassName}>{label}</span>
            <span className={favoriteAddHintClassName}>{hint}</span>
          </span>
        </div>
      </ProjectFolder>
    </div>
  );
}
