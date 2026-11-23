"use client";

import { folderTabAppearance } from "@/components/ui/tab/appearance";
import TabMenu from "@/components/ui/tab/TabMenu";

import type { TabMenuSharedProps } from "@/components/ui/tab/types";

export type { TabMenuItem } from "@/components/ui/tab/types";

/**
 * FolderTabMenu
 *
 * 폴더 어깨에 가로로 두는 서브폴더 탭입니다.
 * 열린 탭은 아이콘과 이름만 보여주고, 나머지 탭은 흰 칸으로 보여 줍니다.
 *
 * @param props - FolderTabMenu 컴포넌트 Props
 * @param props.ariaLabel - 탭 묶음의 접근 이름
 * @param props.value - 현재 선택된 탭
 * @param props.items - 보여줄 탭 목록
 * @param props.onChange - 탭을 바꿀 때 실행되는 함수
 * @param props.className - 탭 목록에 더할 클래스
 * @param props.itemClassName - 각 탭 버튼에 더할 클래스
 */
export default function FolderTabMenu<T extends string>({
  items,
  ...props
}: TabMenuSharedProps<T>) {
  return <TabMenu {...props} items={items} appearance={folderTabAppearance()} />;
}
