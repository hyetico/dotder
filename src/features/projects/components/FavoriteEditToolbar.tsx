"use client";

import PrimaryButton from "@/components/ui/button/PrimaryButton";

import FavoriteSelectBox from "@/features/projects/components/FavoriteSelectBox";

const favoriteEditToolbarClassName =
  "flex min-h-10 min-w-0 flex-wrap items-center justify-between gap-3";
const favoriteEditSelectClassName = "flex min-w-0 items-center";
const favoriteEditCheckClassName = "flex min-w-0 items-center gap-2";
const favoriteEditSelectLabelClassName =
  "text-[14px] leading-5 font-medium text-[var(--color-text)]";
const favoriteEditDividerClassName = "mx-4 h-4 w-px shrink-0 bg-[var(--color-border)]";
const favoriteEditCountClassName =
  "text-[14px] leading-5 font-medium text-[var(--color-text-secondary)] tabular-nums";
const favoriteEditRemoveButtonClassName = "!h-7 !rounded-full !px-3";

type FavoriteEditToolbarProps = {
  selectedCount: number;
  allSelected: boolean;
  partiallySelected: boolean;
  onToggleAll: () => void;
  onRemoveSelected: () => void;
};

/**
 * FavoriteEditToolbar
 *
 * 즐겨찾기 편집 중 전체 선택과 선택 해제를 한 줄로 보여 줍니다.
 * 전체 선택은 지금 검색과 필터에 보이는 프로젝트만 고릅니다.
 *
 * @param props - FavoriteEditToolbar 컴포넌트 Props
 * @param props.selectedCount - 지금 고른 프로젝트 수
 * @param props.allSelected - 보이는 프로젝트를 모두 골랐는지 여부
 * @param props.partiallySelected - 일부만 골랐는지 여부
 * @param props.onToggleAll - 전체 선택을 켜거나 끌 때 실행되는 함수
 * @param props.onRemoveSelected - 고른 프로젝트를 즐겨찾기에서 뺄 때 실행되는 함수
 */
export default function FavoriteEditToolbar({
  selectedCount,
  allSelected,
  partiallySelected,
  onToggleAll,
  onRemoveSelected,
}: FavoriteEditToolbarProps) {
  return (
    <div className={favoriteEditToolbarClassName}>
      <div className={favoriteEditSelectClassName}>
        <div className={favoriteEditCheckClassName}>
          <FavoriteSelectBox
            checked={allSelected}
            mixed={partiallySelected}
            label="전체 선택"
            onChange={onToggleAll}
          />
          <span className={favoriteEditSelectLabelClassName}>전체 선택</span>
        </div>
        <span aria-hidden className={favoriteEditDividerClassName} />
        <span className={favoriteEditCountClassName}>{selectedCount}개 선택</span>
      </div>
      <PrimaryButton
        size="xs"
        className={favoriteEditRemoveButtonClassName}
        disabled={selectedCount === 0}
        onClick={onRemoveSelected}
      >
        선택 {selectedCount}개 해제
      </PrimaryButton>
    </div>
  );
}
