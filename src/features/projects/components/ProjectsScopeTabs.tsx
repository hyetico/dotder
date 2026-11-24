"use client";

import LineTabMenu from "@/components/ui/tab/LineTabMenu";

export type ProjectsScopeTab = "all" | "main" | "favorites";

type ProjectsScopeTabsProps = {
  value: ProjectsScopeTab;
  mainDisabled?: boolean;
  /** `top`: 화면 맨 위 전체 폭 줄. `page`: 페이지 제목 아래 본문 폭 줄 (프로젝트 목록, handoff 01). */
  placement?: "top" | "page";
  onChange: (value: ProjectsScopeTab) => void;
};

/**
 * ProjectsScopeTabs
 *
 * 전체 프로젝트, 메인 프로젝트, 즐겨찾기 프로젝트 중 지금 보는 범위를 바꿉니다.
 *
 * @param props - ProjectsScopeTabs 컴포넌트 Props
 * @param props.value - 현재 선택된 범위
 * @param props.mainDisabled - 메인 프로젝트가 없어 탭을 막을지 여부
 * @param props.onChange - 범위를 바꿀 때 실행되는 함수
 */
export default function ProjectsScopeTabs({
  value,
  mainDisabled = false,
  placement = "top",
  onChange,
}: ProjectsScopeTabsProps) {
  return (
    <LineTabMenu<ProjectsScopeTab>
      ariaLabel="프로젝트 조회 범위"
      className={placement === "top" ? "project-board-tab-line" : "-mx-3 -mt-2 mb-6"}
      value={value}
      onChange={onChange}
      items={[
        {
          id: "all",
          label: "전체",
          title: "전체 프로젝트",
        },
        {
          id: "main",
          label: "메인",
          disabled: mainDisabled,
          title: mainDisabled ? "메인 프로젝트가 없습니다." : "메인 프로젝트",
        },
        {
          id: "favorites",
          label: "즐겨찾기",
          title: "즐겨찾기한 프로젝트",
        },
      ]}
    />
  );
}
