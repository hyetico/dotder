"use client";

import { useEffect, useRef, useState } from "react";

import {
  fieldHoverClassName,
  fieldOpenClassName,
  fieldPaddingClassName,
} from "@/components/ui/fieldControl";
import { AppIcon, ChevronDown } from "@/components/ui/icon";

const selectTriggerClassName =
  "flex w-full min-w-0 items-center justify-between overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-field-border)] bg-[var(--color-field)] text-left text-[var(--color-field-text)] transition-[border-color,box-shadow] outline-none disabled:cursor-not-allowed disabled:border-[var(--color-field-border)] disabled:bg-[var(--color-field-disabled)] disabled:text-[var(--color-field-placeholder)] disabled:opacity-100 disabled:hover:border-[var(--color-field-border)]";

export type SelectOption = {
  value: string;
  label: string;
};

type SelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "md" | "sm";
};

export default function Select({
  value,
  onChange,
  options,
  placeholder = "선택",
  disabled = false,
  className = "w-full",
  size = "md",
}: SelectProps) {
  const isSmall = size === "sm";
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleSelect = (nextValue: string) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
          }
        }}
        className={`${selectTriggerClassName} ${
          isSmall
            ? `text-caption h-9 gap-2 px-3`
            : `text-body h-10 gap-3 lg:h-11 ${fieldPaddingClassName}`
        } ${isOpen ? fieldOpenClassName : fieldHoverClassName}`}
      >
        <span
          className={`min-w-0 flex-1 truncate ${
            selectedOption ? "" : "text-[var(--color-field-placeholder)]"
          } `}
        >
          {selectedOption?.label ?? placeholder}
        </span>

        <AppIcon
          icon={ChevronDown}
          size={isSmall ? "sm" : "md"}
          className={`shrink-0 text-[var(--color-field-placeholder)] transition-transform ${
            isOpen ? "rotate-180" : ""
          } `}
        />
      </button>

      {isOpen && (
        <ul
          role="listbox"
          className="absolute top-[calc(100%+4px)] left-0 z-20 w-max min-w-full overflow-hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white py-1 shadow-[var(--shadow-dropdown)]"
        >
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <li key={option.value} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`text-body w-full px-4 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "bg-[var(--color-hover-strong)] font-medium text-[var(--color-text)]"
                      : "text-[var(--color-text)] hover:bg-[var(--color-hover-soft)]"
                  } `}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
