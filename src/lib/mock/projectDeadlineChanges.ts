import type { ProjectDeadlineChange } from "@/features/projects/types/project";

export const mockProjectDeadlineChanges: ProjectDeadlineChange[] = [
  {
    id: 1,
    projectId: 1,
    previousEndDate: "2026-06-01",
    nextEndDate: "2026-06-15",
    changedAt: "2026-06-03T09:30:00",
    overdueDaysAtChange: 2,
  },
  {
    id: 2,
    projectId: 1,
    previousEndDate: "2026-06-15",
    nextEndDate: "2026-06-28",
    changedAt: "2026-06-17T11:00:00",
    overdueDaysAtChange: 2,
  },
  {
    id: 3,
    projectId: 1,
    previousEndDate: "2026-06-28",
    nextEndDate: "2026-07-12",
    changedAt: "2026-06-30T15:20:00",
    overdueDaysAtChange: 2,
  },
  {
    id: 4,
    projectId: 1,
    previousEndDate: "2026-07-12",
    nextEndDate: "2026-07-26",
    changedAt: "2026-07-14T10:40:00",
    overdueDaysAtChange: 2,
  },
  {
    id: 5,
    projectId: 1,
    previousEndDate: "2026-07-26",
    nextEndDate: "2026-08-10",
    changedAt: "2026-07-28T13:15:00",
    overdueDaysAtChange: 2,
  },
  {
    id: 6,
    projectId: 1,
    previousEndDate: "2026-08-10",
    nextEndDate: "2026-08-20",
    changedAt: "2026-08-12T09:30:00",
    overdueDaysAtChange: 2,
  },
  {
    id: 7,
    projectId: 1,
    previousEndDate: "2026-08-20",
    nextEndDate: "2026-09-01",
    changedAt: "2026-08-24T14:10:00",
    overdueDaysAtChange: 4,
    reason: "인증 기능 검사와 오류 수정에 추가 시간이 필요해 마감일을 조정했습니다.",
  },
];

export function getProjectDeadlineChanges(projectId: number): ProjectDeadlineChange[] {
  return mockProjectDeadlineChanges
    .filter((change) => change.projectId === projectId)
    .sort((left, right) => {
      if (left.changedAt < right.changedAt) {
        return 1;
      }

      if (left.changedAt > right.changedAt) {
        return -1;
      }

      return right.id - left.id;
    });
}

export function recordProjectDeadlineChange(
  input: Omit<ProjectDeadlineChange, "id">,
): ProjectDeadlineChange {
  const nextId =
    mockProjectDeadlineChanges.reduce((maxId, change) => Math.max(maxId, change.id), 0) + 1;

  const change: ProjectDeadlineChange = {
    ...input,
    id: nextId,
  };

  mockProjectDeadlineChanges.push(change);

  return change;
}

export function removeProjectDeadlineChanges(projectId: number) {
  for (let index = mockProjectDeadlineChanges.length - 1; index >= 0; index -= 1) {
    if (mockProjectDeadlineChanges[index].projectId === projectId) {
      mockProjectDeadlineChanges.splice(index, 1);
    }
  }
}
