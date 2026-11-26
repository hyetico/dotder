/** `cn()`에 넘길 수 있는 값. 거짓 값은 건너뛴다. */
export type ClassValue = string | false | null | undefined;

/**
 * 조건부 className을 한 줄로 합친다.
 *
 * 거짓 값(`false`, `null`, `undefined`, 빈 문자열)은 빼고 공백 하나로 잇는다.
 * 겹치는 Tailwind 클래스를 정리하지는 않으므로, 같은 속성의 클래스를 두 번 넘기지 않는다.
 *
 * @example
 * cn("rounded-md px-3", isActive && "bg-[var(--btn-primary)]", className)
 * // isActive가 false이고 className이 ""이면 "rounded-md px-3"
 */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
