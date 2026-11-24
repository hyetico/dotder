import { useMemo, type CSSProperties } from "react";

import {
  buildActivityMosaic,
  type ActivityDay,
  type ActivityLevel,
} from "@/features/projects/utils/activityMosaic";

import { cn } from "@/lib/cn";
import { projectColorVar, type ProjectColorKey } from "@/lib/projectPalette";

type MosaicProps = {
  /** 날짜별 기록. 없으면 빈 날 점만 그린다 */
  days: readonly ActivityDay[];
  color: ProjectColorKey;
  /** 기준 날짜. 테스트할 때만 넘긴다 */
  today?: Date;
};

// 조각: 빈 날 점 3 · 1–4단계 5 · 7 · 9 · 11, 칸 11 (보드 01).
// 색은 프로젝트 색 하나에 진하기만 다르게: 빈 날 · 1단계 45% · 65% · 85% · 100% (프로토타입 mosaic).
// 다크 값은 팔레트 다크 색(라이트 색 70% + 흰색)이 준다.
const tileSize: Record<ActivityLevel, string> = {
  0: "size-0.75 rounded-full opacity-45",
  1: "size-1.25 rounded-[var(--radius-tile)] opacity-45",
  2: "size-1.75 rounded-[var(--radius-tile)] opacity-65",
  3: "size-2.25 rounded-[var(--radius-tile)] opacity-85",
  4: "size-2.75 rounded-[var(--radius-tile)]",
};
const LEVELS: ActivityLevel[] = [0, 1, 2, 3, 4];

function Tile({ level }: { level: ActivityLevel }) {
  return (
    <span className="flex size-2.75 items-center justify-center">
      <span className={cn(tileSize[level], "bg-[var(--mosaic-color)]")} />
    </span>
  );
}

/**
 * 활동 모자이크 (보드 01 · REBUILD 5). 7줄 × 20주, 그날 한 일이 많을수록 조각이 크다.
 *
 * 상자 --mosaic-box · 모서리 12 · 안쪽 12. 칸 11 · 사이 3 · 왼쪽 정렬이고, 상자가 좁을 때만 가로 사이를 줄인다
 * (넘치게 가리지 않는다). 아래 줄 「최근 20주 · 활동한 날 N일」은 자르지 않고, 범례는 좁으면 다음 줄 오른쪽.
 *
 * @example
 * <Mosaic days={activity} color={project.color} />
 */
export default function Mosaic({ days, color, today }: MosaicProps) {
  const mosaic = useMemo(() => buildActivityMosaic(days, today ?? new Date()), [days, today]);
  const style = { "--mosaic-color": projectColorVar(color) } as CSSProperties;

  return (
    <div className="flex flex-col gap-3" style={style}>
      <div
        role="img"
        aria-label={`최근 20주 활동한 날 ${mosaic.activeDays}일`}
        className="rounded-[var(--radius-md)] bg-[var(--mosaic-box)] p-3"
      >
        {/* 칸 11 고정 · 사이 3 · 왼쪽 정렬(보드 01). 상자가 좁을 때만 가로 사이를 0까지 줄인다 */}
        <div className="grid grid-flow-col grid-cols-[repeat(20,--spacing(2.75))] grid-rows-[repeat(7,--spacing(2.75))] justify-start gap-x-[clamp(0px,calc((100%-var(--spacing)*55)/19),var(--spacing)*0.75)] gap-y-0.75">
          {mosaic.weeks.flatMap((week) =>
            week.map((cell) => (
              <span key={cell.date} className="flex justify-center">
                {cell.isFuture ? <span className="size-2.75" /> : <Tile level={cell.level} />}
              </span>
            )),
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-[var(--folder-ink)]">
        <span className="tabular-nums">최근 20주 · 활동한 날 {mosaic.activeDays}일</span>
        <span aria-hidden className="ml-auto flex items-center gap-1">
          적음
          {LEVELS.map((level) => (
            <Tile key={level} level={level} />
          ))}
          많음
        </span>
      </div>
    </div>
  );
}
