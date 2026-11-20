"use client";

import LineTabMenu from "@/components/ui/tab/LineTabMenu";

export type BacklogScopeTab = "all" | "main" | "favorites";

type BacklogScopeTabsProps = {
  value: BacklogScopeTab;
  onChange: (value: BacklogScopeTab) => void;
};

/**
 * BacklogScopeTabs
 *
 * 전체 백로그, 메인 프로젝트 백로그, 즐겨찾기 프로젝트 백로그 중 지금 보는 범위를 바꿉니다.
 *
 * @param props - BacklogScopeTabs 컴포넌트 Props
 * @param props.value - 현재 선택된 범위
 * @param props.onChange - 범위를 바꿀 때 실행되는 함수
 */
export default function BacklogScopeTabs({ value, onChange }: BacklogScopeTabsProps) {
  return (
    <LineTabMenu<BacklogScopeTab>
      ariaLabel="메모 조회 범위"
      className="project-board-tab-line"
      value={value}
      onChange={onChange}
      items={[
        {
          id: "all",
          label: "전체 메모",
          title: "전체 메모",
        },
        {
          id: "main",
          label: "메인 프로젝트 메모",
          title: "메인 프로젝트의 메모",
        },
        {
          id: "favorites",
          label: "즐겨찾기 프로젝트 메모",
          title: "즐겨찾기한 프로젝트의 메모",
        },
      ]}
    />
  );
}
