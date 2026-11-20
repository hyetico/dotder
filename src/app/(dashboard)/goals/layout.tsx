import LayoutShell from "@/features/projects/components/LayoutShell";

type GoalsLayoutProps = {
  children: React.ReactNode;
};

export default function GoalsLayout({ children }: GoalsLayoutProps) {
  return <LayoutShell>{children}</LayoutShell>;
}
