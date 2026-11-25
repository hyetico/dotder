import Button from "@/components/kit/Button";
import { ChevronRight, Info } from "@/components/ui/icon";

import BrandLogo from "@/features/start/BrandLogo";

import { projectColorVar, type ProjectColorKey } from "@/lib/projectPalette";

import type { CSSProperties } from "react";

// 보드 00 그림: 모여드는 조각 27개 [x, y, 색, 날아오는 x, y, 회전, 늦춤 초]
const TILES: [number, number, ProjectColorKey, number, number, number, number][] = [
  [4, 4, "teal", 22, 34, -78, 0.01],
  [12.5, 4, "brown", -29, -30, -36, 0.03],
  [21, 4, "purple", 31, -21, -67, 0.13],
  [4, 12.5, "teal", -36, -21, 71, 0.17],
  [12.5, 12.5, "brown", -36, 15, -34, 0.13],
  [21, 12.5, "purple", -27, 18, 48, 0.16],
  [29.5, 12.5, "lime", 35, -17, 58, 0.25],
  [38, 12.5, "indigo", -29, -31, -74, 0.28],
  [46.5, 12.5, "mustard", -33, 24, 29, 0.31],
  [4, 21, "lime", 29, 21, -44, 0.35],
  [12.5, 21, "indigo", -20, 30, 36, 0.41],
  [21, 21, "mustard", 27, -17, 41, 0.38],
  [29.5, 21, "slate", 22, 27, -80, 0.48],
  [38, 21, "olive", -35, 24, 87, 0.43],
  [46.5, 21, "teal", 36, 16, -67, 0.53],
  [4, 29.5, "slate", 40, -15, 89, 0.49],
  [12.5, 29.5, "olive", 27, 25, -85, 0.59],
  [21, 29.5, "teal", 23, -29, -75, 0.54],
  [29.5, 29.5, "brown", 22, -26, 10, 0.65],
  [38, 29.5, "purple", 20, -28, 12, 0.64],
  [46.5, 29.5, "lime", -31, 27, 1, 0.68],
  [4, 38, "brown", 25, -16, -45, 0.65],
  [12.5, 38, "purple", -18, 32, -44, 0.69],
  [21, 38, "lime", -22, 31, 4, 0.76],
  [29.5, 38, "indigo", 22, -28, 84, 0.82],
  [38, 38, "mustard", 30, 26, -64, 0.81],
  [46.5, 38, "slate", 19, -16, -37, 0.83],
];

// 둘레에 떠 있는 조각 5개 [x, y, 색, 투명도, 회전]
const FLOATS: [number, number, ProjectColorKey, number, number][] = [
  [-14, 40, "mustard", 0.9, -18],
  [64, 2, "purple", 0.9, 24],
  [70, 40, "teal", 0.85, -12],
  [-10, -6, "indigo", 0.7, 30],
  [30, -16, "olive", 0.6, -20],
];

const FEATURES: { colors: ProjectColorKey[]; title: string; text: string }[] = [
  {
    colors: ["teal", "purple"],
    title: "따로 만들고, 나중에 잇기",
    text: "프로젝트 없이 목표만, 태스크만 먼저 적어도 돼요.",
  },
  {
    colors: ["mustard", "indigo", "olive"],
    title: "조각처럼 쌓이는 기록",
    text: "한 일이 모자이크로 쌓여 나만의 그림이 돼요.",
  },
  {
    colors: ["brown", "lime", "teal", "purple"],
    title: "한눈에 보는 진행",
    text: "지연된 일과 다음에 할 일을 먼저 보여 줘요.",
  },
];

/**
 * 커버 · 시작 화면 (REBUILD 3-8 · 보드 00). 앱 틀 없이 전체 화면 --cover-bg.
 * 머리 72(로고 · 「이어서 하기」) → 왼쪽 글(작은 머리 · 제목 56/68 · 설명 18/30 · [시작하기] [예시로 둘러보기] 48 · 안내)
 * | 오른쪽 모여드는 조각 그림 → 아래 특징 3칸(선 위).
 */
export default function CoverScreen() {
  const hero = (
    <svg viewBox="-24 -24 108 96" aria-hidden className="block h-auto w-full overflow-visible">
      {TILES.map(([x, y, color, fx, fy, r, d]) => (
        <rect
          key={`${x}-${y}`}
          className="cover-tile"
          style={
            {
              "--x": `${fx}px`,
              "--y": `${fy}px`,
              "--r": `${r}deg`,
              "--d": `${d}s`,
            } as CSSProperties
          }
          x={x}
          y={y}
          width={7}
          height={7}
          rx={1.5}
          fill={projectColorVar(color, "fixed")}
        />
      ))}
      {FLOATS.map(([x, y, color, opacity, r]) => (
        <rect
          key={`${x}-${y}`}
          className="cover-float"
          x={x}
          y={y}
          width={7}
          height={7}
          rx={1.5}
          fill={projectColorVar(color, "fixed")}
          opacity={opacity}
          transform={`rotate(${r} ${x + 3.5} ${y + 3.5})`}
        />
      ))}
    </svg>
  );

  return (
    <>
      {/* 태블릿 · 모바일 (보드 T · M 00): 로고 → 그림 → 제목 32/42 → 한 줄 설명 → 버튼 52 두 줄 → 안내 */}
      <div className="flex min-h-dvh flex-col bg-[var(--cover-bg)] px-6 pt-14 pb-8 text-[var(--text)] lg:hidden">
        <span className="[&_strong]:text-base">
          <BrandLogo />
        </span>
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-90">{hero}</div>
        </div>
        <h1 className="text-[length:var(--type-4xl)] leading-10.5 font-bold tracking-[-0.03em]">
          조각을 이어,
          <br />
          나의 기록으로
        </h1>
        <p className="mt-3 mb-8 text-base leading-6.5 text-[var(--t2)]">
          따로 만들고, 필요할 때 이어 붙이세요.
        </p>
        <div className="flex flex-col gap-2.5">
          <Button variant="primary" size="lg" href="/projects" className="h-13">
            시작하기
          </Button>
          <Button size="lg" href="/projects" className="h-13">
            예시로 둘러보기
          </Button>
        </div>
        <span className="mt-4 text-center text-xs text-[var(--t3)]">
          로그인 없이 이 기기에 저장돼요
        </span>
      </div>
      {/* 웹 (보드 00) */}
      <div className="flex min-h-dvh flex-col bg-[var(--cover-bg)] text-[var(--text)] max-lg:hidden">
        <header className="flex h-18 items-center px-4 md:px-8 lg:px-16">
          <BrandLogo />
          <span className="flex-1" />
          <Button variant="ghost" size="sm" href="/projects">
            이어서 하기
          </Button>
        </header>

        <main className="grid flex-1 items-center gap-10 px-4 py-10 md:px-8 lg:grid-cols-2 lg:pr-16 lg:pl-30">
          <div className="flex max-w-130 flex-col gap-7">
            <span className="text-xs font-semibold tracking-[0.04em] text-[var(--t3)]">
              PERSONAL RECORD · v1
            </span>
            <h1 className="text-4xl font-bold tracking-[-0.035em] md:text-6xl">
              조각을 이어,
              <br />
              나의 기록으로
            </h1>
            <p className="text-lg leading-7.5 text-[var(--t2)]">
              프로젝트 · 목표 · 태스크 · 메모를 따로 만들고,
              <br className="max-md:hidden" />
              필요할 때 이어 붙이세요. 하루하루가 한 조각씩 쌓여요.
            </p>
            <div className="mt-1 flex flex-wrap gap-3">
              <Button variant="primary" size="lg" href="/projects">
                시작하기
                <ChevronRight size={18} aria-hidden />
              </Button>
              <Button size="lg" href="/projects">
                예시로 둘러보기
              </Button>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--t3)]">
              <Info size={14} aria-hidden />
              로그인 없이 이 기기에 저장돼요
            </span>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-150">{hero}</div>
          </div>
        </main>

        <footer className="grid gap-6 border-t border-[var(--cover-line)] px-4 pt-7 pb-10 md:grid-cols-3 md:gap-12 md:px-8 lg:px-30">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="flex min-w-0 flex-col gap-2">
              <span aria-hidden className="inline-flex gap-0.75">
                {feature.colors.map((color, index) => (
                  <i
                    key={`${color}-${index}`}
                    className="block size-3 rounded-[var(--radius-bar)]"
                    style={{ background: projectColorVar(color, "fixed") }}
                  />
                ))}
              </span>
              <strong className="text-base">{feature.title}</strong>
              <span className="text-sm leading-5.5 text-[var(--t2)]">{feature.text}</span>
            </div>
          ))}
        </footer>
      </div>
    </>
  );
}
