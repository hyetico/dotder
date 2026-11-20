"use client";

import { usePathname, useSearchParams } from "next/navigation";

import {
  DEFAULT_PROJECT_ID,
  getProjectScopeFromPath,
  isFlatProjectViewPath,
  isProjectFormPath,
  parseProjectScopeFromSearchParam,
  type ProjectScope,
} from "@/lib/projectRoutes";

function shouldParseProjectScopeFromSearch(pathname: string): boolean {
  return isFlatProjectViewPath(pathname) || isProjectFormPath(pathname);
}

export function useCurrentProjectScope(): ProjectScope {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const scopeFromPath = getProjectScopeFromPath(pathname);

  if (scopeFromPath !== null) {
    return scopeFromPath;
  }

  if (shouldParseProjectScopeFromSearch(pathname)) {
    return parseProjectScopeFromSearchParam(searchParams.get("project"));
  }

  return DEFAULT_PROJECT_ID;
}
