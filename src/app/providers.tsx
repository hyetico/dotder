"use client";

import { useEffect, useState } from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { subscribeMode } from "@/lib/storage/dotderMode";

type ProvidersProps = {
  children: React.ReactNode;
};

/**
 * Providers
 *
 * 앱 전체에서 TanStack Query를 쓸 수 있도록 QueryClient를 제공합니다.
 *
 * @param props - Providers 컴포넌트 Props
 * @param props.children - Provider 안에 들어갈 화면
 */
export default function Providers({ children }: ProvidersProps) {
  // QueryClient: 서버 데이터를 캐시하고 관리하는 TanStack Query의 중앙 관리자
  const [queryClient] = useState(() => new QueryClient());

  // 내 기록 ↔ 예시 모드가 바뀌면 그 모드의 데이터로 다시 읽는다
  useEffect(() => subscribeMode(() => void queryClient.invalidateQueries()), [queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
