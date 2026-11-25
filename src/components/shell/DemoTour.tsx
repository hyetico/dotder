"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/kit/Button";
import Coachmark from "@/components/kit/Coachmark";
import Modal from "@/components/kit/Modal";
import TourBanner from "@/components/kit/TourBanner";
import { setDemoStep, useDemoStep, type DemoStep } from "@/components/shell/demoTourStore";

import { clearExampleData } from "@/features/projects/api/projects";
import BrandLogo from "@/features/start/BrandLogo";

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
 * 예시는 목업 데이터를 그대로 쓰고, 시작 선택에서 지우거나 메인 프로젝트 하나만 남긴다.
 */
export default function DemoTour() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const step = useDemoStep();
  const fromCover = searchParams.get("demo") === "1";

  // 주소의 ?demo=1은 시작 신호로만 쓰고 지운다 (보드 E01 주소)
  useEffect(() => {
    if (fromCover) {
      setDemoStep(1);
      router.replace(pathname, { scroll: false });
    }
  }, [fromCover, pathname, router]);

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

  const start = async (keepMain: boolean) => {
    await clearExampleData(keepMain);
    setDemoStep(null);
    await queryClient.invalidateQueries();
    router.push("/projects");
  };

  if (step == null) {
    return null;
  }

  const coach = step >= 1 && step <= 3 ? STEPS[step as 1 | 2 | 3] : null;

  return (
    <>
      <TourBanner
        text="예시 데이터로 둘러보는 중이에요"
        detail="바꿔도 내 기록에는 남지 않아요"
        secondaryLabel="둘러보기 끝내기"
        onSecondary={() => setDemoStep(null)}
        primaryLabel="내 기록 시작하기"
        onPrimary={() => go(4, pathname)}
      />
      {coach && coach.path.test(pathname) ? (
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
        title="이제 내 기록을 시작해 볼까요?"
        header={<span />}
      >
        <div className="flex flex-col items-center gap-3 px-4 pt-6 text-center">
          <BrandLogo />
          <span className="text-xs font-semibold text-[var(--t3)]">4 / 4</span>
          <h2 className="text-xl font-semibold">이제 내 기록을 시작해 볼까요?</h2>
          <p className="text-sm text-[var(--t2)]">
            예시는 지우고 빈 화면에서 시작하거나, 참고용으로 ‘예시’ 프로젝트 하나만 남길 수 있어요.
          </p>
        </div>
        <div className="flex flex-col gap-2 px-4 pt-4 pb-3">
          <Button variant="primary" size="lg" onClick={() => void start(false)}>
            예시 지우고 시작하기
          </Button>
          <Button size="lg" onClick={() => void start(true)}>
            예시 1개 남기고 시작하기
          </Button>
        </div>
      </Modal>
    </>
  );
}
