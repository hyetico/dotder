"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import SearchDialog from "@/components/shell/SearchDialog";
import Button from "@/components/ui/Button";
import { Search } from "@/components/ui/icon";

/**
 * 헤더 검색 (보드 01 헤더). 웹: secondary sm 200 「검색」, 태블릿 · 모바일: 아이콘 ghost sm.
 * ⌘K / Ctrl+K, 주소 `?search=1`(404 「검색하기」)로도 통합 검색(01-e · 01-f)을 연다.
 */
export default function ShellSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const fromQuery = searchParams.get("search") === "1";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const close = () => {
    setIsOpen(false);
    if (fromQuery) {
      router.replace(pathname, { scroll: false });
    }
  };

  return (
    <>
      {/* 보조 버튼 sm 모양이지만 글은 --t3 · 왼쪽 정렬 · 폭 200 (보드 01) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="kit-focus inline-flex h-[var(--btn-h-sm)] w-50 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-[var(--btn-px-sm)] text-sm font-medium text-[var(--t3)] transition-colors duration-120 hover:border-[var(--btn-secondary-line-h)] hover:bg-[var(--s2)] max-lg:hidden"
      >
        <Search size={16} aria-hidden />
        검색
      </button>
      <Button
        variant="ghost"
        size="sm"
        iconOnly
        aria-label="검색"
        onClick={() => setIsOpen(true)}
        className="lg:hidden"
      >
        <Search size={18} aria-hidden />
      </Button>
      <SearchDialog isOpen={isOpen || fromQuery} onClose={close} />
    </>
  );
}
