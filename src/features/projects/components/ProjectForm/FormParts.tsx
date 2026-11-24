"use client";

import { type ReactNode } from "react";

import { AppIcon, type LucideIcon } from "@/components/ui/icon";
import InfoTooltip, { type InfoTooltipItem } from "@/components/ui/InfoTooltip";

import { tooltipWidthClassName } from "@/features/projects/constants/projectFormDefaults";

/**
 * FormPageTitle
 *
 * 나뉜 폼 위에 화면 전체 제목과 설명을 표시합니다.
 *
 * @param props - FormPageTitle 컴포넌트 Props
 * @param props.title - 화면 제목
 * @param props.description - 제목 아래 설명
 */
export function FormPageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="hidden shrink-0 px-[var(--page-padding-x)] pt-6 pb-4 md:block">
      <h1 className="text-page-title text-[var(--color-text)]">{title}</h1>

      {description ? (
        <p className="text-body mt-1 text-[var(--color-text-secondary)]">{description}</p>
      ) : null}
    </div>
  );
}

/**
 * FormSectionIntro
 *
 * 프로젝트 폼의 구역 제목과 설명을 표시합니다.
 * 나뉜 화면은 아이콘 없이 제목과 설명을 표시합니다.
 *
 * @param props - FormSectionIntro 컴포넌트 Props
 * @param props.icon - 제목 왼쪽 아이콘. plain이면 쓰지 않습니다
 * @param props.title - 구역 제목
 * @param props.description - 넓은 화면 구역 설명
 * @param props.mobileDescription - 좁은 화면 구역 설명. 없으면 description을 씁니다
 * @param props.plain - 아이콘 없이 제목과 설명을 표시할지 여부
 * @param props.className - 구역 줄에 더할 클래스
 */
export function FormSectionIntro({
  icon,
  title,
  description,
  mobileDescription,
  plain = false,
  className = "",
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  mobileDescription?: string;
  plain?: boolean;
  className?: string;
}) {
  if (plain) {
    return (
      <div className={`shrink-0 ${className} `}>
        <h2>
          <span className="text-page-title text-[var(--color-text)] md:hidden">{title}</span>

          <span className="text-card-title hidden text-[var(--color-text)] md:inline">{title}</span>
        </h2>

        <p className="text-caption mt-1 text-[var(--color-text-secondary)] md:mt-0.5">
          <span className="md:hidden">{mobileDescription ?? description}</span>

          <span className="hidden md:inline">{description}</span>
        </p>
      </div>
    );
  }

  return (
    <div className={`shrink-0 items-start gap-2.5 ${className} `}>
      {icon ? (
        <AppIcon icon={icon} size="md" className="mt-0.5 shrink-0 text-[var(--color-text)]" />
      ) : null}

      <div className="min-w-0">
        <h2 className="text-card-title text-[var(--color-text)]">{title}</h2>

        <p className="text-caption mt-0.5 text-[var(--color-text-secondary)]">{description}</p>
      </div>
    </div>
  );
}

export function FormLabel({
  htmlFor,
  label,
  required = false,
  counter,
  accessory,
  guideItems,
  action,
  labelClassName = "text-body !font-semibold text-[var(--color-text)]",
}: {
  htmlFor?: string;
  label: string;
  required?: boolean;
  counter?: string;
  accessory?: ReactNode;
  guideItems?: InfoTooltipItem[];
  action?: ReactNode;
  labelClassName?: string;
}) {
  const labelAccessory = guideItems ? (
    <InfoTooltip title={label} items={guideItems} maxWidthClassName={tooltipWidthClassName} />
  ) : (
    accessory
  );

  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-1">
        <label htmlFor={htmlFor} className={labelClassName}>
          {label}

          {required ? <span className="ml-0.5 text-[var(--color-field-error)]">*</span> : null}
        </label>

        {labelAccessory}
      </div>

      {action ? (
        <div className="shrink-0">{action}</div>
      ) : counter ? (
        <span className="text-caption shrink-0 text-[var(--color-text-muted)]">{counter}</span>
      ) : null}
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p data-field-error className="text-caption mt-1.5 text-[var(--color-field-error)]">
      {message}
    </p>
  );
}
