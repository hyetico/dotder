"use client";

import { useId, useMemo, useState, type ReactNode } from "react";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import {
  fieldHoverClassName,
  fieldInactiveClassName,
  fieldOpenClassName,
  fieldPaddingClassName,
} from "@/components/ui/fieldControl";
import {
  AppIcon,
  Calendar,
  CalendarSync,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from "@/components/ui/icon";
import Modal, { modalSidePaddingClassName } from "@/components/ui/modal/Modal";

import type { LucideIcon } from "@/components/ui/icon/icons";

export type DatePickerMarker = {
  date: string;
  tone?: DatePickerMarkerTone;
};

type DatePickerMarkerTone = "primary" | "blue" | "teal" | "pink";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  valueClassName?: string;
  min?: string;
  max?: string;
  className?: string;
  variant?: "field" | "button" | "inline" | "embedded";
  formatValue?: (value: string) => string;
  buttonLabel?: string;
  buttonIcon?: LucideIcon;
  buttonClassName?: string;
  buttonTone?: "default" | "danger";
  applyOnConfirm?: boolean;
  iconPosition?: "start" | "end";
  maxWidthClassName?: string;
  markers?: DatePickerMarker[];
  belowCalendar?: (selected: string) => ReactNode;
  onBeforeConfirm?: (value: string) => boolean | Promise<boolean>;
  onRequestOpen?: () => void;
  zIndexClassName?: string;
};

const embeddedDateButtonClassName =
  "text-body inline-flex max-w-full min-w-0 cursor-pointer items-center bg-transparent p-0 text-left outline-none disabled:cursor-not-allowed";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const WEEKDAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

const markerToneClassName: Record<DatePickerMarkerTone, string> = {
  primary: "bg-[var(--color-primary)]",
  blue: "bg-blue-500",
  teal: "bg-teal-400",
  pink: "bg-rose-400",
};

function parseDate(value: string): Date | null {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function toDateValue(date: Date): string {
  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDisplayDate(value: string): string {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}. ${month}. ${day}.`;
}

function isBeforeMin(date: Date, min?: string): boolean {
  if (!min) {
    return false;
  }

  return toDateValue(date) < min;
}

function isAfterMax(date: Date, max?: string): boolean {
  if (!max) {
    return false;
  }

  return toDateValue(date) > max;
}

function isDateUnavailable(date: Date, min?: string, max?: string) {
  return isBeforeMin(date, min) || isAfterMax(date, max);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getCalendarDays(viewDate: Date): Date[] {
  const year = viewDate.getFullYear();

  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startOffset = new Date(year, month, 1).getDay();

  const count = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const days: Date[] = [];

  for (let index = 0; index < count; index += 1) {
    days.push(new Date(year, month, 1 - startOffset + index));
  }

  return days;
}

type DatePickerCalendarProps = {
  viewDate: Date;
  selectedDate: Date | null;
  min?: string;
  max?: string;
  markers?: DatePickerMarker[];
  isConfirming?: boolean;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelect: (date: Date) => void;
};

/**
 * DatePickerCalendar
 *
 * 월을 넘기며 하루를 고르는 달력입니다.
 *
 * @param props - DatePickerCalendar 컴포넌트 Props
 * @param props.viewDate - 지금 보여주는 달
 * @param props.selectedDate - 선택된 날짜
 * @param props.min - 고를 수 있는 가장 이른 날
 * @param props.max - 고를 수 있는 가장 늦은 날
 * @param props.markers - 날짜 아래에 표시할 점
 * @param props.isConfirming - 확인 처리 중인지 여부
 * @param props.onPrevMonth - 이전 달로 이동할 때 실행되는 함수
 * @param props.onNextMonth - 다음 달로 이동할 때 실행되는 함수
 * @param props.onSelect - 날짜를 고를 때 실행되는 함수
 */
function DatePickerCalendar({
  viewDate,
  selectedDate,
  min,
  max,
  markers = [],
  isConfirming = false,
  onPrevMonth,
  onNextMonth,
  onSelect,
}: DatePickerCalendarProps) {
  const today = new Date();

  const calendarDays = useMemo(() => getCalendarDays(viewDate), [viewDate]);

  const markersByDate = useMemo(() => {
    const grouped = new Map<string, DatePickerMarkerTone[]>();

    markers.forEach((marker) => {
      const tones = grouped.get(marker.date) ?? [];

      tones.push(marker.tone ?? "primary");

      grouped.set(marker.date, tones);
    });

    return grouped;
  }, [markers]);

  const selectedInView =
    selectedDate !== null &&
    selectedDate.getFullYear() === viewDate.getFullYear() &&
    selectedDate.getMonth() === viewDate.getMonth();

  const heading =
    selectedDate && selectedInView
      ? `${
          selectedDate.getFullYear() === today.getFullYear()
            ? ""
            : `${selectedDate.getFullYear()}년 `
        }${selectedDate.getMonth() + 1}월 ${selectedDate.getDate()}일 ${WEEKDAY_NAMES[selectedDate.getDay()]}`
      : `${viewDate.getFullYear()}년 ${viewDate.getMonth() + 1}월`;

  const showMarkerRow = markers.length > 0;

  return (
    <div className="mx-auto w-full max-w-[260px]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-body min-w-0 truncate font-semibold text-[var(--color-text)]">
          {heading}
        </p>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="이전 달"
            className="flex size-6 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-gray-100 hover:text-[var(--color-text)]"
          >
            <AppIcon icon={ChevronLeft} size="xs" />
          </button>

          <button
            type="button"
            onClick={onNextMonth}
            aria-label="다음 달"
            className="flex size-6 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-gray-100 hover:text-[var(--color-text)]"
          >
            <AppIcon icon={ChevronRight} size="xs" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="text-caption flex h-6 items-center justify-center font-medium text-[var(--color-text-muted)]"
          >
            {weekday}
          </div>
        ))}

        {calendarDays.map((day) => {
          const dateKey = toDateValue(day);

          const isCurrentMonth = day.getMonth() === viewDate.getMonth();

          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

          const isToday = isSameDay(day, today);

          const isUnavailable = isDateUnavailable(day, min, max);

          const dayMarkers = (markersByDate.get(dateKey) ?? []).slice(0, 3);

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isUnavailable}
              aria-pressed={isSelected}
              aria-label={`${day.getFullYear()}년 ${day.getMonth() + 1}월 ${day.getDate()}일`}
              onClick={() => {
                if (isConfirming) {
                  return;
                }

                onSelect(day);
              }}
              className={`flex ${
                showMarkerRow ? "h-8" : "h-7"
              } flex-col items-center justify-center`}
            >
              <span
                className={`text-caption flex size-6 items-center justify-center rounded-full leading-none transition-colors ${
                  isUnavailable
                    ? "cursor-not-allowed text-[var(--color-text-disabled)]"
                    : isSelected
                      ? "bg-primary-gradient font-medium text-white"
                      : isToday
                        ? "font-medium text-[var(--color-primary)] ring-1 ring-[var(--color-primary)] ring-inset hover:bg-[var(--color-primary-soft)]"
                        : isCurrentMonth
                          ? "text-[var(--color-text)] hover:bg-gray-100"
                          : "text-[var(--color-text-disabled)] hover:bg-[var(--color-hover-soft)]"
                } `}
              >
                {day.getDate()}
              </span>

              {showMarkerRow ? (
                <span className="mt-px flex h-1 items-center gap-px" aria-hidden="true">
                  {dayMarkers.map((tone, index) => (
                    <span
                      key={`${dateKey}-${tone}-${index}`}
                      className={`size-1 rounded-full ${markerToneClassName[tone]} `}
                    />
                  ))}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "날짜 선택",
  disabled = false,
  readOnly = false,
  invalid = false,
  valueClassName = "",
  min,
  max,
  className = "",
  variant = "field",
  formatValue,
  buttonLabel,
  buttonIcon,
  buttonClassName = "",
  buttonTone = "default",
  applyOnConfirm = false,
  iconPosition = "end",
  maxWidthClassName = "max-w-[300px]",
  markers = [],
  belowCalendar,
  onBeforeConfirm,
  onRequestOpen,
  zIndexClassName,
}: DatePickerProps) {
  const titleId = useId();

  const [isOpen, setIsOpen] = useState(false);

  const [viewDate, setViewDate] = useState<Date>(
    () => parseDate(value) ?? parseDate(min ?? "") ?? new Date(),
  );

  const [draftValue, setDraftValue] = useState(value);

  const [isConfirming, setIsConfirming] = useState(false);

  const keepsSelection = applyOnConfirm || belowCalendar !== undefined;

  const title = placeholder.replace(/ 선택$/, "");

  const selectedDate = parseDate(keepsSelection ? draftValue : value);

  // 열려 있는 동안 값이나 최소 날짜가 바뀌면(열릴 때 포함) 고르던 날짜와 보이는 달을 다시 맞춘다.
  const [syncedFrom, setSyncedFrom] = useState<{ value: string; min?: string } | null>(null);

  if (!isOpen && syncedFrom !== null) {
    setSyncedFrom(null);
  }

  if (isOpen && (syncedFrom === null || syncedFrom.value !== value || syncedFrom.min !== min)) {
    setSyncedFrom({ value, min });
    setDraftValue(value);
    setViewDate(parseDate(value) ?? parseDate(min ?? "") ?? new Date());
  }

  const open = () => {
    if (disabled || readOnly) {
      return;
    }

    setDraftValue(value);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const handleSelect = (date: Date) => {
    if (isDateUnavailable(date, min, max)) {
      return;
    }

    const nextValue = toDateValue(date);

    setViewDate(new Date(date.getFullYear(), date.getMonth(), 1));

    if (keepsSelection) {
      setDraftValue(nextValue);
      return;
    }

    onChange(nextValue);
    close();
  };

  const handleReset = () => {
    if (isConfirming) {
      return;
    }

    if (!keepsSelection) {
      onChange("");
      close();
      return;
    }

    setDraftValue("");
    setViewDate(parseDate(min ?? "") ?? new Date());
  };

  const handleConfirm = async () => {
    if (isConfirming) {
      return;
    }

    if (!draftValue) {
      if (value) {
        onChange("");
        close();
      }

      return;
    }

    const draftDate = parseDate(draftValue);

    if (!draftDate || isDateUnavailable(draftDate, min, max)) {
      return;
    }

    if (onBeforeConfirm) {
      setIsConfirming(true);

      try {
        const accepted = await onBeforeConfirm(draftValue);

        if (!accepted) {
          return;
        }
      } finally {
        setIsConfirming(false);
      }
    }

    onChange(draftValue);
    close();
  };

  const handlePrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const calendar = (
    <DatePickerCalendar
      viewDate={viewDate}
      selectedDate={selectedDate}
      min={min}
      max={max}
      markers={markers}
      isConfirming={isConfirming}
      onPrevMonth={handlePrevMonth}
      onNextMonth={handleNextMonth}
      onSelect={handleSelect}
    />
  );

  if (variant === "inline") {
    return <div className={`w-full ${className} `}>{calendar}</div>;
  }

  const isButton = variant === "button";
  const valueText = value ? (formatValue ? formatValue(value) : formatDisplayDate(value)) : "";

  const fieldAlignClassName = iconPosition === "start" ? "justify-start" : "justify-between";

  const fieldIcon = (
    <AppIcon
      icon={Calendar}
      size="md"
      className={`shrink-0 ${
        value && !disabled && !readOnly
          ? "text-[var(--color-field-text)]"
          : "text-[var(--color-field-placeholder)]"
      } `}
    />
  );

  return (
    <div
      className={[isButton ? "min-w-0" : variant === "embedded" ? "w-auto" : "w-full", className]
        .filter(Boolean)
        .join(" ")}
    >
      {variant === "embedded" ? (
        <button
          type="button"
          disabled={disabled || readOnly}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={open}
          className={`${embeddedDateButtonClassName} ${disabled || readOnly ? "text-[var(--color-text-muted)]" : valueText ? "text-[var(--color-field-text)]" : "text-[var(--color-field-placeholder)]"}`}
        >
          <span className="truncate">{valueText || placeholder}</span>
        </button>
      ) : isButton ? (
        <SecondaryButton
          disabled={disabled}
          tone={invalid ? "danger" : buttonTone}
          aria-invalid={invalid || undefined}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={open}
          icon={<AppIcon icon={buttonIcon ?? CalendarSync} size="sm" />}
          className={buttonClassName}
        >
          {valueText || buttonLabel || placeholder}
        </SecondaryButton>
      ) : (
        <button
          type="button"
          disabled={disabled}
          tabIndex={readOnly ? -1 : undefined}
          aria-haspopup={readOnly ? undefined : "dialog"}
          aria-expanded={readOnly ? undefined : isOpen}
          onClick={() => {
            if (onRequestOpen) {
              onRequestOpen();
              return;
            }

            open();
          }}
          className={`text-body flex h-10 w-full items-center ${fieldAlignClassName} gap-3 rounded-[var(--radius-sm)] border lg:h-11 ${fieldPaddingClassName} text-left transition-colors outline-none ${
            disabled || readOnly
              ? `${fieldInactiveClassName} pointer-events-none hover:border-[var(--color-field-border)] hover:bg-[var(--color-field-disabled)]`
              : `border-[var(--color-field-border)] bg-[var(--color-field)] text-[var(--color-field-text)] ${fieldHoverClassName}`
          } ${
            invalid && !disabled && !readOnly
              ? `border-[var(--color-field-error)] hover:border-[var(--color-field-error)]`
              : isOpen
                ? fieldOpenClassName
                : ""
          }`}
        >
          {iconPosition === "start" ? fieldIcon : null}

          <span
            className={
              value
                ? `truncate ${valueClassName}`
                : "truncate text-[var(--color-field-placeholder)]"
            }
          >
            {valueText || placeholder}
          </span>

          {iconPosition === "end" ? fieldIcon : null}
        </button>
      )}

      <Modal
        isOpen={isOpen}
        onClose={close}
        padded={false}
        labelledBy={titleId}
        maxWidthClassName={maxWidthClassName}
        zIndexClassName={zIndexClassName}
      >
        <Modal.Header
          id={titleId}
          title={title}
          onClose={close}
          icon={<AppIcon icon={Calendar} size="md" />}
        />

        <div className={` ${modalSidePaddingClassName} py-4`}>{calendar}</div>

        {belowCalendar && draftValue ? (
          <div className="border-t border-[var(--color-border)]">
            <div className={` ${modalSidePaddingClassName} py-3`}>{belowCalendar(draftValue)}</div>
          </div>
        ) : null}

        <Modal.Footer>
          <SecondaryButton
            size="modal"
            onClick={handleReset}
            disabled={isConfirming || (keepsSelection ? !draftValue : !value)}
            icon={<AppIcon icon={RotateCcw} size="sm" />}
            className="mr-auto"
          >
            초기화
          </SecondaryButton>

          {keepsSelection ? (
            <>
              <SecondaryButton size="modal" onClick={close}>
                취소
              </SecondaryButton>

              <PrimaryButton
                size="modal"
                onClick={handleConfirm}
                disabled={isConfirming || (!draftValue && !value)}
              >
                확인
              </PrimaryButton>
            </>
          ) : null}
        </Modal.Footer>
      </Modal>
    </div>
  );
}
