"use client";

import FilterBottomSheet from "@/components/ui/FilterBottomSheet";
import { ListFilter, iconStroke } from "@/components/ui/icon";

import type { StatusFilterChipItem } from "@/components/ui/StatusFilterChips";

const mobileFilterClassName =
  "text-sm inline-flex h-11 min-w-0 shrink items-center gap-3 rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 whitespace-nowrap text-[var(--color-text)] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none lg:hidden";

const filterIconWrapClassName = "relative inline-flex";

const filterAppliedDotClassName =
  "absolute -top-1 -right-1 size-1.5 rounded-full bg-[var(--color-primary)] ring-2 ring-[var(--color-border)]";

const filterBarClassName =
  "hidden h-11 min-w-0 items-center rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-1 lg:flex";

const chipRowClassName =
  "flex min-w-0 items-center gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const filterDividerClassName = "h-5 w-px shrink-0 bg-[var(--color-border-strong)]";

const desktopFilterDividerClassName = "mx-3 h-5 w-px shrink-0 bg-[var(--color-border-strong)]";

const filterIconBaseClassName =
  "relative inline-flex h-9 w-14 shrink-0 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none";

const statusIconBaseClassName =
  "inline-flex size-4 shrink-0 items-center justify-center [&_svg]:size-4";

const chipBaseClassName =
  "text-sm inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[18px] px-3 whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none";

type StatusFilterBarProps<T extends string> = {
  items: StatusFilterChipItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  title: string;
  sectionLabel: string;
  resetValue: T;
};

/**
 * filterIconClassName
 *
 * 필터가 적용됐을 때 아이콘을 진하게 보이도록 버튼 클래스를 한 줄로 합칩니다.
 *
 * @param active - 기본값이 아닌 필터가 적용됐는지 여부
 * @returns 필터 아이콘 버튼 클래스
 */
function filterIconClassName(active: boolean) {
  return [
    filterIconBaseClassName,
    "rounded-[18px]",
    active
      ? "bg-[var(--color-hover)] text-[var(--color-text)]"
      : "text-[var(--color-text-muted)] hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)]",
  ].join(" ");
}

/**
 * statusIconClassName
 *
 * 선택된 상태 아이콘만 진한 글자색을 쓰도록 클래스를 한 줄로 합칩니다.
 *
 * @param selected - 이 상태가 선택됐는지 여부
 * @returns 상태 아이콘 클래스
 */
function statusIconClassName(selected: boolean) {
  return [
    statusIconBaseClassName,
    selected ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]",
  ].join(" ");
}

/**
 * chipClassName
 *
 * 상태 칩이 선택됐을 때와 아닐 때의 클래스를 한 줄로 합칩니다.
 *
 * @param selected - 이 상태가 선택됐는지 여부
 * @returns 칩 버튼 클래스
 */
function chipClassName(selected: boolean) {
  return [
    chipBaseClassName,
    selected
      ? "bg-[var(--color-hover)] text-[var(--color-text)]"
      : "bg-transparent font-normal text-[var(--color-text-muted)] hover:bg-[var(--color-hover-soft)]",
  ].join(" ");
}

/**
 * formatFilterCount
 *
 * 상태 개수를 필터에 보일 글자로 바꿉니다.
 *
 * @param count - 상태 개수
 * @returns 99개를 넘으면 +99, 아니면 숫자
 */
function formatFilterCount(count: number) {
  return count > 99 ? "+99" : String(count);
}

/**
 * StatusFilterBar
 *
 * 검색 아래에서 상태 필터와 필터 버튼을 한 알약으로 보여 줍니다.
 * 넓은 화면은 상태 칩과 필터 아이콘을 같이 두고, 좁은 화면은 필터 아이콘과 현재 상태를 같이 둡니다.
 *
 * @param props - StatusFilterBar 컴포넌트 Props
 * @param props.items - 고를 수 있는 상태와 개수
 * @param props.value - 현재 상태
 * @param props.onChange - 상태를 고를 때 실행되는 함수
 * @param props.label - 필터 버튼의 접근 이름
 * @param props.title - 필터 시트 제목
 * @param props.sectionLabel - 상태 목록과 칩 묶음의 접근 이름
 * @param props.resetValue - 필터를 초기화할 때 돌아갈 상태
 */
export default function StatusFilterBar<T extends string>({
  items,
  value,
  onChange,
  label,
  title,
  sectionLabel,
  resetValue,
}: StatusFilterBarProps<T>) {
  const activeItem = items.find((item) => item.id === value) ?? items[0];

  return (
    <FilterBottomSheet
      label={label}
      title={title}
      sectionLabel={sectionLabel}
      options={items}
      value={value}
      onChange={onChange}
      resetValue={resetValue}
      renderTrigger={({ onClick, expanded, active }) => (
        <>
          <button
            type="button"
            className={mobileFilterClassName}
            aria-label={label}
            aria-expanded={expanded}
            onClick={onClick}
          >
            <span className={filterIconWrapClassName}>
              <ListFilter size={16} strokeWidth={iconStroke} aria-hidden />
              {active ? <span aria-hidden className={filterAppliedDotClassName} /> : null}
            </span>
            <span aria-hidden className={filterDividerClassName} />
            <span className="min-w-0 truncate font-semibold">
              {activeItem.label} {formatFilterCount(activeItem.count)}
            </span>
          </button>

          <div className={filterBarClassName}>
            <div role="radiogroup" aria-label={sectionLabel} className={chipRowClassName}>
              {items.map((item) => {
                const selected = item.id === value;

                return (
                  <button
                    key={item.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(item.id)}
                    className={chipClassName(selected)}
                  >
                    {item.icon ? (
                      <span className={statusIconClassName(selected)}>{item.icon}</span>
                    ) : null}
                    <span className={selected ? "font-semibold" : undefined}>
                      {item.label} {formatFilterCount(item.count)}
                    </span>
                  </button>
                );
              })}
            </div>

            <span aria-hidden className={desktopFilterDividerClassName} />
            <button
              type="button"
              className={filterIconClassName(active)}
              aria-label={label}
              aria-expanded={expanded}
              onClick={onClick}
            >
              <span className={filterIconWrapClassName}>
                <ListFilter size={16} strokeWidth={iconStroke} aria-hidden />
                {active ? <span aria-hidden className={filterAppliedDotClassName} /> : null}
              </span>
            </button>
          </div>
        </>
      )}
    />
  );
}
