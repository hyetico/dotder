import LayoutShell from "@/features/projects/components/LayoutShell";

type ProjectsLayoutProps = {
  children: React.ReactNode;
};

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return <LayoutShell>{children}</LayoutShell>;
}
