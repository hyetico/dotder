import type { ReactNode } from "react";

type StatusChoiceButtonProps = {
  statusId: string;
  selected: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  dimmed?: boolean;
  palette?: "primary" | "status";
  className?: string;
  hideIconOnTablet?: boolean;
  showIconAlways?: boolean;
};

/**
 * StatusChoiceButton
 *
 * 상태 선택 버튼을 그립니다.
 * 프로젝트 상태 버튼은 배경 없이 두고, 그 외에는 선택된 버튼만 프라이머리 그라데이션을 씁니다.
 *
 * @param props - StatusChoiceButton 컴포넌트 Props
 * @param props.statusId - 상태 id
 * @param props.selected - 현재 선택된 상태인지 여부
 * @param props.onClick - 상태를 고를 때 실행되는 함수
 * @param props.icon - 상태 아이콘
 * @param props.children - 상태 이름
 * @param props.disabled - 선택할 수 없는지 여부
 * @param props.dimmed - 비활성 상태를 흐리게 보일지 여부
 * @param props.palette - status면 상태 색 카드, primary면 프라이머리 그라데이션
 * @param props.className - 상태 카드 높이에 덧붙일 클래스
 * @param props.hideIconOnTablet - 태블릿 이하에서 아이콘을 숨길지 여부
 * @param props.showIconAlways - 화면 너비와 상관없이 아이콘을 보일지 여부
 */
export default function StatusChoiceButton({
  selected,
  onClick,
  icon,
  children,
  disabled = false,
  dimmed = false,
  palette = "primary",
  className = "",
  hideIconOnTablet = false,
  showIconAlways = false,
}: StatusChoiceButtonProps) {
  const isStatusPalette = palette === "status";

  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={selected}
      onClick={onClick}
      className={`text-body flex min-w-0 items-center font-medium transition-[background-image,background-color,border-color,color] duration-150 hover:shadow-none! focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none active:shadow-none! ${
        isStatusPalette
          ? ` ${className || "h-9"} justify-center gap-2.5 rounded-[var(--radius-sm)] border-2 bg-transparent px-3 text-center text-[var(--color-text)] md:justify-start md:text-left ${
              selected
                ? "border-[var(--color-field-focus)]"
                : "border-gray-200 hover:border-gray-300"
            } `
          : `h-9 justify-center gap-1 overflow-hidden rounded-[var(--radius-sm)] border px-4 text-center ${
              selected
                ? `bg-primary-gradient border-transparent text-white`
                : `border-[var(--color-border)] bg-white text-[var(--color-text)] hover:bg-[var(--color-hover)]`
            } `
      } ${dimmed ? "cursor-not-allowed opacity-40" : disabled ? "cursor-default" : ""} `}
    >
      {icon ? (
        <span
          className={`flex shrink-0 items-center justify-center ${
            showIconAlways ? "" : hideIconOnTablet ? "max-lg:hidden" : "max-md:hidden"
          } `}
        >
          {icon}
        </span>
      ) : null}

      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}
