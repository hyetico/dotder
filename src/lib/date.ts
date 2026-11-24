/**
 * 날짜를 다루고 화면에 보여주는 함수는 이 파일에만 둔다 (code-guide 5장, style-guide 9장).
 *
 * 저장 형식은 `YYYY-MM-DD`(날짜 키), 화면 형식은 `YYYY.MM.DD`이다.
 */

const DAY_MS = 86_400_000;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * 날짜를 저장용 키로 바꾼다.
 *
 * @param date - 바꿀 날짜. 기기 시간대 기준으로 읽는다
 * @returns `YYYY-MM-DD`
 *
 * @example
 * toDateKey(new Date(2026, 10, 21)) // "2026-11-21"
 */
export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * 날짜 키를 기기 시간대의 자정으로 읽는다.
 *
 * @param value - `YYYY-MM-DD`. 뒤에 시각이 붙어 있으면 날짜 부분만 쓴다
 * @returns 읽을 수 없으면 null
 */
export function parseDateKey(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value?.trim() ?? "");

  if (!match) {
    return null;
  }

  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));

  return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * 날짜를 기본 화면 형식으로 바꾼다.
 *
 * @param value - `YYYY-MM-DD` 또는 그 뒤에 시각이 붙은 값
 * @returns `YYYY.MM.DD`. 읽을 수 없으면 빈 문자열
 *
 * @example
 * formatDate("2026-11-21") // "2026.11.21"
 */
export function formatDate(value: string | null | undefined) {
  const date = parseDateKey(value);

  if (!date) {
    return "";
  }

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
}

/**
 * 기간을 화면 형식으로 바꾼다. 한쪽만 있으면 있는 쪽만 보여준다.
 *
 * @param startDate - 시작일 `YYYY-MM-DD`. 비어 있으면 시작일 없음
 * @param endDate - 마감일 `YYYY-MM-DD`. 비어 있으면 마감 없음
 * @returns `YYYY.MM.DD ~ YYYY.MM.DD`, 시작일만 있으면 `YYYY.MM.DD ~`. 둘 다 없으면 빈 문자열
 *
 * @example
 * formatDateRange("2026-11-21", "2026-12-31") // "2026.11.21 ~ 2026.12.31"
 */
export function formatDateRange(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start && end) {
    return `${start} ~ ${end}`;
  }

  if (start) {
    return `${start} ~`;
  }

  return end;
}

/**
 * 시각을 날짜와 시:분으로 바꾼다.
 *
 * @param value - ISO 시각 (`2026-11-09T13:48:00`)
 * @returns `YYYY.MM.DD HH:mm`. 읽을 수 없으면 받은 값 그대로
 */
export function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * 날짜를 `9월 3일`처럼 월과 일로 바꾼다.
 *
 * @param value - `YYYY-MM-DD`
 * @returns 읽을 수 없으면 빈 문자열
 */
export function formatMonthDay(value: string | null | undefined) {
  const date = parseDateKey(value);

  return date ? `${date.getMonth() + 1}월 ${date.getDate()}일` : "";
}

/**
 * 날짜를 `2026년 9월 3일`처럼 문장 형식으로 바꾼다. 모달 제목처럼 한 날짜를 크게 보여줄 때 쓴다.
 *
 * @param value - `YYYY-MM-DD`
 * @returns 읽을 수 없으면 빈 문자열
 */
export function formatLongDate(value: string | null | undefined) {
  const date = parseDateKey(value);

  return date ? `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일` : "";
}

/**
 * 두 날짜 사이의 일 수를 센다.
 *
 * @param fromDate - 기준일 `YYYY-MM-DD`
 * @param toDate - 비교일 `YYYY-MM-DD`
 * @returns `toDate - fromDate` 일 수. 둘 중 하나라도 읽을 수 없으면 0
 */
export function getDayDelta(fromDate: string, toDate: string) {
  const from = parseDateKey(fromDate);
  const to = parseDateKey(toDate);

  if (!from || !to) {
    return 0;
  }

  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

/**
 * 지난 시각을 `n분 전`처럼 상대 시간으로 바꾼다.
 *
 * 1분 미만은 `방금 전`, 하루 미만은 분·시간, 하루 지나면 `어제`, 그 이상은 날짜로 보여준다.
 *
 * @param value - ISO 시각
 * @param now - 기준 시각. 테스트할 때만 넘긴다
 *
 * @example
 * formatRelativeTime("2026-11-21T09:00:00", new Date("2026-11-21T12:00:00")) // "3시간 전"
 */
export function formatRelativeTime(value: string, now: Date = new Date()) {
  const time = new Date(value);
  const elapsed = now.getTime() - time.getTime();
  const minute = 60_000;
  const hour = 60 * minute;

  if (Number.isNaN(time.getTime()) || elapsed < minute) {
    return "방금 전";
  }

  if (elapsed < hour) {
    return `${Math.floor(elapsed / minute)}분 전`;
  }

  if (elapsed < DAY_MS) {
    return `${Math.floor(elapsed / hour)}시간 전`;
  }

  if (elapsed < 2 * DAY_MS) {
    return "어제";
  }

  return formatDate(value);
}
