import { holdAddNoticeMessage } from "@/features/projects/utils/projectUtils";

type HoldAddNoticeProps = {
  className?: string;
};

/**
 * HoldAddNotice
 *
 * 보류 중인 프로젝트에서는 목표와 태스크를 추가할 수 없다는 안내를 보여 줍니다.
 *
 * @param props - HoldAddNotice 컴포넌트 Props
 * @param props.className - 안내 문구에 더할 클래스
 */
export default function HoldAddNotice({ className = "" }: HoldAddNoticeProps) {
  return (
    <span className={`text-caption block text-[var(--color-text-secondary)] ${className} `}>
      {holdAddNoticeMessage}
    </span>
  );
}
