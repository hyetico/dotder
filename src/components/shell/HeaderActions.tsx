"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type HeaderActionsContextValue = {
  slot: HTMLElement | null;
  setSlot: (slot: HTMLElement | null) => void;
};

const HeaderActionsContext = createContext<HeaderActionsContextValue | null>(null);

/**
 * 페이지가 헤더 오른쪽 버튼을 같은 자리에 넣을 수 있게 슬롯을 공유한다.
 */
export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  return (
    <HeaderActionsContext.Provider value={{ slot, setSlot }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

/**
 * 헤더 오른쪽에 페이지 버튼을 그리는 자리. 버튼이 없으면 자리를 비워 둔다.
 */
export function HeaderActionsSlot() {
  const context = useContext(HeaderActionsContext);

  if (!context) {
    return null;
  }

  const { setSlot } = context;

  return <div ref={setSlot} className="flex shrink-0 items-center empty:hidden lg:gap-2" />;
}

/**
 * 현재 페이지의 버튼을 헤더 오른쪽 자리에 붙인다 (버튼은 ui Button으로 넘긴다).
 *
 * @example
 * <HeaderActions><Button variant="primary" size="sm">추가</Button></HeaderActions>
 */
export function HeaderActions({ children }: { children: ReactNode }) {
  const context = useContext(HeaderActionsContext);

  if (!context?.slot) {
    return null;
  }

  return createPortal(children, context.slot);
}
