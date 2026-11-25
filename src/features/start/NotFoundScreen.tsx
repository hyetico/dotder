import Button from "@/components/kit/Button";
import { Home, Search } from "@/components/ui/icon";

import BrandLogo from "@/features/start/BrandLogo";

import { cn } from "@/lib/cn";
import { projectColorVar } from "@/lib/projectPalette";

// 보드 13 조각 15개 (5 × 3). muted · ink · empty는 프로젝트 색이 아닌 칸
const TILES = [
  "olive",
  "olive",
  "olive",
  "muted",
  "purple",
  "olive",
  "purple",
  "brown",
  "olive",
  "indigo",
  "purple",
  "brown",
  "empty",
  "teal",
  "ink",
] as const;

/**
 * 404 (REBUILD 3-7 · 보드 13). 앱 틀 없이 --cover-bg, 머리 72(로고) → 가운데: 조각 5 × 3(40 · 사이 8, 빈 칸 하나는 점선)
 * · 「404 · NOT FOUND」 · 제목 40/52 · 설명 · [프로젝트로 가기] [검색하기].
 */
export default function NotFoundScreen() {
  const buttons = (className: string) => (
    <div className={className}>
      <Button variant="primary" href="/projects">
        <Home size={16} aria-hidden />
        프로젝트로 가기
      </Button>
      <Button href="/projects?search=1">
        <Search size={16} aria-hidden />
        검색하기
      </Button>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--cover-bg)] text-[var(--text)]">
      <header className="flex h-14 items-center px-4 md:h-18 md:px-8 lg:px-16">
        <BrandLogo />
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center md:gap-6">
        <div
          aria-hidden
          className="grid grid-cols-[repeat(5,--spacing(8))] gap-1.5 md:grid-cols-[repeat(5,--spacing(10))] md:gap-2"
        >
          {TILES.map((tile, index) => (
            <i
              key={index}
              className={cn(
                "block size-8 rounded-[var(--radius-sm)] md:size-10",
                tile === "muted" && "bg-[var(--tile-muted)]",
                tile === "ink" && "bg-[var(--tile-ink)]",
                tile === "empty" && "border-2 border-dashed border-[var(--tile-empty-line)]",
              )}
              style={
                tile === "muted" || tile === "ink" || tile === "empty"
                  ? undefined
                  : { background: projectColorVar(tile, "fixed") }
              }
            />
          ))}
        </div>
        <span className="text-xs font-semibold tracking-[0.06em] text-[var(--t3)]">
          404 · NOT FOUND
        </span>
        <h1 className="text-hero-m font-bold tracking-[-0.02em] md:text-5xl md:leading-13 md:tracking-[-0.03em]">
          페이지를 찾을 수 없어요.
        </h1>
        <p className="text-base leading-6.5 text-[var(--t2)]">
          주소가 바뀌었거나 지운 항목일 수 있어요.
          <br />내 기록은 그대로 있어요.
        </p>
        {buttons("flex flex-wrap justify-center gap-3 max-md:hidden")}
      </main>
      {/* 모바일은 버튼을 아래에 꽉 차게 (보드 M 13) */}
      {buttons("flex flex-col gap-2 px-4 pt-4 pb-8 md:hidden [&>*]:h-12")}
    </div>
  );
}
