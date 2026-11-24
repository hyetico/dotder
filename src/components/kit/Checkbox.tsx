import { Check, Minus } from "@/components/ui/icon";

import { cn } from "@/lib/cn";

type CheckboxProps = {
  checked: boolean;
  /** 일부만 골랐을 때 (−) */
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  /** 읽는 이름. 보이는 라벨이 감싸면 생략 */
  label?: string;
};

/**
 * 체크박스 (보드 .cb · Components 09). 18 상자 · 테두리 1.5 --cb-line · 모서리 4 · 고르면 --primary 채움.
 * 누르는 영역은 감싸는 라벨(웹 40 · 터치 44)이 맡는다.
 *
 * @example
 * <label className="flex items-center gap-2"><Checkbox checked={all} onChange={toggleAll} />전체 선택</label>
 */
export default function Checkbox({
  checked,
  indeterminate = false,
  onChange,
  label,
}: CheckboxProps) {
  const isOn = checked || indeterminate;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={label}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onChange(!checked);
      }}
      className={cn(
        "kit-focus inline-flex size-4.5 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-kbd)] border-[length:var(--line-dash)]",
        isOn
          ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
          : "border-[var(--cb-line)] bg-[var(--surface)]",
      )}
    >
      {indeterminate ? (
        <Minus size={12} aria-hidden />
      ) : checked ? (
        <Check size={12} aria-hidden />
      ) : null}
    </button>
  );
}
