import { cn } from "@/lib/cn";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 읽는 이름 (보이는 글이 따로 있으면 `labelledBy`) */
  label?: string;
  labelledBy?: string;
};

/**
 * 스위치 (보드 .sw). 36 × 20 · 손잡이 16 · 끔 --switch-off · 켬 --primary.
 *
 * @example
 * <Switch checked={lateOnly} onChange={setLateOnly} label="마감 지난 것만" />
 */
export default function Switch({ checked, onChange, label, labelledBy }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      onClick={() => onChange(!checked)}
      className={cn(
        "kit-focus relative h-5 w-9 shrink-0 cursor-pointer rounded-[var(--radius-full)] transition-colors",
        checked ? "bg-[var(--primary)]" : "bg-[var(--switch-off)]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 size-4 rounded-full shadow-[0_1px_2px_rgb(0_0_0/20%)] transition-[left]",
          checked ? "left-4.5 bg-[var(--on-primary)]" : "left-0.5 bg-[var(--switch-knob)]",
        )}
      />
    </button>
  );
}
