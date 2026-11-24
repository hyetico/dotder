import { z } from "zod";

import { getTodayDateValue } from "@/features/goals/utils/goalDates";

import { PROJECT_COLOR_KEYS } from "@/lib/projectPalette";

const goalSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "목표 이름을 입력해주세요.")
      .max(50, "목표 이름은 50자 이하로 입력해주세요."),

    description: z.string().max(100, "목표 설명은 100자 이하로 입력해주세요."),

    color: z.enum(PROJECT_COLOR_KEYS).nullable(),

    startDate: z.string().min(1, "시작일을 선택해주세요."),

    endDate: z.string().min(1, "마감일을 선택해주세요."),

    status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED"]),

    tags: z.array(z.string()).max(2, "태그는 2개까지만 선택할 수 있습니다."),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "마감일은 시작일 이후여야 합니다.",
    path: ["endDate"],
  });

export type GoalFormData = z.infer<typeof goalSchema>;

export type GoalProjectPeriod = {
  startDate: string;
  endDate: string;
};

/**
 * createGoalSchema
 *
 * 목표 폼의 검증 규칙을 만듭니다. 연결된 프로젝트가 있으면 그 기간 안으로 날짜를 제한합니다.
 *
 * @param period - 연결된 프로젝트 기간. 없으면 오늘부터 선택 가능
 * @returns 목표 폼 검증 스키마
 */
export function createGoalSchema(period?: GoalProjectPeriod) {
  if (!period?.startDate || !period.endDate) {
    const today = getTodayDateValue();

    return goalSchema.refine((data) => !data.startDate || data.startDate >= today, {
      message: "시작일은 오늘부터 선택해주세요.",
      path: ["startDate"],
    });
  }

  return goalSchema
    .refine(
      (data) =>
        !data.startDate || (data.startDate >= period.startDate && data.startDate <= period.endDate),
      {
        message: "시작일은 선택한 프로젝트 기간 안에서 선택해주세요.",
        path: ["startDate"],
      },
    )
    .refine(
      (data) =>
        !data.endDate || (data.endDate >= period.startDate && data.endDate <= period.endDate),
      {
        message: "마감일은 선택한 프로젝트 기간 안에서 선택해주세요.",
        path: ["endDate"],
      },
    );
}
