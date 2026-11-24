"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { getProjectAccentStyle } from "@/features/projects/utils/projectColors";

import type { ProjectColorKey } from "@/lib/projectPalette";

const ProjectAccentStyleContext = createContext<CSSProperties | undefined>(undefined);

const ProjectAccentSetterContext = createContext<
  ((color: string | null | undefined) => void) | null
>(null);

/**
 * useProjectAccentStyle
 *
 * 지금 화면의 프로젝트 색 그라데이션 스타일을 읽습니다.
 * 모달처럼 화면 밖으로 그려지는 곳에서도 같은 색을 쓰게 합니다.
 *
 * @returns 프로젝트 색 변수. 지정된 색이 없으면 undefined
 */
export function useProjectAccentStyle() {
  return useContext(ProjectAccentStyleContext);
}

/**
 * useSyncProjectAccent
 *
 * 고른 프로젝트 색을 감싼 화면의 뱃지와 버튼 색에 반영합니다.
 *
 * @param color - 지금 고른 프로젝트 색. 없으면 null
 */
export function useSyncProjectAccent(color: string | null) {
  const setColor = useContext(ProjectAccentSetterContext);

  useEffect(() => {
    if (!setColor) {
      return;
    }

    setColor(color);

    return () => {
      setColor(undefined);
    };
  }, [color, setColor]);
}

type ProjectAccentProps = {
  color?: ProjectColorKey | null;
  children: ReactNode;
};

/**
 * ProjectAccent
 *
 * 자식 화면의 왕관 뱃지와 주요 버튼이 프로젝트 색 그라데이션을 쓰게 합니다.
 * 색이 없으면 기본색을 유지합니다.
 *
 * @param props - ProjectAccent 컴포넌트 Props
 * @param props.color - 적용할 프로젝트 색. 없으면 기본색
 * @param props.children - 색을 적용할 화면
 */
export default function ProjectAccent({ color = null, children }: ProjectAccentProps) {
  const parentStyle = useContext(ProjectAccentStyleContext);
  const [override, setOverride] = useState<string | null | undefined>(undefined);
  const resolved = override === undefined ? color : override;
  const style = getProjectAccentStyle(resolved) ?? parentStyle;

  return (
    <ProjectAccentSetterContext.Provider value={setOverride}>
      <ProjectAccentStyleContext.Provider value={style}>
        <div
          style={{
            display: "contents",
            ...style,
          }}
        >
          {children}
        </div>
      </ProjectAccentStyleContext.Provider>
    </ProjectAccentSetterContext.Provider>
  );
}
