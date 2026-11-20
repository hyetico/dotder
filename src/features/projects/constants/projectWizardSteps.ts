import { type ProjectFormData } from "@/features/projects/schemas/projectSchema";

export type ProjectWizardStepId = 1 | 2 | 3;

export type ProjectWizardStep = {
  id: ProjectWizardStepId;
  label: string;
  mobileLabel: string;
  progressLabel: string;
  fields: (keyof ProjectFormData)[];
};

export const projectWizardSteps: ProjectWizardStep[] = [
  {
    id: 1,
    label: "기본 정보",
    mobileLabel: "기본 정보",
    progressLabel: "기본 정보 입력",
    fields: ["color", "name", "description", "tags"],
  },
  {
    id: 2,
    label: "일정 및 상태",
    mobileLabel: "일정 및 상태",
    progressLabel: "프로젝트 일정과 상태 설정",
    fields: ["status", "startDate", "endDate"],
  },
  {
    id: 3,
    label: "팀 및 설정",
    mobileLabel: "팀 및 프로젝트 설정",
    progressLabel: "팀 및 메인 프로젝트 설정",
    fields: ["teamId", "isMain"],
  },
];

export const projectWizardLastStep = projectWizardSteps.length;
