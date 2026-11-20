export type StatusColorKey = "all" | "planned" | "inProgress" | "onHold" | "done" | "delayed";

export type StatusColorTokens = {
  text: string;
  background: string;
  hoverText: string;
  hoverBackground: string;
  activeBackground: string;
  activeText: string;
  dark: {
    background: string;
    text: string;
  };
};

const restingBackground = "linear-gradient(180deg, #FFFFFF 0%, #F7F8FA 100%)";

/**
 * 상태 필터의 기본 컬러.
 * 버튼 배경은 상태마다 바꾸지 않고, 선택된 버튼은 프라이머리 그라데이션을 쓴다.
 */
export const STATUS_COLORS: Record<StatusColorKey, StatusColorTokens> = {
  all: {
    text: "#475569",
    background: restingBackground,
    hoverText: "#343840",
    hoverBackground: "linear-gradient(180deg, #F3F4F6 0%, #E5E7EB 100%)",
    activeBackground: "linear-gradient(90deg, #343840 0%, #484D56 100%)",
    activeText: "#FFFFFF",
    dark: {
      background: "#343840",
      text: "#F7F7F5",
    },
  },
  planned: {
    text: "#475569",
    background: restingBackground,
    hoverText: "#475569",
    hoverBackground: "linear-gradient(180deg, #F7F7F5 0%, #E2E8F0 100%)",
    activeBackground: "linear-gradient(135deg, #F1F5F9 0%, #D5DEE8 52%, #B7C3D1 100%)",
    activeText: "#3E4C5F",
    dark: {
      background: "#1F2937",
      text: "#E5E7EB",
    },
  },
  inProgress: {
    text: "#475569",
    background: restingBackground,
    hoverText: "#1D4ED8",
    hoverBackground: "linear-gradient(180deg, #F5F9FF 0%, #E7F0FE 100%)",
    activeBackground: "linear-gradient(135deg, #1E40AF 0%, #3B82F6 45%, #93C5FD 100%)",
    activeText: "#FFFFFF",
    dark: {
      background: "#1E3A8A",
      text: "#BFDBFE",
    },
  },
  onHold: {
    text: "#475569",
    background: restingBackground,
    hoverText: "#92400E",
    hoverBackground: "linear-gradient(180deg, #FFFBF3 0%, #FEF3C7 100%)",
    activeBackground: "linear-gradient(135deg, #B45309 0%, #F59E0B 45%, #FCD34D 100%)",
    activeText: "#FFFFFF",
    dark: {
      background: "#92400E",
      text: "#FED7AA",
    },
  },
  done: {
    text: "#475569",
    background: restingBackground,
    hoverText: "#065F46",
    hoverBackground: "linear-gradient(180deg, #F4FDF8 0%, #D1FAE5 100%)",
    activeBackground: "linear-gradient(135deg, #047857 0%, #10B981 45%, #6EE7B7 100%)",
    activeText: "#FFFFFF",
    dark: {
      background: "#065F46",
      text: "#A7F3D0",
    },
  },
  delayed: {
    text: "#475569",
    background: restingBackground,
    hoverText: "#B91C1C",
    hoverBackground: "linear-gradient(180deg, #FFF8F8 0%, #FEE2E2 100%)",
    activeBackground: "linear-gradient(135deg, #B91C1C 0%, #EF4444 45%, #FCA5A5 100%)",
    activeText: "#FFFFFF",
    dark: {
      background: "#991B1B",
      text: "#FEE2E2",
    },
  },
};

const STATUS_TONE_BY_ID: Record<string, StatusColorKey> = {
  all: "all",
  PLANNED: "planned",
  NOT_STARTED: "planned",
  TODO: "planned",
  IN_PROGRESS: "inProgress",
  ON_HOLD: "onHold",
  DONE: "done",
  COMPLETED: "done",
  DELAYED: "delayed",
};

/**
 * getStatusColor
 *
 * 상태 키에 해당하는 공용 컬러를 반환합니다.
 *
 * @param tone - 상태 컬러 키
 * @returns 글자, 그라데이션 배경, 선택, 다크 모드 컬러
 */
export function getStatusColor(tone: StatusColorKey) {
  return STATUS_COLORS[tone];
}

/**
 * getStatusFilterTone
 *
 * 목록 필터 id를 공용 상태 컬러 키로 바꿉니다.
 *
 * @param id - 전체, 계획, 진행 중, 보류, 완료, 지연 필터 id
 * @returns 상태 컬러 키
 */
export function getStatusFilterTone(id: string): StatusColorKey {
  return STATUS_TONE_BY_ID[id] ?? "all";
}
