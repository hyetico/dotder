import { cn } from "@/lib/cn";

/**
 * 라디오 점 (보드 12 .rd). 18 · 테두리 1.5 --cb-line, 고르면 테두리 5.5 --primary.
 * 표시만 한다 — 고르기는 감싼 버튼 · label이 맡는다.
 *
 * @example
 * <button role="radio" aria-checked={on}><RadioDot checked={on} />라이트</button>
 */
export default function RadioDot({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block size-4.5 shrink-0 rounded-full bg-[var(--surface)] transition-[border-width] duration-120",
        checked
          ? "border-[length:var(--radio-on)] border-[var(--primary)]"
          : "border-[length:var(--line-dash)] border-[var(--cb-line)]",
      )}
    />
  );
}
