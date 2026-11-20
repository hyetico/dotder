"use client";

import { AppIcon, Check } from "@/components/ui/icon";
import {
  projectWizardSteps,
  type ProjectWizardStepId,
} from "@/features/projects/constants/projectWizardSteps";

const circleClassName =
  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-body font-semibold transition-colors";
const circleDoneClassName = `${circleClassName} bg-primary-gradient text-white`;
const circleTodoClassName = `${circleClassName} bg-[var(--color-hover-strong)] text-[var(--color-text-muted)]`;
const lineClassName = "absolute top-[15px] left-1/2 h-0.5 w-full transition-colors";

/**
 * WizardStepper
 *
 * 태블릿과 웹에서 3단계 진행 위치를 원과 선으로 보여줍니다.
 * 이미 지난 단계는 눌러서 돌아갈 수 있습니다.
 *
 * @param props - WizardStepper 컴포넌트 Props
 * @param props.current - 지금 보고 있는 단계
 * @param props.onStepClick - 지난 단계를 눌렀을 때 실행되는 함수
 */
function WizardStepper({
  current,
  onStepClick,
}: {
  current: ProjectWizardStepId;
  onStepClick: (step: ProjectWizardStepId) => void;
}) {
  return (
    <ol className="mx-auto hidden w-full max-w-[600px] grid-cols-3 md:grid">
      {projectWizardSteps.map((step, index) => {
        const isDone = step.id < current;

        const isCurrent = step.id === current;

        const isLast = index === projectWizardSteps.length - 1;

        const circle = isDone ? <AppIcon icon={Check} size="md" /> : step.id;

        return (
          <li
            key={step.id}
            aria-current={isCurrent ? "step" : undefined}
            className="relative flex flex-col items-center gap-2"
          >
            {isLast ? null : (
              <span
                aria-hidden
                className={`${lineClassName} ${
                  isDone ? "bg-[var(--color-primary)]" : "bg-[var(--color-hover-strong)]"
                }`}
              />
            )}

            {isDone ? (
              <button
                type="button"
                aria-label={`${step.label} 단계로 돌아가기`}
                onClick={() => onStepClick(step.id)}
                className={circleDoneClassName}
              >
                {circle}
              </button>
            ) : (
              <span className={isCurrent ? circleDoneClassName : circleTodoClassName}>
                {circle}
              </span>
            )}

            <span
              className={`text-body ${
                isCurrent
                  ? "font-semibold text-[var(--color-text)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * WizardProgressBar
 *
 * 태블릿과 웹에서 단계 설명과 진행률을 막대로 보여줍니다.
 *
 * @param props - WizardProgressBar 컴포넌트 Props
 * @param props.current - 지금 보고 있는 단계
 */
function WizardProgressBar({ current }: { current: ProjectWizardStepId }) {
  const step = projectWizardSteps[current - 1];

  const percent = Math.round((current / projectWizardSteps.length) * 100);

  return (
    <div className="hidden md:block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-body font-semibold text-[var(--color-text)]">
          {current} / {projectWizardSteps.length} 단계 · {step.progressLabel}
        </p>

        <span className="text-body font-semibold text-[var(--color-text)] tabular-nums">
          {percent}%
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-label="프로젝트 추가 진행률"
        className="h-2 overflow-hidden rounded-full bg-[var(--color-hover-strong)]"
      >
        <div
          className="bg-primary-gradient h-full rounded-full transition-[width] duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/**
 * WizardMobileProgress
 *
 * 모바일에서 단계 이름과 3칸짜리 진행 막대를 보여줍니다.
 *
 * @param props - WizardMobileProgress 컴포넌트 Props
 * @param props.current - 지금 보고 있는 단계
 */
function WizardMobileProgress({ current }: { current: ProjectWizardStepId }) {
  const step = projectWizardSteps[current - 1];

  return (
    <div className="md:hidden">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-section-title text-[var(--color-text)]">{step.mobileLabel}</h2>

        <span className="text-body font-semibold text-[var(--color-text)] tabular-nums">
          {current} / {projectWizardSteps.length}
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={projectWizardSteps.length}
        aria-valuenow={current}
        aria-label="프로젝트 추가 진행 단계"
        className="grid grid-cols-3 gap-1.5"
      >
        {projectWizardSteps.map((item) => (
          <span
            key={item.id}
            className={`h-1.5 rounded-full transition-colors ${
              item.id <= current ? "bg-primary-gradient" : "bg-[var(--color-hover-strong)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * WizardProgress
 *
 * 새 프로젝트 추가 화면의 제목 아래 진행 표시입니다.
 * 모바일은 단계 이름과 막대, 태블릿과 웹은 단계 원과 진행률 막대를 보여줍니다.
 *
 * @param props - WizardProgress 컴포넌트 Props
 * @param props.current - 지금 보고 있는 단계
 * @param props.onStepClick - 지난 단계를 눌렀을 때 실행되는 함수
 */
export function WizardProgress({
  current,
  onStepClick,
}: {
  current: ProjectWizardStepId;
  onStepClick: (step: ProjectWizardStepId) => void;
}) {
  return (
    <div className="flex flex-col gap-6 md:gap-5">
      <WizardStepper current={current} onStepClick={onStepClick} />

      <WizardProgressBar current={current} />

      <WizardMobileProgress current={current} />
    </div>
  );
}
