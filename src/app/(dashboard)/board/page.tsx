import { redirect } from "next/navigation";

import { DEFAULT_PROJECT_ID } from "@/lib/projectRoutes";

export default function BoardRedirectPage() {
  redirect(`/projects/${DEFAULT_PROJECT_ID}/tasks`);
}
