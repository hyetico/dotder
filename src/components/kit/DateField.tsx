"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";

import Button from "@/components/kit/Button";
import Popover from "@/components/kit/Popover";
import { Calendar, ChevronLeft, ChevronRight } from "@/components/ui/icon";

import { cn } from "@/lib/cn";
import { formatDate, parseDateKey, toDateKey } from "@/lib/date";

type DateFieldProps = {
  /** `YYYY-MM-DD`. 비면 「날짜 선택」 */
  value: string;
  onChange: (value: string) => void;
  /** 읽는 이름 · 모바일 시트 제목. 예: "시작일" */
  label: string;
  /** 이 날 이전은 고를 수 없다 (`YYYY-MM-DD`, 시작일은 오늘) */
  min?: string;
  invalid?: boolean;
  /** 바꿀 수 없는 칸 (보드 03-g 「지금 마감일」) */
  disabled?: boolean;
  /** field: 입력칸 · row: 상세 드로어 속성 줄(테두리 없음 · 요일 붙임 · 보드 05-b) */
  variant?: "field" | "row";
  /** row 오른쪽 끝 작은 글 (「87일 지남」) */
  trailing?: ReactNode;
  id?: string;
};

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 날짜 칸 (Components 08 DatePicker). 달력 아이콘 + 「2026.08.01」(비면 「날짜 선택」).
 * 누르면 칸 아래 달력 팝오버 282(7열 36), 모바일은 바텀시트(칸 44). 고른 날은 채움, 오늘은 테두리,
 * `min` 이전 날은 --t4 · 누를 수 없음. 아래에 「오늘」 · 「지우기」. 브라우저 기본 날짜 입력은 쓰지 않는다.
 *
 * @example
 * <DateField label="시작일" value={start} onChange={setStart} min={todayKey} />
 */
export default function DateField({
  value,
  onChange,
  label,
  min,
  invalid = false,
  disabled = false,
  variant = "field",
  trailing,
  id,
}: DateFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const today = toDateKey(new Date());
  const selected = parseDateKey(value);
  const [month, setMonth] = useState(() => {
    const base = selected ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const start = new Date(first);
    start.setDate(1 - first.getDay());

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [month]);

  const pick = (key: string) => {
    onChange(key);
    setIsOpen(false);
  };

  const moveMonth = (step: number) =>
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + step, 1));

  return (
    <>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        disabled={disabled}
        aria-label={`${label} ${value ? formatDate(value) : "날짜 선택"}`}
        onClick={() => setIsOpen((open) => !open)}
        className={cn(
          "kit-focus flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] text-left text-sm",
          variant === "row"
            ? "-ml-2.5 min-h-9 px-2.5 hover:bg-[var(--s3)]"
            : cn(
                "h-10 border bg-[var(--surface)] px-3 transition-[border-color] max-md:h-12",
                invalid
                  ? "border-[var(--bad)]"
                  : "border-[var(--input-line)] hover:border-[var(--input-line-h)]",
                "disabled:cursor-not-allowed disabled:bg-[var(--s2)] disabled:text-[var(--t4)] disabled:hover:border-[var(--input-line)]",
                isOpen && "border-[var(--primary)] shadow-[0_0_0_3px_var(--input-ring)]",
              ),
        )}
      >
        <Calendar size={16} aria-hidden className="shrink-0 text-[var(--t3)]" />
        <span
          className={cn(
            "min-w-0 truncate",
            variant === "field" && "flex-1",
            value ? "text-[var(--text)]" : "text-[var(--t3)]",
          )}
        >
          {value
            ? variant === "row"
              ? `${formatDate(value)} (${WEEKDAYS[selected?.getDay() ?? 0]})`
              : formatDate(value)
            : "날짜 선택"}
        </span>
        {variant === "row" && trailing ? (
          <span className="ml-auto text-xs whitespace-nowrap">{trailing}</span>
        ) : null}
      </button>
      <Popover
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        anchorRef={buttonRef}
        title={label}
        width={282}
      >
        <div className="flex flex-col gap-1 p-1">
          <div className="flex items-center justify-between px-1">
            <strong className="text-sm font-semibold">
              {month.getFullYear()}년 {month.getMonth() + 1}월
            </strong>
            <span className="flex">
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                aria-label="이전 달"
                onClick={() => moveMonth(-1)}
              >
                <ChevronLeft size={16} aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="xs"
                iconOnly
                aria-label="다음 달"
                onClick={() => moveMonth(1)}
              >
                <ChevronRight size={16} aria-hidden />
              </Button>
            </span>
          </div>
          <div
            role="grid"
            aria-label={`${month.getFullYear()}년 ${month.getMonth() + 1}월`}
            className="grid grid-cols-7"
          >
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="flex h-8 items-center justify-center text-xs text-[var(--t3)]"
              >
                {day}
              </span>
            ))}
            {days.map((date) => {
              const key = toDateKey(date);
              const isOther = date.getMonth() !== month.getMonth();
              const isDisabled = Boolean(min && key < min);
              const isSelected = key === value;
              const isToday = key === today;

              return (
                <button
                  key={key}
                  type="button"
                  aria-disabled={isDisabled || undefined}
                  aria-pressed={isSelected}
                  aria-label={formatDate(key)}
                  onClick={() => (isDisabled ? undefined : pick(key))}
                  className={cn(
                    "kit-focus flex size-9 items-center justify-center justify-self-center rounded-[var(--radius-sm)] text-sm tabular-nums max-md:size-11",
                    isSelected
                      ? "bg-[var(--primary)] font-semibold text-[var(--on-primary)]"
                      : isDisabled
                        ? "cursor-not-allowed text-[var(--t4)]"
                        : cn(
                            "cursor-pointer hover:bg-[var(--s3)]",
                            isOther ? "text-[var(--t3)]" : "text-[var(--text)]",
                          ),
                    isToday && !isSelected && "border border-[var(--primary)]",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="flex justify-between border-t border-[var(--divider)] pt-1">
            <Button variant="ghost" size="xs" onClick={() => pick("")}>
              지우기
            </Button>
            <Button
              variant="ghost"
              size="xs"
              disabled={Boolean(min && today < min)}
              onClick={() => pick(today)}
            >
              오늘
            </Button>
          </div>
        </div>
      </Popover>
    </>
  );
}
