import { notFound } from "next/navigation";

import UiGallery from "@/components/ui/UiGallery";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공통 컴포넌트 · Dotder",
  robots: { index: false },
};

export default function UiPage() {
  // 견본 페이지는 개발 서버 · 미리보기 배포에서 연다 (실제 사이트에서는 404)
  if (process.env.VERCEL_ENV === "production") {
    notFound();
  }

  return <UiGallery />;
}
