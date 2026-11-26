"use client";

import { useEffect, useState } from "react";

import Button from "@/components/kit/Button";
import { ChevronRight } from "@/components/ui/icon";

import { cn } from "@/lib/cn";
import { hasSavedData } from "@/lib/storage/dotderData";
import { setMode } from "@/lib/storage/dotderMode";

/**
 * 이 브라우저에 저장된 내 기록이 있는지. 확인하기 전에는 null.
 *
 * @param recheck - 바뀔 때마다 다시 확인한다 (둘러보기 4/4 창을 열 때)
 *
 * @example
 * const hasSaved = useHasSavedData(); // true | false | null
 */
export function useHasSavedData(recheck?: unknown) {
  const [hasSaved, setHasSaved] = useState<boolean | null>(null);

  useEffect(() => {
    let isActive = true;
    void hasSavedData().then((value) => {
      if (isActive) {
        setHasSaved(value);
      }
    });
    return () => {
      isActive = false;
    };
  }, [recheck]);

  return hasSaved;
}

type CoverActionsProps = {
  /** mobile: 꽉 찬 두 줄 52 (보드 T · M 00) · web: 한 줄 48 (보드 00) */
  layout: "mobile" | "web";
};

/**
 * 첫 화면 버튼 두 개 (로그인 없이 「내 기록」 = 이 브라우저에 저장).
 * 저장된 내 기록이 없으면 [시작하기], 있으면 [이어서 하기]가 주 버튼이고 둘 다 내 기록 `/projects`로 간다.
 * [예시로 둘러보기]는 보조 버튼으로 예시 모드를 연다. 확인하기 전에는 자리만 두고 숨긴다.
 *
 * 로그인을 붙이면 「내 기록」 앞에 로그인 · 가입을 넣고, 첫 로그인 때 이 브라우저 기록을 계정으로 옮긴다.
 */
export default function CoverActions({ layout }: CoverActionsProps) {
  const hasSaved = useHasSavedData();
  const label = hasSaved ? "이어서 하기" : "시작하기";
  const isMobile = layout === "mobile";

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        href="/projects"
        onClick={() => setMode("mine")}
        // 확인 전에는 자리만 둔다 (글이 바뀌며 깜빡이지 않게)
        className={cn(isMobile && "h-13", hasSaved == null && "invisible")}
      >
        {label}
        {isMobile ? null : <ChevronRight size={18} aria-hidden />}
      </Button>
      <Button size="lg" href="/projects?demo=1" className={isMobile ? "h-13" : undefined}>
        예시로 둘러보기
      </Button>
    </>
  );
}
