import { redirect } from "next/navigation";

import { getNewProjectPath } from "@/lib/projectRoutes";

// 프로젝트 만들기는 드로어로 바뀌었다 (6단계 · P-5). 예전 주소는 드로어를 여는 주소로 넘긴다.
export default function ProjectNewPage() {
  redirect(getNewProjectPath());
}
