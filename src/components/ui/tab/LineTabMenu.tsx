"use client";

import { lineTabAppearance } from "@/components/ui/tab/appearance";
import TabMenu from "@/components/ui/tab/TabMenu";
import type { TabMenuSharedProps } from "@/components/ui/tab/types";

export type { TabMenuItem } from "@/components/ui/tab/types";

type LineTabMenuProps<T extends string> = TabMenuSharedProps<T> & {
  stackOnMobile?: boolean;
};

/**
 * LineTabMenu
 *
 * 밑줄로 현재 탭을 표시하는 탭 메뉴입니다.
 * 공용 탭 메뉴에 밑줄 모양만 입혀 아이콘, 이름, 개수를 한 줄로 보여 줍니다.
 *
 * @param props - LineTabMenu 컴포넌트 Props
 * @param props.ariaLabel - 탭 묶음의 접근 이름
 * @param props.value - 현재 선택된 탭
 * @param props.items - 보여줄 탭 목록
 * @param props.onChange - 탭을 바꿀 때 실행되는 함수
 * @param props.className - 탭 목록에 더할 클래스
 * @param props.itemClassName - 각 탭 버튼에 더할 클래스
 * @param props.stackOnMobile - 좁은 화면에서 아이콘을 위에 쌓을지 여부
 */
export default function LineTabMenu<T extends string>({
  items,
  stackOnMobile = false,
  ...props
}: LineTabMenuProps<T>) {
  return (
    <TabMenu {...props} items={items} appearance={lineTabAppearance(stackOnMobile, items.length)} />
  );
}
