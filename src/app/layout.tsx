import "./globals.css";

import Providers from "@/app/providers";

import { buildProjectPaletteCss } from "@/lib/projectPalette";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dotder",
  description: "Task management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
        {/* 프로젝트 색 변수 (--project-<키> 등). 값은 lib/projectPalette.ts 한 곳에 있다 */}
        <style dangerouslySetInnerHTML={{ __html: buildProjectPaletteCss() }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
