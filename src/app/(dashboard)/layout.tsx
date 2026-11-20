import AppLayout from "@/components/layout/AppLayout";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

/**
 * DashboardLayout
 *
 * 사이드바, 헤더, 모바일 드로어 같은 공통 레이아웃으로 대시보드 화면을 감쌉니다.
 *
 * @param props - DashboardLayout 컴포넌트 Props
 * @param props.children - 레이아웃 안에 들어갈 페이지
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <AppLayout>{children}</AppLayout>;
}
