"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

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

import { formatDate, parseDateKey, toDateKey } from "@/lib/date";

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

const POPOVER_QUERY = "(min-width: 768px)";
const POPOVER_GAP = 4;
const popoverTextButtonClassName =
  "text-body h-8 cursor-pointer rounded-[var(--radius-sm)] px-2.5 font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:text-[var(--color-text-disabled)] disabled:hover:bg-transparent";

const WEEKDAY_NAMES = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];

const markerToneClassName: Record<DatePickerMarkerTone, string> = {
  primary: "bg-[var(--color-primary)]",
  blue: "bg-[var(--color-info)]",
  teal: "bg-[var(--color-success)]",
  pink: "bg-[var(--color-danger)]",
};

function isBeforeMin(date: Date, min?: string): boolean {
  if (!min) {
    return false;
  }

  return toDateKey(date) < min;
}

function isAfterMax(date: Date, max?: string): boolean {
  if (!max) {
    return false;
  }

  return toDateKey(date) > max;
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
    <div className="mx-auto w-full max-w-63">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-body min-w-0 truncate font-semibold text-[var(--color-text)]">
          {heading}
        </p>

        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={onPrevMonth}
            aria-label="이전 달"
            className="flex size-6 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
          >
            <AppIcon icon={ChevronLeft} size="xs" />
          </button>

          <button
            type="button"
            onClick={onNextMonth}
            aria-label="다음 달"
            className="flex size-6 items-center justify-center rounded-full text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-text)]"
          >
            <AppIcon icon={ChevronRight} size="xs" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className="text-caption flex h-9 items-center justify-center font-medium text-[var(--color-text-muted)]"
          >
            {weekday}
          </div>
        ))}

        {calendarDays.map((day) => {
          const dateKey = toDateKey(day);

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
                showMarkerRow ? "h-10" : "h-9"
              } flex-col items-center justify-center`}
            >
              <span
                className={`text-body flex size-9 items-center justify-center rounded-[var(--radius-sm)] leading-none transition-colors ${
                  isUnavailable
                    ? "cursor-not-allowed text-[var(--color-text-disabled)]"
                    : isSelected
                      ? "bg-[var(--color-primary)] font-semibold text-[var(--color-text-inverse)]"
                      : isToday
                        ? "font-semibold text-[var(--color-text)] ring-1 ring-[var(--color-border-strong)] ring-inset hover:bg-[var(--color-hover)]"
                        : isCurrentMonth
                          ? "text-[var(--color-text)] hover:bg-[var(--color-hover)]"
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
  placeholder = "날짜 고르기",
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
  iconPosition = "start",
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
    () => parseDateKey(value) ?? parseDateKey(min ?? "") ?? new Date(),
  );

  const [draftValue, setDraftValue] = useState(value);

  const [isConfirming, setIsConfirming] = useState(false);

  /* 웹 · 태블릿은 입력칸 아래 팝오버, 모바일은 모달 (handoff B6) */
  const anchorRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"popover" | "modal">("modal");
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number } | null>(
    null,
  );

  const keepsSelection = applyOnConfirm || belowCalendar !== undefined;

  const title = placeholder.replace(/ (선택|고르기)$/, "");

  const selectedDate = parseDateKey(keepsSelection ? draftValue : value);

  // 열려 있는 동안 값이나 최소 날짜가 바뀌면(열릴 때 포함) 고르던 날짜와 보이는 달을 다시 맞춘다.
  const [syncedFrom, setSyncedFrom] = useState<{ value: string; min?: string } | null>(null);

  if (!isOpen && syncedFrom !== null) {
    setSyncedFrom(null);
  }

  if (isOpen && (syncedFrom === null || syncedFrom.value !== value || syncedFrom.min !== min)) {
    setSyncedFrom({ value, min });
    setDraftValue(value);
    setViewDate(parseDateKey(value) ?? parseDateKey(min ?? "") ?? new Date());
  }

  const open = () => {
    if (disabled || readOnly) {
      return;
    }

    setDraftValue(value);
    setMode(window.matchMedia(POPOVER_QUERY).matches ? "popover" : "modal");
    setPopoverPosition(null);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
  };

  const isPopoverOpen = isOpen && mode === "popover";

  useEffect(() => {
    if (!isPopoverOpen) {
      return;
    }

    const place = () => {
      const anchor = anchorRef.current?.getBoundingClientRect();
      const height = popoverRef.current?.offsetHeight ?? 0;

      if (!anchor) {
        return;
      }

      const width = popoverRef.current?.offsetWidth ?? 0;
      const below = anchor.bottom + POPOVER_GAP;
      const fitsBelow = below + height <= window.innerHeight - POPOVER_GAP;
      const top = fitsBelow ? below : Math.max(POPOVER_GAP, anchor.top - POPOVER_GAP - height);
      const left = Math.min(
        Math.max(POPOVER_GAP, anchor.left),
        window.innerWidth - width - POPOVER_GAP,
      );

      setPopoverPosition({ top, left });
    };

    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !popoverRef.current?.contains(target) &&
        !anchorRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      const dialogs = document.querySelectorAll("[role='dialog']");

      if (event.key !== "Escape" || dialogs[dialogs.length - 1] !== popoverRef.current) {
        return;
      }

      setIsOpen(false);
      anchorRef.current?.querySelector("button")?.focus();
    };

    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isPopoverOpen]);

  const isPopoverPlaced = popoverPosition !== null;

  useEffect(() => {
    // 팝오버는 body 끝에 붙으므로, 자리를 잡아 보이게 된 뒤 초점을 옮겨 키보드로 바로 고르게 한다.
    if (isPopoverOpen && isPopoverPlaced) {
      popoverRef.current?.focus({ preventScroll: true });
    }
  }, [isPopoverOpen, isPopoverPlaced]);

  const handleSelect = (date: Date) => {
    if (isDateUnavailable(date, min, max)) {
      return;
    }

    const nextValue = toDateKey(date);

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
    setViewDate(parseDateKey(min ?? "") ?? new Date());
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

    const draftDate = parseDateKey(draftValue);

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

  const today = new Date();
  const canPickToday = !isDateUnavailable(today, min, max);

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
  const valueText = value ? (formatValue ? formatValue(value) : formatDate(value)) : "";

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

  const resetDisabled = isConfirming || (keepsSelection ? !draftValue : !value);

  const popover =
    isPopoverOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={popoverRef}
            role="dialog"
            aria-label={title}
            tabIndex={-1}
            className="fixed z-[var(--z-popover)] w-[var(--popover-calendar)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3.5 shadow-[var(--shadow-overlay)] outline-none"
            style={
              popoverPosition
                ? { top: popoverPosition.top, left: popoverPosition.left }
                : { top: 0, left: 0, visibility: "hidden" }
            }
          >
            {calendar}

            {belowCalendar && draftValue ? (
              <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                {belowCalendar(draftValue)}
              </div>
            ) : null}

            <div className="mt-3 flex items-center gap-1 border-t border-[var(--color-border)] pt-3">
              <button
                type="button"
                disabled={!canPickToday || isConfirming}
                onClick={() => handleSelect(today)}
                className={popoverTextButtonClassName}
              >
                오늘
              </button>
              <button
                type="button"
                disabled={resetDisabled}
                onClick={handleReset}
                className={popoverTextButtonClassName}
              >
                지우기
              </button>

              {keepsSelection ? (
                <div className="ml-auto flex items-center gap-1">
                  <button type="button" onClick={close} className={popoverTextButtonClassName}>
                    취소
                  </button>
                  <PrimaryButton
                    size="xs"
                    onClick={handleConfirm}
                    disabled={isConfirming || (!draftValue && !value)}
                  >
                    확인
                  </PrimaryButton>
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={anchorRef}
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

      {popover}

      <Modal
        isOpen={isOpen && mode === "modal"}
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
            disabled={resetDisabled}
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
