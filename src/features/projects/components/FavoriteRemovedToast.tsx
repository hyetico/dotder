"use client";

const favoriteRemovedToastClassName =
  "fixed bottom-6 left-1/2 z-[var(--z-toast)] flex -translate-x-1/2 items-center gap-3 rounded-full bg-[var(--color-primary)] py-1.5 pr-1.5 pl-4 text-[var(--color-text-inverse)] shadow-[var(--shadow-overlay)]";
const favoriteRemovedUndoClassName =
  "cursor-pointer rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-xs leading-5 font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover)]";

type FavoriteRemovedToastProps = {
  onUndo: () => void;
};

/**
 * FavoriteRemovedToast
 *
 * 즐겨찾기를 해제한 뒤 화면 아래에 보이는 알림입니다.
 * 실행 취소를 누르면 방금 뺀 프로젝트를 다시 즐겨찾기에 넣습니다.
 *
 * @param props - FavoriteRemovedToast 컴포넌트 Props
 * @param props.onUndo - 실행 취소를 눌렀을 때 실행되는 함수
 */
export default function FavoriteRemovedToast({ onUndo }: FavoriteRemovedToastProps) {
  return (
    <div role="status" className={favoriteRemovedToastClassName}>
      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[var(--color-surface)]" />
      <span className="text-sm leading-5 font-medium whitespace-nowrap">
        즐겨찾기에서 해제했어요.
      </span>
      <button type="button" onClick={onUndo} className={favoriteRemovedUndoClassName}>
        실행 취소
      </button>
    </div>
  );
}
