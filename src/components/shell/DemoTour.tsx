"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import Coachmark from "@/components/kit/Coachmark";
import Modal from "@/components/kit/Modal";
import TourBanner from "@/components/kit/TourBanner";
import { setDemoStep, useDemoStep, type DemoStep } from "@/components/shell/demoTourStore";

import { startMyRecords } from "@/features/projects/api/projects";
import BrandLogo from "@/features/start/BrandLogo";
import { useHasSavedData } from "@/features/start/CoverActions";

import { clearProjectPreferences } from "@/lib/projectSwitcherPreferences";
import { hasSavedData } from "@/lib/storage/dotderData";
import { setMode, useMode } from "@/lib/storage/dotderMode";

// 보드 E01 코치마크 3개 (4번째는 시작 선택 창). 글은 지금 앱이 하는 일만 남겼다 (보고에 적음)
const STEPS: Record<1 | 2 | 3, { path: RegExp; target: string; title: string; text: string }> = {
  1: {
    path: /^\/projects$/,
    target: '[data-tour="project-card"]',
    title: "프로젝트는 폴더 카드예요",
    text: "색 · 상태 · 기간과 활동 모자이크가 한 장에 보여요. 조각이 클수록 그날 많이 했다는 뜻이에요.",
  },
  2: {
    path: /^\/projects\/\d+$/,
    target: '[data-tour="piece-bar"]',
    title: "태스크 하나가 조각 하나",
    text: "채워진 칸은 완료, 빨간 테두리는 마감 지남이에요.",
  },
  3: {
    path: /^\/tasks$/,
    target: '[data-tour="quick-add"]',
    title: "Enter 한 번으로 추가",
    text: "프로젝트 없이 적어도 괜찮아요.",
  },
};

/**
 * 예시로 둘러보기 (보드 E01). 커버 「예시로 둘러보기」 → `/projects?demo=1`.
 * 위 띠 44(끝내기 · 내 기록 시작하기) + 코치마크 3개(폴더 카드 → 조각 바 → 빠른 추가) → 시작 선택.
 * 둘러보는 동안은 예시 모드(`demo`)라 예시 목업을 새로 불러오고 저장하지 않는다. 띠는 예시 모드에서만 보인다.
 * 4 / 4에서 [시작하기]로 내 기록(비어 있으면 빈 상태)으로 간다. 예시는 내 기록에 들어오지 않는다.
 */
export default function DemoTour() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const step = useDemoStep();
  const isDemo = useMode() === "demo";
  const hasSaved = useHasSavedData(step === 4);
  const fromCover = searchParams.get("demo") === "1";

  // 주소의 ?demo=1은 시작 신호로만 쓰고 지운다 (보드 E01 주소)
  useEffect(() => {
    if (fromCover) {
      // 예시는 늘 새로 시작한다 (예시 즐겨찾기 · 최근도 비움)
      setMode("demo");
      clearProjectPreferences();
      setDemoStep(1);
      void queryClient.invalidateQueries();
      router.replace(pathname, { scroll: false });
    }
  }, [fromCover, pathname, queryClient, router]);

  const go = (next: DemoStep, path: string) => {
    setDemoStep(next);
    if (pathname !== path) {
      router.push(path);
    }
  };

  const next = () => {
    if (step === 1) {
      const href = document
        .querySelector('[data-tour="project-card"] a[href^="/projects/"]')
        ?.getAttribute("href");
      go(2, href ?? "/projects");
    } else if (step === 2) {
      go(3, "/tasks");
    } else if (step === 3) {
      go(4, "/projects");
    }
  };

  const start = async () => {
    await startMyRecords();
    setDemoStep(null);
    await queryClient.invalidateQueries();
    router.push("/projects");
  };

  // 내 기록이 있으면 내 기록 목록으로, 없으면 첫 화면으로
  const end = async () => {
    const saved = await hasSavedData();
    setMode("mine");
    setDemoStep(null);
    await queryClient.invalidateQueries();
    router.push(saved ? "/projects" : "/");
  };

  if (!isDemo) {
    return null;
  }

  const coach = step != null && step >= 1 && step <= 3 ? STEPS[step as 1 | 2 | 3] : null;

  return (
    <>
      <TourBanner
        text="예시 데이터로 둘러보는 중이에요"
        detail="바꿔도 내 기록에는 남지 않아요"
        shortText="예시 둘러보는 중"
        secondaryLabel="둘러보기 끝내기"
        onSecondary={() => void end()}
        primaryLabel="내 기록 시작하기"
        onPrimary={() => go(4, pathname)}
      />
      {step != null && coach && coach.path.test(pathname) ? (
        <Coachmark
          key={step}
          target={coach.target}
          step={step}
          total={4}
          title={coach.title}
          text={coach.text}
          onNext={next}
          onSkip={() => setDemoStep(0)}
        />
      ) : null}
      <Modal
        isOpen={step === 4}
        onClose={() => setDemoStep(0)}
        title={hasSaved ? "내 기록으로 돌아갈까요?" : "이제 내 기록을 시작해 볼까요?"}
        header={<span />}
      >
        <div className="flex flex-col items-center gap-3 px-4 pt-6 text-center">
          <BrandLogo />
          <span className="text-xs font-semibold text-[var(--t3)]">4 / 4</span>
          <h2 className="text-xl font-semibold">
            {hasSaved ? "내 기록으로 돌아갈까요?" : "이제 내 기록을 시작해 볼까요?"}
          </h2>
          {hasSaved ? null : (
            <p className="text-sm text-[var(--t2)]">예시는 커버에서 언제든 다시 볼 수 있어요.</p>
          )}
        </div>
        <div className="flex flex-col gap-2 px-4 pt-4 pb-3">
          {/* 예시는 내 기록에 넣지 않는다. 이미 내 기록이 있으면 덮어쓰지 않고 돌아가기만 */}
          <Button variant="primary" size="lg" onClick={() => void start()}>
            {hasSaved ? "내 기록으로 돌아가기" : "시작하기"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
