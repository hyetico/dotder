import PrimaryButton from "@/components/ui/button/PrimaryButton";
import { AppIcon, CircleAlert, RefreshCw } from "@/components/ui/icon";
import EmptyState from "@/components/ui/state/EmptyState";

type ErrorStateProps = {
  /** 무엇을 못 했는지 한 줄. 예: "기록을 불러오지 못했어요" */
  title: string;
  /** 다음에 할 일 한 줄. 없으면 숨긴다. */
  description?: string;
  /** 「다시 시도」를 눌렀을 때. 보통 쿼리의 `refetch`를 넘긴다. */
  onRetry: () => void;
};

/**
 * 불러오기에 실패했을 때 그 영역 안에 보여주는 오류 상자. 「다시 시도」 주 버튼을 하나 둔다.
 *
 * 화면 전체를 덮지 않고, 실패한 영역 자리에 둔다 (Components 12 · 접근성 「오류는 그 영역 안에」).
 *
 * @example
 * <ErrorState title="목표를 불러오지 못했어요" onRetry={() => refetch()} />
 */
export default function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <div role="alert">
      <EmptyState
        tone="error"
        icon={CircleAlert}
        title={title}
        description={description}
        actions={
          <PrimaryButton icon={<AppIcon icon={RefreshCw} size="sm" />} onClick={onRetry}>
            다시 시도
          </PrimaryButton>
        }
      />
    </div>
  );
}
