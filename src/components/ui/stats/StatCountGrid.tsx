import type { ReactNode } from "react";

type StatCountGridProps = {
  children: ReactNode;
};

const statCountListClassName =
  "grid grid-cols-2 gap-2 md:flex md:flex-wrap xl:gap-3 md:[&>*]:min-w-max md:[&>*]:max-w-full md:[&>*]:grow md:[&>*]:basis-0";

export const statCountWideCardClassName = "hidden @[640px]:block";

/**
 * StatCountGrid
 *
 * StatCountCard 여러 개를 배치합니다.
 * 태블릿 이상에서는 한 줄로 두고, 내용이 넘치면 다음 줄로 넘깁니다.
 *
 * @param props - StatCountGrid 컴포넌트 Props
 * @param props.children - 배치할 StatCountCard들
 */
export default function StatCountGrid({ children }: StatCountGridProps) {
  return (
    <div className="@container">
      <div className={statCountListClassName}>{children}</div>
    </div>
  );
}
