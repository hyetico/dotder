import { parseDateKey, toDateKey } from "@/lib/date";

/** 하루 활동 기록. `date`는 `YYYY-MM-DD`, `count`는 그날 만들거나 고치거나 완료한 수. */
export type ActivityDay = {
  date: string;
  count: number;
};

/** 0은 빈 날(3px 점), 1–4는 활동 단계(5 · 7 · 9 · 11px 조각). */
export type ActivityLevel = 0 | 1 | 2 | 3 | 4;

export type ActivityMosaicCell = {
  date: string;
  count: number;
  level: ActivityLevel;
  /** 오늘 뒤의 날. 그리지 않는다. */
  isFuture: boolean;
};

export type ActivityMosaic = {
  /** 주(세로 줄)마다 월요일부터 일요일까지 7칸. 왼쪽이 오래된 주. */
  weeks: ActivityMosaicCell[][];
  /** 최근 기간 안에서 기록이 1 이상인 날 수 */
  activeDays: number;
};

export const ACTIVITY_MOSAIC_WEEKS = 20;

/**
 * 하루 기록 수를 모자이크 단계로 바꾼다 (원본 PRD 「활동 기준」).
 *
 * @param count - 그날 기록 수
 * @returns 0 빈 날 · 1 → 1단계 · 2–3 → 2단계 · 4–6 → 3단계 · 7 이상 → 4단계
 *
 * @example
 * getActivityLevel(5) // 3
 */
export function getActivityLevel(count: number): ActivityLevel {
  if (count >= 7) {
    return 4;
  }

  if (count >= 4) {
    return 3;
  }

  if (count >= 2) {
    return 2;
  }

  return count >= 1 ? 1 : 0;
}

/**
 * 하루 한 글자로 적은 기록 문자열을 날짜별 기록으로 푼다.
 *
 * @param from - 첫 글자의 날짜. `YYYY-MM-DD`
 * @param counts - 하루 한 글자(0–9) 문자열
 * @returns 기록이 1 이상인 날만
 *
 * @example
 * decodeActivityCounts("2026-07-08", "0120") // [{ date: "2026-07-09", count: 1 }, { date: "2026-07-10", count: 2 }]
 */
export function decodeActivityCounts(from: string, counts: string): ActivityDay[] {
  const start = parseDateKey(from);

  if (!start) {
    return [];
  }

  return [...counts].flatMap((digit, index) => {
    const count = Number(digit);

    if (!count) {
      return [];
    }

    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + index);

    return [{ date: toDateKey(date), count }];
  });
}

/**
 * 오늘이 든 주까지 최근 N주를 7줄 × N주 칸으로 만든다. 한 주는 월요일에 시작한다.
 *
 * @param days - 날짜별 기록. 순서와 상관없고, 같은 날이 여러 번 있으면 더한다
 * @param today - 기준 날짜
 * @param weeks - 주 수. 기본 20
 * @returns 주별 칸과 활동한 날 수
 *
 * @example
 * buildActivityMosaic([{ date: "2026-11-24", count: 3 }], new Date(2026, 10, 24)).activeDays // 1
 */
export function buildActivityMosaic(
  days: readonly ActivityDay[],
  today: Date,
  weeks = ACTIVITY_MOSAIC_WEEKS,
): ActivityMosaic {
  const countByDate = new Map<string, number>();

  days.forEach((day) => {
    countByDate.set(day.date, (countByDate.get(day.date) ?? 0) + day.count);
  });

  const todayKey = toDateKey(today);
  // 월요일 = 0 … 일요일 = 6
  const weekdayFromMonday = (today.getDay() + 6) % 7;
  const firstDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() - weekdayFromMonday - (weeks - 1) * 7,
  );

  let activeDays = 0;

  const grid = Array.from({ length: weeks }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = toDateKey(
        new Date(
          firstDay.getFullYear(),
          firstDay.getMonth(),
          firstDay.getDate() + weekIndex * 7 + dayIndex,
        ),
      );
      const isFuture = date > todayKey;
      const count = isFuture ? 0 : (countByDate.get(date) ?? 0);

      if (count > 0) {
        activeDays += 1;
      }

      return { date, count, level: getActivityLevel(count), isFuture };
    }),
  );

  return { weeks: grid, activeDays };
}
