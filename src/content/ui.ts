/**
 * 화면 고정 글 (버튼 · 확인창 · 토스트 · 빠른 입력). 원문: REBUILD.md 5-3 (2026-11-24 확정).
 * 화면 · 컴포넌트에 같은 글을 직접 쓰지 않고 여기서 가져온다.
 */

/** 버튼 이름 */
export const BUTTON_LABEL = {
  /** 만들기 드로어의 주 버튼 */
  create: "만들기",
  /** 수정 · 상세 드로어의 주 버튼 (바꾼 것이 없으면 비활성) */
  save: "저장",
  cancel: "취소",
  delete: "삭제",
  close: "닫기",
  /** 헤더의 만들기 드로어 여는 버튼 (「+ 추가」) */
  add: "추가",
  undo: "되돌리기",
  retry: "다시 시도",
  /** 복제 토스트 (보드 03-h) */
  open: "열기",
} as const;

/** 바꾼 채로 닫을 때 확인창 */
export const DISCARD_CONFIRM = {
  title: "저장하지 않고 닫을까요?",
  text: "수정한 내용이 사라져요.",
} as const;

/** 삭제 확인 설명 */
export const DELETE_CONFIRM_TEXT = "삭제하면 되돌릴 수 없어요.";

/**
 * 삭제 확인 제목. 받침에 따라 「을 · 를」을 붙인다.
 *
 * @param target - 지울 대상 이름. 예: "프로젝트", "‘스토어 출시 준비’"
 *
 * @example
 * deleteConfirmTitle("프로젝트") // "프로젝트를 삭제할까요?"
 */
export function deleteConfirmTitle(target: string) {
  return `${target}${objectParticle(target)} 삭제할까요?`;
}

/** 토스트 글 */
export const TOAST_TEXT = {
  saved: "저장했어요",
  deleted: "삭제했어요",
  undone: "되돌렸어요",
  saveFailed: "저장하지 못했어요. 다시 시도해 주세요.",
  archived: "보관했어요",
  restored: "되돌렸어요",
  mainSet: "메인 프로젝트로 지정했어요",
  mainCleared: "메인 프로젝트를 해제했어요",
  favoriteAdded: "즐겨찾기에 추가했어요",
  favoriteRemoved: "즐겨찾기에서 뺐어요",
  favoriteFull: "즐겨찾기는 최대 3개까지 추가할 수 있어요.",
  /** 마감일 변경 드로어 저장 (프로토타입 dueChange) */
  deadlineChanged: "마감일을 변경했어요. 변경 내역은 기록 탭에서 볼 수 있어요.",
  /** 목표 ⋯ 「완료」 (프로토타입 gmenu) */
  goalCompleted: "목표를 완료했어요",
  /** 메모 ⋯ (프로토타입 mmenu) */
  memoToTask: "태스크로 등록했어요.",
  memoToGoal: "목표로 등록했어요.",
  memoRelinked: "연결을 변경했어요.",
} as const;

/** 복제 토스트 (프로토타입 pmenu) */
export function duplicatedToast(name: string) {
  return `‘${name}’을 만들었어요`;
}

/** 빠른 입력 줄 안내 글. 앞의 「+」는 칸 안 아이콘으로 그린다 (프로토타입 data-quick) */
export const QUICK_ADD_PLACEHOLDER = {
  task: "태스크 추가",
  memo: "생각 적기",
} as const;

/** 목표 태그 고르기 (프로토타입 goalTagField) */
export const GOAL_TAG_TEXT = {
  noProject: "프로젝트를 선택하면 태그를 지정할 수 있어요.",
  noTags: "등록된 태그가 없어요. 프로젝트 수정에서 추가할 수 있어요.",
} as const;

/** 프로젝트 태그 칸 (보드 01-a2) */
export const TAG_FIELD_TEXT = {
  label: "태그",
  hint: "목표에서 이 태그를 선택할 수 있어요.",
  add: "+ 태그 추가",
} as const;

/** 메모 카드 바로 저장 표시 */
export const INLINE_SAVE_TEXT = {
  saved: "저장됨",
  failed: "저장하지 못했어요",
} as const;

// 마지막 글자에 받침이 있으면 「을」, 없으면 「를」. 한글이 아니면(따옴표 등) 앞 글자를 본다.
function objectParticle(word: string) {
  const chars = [...word].reverse();
  const last = chars.find((char) => /[가-힣]/.test(char));

  if (!last) {
    return "를";
  }

  return (last.charCodeAt(0) - 0xac00) % 28 === 0 ? "를" : "을";
}
