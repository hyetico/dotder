"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import CloseButton from "@/components/ui/button/CloseButton";
import FilterButton from "@/components/ui/FilterButton";
import { AppIcon, RotateCcw } from "@/components/ui/icon";
import LineTabMenu from "@/components/ui/tab/LineTabMenu";

import { useIsClient } from "@/hooks/useIsClient";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";
import { getStatusFilterTone } from "@/lib/statusColors";

export type MobileFilterOption<T extends string> = {
  id: T;
  label: string;
  icon?: ReactNode;
};

export type MobileFilterSortOption = {
  value: string;
  label: string;
};

type MobileFilterDrawerProps<T extends string> = {
  isOpen: boolean;
  onClose: () => void;
  label: string;
  filterOptions: MobileFilterOption<T>[];
  activeFilter: T;
  onFilterChange: (filter: T) => void;
  allFilter: T;
  sortOptions?: MobileFilterSortOption[];
  sortValue?: string;
  onSortChange?: (value: string) => void;
  defaultSort?: string;
};

/**
 * FilterSection
 *
 * 필터 드로어 안에서 상태나 정렬 버튼을 제목 아래에 묶습니다.
 *
 * @param props - FilterSection 컴포넌트 Props
 * @param props.title - 묶음 제목
 * @param props.children - 안에 둘 필터 버튼
 */
function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">{title}</h3>

      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

/**
 * MobileFilterDrawer
 *
 * 좁은 화면에서 상태와 정렬을 고르는 필터 드로어입니다.
 * 적용하기를 눌러야 목록에 반영됩니다.
 *
 * @param props - MobileFilterDrawer 컴포넌트 Props
 * @param props.isOpen - 드로어가 열려 있는지 여부
 * @param props.onClose - 드로어를 닫을 때 실행되는 함수
 * @param props.label - 드로어 접근 이름
 * @param props.filterOptions - 상태 필터 항목
 * @param props.activeFilter - 현재 적용된 상태 필터
 * @param props.onFilterChange - 상태 필터를 적용할 때 실행되는 함수
 * @param props.allFilter - 전체를 뜻하는 필터 값
 * @param props.sortOptions - 정렬 항목. 없으면 정렬 묶음을 숨깁니다
 * @param props.sortValue - 현재 적용된 정렬
 * @param props.onSortChange - 정렬을 적용할 때 실행되는 함수
 * @param props.defaultSort - 초기화할 때 돌아갈 정렬. 기본값은 latest
 */
export default function MobileFilterDrawer<T extends string>({
  isOpen,
  onClose,
  label,
  filterOptions,
  activeFilter,
  onFilterChange,
  allFilter,
  sortOptions = [],
  sortValue = "",
  onSortChange,
  defaultSort = "latest",
}: MobileFilterDrawerProps<T>) {
  const isClient = useIsClient();
  const setScrollRoot = useModalScrollLock(isOpen);
  const [draftFilter, setDraftFilter] = useState<T>(activeFilter);
  const [draftSort, setDraftSort] = useState(sortValue || defaultSort);
  const hasSort = sortOptions.length > 0 && Boolean(onSortChange);

  // 열려 있는 동안 적용된 값이 바뀌면(열릴 때 포함) 고르던 값을 적용된 값으로 맞춘다.
  const appliedSort = sortValue || defaultSort;
  const [syncedFrom, setSyncedFrom] = useState<{ activeFilter: T; appliedSort: string } | null>(
    null,
  );

  if (!isOpen && syncedFrom !== null) {
    setSyncedFrom(null);
  }

  if (
    isOpen &&
    (syncedFrom === null ||
      syncedFrom.activeFilter !== activeFilter ||
      syncedFrom.appliedSort !== appliedSort)
  ) {
    setSyncedFrom({ activeFilter, appliedSort });
    setDraftFilter(activeFilter);
    setDraftSort(appliedSort);
  }

  /**
   * handleApply
   *
   * 고른 상태와 정렬을 목록에 적용하고 드로어를 닫습니다.
   */
  const handleApply = () => {
    onFilterChange(draftFilter);

    if (hasSort && onSortChange) {
      onSortChange(draftSort);
    }

    onClose();
  };

  /**
   * handleReset
   *
   * 드로어 안의 상태와 정렬을 기본값으로 되돌립니다.
   */
  const handleReset = () => {
    setDraftFilter(allFilter);
    setDraftSort(defaultSort);
  };

  const isDefaultDraft = draftFilter === allFilter && (!hasSort || draftSort === defaultSort);

  const hasChanges =
    draftFilter !== activeFilter || (hasSort && draftSort !== (sortValue || defaultSort));

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isClient || !isOpen) {
    return null;
  }

  return createPortal(
    <div ref={setScrollRoot} className="fixed inset-0 z-[120]" role="presentation">
      <button
        type="button"
        aria-label="필터 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/20 transition-opacity duration-300"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="absolute top-0 right-0 flex h-full w-full max-w-[420px] flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-dropdown)] transition-transform duration-300 ease-out sm:w-[min(100vw,400px)]"
      >
        <div className="flex h-[54px] shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] px-5">
          <h2 className="text-section-title text-[var(--color-text)]">필터</h2>

          <CloseButton onClick={onClose} />
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto overscroll-none px-5 py-5">
          <FilterSection title="상태">
            {filterOptions.map((option) => (
              <FilterButton
                key={option.id}
                variant="outline"
                tone={getStatusFilterTone(option.id)}
                icon={option.icon}
                selected={draftFilter === option.id}
                onClick={() => setDraftFilter(option.id)}
              >
                {option.label}
              </FilterButton>
            ))}
          </FilterSection>

          {hasSort ? (
            <section>
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-text)]">정렬</h3>

              <LineTabMenu
                ariaLabel="정렬"
                value={draftSort}
                items={sortOptions.map((option) => ({
                  id: option.value,
                  label: option.label,
                }))}
                onChange={setDraftSort}
              />
            </section>
          ) : null}
        </div>

        <div className="flex h-[54px] shrink-0 items-center border-t border-[var(--color-border)] px-5">
          <div className="flex w-full items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={isDefaultDraft}
              className="text-body-sm inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 font-medium whitespace-nowrap text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <AppIcon icon={RotateCcw} size="md" />
              초기화
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!hasChanges}
              className="text-body-sm bg-primary-gradient flex h-10 min-w-0 flex-1 items-center justify-center rounded-[var(--radius-sm)] font-medium !text-white transition-[filter,opacity] duration-150 hover:!text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              필터 적용하기
            </button>
          </div>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
