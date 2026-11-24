import { useMemo } from "react";

import {
  buildActivityMosaic,
  type ActivityDay,
  type ActivityLevel,
} from "@/features/projects/utils/activityMosaic";
import { getProjectAccentColor } from "@/features/projects/utils/projectColors";

import type { ProjectColorKey } from "@/lib/projectPalette";
import type { CSSProperties } from "react";

type ActivityMosaicProps = {
  /** 날짜별 기록. 없으면 빈 날 점만 그린다. */
  days: readonly ActivityDay[];
  /** 프로젝트 색 키. 없으면 회색. */
  color: ProjectColorKey | null;
  /** 기준 날짜. 테스트할 때만 넘긴다. */
  today?: Date;
};

// 조각 크기: 빈 날 점 3 · 1–4단계 5 · 7 · 9 · 11 (Design Guide 11)
const tileSizeClassName: Record<ActivityLevel, string> = {
  0: "size-0.75 rounded-full",
  1: "size-1.25 rounded-[var(--radius-tile)]",
  2: "size-1.75 rounded-[var(--radius-tile)]",
  3: "size-2.25 rounded-[var(--radius-tile)]",
  4: "size-2.75 rounded-[var(--radius-tile)]",
};

const tileToneClassName: Record<ActivityLevel, string> = {
  0: "mosaic-tone-0",
  1: "mosaic-tone-1",
  2: "mosaic-tone-2",
  3: "mosaic-tone-3",
  4: "mosaic-tone-4",
};

const LEGEND_LEVELS: ActivityLevel[] = [0, 1, 2, 3, 4];

function Tile({ level }: { level: ActivityLevel }) {
  return (
    <span className="flex size-2.75 items-center justify-center">
      <span className={`${tileSizeClassName[level]} ${tileToneClassName[level]}`} />
    </span>
  );
}

/**
 * 폴더 카드의 활동 모자이크. 하루 한 칸(7줄 × 20주), 그날 한 일이 많을수록 조각이 크다.
 *
 * 색은 프로젝트 색 한 가지이고, 크기로 양을 말한다 (Design Guide 11). 계산은 `buildActivityMosaic`.
 *
 * @example
 * <ActivityMosaic days={activity[project.id] ?? []} color={project.color} />
 */
export default function ActivityMosaic({ days, color, today }: ActivityMosaicProps) {
  const mosaic = useMemo(() => buildActivityMosaic(days, today ?? new Date()), [days, today]);
  const style = color
    ? ({ "--mosaic-color": getProjectAccentColor(color) } as CSSProperties)
    : undefined;

  return (
    <div className="activity-mosaic flex flex-col gap-2.5" style={style}>
      <div
        role="img"
        aria-label={`최근 20주 활동한 날 ${mosaic.activeDays}일`}
        className="activity-mosaic-box flex justify-center rounded-[var(--radius-sm)] p-3"
      >
        <div className="flex gap-0.75">
          {mosaic.weeks.map((week) => (
            <div key={week[0].date} className="flex flex-col gap-0.75">
              {week.map((cell) =>
                cell.isFuture ? (
                  <span key={cell.date} className="size-2.75" />
                ) : (
                  <Tile key={cell.date} level={cell.level} />
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="text-caption flex items-center justify-between gap-2 text-[var(--color-text-secondary)]">
        <span className="truncate tabular-nums">최근 20주 · 활동한 날 {mosaic.activeDays}일</span>
        <span aria-hidden className="flex shrink-0 items-center gap-1">
          적음
          {LEGEND_LEVELS.map((level) => (
            <Tile key={level} level={level} />
          ))}
          많음
        </span>
      </div>
    </div>
  );
}
