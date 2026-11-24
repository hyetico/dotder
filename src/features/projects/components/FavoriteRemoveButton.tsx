"use client";

import { Minus } from "@/components/ui/icon";

const favoriteRemoveButtonClassName =
  "relative z-20 grid size-6 shrink-0 cursor-pointer place-items-center rounded-full border border-[rgba(41,45,50,0.08)] bg-white text-[var(--color-text-secondary)] shadow-[0_1px_2px_rgba(41,45,50,0.06),0_2px_4px_rgba(41,45,50,0.08)] before:absolute before:top-1/2 before:left-1/2 before:size-8 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] hover:bg-[var(--color-hover-soft)]";

export const favoriteRemoveButtonFloatingClassName = "absolute top-3.5 right-4 z-20";
export const favoriteRemoveButtonCardClassName = "absolute top-3.5 right-4 z-20";

type FavoriteRemoveButtonProps = {
  label: string;
  onClick: () => void;
  className?: string;
};

/**
 * FavoriteRemoveButton
 *
 * 편집 중인 즐겨찾기에서 프로젝트를 빼는 동그란 빼기 버튼입니다.
 *
 * @param props - FavoriteRemoveButton 컴포넌트 Props
 * @param props.label - 버튼 이름. 어떤 프로젝트를 해제하는지 적습니다
 * @param props.onClick - 버튼을 눌렀을 때 실행되는 함수
 * @param props.className - 카드 위 위치처럼 버튼에 더할 클래스
 */
export default function FavoriteRemoveButton({
  label,
  onClick,
  className = "",
}: FavoriteRemoveButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={[favoriteRemoveButtonClassName, className].filter(Boolean).join(" ")}
    >
      <Minus size={12} strokeWidth={1.5} color="var(--color-text-secondary)" aria-hidden />
    </button>
  );
}
