import { CreatePageLayout } from "@/components/layout/pages/CreatePage/CreatePageFrame";

type ProjectNewLayoutProps = {
  children: React.ReactNode;
};

export default function ProjectNewLayout({ children }: ProjectNewLayoutProps) {
  return <CreatePageLayout fitViewport>{children}</CreatePageLayout>;
}
