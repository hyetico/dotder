import { AppIcon, X } from "@/components/ui/icon";

const goalTagClassName =
  "inline-flex max-w-full min-w-0 items-center rounded-[9px] border border-[#e9ebee] bg-[#f7f8f9] px-2.5 py-1 text-xs leading-[18px] font-semibold text-[#34393f]";
const goalTagRemoveClassName =
  "inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6b7280] hover:bg-white hover:text-[#34393f]";

type GoalTagProps = {
  tag: string;
  onRemove?: () => void;
  className?: string;
};

/**
 * GoalTag
 *
 * 목표 카드와 같은 회색 태그 칩을 표시합니다.
 * 지울 수 있는 태그에는 글자 오른쪽에 X 버튼이 붙습니다.
 *
 * @param props - GoalTag 컴포넌트 Props
 * @param props.tag - 표시할 태그 이름
 * @param props.onRemove - X 버튼을 눌렀을 때 실행되는 함수. 없으면 지울 수 없는 태그
 * @param props.className - 칩에 더할 클래스
 */
export default function GoalTag({ tag, onRemove, className = "" }: GoalTagProps) {
  const chipClassName = [goalTagClassName, onRemove ? "gap-1 pr-1" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <span title={tag} className={chipClassName}>
      <span className="min-w-0 truncate">{tag}</span>
      {onRemove ? (
        <button
          type="button"
          aria-label={`${tag} 삭제`}
          onClick={onRemove}
          className={goalTagRemoveClassName}
        >
          <AppIcon icon={X} size="xs" />
        </button>
      ) : null}
    </span>
  );
}
