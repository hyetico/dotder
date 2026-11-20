import type { ReactNode } from "react";

type BottomAppBarProps = {
  leading?: ReactNode;
  children?: ReactNode;
};

const bottomAppBarClassName =
  "flex h-[var(--bottom-app-bar-height)] shrink-0 items-center justify-between gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 md:fixed md:inset-x-0 md:bottom-0 md:z-20 md:pl-[calc(var(--sidebar-collapsed-width)+16px)] min-[1280px]:pl-[calc(var(--sidebar-width)+16px)] md:[html[data-sidebar=closed]_&]:pl-[calc(var(--sidebar-collapsed-width)+16px)] md:[html[data-sidebar=open]_&]:pl-[calc(var(--sidebar-width)+16px)]";

export default function BottomAppBar({ leading, children }: BottomAppBarProps) {
  return (
    <>
      <div aria-hidden className="hidden h-[var(--bottom-app-bar-height)] shrink-0 md:block" />

      <div data-bottom-app-bar className={bottomAppBarClassName}>
        <div className="flex min-w-0 items-center">{leading}</div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">{children}</div>
      </div>
    </>
  );
}
