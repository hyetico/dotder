"use client";

import dynamic from "next/dynamic";

import type { TaskFilterTab } from "@/features/tasks/utils/taskUtils";
import type { ProjectScope } from "@/lib/projectRoutes";

const TaskBoard = dynamic(() => import("@/features/tasks/components/board/TaskBoard"), {
  ssr: false,
});

type TaskBoardClientProps = {
  projectScope: ProjectScope;
  searchQuery?: string;
  statusFilter?: TaskFilterTab;
};

export default function TaskBoardClient({
  projectScope,
  searchQuery = "",
  statusFilter = "all",
}: TaskBoardClientProps) {
  return (
    <TaskBoard projectScope={projectScope} searchQuery={searchQuery} statusFilter={statusFilter} />
  );
}
