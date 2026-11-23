import LayoutShell from "@/features/projects/components/LayoutShell";

type MemosLayoutProps = {
  children: React.ReactNode;
};

export default function MemosLayout({ children }: MemosLayoutProps) {
  return <LayoutShell>{children}</LayoutShell>;
}
