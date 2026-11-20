import type { ReactNode } from "react";

const frameClassName = "mx-auto w-full min-w-0 max-w-[var(--page-frame-max)]";

type DrawerFrameProps = {
  children: ReactNode;
  className?: string;
};

/**
 * DrawerFrame
 *
 * 드로어 안 내용을 페이지 최대 너비로 가운데 맞춥니다.
 * 접힌 드로어보다 넓은 화면에서만 너비가 제한됩니다.
 *
 * @param props - DrawerFrame 컴포넌트 Props
 * @param props.children - 최대 너비 안에 둘 내용
 * @param props.className - 프레임에 더할 클래스
 */
export default function DrawerFrame({ children, className = "" }: DrawerFrameProps) {
  const frameStateClassName = [frameClassName, className].filter(Boolean).join(" ");

  return <div className={frameStateClassName}>{children}</div>;
}
