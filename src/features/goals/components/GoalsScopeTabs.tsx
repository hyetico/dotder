"use client";

import LineTabMenu from "@/components/ui/tab/LineTabMenu";

export type GoalsScopeTab = "all" | "main" | "favorites" | "project";

type GoalsScopeTabsProps = {
  value: GoalsScopeTab;
  mainDisabled?: boolean;
  onChange: (value: Exclude<GoalsScopeTab, "project">) => void;
};

/**
 * GoalsScopeTabs
 *
 * 전체 목표, 메인 프로젝트 목표, 즐겨찾기 프로젝트 목표 중 지금 보는 범위를 바꿉니다.
 *
 * @param props - GoalsScopeTabs 컴포넌트 Props
 * @param props.value - 현재 선택된 범위
 * @param props.mainDisabled - 메인 프로젝트가 없어 탭을 막을지 여부
 * @param props.onChange - 범위를 바꿀 때 실행되는 함수
 */
export default function GoalsScopeTabs({
  value,
  mainDisabled = false,
  onChange,
}: GoalsScopeTabsProps) {
  return (
    <LineTabMenu<GoalsScopeTab>
      ariaLabel="목표 조회 범위"
      className="project-board-tab-line"
      value={value}
      onChange={(id) => {
        if (id === "project") {
          return;
        }

        onChange(id);
      }}
      items={[
        {
          id: "all",
          label: "전체 목표",
        },
        {
          id: "main",
          label: "메인 프로젝트 목표",
          disabled: mainDisabled,
          title: mainDisabled ? "메인 프로젝트가 없습니다." : "메인 프로젝트의 목표",
        },
        {
          id: "favorites",
          label: "즐겨찾기 프로젝트 목표",
          title: "즐겨찾기한 프로젝트의 목표",
        },
      ]}
    />
  );
}
