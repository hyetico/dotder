export type User = {
  id: number;
  name: string;
  role: string;
  email: string;
  image: string;
};

export const currentUser: User = {
  id: 4,
  name: "김민수",
  role: "Frontend Developer",
  email: "minsu@example.com",
  image: "https://placehold.co/100x100",
};

export const mockUsers: User[] = [
  {
    id: 1,
    name: "김인수",
    role: "Frontend Developer",
    email: "insu@example.com",
    image: "https://placehold.co/100x100",
  },
  {
    id: 2,
    name: "이지은",
    role: "Backend Developer",
    email: "jieun@example.com",
    image: "https://placehold.co/100x100",
  },
  {
    id: 3,
    name: "박서연",
    role: "Product Designer",
    email: "seoyeon@example.com",
    image: "https://placehold.co/100x100",
  },
  currentUser,
];

export function getUserName(userId: number) {
  return mockUsers.find((user) => user.id === userId)?.name ?? "알 수 없음";
}
