"use client";

import { usePathname } from "next/navigation";

import { isMemosListPath, isGoalsListPath, isProjectsListPath } from "@/lib/projectRoutes";

type LayoutShellProps = {
  children: React.ReactNode;
};

export default function LayoutShell({ children }: LayoutShellProps) {
  const pathname = usePathname();

  // 프로젝트 0개여도 목록 화면을 그대로 보여 준다 (목록 자리에 kit EmptyState · 11.26)
  const page = children;

  if (!isProjectsListPath(pathname) && !isGoalsListPath(pathname) && !isMemosListPath(pathname)) {
    return page;
  }

  return (
    <div className="min-h-[calc(100dvh-var(--header-height))] bg-[var(--color-surface)]">
      {page}
    </div>
  );
}
