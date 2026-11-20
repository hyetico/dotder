"use client";

import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";

import { createPortal } from "react-dom";

import { AppIcon, Funnel, type IconSize } from "@/components/ui/icon";

import CloseButton from "@/components/ui/button/CloseButton";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";

import { useModalScrollLock } from "@/hooks/useModalScrollLock";

export type FilterSheetOption<T extends string> = {
  id: T;
  label: string;
  count: number;
};

type FilterBottomSheetProps<T extends string> = {
  label?: string;
  title?: string;
  sectionLabel?: string;
  options: FilterSheetOption<T>[];
  value: T;
  onChange: (value: T) => void;
  resetValue: T;
  className?: string;
  tone?: "outline" | "soft";
  iconSize?: IconSize;
  hideIconOnMobile?: boolean;
  mobileLabel?: string;
  renderTrigger?: (props: { onClick: () => void; expanded: boolean; active: boolean }) => ReactNode;
};

/**
 * FilterSheetButton
 *
 * 좁은 화면에서 필터 시트를 여는 버튼입니다.
 * 보이는 높이는 40px이고, 터치 영역은 44px입니다.
 *
 * @param props - FilterSheetButton 컴포넌트 Props
 * @param props.label - 버튼 이름
 * @param props.active - 기본값이 아닌 필터가 적용됐는지 여부
 * @param props.expanded - 시트가 열려 있는지 여부
 * @param props.onClick - 시트를 열 때 실행되는 함수
 * @param props.className - 버튼에 더할 클래스
 * @param props.tone - 버튼 바탕. soft는 보기 전환과 같은 회색
 * @param props.iconSize - 아이콘 크기. 기본값은 md
 * @param props.hideIconOnMobile - 모바일에서 아이콘을 숨길지 여부
 * @param props.mobileLabel - 모바일에서 아이콘 대신 보일 글자
 */
function FilterSheetButton({
  label,
  active,
  expanded,
  onClick,
  className = "",
  tone = "outline",
  iconSize = "md",
  hideIconOnMobile = false,
  mobileLabel,
}: {
  label: string;
  active: boolean;
  expanded: boolean;
  onClick: () => void;
  className?: string;
  tone?: "outline" | "soft";
  iconSize?: IconSize;
  hideIconOnMobile?: boolean;
  mobileLabel?: string;
}) {
  const isSoft = tone === "soft";

  const button = (
    <button
      type="button"
      aria-label={label}
      aria-expanded={expanded}
      onClick={onClick}
      className={`text-body relative inline-flex shrink-0 items-center justify-center transition-colors before:absolute before:top-1/2 before:left-1/2 before:h-11 before:w-full before:min-w-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none ${
        isSoft
          ? `size-9 rounded-[6px] min-[1025px]:size-8 ${
              active
                ? `bg-white text-[var(--color-text)] shadow-sm`
                : `text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]`
            } `
          : `h-10 w-10 rounded-[var(--radius-sm)] border border-[#E5E7EB] bg-white text-[var(--color-text)] hover:bg-[var(--color-hover-soft)] ${className} `
      } `}
    >
      <AppIcon icon={Funnel} size={iconSize} className={hideIconOnMobile ? "max-md:hidden" : ""} />
      {hideIconOnMobile && mobileLabel ? (
        <span className="text-sm leading-5 font-medium md:hidden">{mobileLabel}</span>
      ) : null}
      {active ? (
        <span
          aria-hidden
          className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[var(--color-primary)]"
        />
      ) : null}
    </button>
  );

  if (!isSoft) {
    return button;
  }

  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[#F1F3F5] p-0.5 min-[1025px]:h-9 min-[1025px]:w-9 ${className} `}
    >
      {button}
    </span>
  );
}

/**
 * FilterBottomSheet
 *
 * 좁은 화면에서 상태를 하나만 고르는 하단 시트입니다.
 * 적용을 눌러야 목록에 반영됩니다.
 *
 * @param props - FilterBottomSheet 컴포넌트 Props
 * @param props.label - 버튼과 시트의 접근 이름. 기본값은 필터
 * @param props.title - 시트 제목. 기본값은 필터
 * @param props.sectionLabel - 상태 목록 제목. 기본값은 상태
 * @param props.options - 고를 수 있는 상태
 * @param props.value - 현재 적용된 상태
 * @param props.onChange - 상태를 적용할 때 실행되는 함수
 * @param props.resetValue - 초기화할 때 돌아갈 상태
 * @param props.className - 기본 열기 버튼에 더할 클래스
 * @param props.tone - 버튼 바탕. soft는 보기 전환과 같은 회색
 * @param props.iconSize - 아이콘 크기. 기본값은 md
 * @param props.hideIconOnMobile - 모바일에서 아이콘을 숨길지 여부
 * @param props.mobileLabel - 모바일에서 아이콘 대신 보일 글자
 * @param props.renderTrigger - 시트 열기 버튼. 없으면 필터 아이콘 버튼을 씁니다
 */
export default function FilterBottomSheet<T extends string>({
  label = "필터",
  title = "필터",
  sectionLabel = "상태",
  options,
  value,
  onChange,
  resetValue,
  className,
  tone = "outline",
  iconSize = "md",
  hideIconOnMobile = false,
  mobileLabel,
  renderTrigger,
}: FilterBottomSheetProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [draft, setDraft] = useState<T>(value);
  const setScrollRoot = useModalScrollLock(isOpen);

  /**
   * openSheet
   *
   * 지금 적용된 상태를 시트에 복사한 뒤 엽니다.
   */
  const openSheet = () => {
    setDraft(value);
    setIsOpen(true);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  /**
   * handleApply
   *
   * 고른 상태를 목록에 적용하고 시트를 닫습니다.
   */
  const handleApply = () => {
    onChange(draft);
    setIsOpen(false);
  };

  /**
   * handleReset
   *
   * 시트 안의 선택을 기본 상태로 되돌립니다.
   */
  const handleReset = () => {
    setDraft(resetValue);
  };

  return (
    <>
      {renderTrigger ? (
        renderTrigger({
          onClick: openSheet,
          expanded: isOpen,
          active: value !== resetValue,
        })
      ) : (
        <FilterSheetButton
          label={label}
          active={value !== resetValue}
          expanded={isOpen}
          onClick={openSheet}
          className={className}
          tone={tone}
          iconSize={iconSize}
          hideIconOnMobile={hideIconOnMobile}
          mobileLabel={mobileLabel}
        />
      )}

      {isMounted && isOpen
        ? createPortal(
            <div ref={setScrollRoot} className="fixed inset-0 z-[120]" role="presentation">
              <button
                type="button"
                aria-label="필터 닫기"
                onClick={() => setIsOpen(false)}
                className="absolute inset-0 bg-black/20"
              />

              <aside
                role="dialog"
                aria-modal="true"
                aria-label={label}
                className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col rounded-t-[20px] bg-[var(--color-surface)] shadow-[var(--shadow-dropdown)]"
              >
                <div className="flex shrink-0 items-center justify-between gap-3 px-5 pt-5 pb-2">
                  <h2 className="text-card-title text-[var(--color-text)]">{title}</h2>
                  <CloseButton onClick={() => setIsOpen(false)} />
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-none px-5 pb-4">
                  <p className="text-body-sm mb-1 font-medium text-[var(--color-text-secondary)]">
                    {sectionLabel}
                  </p>

                  <div role="radiogroup" aria-label={sectionLabel}>
                    {options.map((option) => {
                      const selected = draft === option.id;

                      return (
                        <button
                          key={option.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setDraft(option.id)}
                          className="text-body flex h-10 w-full items-center gap-3 border-b border-[var(--color-border)] text-left text-[var(--color-text)] last:border-b-0"
                        >
                          <span
                            className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-[var(--color-primary)] bg-[var(--color-primary)]"
                                : "border-[#D1D5DB] bg-white"
                            } `}
                          >
                            {selected ? <span className="size-2 rounded-full bg-white" /> : null}
                          </span>
                          <span>
                            {option.label}
                            <span className="ml-1 text-[var(--color-text-secondary)] tabular-nums">
                              ({option.count})
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 border-t border-[var(--color-border)] px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                  <SecondaryButton
                    onClick={handleReset}
                    disabled={draft === resetValue}
                    className="!h-10"
                  >
                    초기화
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleApply}
                    className="!h-[38px] min-w-0 flex-1 justify-center"
                  >
                    적용
                  </PrimaryButton>
                </div>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
