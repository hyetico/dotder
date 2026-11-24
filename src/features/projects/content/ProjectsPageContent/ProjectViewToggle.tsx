import { LayoutGrid, List } from "@/components/ui/icon";
import SegmentedIconToggle from "@/components/ui/SegmentedIconToggle";

export type ProjectCardViewMode = "board" | "list";

const viewTabs: {
  id: ProjectCardViewMode;
  label: string;
  icon: typeof List;
}[] = [
  {
    id: "board",
    label: "보드",
    icon: LayoutGrid,
  },
  {
    id: "list",
    label: "리스트",
    icon: List,
  },
];

type ProjectViewToggleProps = {
  viewMode: ProjectCardViewMode;
  onViewModeChange: (viewMode: ProjectCardViewMode) => void;
};

/**
 * ProjectViewToggle
 *
 * 프로젝트 카드를 보드와 리스트로 바꾸는 버튼입니다.
 * 바깥은 높이 44px 알약이고, 안은 반으로 나뉘며 가운데에 세로 구분선이 있습니다.
 * 선택된 반쪽 배경은 --color-hover이고, 웹과 모바일에서 같은 모양을 씁니다.
 *
 * @param props - ProjectViewToggle 컴포넌트 Props
 * @param props.viewMode - 현재 보기
 * @param props.onViewModeChange - 보기를 바꿀 때 실행되는 함수
 */
export default function ProjectViewToggle({ viewMode, onViewModeChange }: ProjectViewToggleProps) {
  return (
    <SegmentedIconToggle
      label="프로젝트 보기"
      value={viewMode}
      items={viewTabs}
      onChange={onViewModeChange}
    />
  );
}
