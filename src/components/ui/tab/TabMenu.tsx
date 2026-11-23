"use client";

import Button from "@/components/ui/button/Button";
import AppIcon from "@/components/ui/icon/AppIcon";
import { defaultTabAppearance } from "@/components/ui/tab/appearance";

import type { TabMenuAppearance, TabMenuSharedProps } from "@/components/ui/tab/types";

export type { TabMenuItem } from "@/components/ui/tab/types";

type TabMenuProps<T extends string> = TabMenuSharedProps<T> & {
  appearance?: TabMenuAppearance;
};

const tabLabelClassName = "inline-flex items-center gap-1";

/**
 * TabMenu
 *
 * 탭 목록과 버튼 배치를 한곳에서 그리는 공용 탭 메뉴입니다.
 * 기본은 버튼 모양이고, appearance로 다른 모양의 클래스만 더합니다.
 *
 * @param props - TabMenu 컴포넌트 Props
 * @param props.appearance - 탭 목록과 버튼에 입힐 모양
 * @param props.ariaLabel - 탭 묶음의 접근 이름
 * @param props.value - 현재 선택된 탭
 * @param props.items - 보여줄 탭 목록
 * @param props.onChange - 탭을 바꿀 때 실행되는 함수
 * @param props.className - 탭 목록에 더할 클래스
 * @param props.itemClassName - 각 탭 버튼에 더할 클래스
 */
export default function TabMenu<T extends string>({
  appearance,
  ariaLabel,
  value,
  items,
  onChange,
  className = "",
  itemClassName = "",
}: TabMenuProps<T>) {
  const resolved = appearance ?? defaultTabAppearance();
  const listClassName = [resolved.listClassName, className].filter(Boolean).join(" ");

  return (
    <div role="tablist" aria-label={ariaLabel} className={listClassName} style={resolved.listStyle}>
      {items.map((item) => {
        const state = {
          selected: value === item.id,
          disabled: Boolean(item.disabled),
        };
        const itemAppearance = resolved.item(state);
        const buttonClassName = [itemAppearance.itemClassName, itemClassName]
          .filter(Boolean)
          .join(" ");

        return (
          <Button
            key={item.id}
            type="button"
            role="tab"
            title={item.title}
            aria-selected={state.selected}
            disabled={item.disabled}
            onClick={() => onChange(item.id)}
            className={buttonClassName}
          >
            {itemAppearance.markClassName ? (
              <span aria-hidden className={itemAppearance.markClassName} />
            ) : null}
            {item.icon ? (
              <AppIcon
                icon={item.icon}
                size={itemAppearance.iconSize ?? "sm"}
                className={itemAppearance.iconClassName}
                style={itemAppearance.iconStyle}
              />
            ) : null}
            <span className={itemAppearance.labelClassName ?? tabLabelClassName}>
              {item.label}
              {item.count != null ? <span className="tabular-nums">{item.count}</span> : null}
            </span>
          </Button>
        );
      })}
    </div>
  );
}
