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
    // 누르는 영역 24 · 보이는 칸 18 (보드 S5 체크박스)
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
      className="kit-focus group/cb -m-0.75 inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-xs)]"
    >
      <span
        aria-hidden
        className={cn(
          "inline-flex size-4.5 items-center justify-center rounded-[var(--radius-kbd)] border-[length:var(--line-dash)] transition-colors duration-150",
          isOn
            ? "border-[var(--primary)] bg-[var(--primary)] text-[var(--on-primary)]"
            : "border-[var(--cb-line)] bg-[var(--surface)] group-hover/cb:border-[var(--input-line-h)]",
        )}
      >
        {indeterminate ? (
          <Minus size={12} aria-hidden />
        ) : (
          <Check
            size={12}
            aria-hidden
            className={cn(
              "transition-[opacity,scale] duration-150 motion-reduce:duration-0",
              checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
          />
        )}
      </span>
    </button>
  );
}
