import { notFound } from "next/navigation";

import UiGallery from "@/components/ui/UiGallery";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "공통 컴포넌트 · Dotder",
  robots: { index: false },
};

export default function UiPage() {
  // 견본 페이지는 개발 서버에서만 연다 (배포 사이트에서는 404)
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <UiGallery />;
}
