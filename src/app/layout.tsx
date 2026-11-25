import "./globals.css";

import { THEME_INIT_SCRIPT } from "@/components/shell/theme";

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
    // 테마는 첫 그림 전에 스크립트가 정하므로 html 속성 차이는 경고하지 않는다
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
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
