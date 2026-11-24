import Notice from "@/components/ui/Notice";

import { holdAddNoticeMessage } from "@/features/projects/utils/projectUtils";

type HoldAddNoticeProps = {
  className?: string;
};

/**
 * 보류 중인 프로젝트에서 목표 · 태스크를 추가할 수 없다는 안내 줄 (`Notice`).
 *
 * @example
 * {onHold ? <HoldAddNotice /> : null}
 */
export default function HoldAddNotice({ className = "" }: HoldAddNoticeProps) {
  return <Notice className={className}>{holdAddNoticeMessage}</Notice>;
}
