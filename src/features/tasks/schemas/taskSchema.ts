import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(2, "태스크 제목은 2글자 이상 입력해주세요."),

  description: z.string().min(5, "태스크 설명은 5글자 이상 입력해주세요."),

  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),

  dueDate: z.string().min(1, "마감일을 선택해주세요."),

  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]),
});

export const allProjectsTaskSchema = taskSchema.extend({
  projectId: z.string().min(1, "프로젝트를 선택해주세요."),
});

export type TaskFormData = z.infer<typeof taskSchema>;

export type AllProjectsTaskFormData = z.infer<typeof allProjectsTaskSchema>;
