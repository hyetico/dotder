import { cn } from "@/lib/cn";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  /** 읽는 이름 (보이는 글이 따로 있으면 `labelledBy`) */
  label?: string;
  labelledBy?: string;
};

/**
 * 스위치 (보드 .sw). 36 × 20 · 손잡이 16 · 끔 --switch-off + 손잡이 --switch-knob-off + 테두리 --input-line · 켬 --primary.
 *
 * 꺼짐 테두리는 box-shadow가 아니라 before 가상 요소로 그린다. kit-focus 초점 링이 box-shadow라서
 * 같은 속성을 쓰면 키보드 초점 때 테두리가 사라진다 (컬러 가이드 v1).
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
        checked
          ? "bg-[var(--primary)]"
          : "bg-[var(--switch-off)] before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:border before:border-[var(--input-line)]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0.5 size-4 rounded-full shadow-[0_1px_2px_rgb(0_0_0/20%)] transition-[left]",
          checked ? "left-4.5 bg-[var(--on-primary)]" : "left-0.5 bg-[var(--switch-knob-off)]",
        )}
      />
    </button>
  );
}
