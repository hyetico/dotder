import LayoutShell from "@/features/projects/components/LayoutShell";

type BacklogLayoutProps = {
  children: React.ReactNode;
};

export default function BacklogLayout({ children }: BacklogLayoutProps) {
  return <LayoutShell>{children}</LayoutShell>;
}
