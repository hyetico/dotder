"use client";

import { AppIcon, Check, Minus } from "@/components/ui/icon";

const favoriteSelectBoxClassName =
  "grid size-4 shrink-0 cursor-pointer place-items-center rounded-[4px] border text-white";
const favoriteSelectBoxOnClassName = "border-[var(--color-primary)] bg-[var(--color-primary)]";
const favoriteSelectBoxOffClassName = "border-[var(--color-border-strong)] bg-white";

type FavoriteSelectBoxProps = {
  checked: boolean;
  mixed?: boolean;
  label: string;
  onChange: () => void;
};

/**
 * FavoriteSelectBox
 *
 * 즐겨찾기 편집에서 프로젝트를 고르는 네모 체크입니다.
 * 일부만 고르면 빼기 표시를 보여 줍니다.
 *
 * @param props - FavoriteSelectBox 컴포넌트 Props
 * @param props.checked - 선택된 상태인지 여부
 * @param props.mixed - 일부만 선택됐는지 여부
 * @param props.label - 체크 버튼 이름
 * @param props.onChange - 선택을 바꿀 때 실행되는 함수
 */
export default function FavoriteSelectBox({
  checked,
  mixed = false,
  label,
  onChange,
}: FavoriteSelectBoxProps) {
  const marked = checked || mixed;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={mixed ? "mixed" : checked}
      aria-label={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange();
      }}
      className={[
        favoriteSelectBoxClassName,
        marked ? favoriteSelectBoxOnClassName : favoriteSelectBoxOffClassName,
      ].join(" ")}
    >
      {mixed ? (
        <AppIcon icon={Minus} size="xs" />
      ) : checked ? (
        <AppIcon icon={Check} size="xs" />
      ) : null}
    </button>
  );
}
