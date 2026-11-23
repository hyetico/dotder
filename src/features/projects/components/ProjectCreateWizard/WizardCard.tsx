"use client";

import { type ReactNode } from "react";

import BottomAppBar from "@/components/layout/pages/CreatePage/BottomAppBar";
import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";

import {
  projectWizardLastStep,
  type ProjectWizardStepId,
} from "@/features/projects/constants/projectWizardSteps";

const cardClassName =
  "min-h-[calc(100dvh-var(--header-height)-var(--bottom-app-bar-height)-6.5rem)] flex-1 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)] md:max-h-[560px] md:min-h-[460px]";
const cardSingleClassName = "md:flex md:flex-col";
const cardSplitClassName =
  "md:grid md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)]";
const introClassName =
  "hidden flex-col items-center justify-center gap-6 border-r border-[var(--color-border)] px-6 py-8 text-center md:flex";
const barButtonClassName =
  "min-w-0! flex-1! basis-0! shrink! justify-center md:w-auto md:flex-none! md:basis-auto! md:shrink-0!";

type WizardBottomBarProps = {
  step: ProjectWizardStepId;
  isSubmitting: boolean;
  canProceed: boolean;
  submitLabel: string;
  onCancel: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
};

/**
 * getWizardPrimaryLabel
 *
 * 단계별 주요 버튼 문구를 정합니다. 마지막 단계는 저장 문구, 저장 중에는 진행 문구를 씁니다.
 *
 * @param step - 지금 보고 있는 단계
 * @param isSubmitting - 저장 중인지 여부
 * @param submitLabel - 마지막 단계 저장 버튼 문구
 * @returns 주요 버튼 문구
 */
function getWizardPrimaryLabel(
  step: ProjectWizardStepId,
  isSubmitting: boolean,
  submitLabel: string,
) {
  if (step !== projectWizardLastStep) {
    return "다음";
  }

  return isSubmitting ? "저장 중..." : submitLabel;
}

/**
 * WizardBottomBar
 *
 * 화면 아래 앱 바에 취소, 이전, 다음(저장) 버튼을 둡니다.
 * 첫 단계는 취소와 다음, 이후 단계는 웹에서 취소·이전·다음, 모바일에서는 이전과 다음을 보여줍니다.
 *
 * @param props - WizardBottomBar 컴포넌트 Props
 * @param props.step - 지금 보고 있는 단계
 * @param props.isSubmitting - 저장 중인지 여부
 * @param props.canProceed - 지금 단계의 필수 입력이 끝나 다음으로 갈 수 있는지 여부
 * @param props.submitLabel - 마지막 단계 저장 버튼 문구
 * @param props.onCancel - 취소할 때 실행되는 함수
 * @param props.onPrev - 이전 단계로 돌아갈 때 실행되는 함수
 * @param props.onNext - 다음 단계로 넘어갈 때 실행되는 함수
 * @param props.onSubmit - 마지막 단계에서 저장할 때 실행되는 함수
 */
export function WizardBottomBar({
  step,
  isSubmitting,
  canProceed,
  submitLabel,
  onCancel,
  onPrev,
  onNext,
  onSubmit,
}: WizardBottomBarProps) {
  const isFirst = step === 1;

  const isLast = step === projectWizardLastStep;

  return (
    <BottomAppBar>
      <SecondaryButton
        size="md"
        onClick={onCancel}
        disabled={isSubmitting}
        className={`${barButtonClassName}${isFirst ? "" : " max-md:hidden"}`}
      >
        취소
      </SecondaryButton>

      {isFirst ? null : (
        <SecondaryButton
          size="md"
          onClick={onPrev}
          disabled={isSubmitting}
          className={barButtonClassName}
        >
          이전
        </SecondaryButton>
      )}

      <PrimaryButton
        size="md"
        onClick={isLast ? onSubmit : onNext}
        disabled={isSubmitting || !canProceed}
        className={barButtonClassName}
      >
        {getWizardPrimaryLabel(step, isSubmitting, submitLabel)}
      </PrimaryButton>
    </BottomAppBar>
  );
}

/**
 * WizardCard
 *
 * 한 단계의 입력 내용을 담는 흰 카드입니다.
 * 웹에서 왼쪽에 소개 그림과 설명을 두고, 오른쪽에 입력 내용을 둡니다.
 * 소개가 없으면 카드 전체를 입력 내용에 씁니다. 모바일에서는 소개를 숨깁니다.
 *
 * @param props - WizardCard 컴포넌트 Props
 * @param props.intro - 왼쪽 소개 그림. 없으면 단일 칸 카드
 * @param props.introTitle - 소개 제목
 * @param props.introDescription - 소개 설명
 * @param props.children - 단계별 입력 내용
 */
export function WizardCard({
  intro,
  introTitle,
  introDescription,
  children,
}: {
  intro?: ReactNode;
  introTitle?: string;
  introDescription?: string;
  children: ReactNode;
}) {
  const body = (
    <div className="flex min-h-0 min-w-0 flex-col md:flex-1">
      <div className="flex-1 p-4 md:min-h-0 md:overflow-y-auto md:px-6 md:py-5">{children}</div>
    </div>
  );

  if (!intro) {
    return <div className={`${cardClassName} ${cardSingleClassName}`}>{body}</div>;
  }

  return (
    <div className={`${cardClassName} ${cardSplitClassName}`}>
      <div className={introClassName}>
        {intro}

        <div>
          <h2 className="text-section-title text-[var(--color-text)]">{introTitle}</h2>

          <p className="text-body mt-2 text-[var(--color-text-secondary)]">{introDescription}</p>
        </div>
      </div>

      {body}
    </div>
  );
}
