import { projectFormDomId } from "@/features/projects/constants/projectFormDefaults";

import { mockUsers } from "@/lib/mock/users";

/**
 * getTomorrowDateValue
 *
 * 오늘 다음 날을 YYYY-MM-DD로 돌려줍니다.
 *
 * @returns 내일 날짜
 */
export function getTomorrowDateValue() {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  const year = tomorrow.getFullYear();

  const month = String(tomorrow.getMonth() + 1).padStart(2, "0");

  const day = String(tomorrow.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getProjectAdmin(name: string) {
  const user = mockUsers.find((item) => item.name === name);

  if (user) {
    return user;
  }

  return {
    name,
    role: "",
    image: "",
  };
}

/**
 * scrollToProjectFormError
 *
 * 프로젝트 폼에서 처음 나온 입력 오류가 화면에 보이게 스크롤합니다.
 *
 * @param formId - 스크롤할 폼 id
 */
export function scrollToProjectFormError(formId?: string) {
  window.setTimeout(() => {
    document
      .getElementById(formId ?? projectFormDomId)
      ?.querySelector("[data-field-error]")
      ?.scrollIntoView({
        block: "center",
      });
  }, 0);
}
