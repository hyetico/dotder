import type { LucideIcon } from "@/components/ui/icon/icons";
import type { IconSize } from "@/components/ui/icon/iconSize";
import type { CSSProperties } from "react";

export type TabMenuItem<T extends string> = {
  id: T;
  label: string;
  count?: number;
  icon?: LucideIcon;
  disabled?: boolean;
  title?: string;
};

export type TabMenuSharedProps<T extends string> = {
  ariaLabel: string;
  value: T;
  items: readonly TabMenuItem<T>[];
  onChange: (id: T) => void;
  className?: string;
  itemClassName?: string;
};

export type TabItemState = {
  selected: boolean;
  disabled: boolean;
};

export type TabMenuItemAppearance = {
  itemClassName: string;
  iconSize?: IconSize;
  iconClassName?: string;
  iconStyle?: CSSProperties;
  labelClassName?: string;
  markClassName?: string;
};

export type TabMenuAppearance = {
  listClassName: string;
  listStyle?: CSSProperties;
  item: (state: TabItemState) => TabMenuItemAppearance;
};
