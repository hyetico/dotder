export type MemoZone = "quick" | "archive";

export type MemoRegistrationKind = "goal" | "task";

export type MemoRegistration = {
  kind: MemoRegistrationKind;
  targetId: number;
  projectId: number | null;
};

export type Memo = {
  id: number;
  title: string;
  body: string;
  projectId: number | null;
  createdAt: string;
  zone: MemoZone;
  sortRank: number;
  registration: MemoRegistration | null;
};
