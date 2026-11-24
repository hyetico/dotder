"use client";

import LineTabMenu from "@/components/ui/tab/LineTabMenu";

export type MemosScopeTab = "all" | "main" | "favorites";

type MemosScopeTabsProps = {
  value: MemosScopeTab;
  /** `top`: 화면 맨 위 전체 폭 줄. `page`: 페이지 제목 아래 본문 폭 줄 (design 11). */
  placement?: "top" | "page";
  onChange: (value: MemosScopeTab) => void;
};

/**
 * MemosScopeTabs
 *
 * 전체 메모, 메인 프로젝트 메모, 즐겨찾기 프로젝트 메모 중 지금 보는 범위를 바꿉니다.
 *
 * @param props - MemosScopeTabs 컴포넌트 Props
 * @param props.value - 현재 선택된 범위
 * @param props.onChange - 범위를 바꿀 때 실행되는 함수
 */
export default function MemosScopeTabs({
  value,
  placement = "top",
  onChange,
}: MemosScopeTabsProps) {
  return (
    <LineTabMenu<MemosScopeTab>
      ariaLabel="메모 조회 범위"
      className={placement === "top" ? "project-board-tab-line" : "-mx-3 mb-6"}
      value={value}
      onChange={onChange}
      items={[
        {
          id: "all",
          label: "전체",
          title: "전체 메모",
        },
        {
          id: "main",
          label: "메인 프로젝트",
          title: "메인 프로젝트의 메모",
        },
        {
          id: "favorites",
          label: "즐겨찾기",
          title: "즐겨찾기한 프로젝트의 메모",
        },
      ]}
    />
  );
}
