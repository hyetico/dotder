"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type PageMeta = { title: string; subtitle?: ReactNode } | null;
type PageMetaContextValue = { meta: PageMeta; setMeta: (meta: PageMeta) => void };

const PageMetaContext = createContext<PageMetaContextValue | null>(null);

/** 태블릿 · 모바일 헤더에 보일 페이지 제목 · 부제를 모은다 (보드 T · M 01 헤더). */
export function PageMetaProvider({ children }: { children: ReactNode }) {
  const [meta, setMeta] = useState<PageMeta>(null);

  return <PageMetaContext.Provider value={{ meta, setMeta }}>{children}</PageMetaContext.Provider>;
}

/** 지금 페이지의 제목 · 부제. 없으면 null (헤더는 메뉴 이름을 쓴다). */
export function usePageMetaValue() {
  return useContext(PageMetaContext)?.meta ?? null;
}

/**
 * 페이지가 태블릿 · 모바일 헤더에 제목 · 부제를 알린다. 페이지를 떠나면 지운다.
 *
 * @example
 * usePageMeta("프로젝트", "15개 중 5개 진행 중");
 */
export function usePageMeta(title: string, subtitle?: ReactNode) {
  const setMeta = useContext(PageMetaContext)?.setMeta;

  useEffect(() => {
    setMeta?.({ title, subtitle });
    return () => setMeta?.(null);
  }, [setMeta, subtitle, title]);
}
