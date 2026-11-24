export const fieldPaddingClassName = "px-2.5 md:px-4";

export const fieldInactiveClassName =
  "cursor-not-allowed border-[var(--color-field-border)] bg-[var(--color-field-disabled)] text-[var(--color-field-placeholder)]";

export const fieldHoverClassName = "hover:border-[var(--color-field-border-hover)]";

export const fieldFocusRingClassName =
  "focus:border-[var(--color-field-focus)] focus:shadow-[0_0_0_1px_var(--color-field-focus)]";

export const fieldFocusWithinClassName =
  "focus-within:border-[var(--color-field-focus)] focus-within:shadow-[0_0_0_1px_var(--color-field-focus)]";

export const fieldOpenClassName =
  "border-[var(--color-field-focus)] shadow-[0_0_0_1px_var(--color-field-focus)]";

export const fieldControlClassName = `text-body w-full rounded-[var(--radius-sm)] border border-[var(--color-field-border)] bg-[var(--color-field)] px-2.5 text-[var(--color-field-text)] md:px-4 outline-none transition-[border-color,box-shadow] placeholder:text-[var(--color-field-placeholder)] ${fieldHoverClassName} ${fieldFocusRingClassName}`;

export const fieldStateClassName =
  "disabled:cursor-not-allowed disabled:border-[var(--color-field-border)] disabled:bg-[var(--color-field-disabled)] disabled:text-[var(--color-field-placeholder)] disabled:placeholder:text-[var(--color-field-placeholder)] disabled:hover:border-[var(--color-field-border)] disabled:shadow-none read-only:cursor-not-allowed read-only:border-[var(--color-field-border)] read-only:bg-[var(--color-field-disabled)] read-only:text-[var(--color-field-placeholder)] read-only:hover:border-[var(--color-field-border)] read-only:focus:border-[var(--color-field-border)] read-only:focus:shadow-none aria-invalid:border-[var(--color-field-error)] aria-invalid:hover:border-[var(--color-field-error)] aria-invalid:focus:border-[var(--color-field-error)] aria-invalid:focus:shadow-[0_0_0_1px_var(--color-field-error)]";
