"use client";

import { tileTabAppearance } from "@/components/ui/tab/appearance";
import TabMenu from "@/components/ui/tab/TabMenu";
import type { TabMenuSharedProps } from "@/components/ui/tab/types";

export type { TabMenuItem } from "@/components/ui/tab/types";

/**
 * TileTabMenu
 *
 * 칸으로 나눈 타일 탭 메뉴입니다.
 * 공용 탭 메뉴에 타일 모양만 입혀 아이콘을 위에 두고 이름과 개수를 보여 줍니다.
 *
 * @param props - TileTabMenu 컴포넌트 Props
 * @param props.ariaLabel - 탭 묶음의 접근 이름
 * @param props.value - 현재 선택된 탭
 * @param props.items - 보여줄 탭 목록
 * @param props.onChange - 탭을 바꿀 때 실행되는 함수
 * @param props.className - 탭 목록에 더할 클래스
 * @param props.itemClassName - 각 탭 버튼에 더할 클래스
 */
export default function TileTabMenu<T extends string>({ items, ...props }: TabMenuSharedProps<T>) {
  return <TabMenu {...props} items={items} appearance={tileTabAppearance(items.length)} />;
}
