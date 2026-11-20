/**
 * getTodayDateValue
 *
 * 오늘 날짜를 입력 칸에 쓰는 날짜 문자열로 만듭니다.
 *
 * @returns 오늘 날짜. YYYY-MM-DD
 */
export function getTodayDateValue() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(today.getMonth() + 1).padStart(2, "0");

  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
