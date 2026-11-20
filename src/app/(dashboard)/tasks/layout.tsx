import LayoutShell from "@/features/projects/components/LayoutShell";

type TasksLayoutProps = {
  children: React.ReactNode;
};

export default function TasksLayout({ children }: TasksLayoutProps) {
  return <LayoutShell>{children}</LayoutShell>;
}
