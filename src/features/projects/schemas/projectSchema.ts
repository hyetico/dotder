import { z } from "zod";

import { PROJECT_TAG_LIMIT } from "@/features/projects/constants/projectTags";
import type { ProjectStatus } from "@/features/projects/types/project";
import { isProjectDelayed } from "@/features/projects/utils/projectUtils";

const projectSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "프로젝트 이름을 입력해주세요.")
      .max(50, "프로젝트 이름은 50자 이하로 입력해주세요."),

    description: z.string().max(500, "프로젝트 설명은 500자 이하로 입력해주세요."),

    color: z.string().nullable(),

    teamId: z.string(),

    startDate: z.string().min(1, "시작일을 선택해주세요."),

    endDate: z.string().min(1, "마감일을 선택해주세요."),

    status: z.enum(["PLANNED", "IN_PROGRESS", "ON_HOLD", "DONE"]),

    isMain: z.boolean(),

    tags: z.array(z.string()).max(PROJECT_TAG_LIMIT, "태그는 10개까지 추가할 수 있습니다."),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: "마감일은 시작일 이후여야 합니다.",
    path: ["endDate"],
  });

export type ProjectFormData = z.infer<typeof projectSchema>;

/**
 * createProjectSchema
 *
 * 프로젝트 폼의 검증 규칙을 만듭니다. 생성/수정 여부와 기존 상태에 따라 규칙이 달라집니다.
 *
 * @param minDate - 시작일과 마감일에 허용하는 가장 이른 날짜. 없으면 제한하지 않음
 * @param isCreating - 새 프로젝트를 만드는 중인지 여부
 * @param initialStatus - 수정 전 프로젝트 상태
 * @returns 프로젝트 폼 검증 스키마
 */
export function createProjectSchema(
  minDate?: string,
  isCreating = false,
  initialStatus?: ProjectStatus,
) {
  let schema = isCreating
    ? projectSchema
        .refine((data) => data.status !== "DONE", {
          message: "프로젝트를 처음 생성할 때는 완료 상태를 선택할 수 없습니다.",
          path: ["status"],
        })
        .refine((data) => data.status !== "ON_HOLD", {
          message: "프로젝트를 처음 생성할 때는 보류 상태를 선택할 수 없습니다.",
          path: ["status"],
        })
    : projectSchema;

  if (!isCreating && (initialStatus === "IN_PROGRESS" || initialStatus === "ON_HOLD")) {
    schema = schema.refine((data) => data.status !== "PLANNED", {
      message: "진행 중이거나 보류인 프로젝트는 계획 상태로 되돌릴 수 없습니다.",
      path: ["status"],
    });
  }

  if (!isCreating && initialStatus === "IN_PROGRESS") {
    schema = schema.refine(
      (data) => {
        const stillDelayed = isProjectDelayed({
          status: "IN_PROGRESS",
          endDate: data.endDate,
        });

        if (!stillDelayed) {
          return true;
        }

        return data.status === "IN_PROGRESS";
      },
      {
        message: "지연중에는 프로젝트 상태를 변경할 수 없습니다.",
        path: ["status"],
      },
    );
  }

  if (!minDate) {
    return schema;
  }

  return schema
    .refine((data) => !data.startDate || data.startDate >= minDate, {
      message: "시작일은 오늘부터 선택할 수 있습니다.",
      path: ["startDate"],
    })
    .refine((data) => !data.endDate || data.endDate >= minDate, {
      message: "마감일은 오늘부터 선택할 수 있습니다.",
      path: ["endDate"],
    });
}
