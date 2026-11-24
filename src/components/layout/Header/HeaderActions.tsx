"use client";

import Link from "next/link";
import { createContext, useContext, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { buttonIconHitClassName } from "@/components/ui/button/buttonSize";
import DropdownMenu, { DropdownMenuLink } from "@/components/ui/DropdownMenu";
import { AppIcon, type LucideIcon } from "@/components/ui/icon";

type HeaderActionsContextValue = {
  slot: HTMLElement | null;
  setSlot: (slot: HTMLElement | null) => void;
};

const HeaderActionsContext = createContext<HeaderActionsContextValue | null>(null);

/**
 * HeaderActionsProvider
 *
 * 페이지가 헤더 오른쪽 버튼을 같은 자리에 넣을 수 있게 슬롯을 공유합니다.
 *
 * @param props - HeaderActionsProvider 컴포넌트 Props
 * @param props.children - 헤더와 페이지
 */
export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  return (
    <HeaderActionsContext.Provider value={{ slot, setSlot }}>
      {children}
    </HeaderActionsContext.Provider>
  );
}

/**
 * HeaderActionsSlot
 *
 * 헤더 오른쪽에 페이지 버튼을 그리는 자리입니다.
 * 버튼이 없으면 자리를 비워 둡니다.
 */
export function HeaderActionsSlot() {
  const context = useContext(HeaderActionsContext);

  if (!context) {
    return null;
  }

  const { setSlot } = context;

  return <div ref={setSlot} className="flex shrink-0 items-center empty:hidden lg:gap-2" />;
}

/**
 * HeaderActions
 *
 * 현재 페이지의 버튼을 헤더 오른쪽에 붙입니다.
 * 다른 페이지에서도 같은 자리에 버튼을 넣을 수 있습니다.
 *
 * @param props - HeaderActions 컴포넌트 Props
 * @param props.children - 헤더 오른쪽에 표시할 버튼
 */
export function HeaderActions({ children }: { children: ReactNode }) {
  const context = useContext(HeaderActionsContext);

  if (!context?.slot) {
    return null;
  }

  return createPortal(children, context.slot);
}

/**
 * headerIconButtonClassName
 *
 * 헤더의 아이콘 버튼. 데스크톱은 흰 배경과 테두리, 태블릿·모바일(lg 미만)은 테두리 없는 아이콘입니다.
 * 메뉴가 열린 햄버거 버튼은 기본 색으로 바꿉니다.
 *
 * @param pressed - 버튼이 열린 상태인지 여부
 * @returns 헤더 아이콘 버튼 클래스
 */
export function headerIconButtonClassName(pressed = false) {
  return `
    ${buttonIconHitClassName}

    inline-flex
    size-9
    shrink-0
    cursor-pointer
    items-center
    justify-center

    rounded-[var(--radius-sm)]

    border

    transition-colors

    active:border-transparent
    active:bg-[var(--color-primary)]
    active:text-[var(--color-text-inverse)]

    ${
      pressed
        ? `
          border-transparent
          bg-[var(--color-primary)]
          text-[var(--color-text-inverse)]

          hover:bg-[var(--color-primary-hover)]
          hover:text-[var(--color-text-inverse)]
        `
        : `
          border-[var(--color-border)]
          bg-[var(--color-surface)]
          text-[var(--color-text)]

          hover:bg-[var(--color-hover-soft)]

          max-lg:border-transparent
          max-lg:bg-transparent
          max-lg:hover:bg-[var(--color-hover)]
        `
    }
  `;
}

const headerActionClassName = `
  ${buttonIconHitClassName}

  inline-flex
  h-9
  w-9
  shrink-0
  items-center
  justify-center
  gap-1.5

  rounded-[var(--radius-sm)]

  border

  text-sm
  leading-5
  font-medium
  whitespace-nowrap

  transition-colors

  lg:w-auto
  lg:px-3.5
`;

const headerActionToneClassName = {
  default: `
    border-[var(--color-border)]
    bg-[var(--color-surface)]
    text-[var(--color-text)]

    hover:bg-[var(--color-hover-soft)]

    max-lg:border-transparent
    max-lg:bg-transparent
    max-lg:hover:bg-[var(--color-hover)]
  `,
  primary: `
    lg:!h-[34px]

    border-transparent
    bg-primary-gradient
    header-action-primary
    text-[var(--color-text-inverse)]
  `,
};

type HeaderActionTone = keyof typeof headerActionToneClassName;

type HeaderActionLinkProps = {
  href: string;
  label: string;
  icon?: LucideIcon;
  tone?: HeaderActionTone;
  className?: string;
  disabled?: boolean;
  title?: string;
};

/**
 * HeaderActionLink
 *
 * 헤더 오른쪽 자리에 두는 페이지 이동 버튼입니다.
 * 좁은 화면에서는 아이콘만 보여 전체 메뉴와 나란히 둡니다.
 *
 * @param props - HeaderActionLink 컴포넌트 Props
 * @param props.href - 이동할 경로
 * @param props.label - 버튼 이름
 * @param props.icon - 버튼 앞 아이콘. 없으면 이름만 표시합니다
 * @param props.tone - 버튼 색. 새로 추가하는 버튼은 primary
 * @param props.className - 버튼에 더할 클래스
 */
export function HeaderActionLink({
  href,
  label,
  icon,
  tone = "default",
  className = "",
  disabled = false,
  title = label,
}: HeaderActionLinkProps) {
  const content = (
    <>
      {icon ? <AppIcon icon={icon} size="md" /> : null}
      <span className={icon ? "hidden lg:inline" : undefined}>{label}</span>
    </>
  );
  const actionClassName = `
    ${headerActionClassName}
    ${icon ? "" : "w-auto! px-3.5!"}
    ${headerActionToneClassName[tone]}
    ${disabled ? "cursor-not-allowed opacity-50" : ""}
    ${className}
  `;

  if (disabled) {
    return (
      <button type="button" disabled aria-label={label} title={title} className={actionClassName}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href} aria-label={label} title={title} className={actionClassName}>
      {content}
    </Link>
  );
}

type HeaderActionButtonProps = {
  label: string;
  icon?: LucideIcon;
  tone?: HeaderActionTone;
  className?: string;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
};

/**
 * HeaderActionButton
 *
 * 헤더 오른쪽 자리에 두는 버튼입니다.
 * 페이지 이동 없이 현재 화면에서 드로어나 모달을 엽니다.
 *
 * @param props - HeaderActionButton 컴포넌트 Props
 * @param props.label - 버튼 이름
 * @param props.icon - 버튼 앞 아이콘. 없으면 이름만 표시합니다
 * @param props.tone - 버튼 색. 새로 추가하는 버튼은 primary
 * @param props.className - 버튼에 더할 클래스
 * @param props.disabled - 버튼을 누를 수 없는지 여부
 * @param props.title - 버튼 툴팁. 없으면 버튼 이름을 씁니다
 * @param props.onClick - 버튼을 눌렀을 때 실행되는 함수
 */
export function HeaderActionButton({
  label,
  icon,
  tone = "default",
  className = "",
  disabled = false,
  title = label,
  onClick,
}: HeaderActionButtonProps) {
  const content = (
    <>
      {icon ? <AppIcon icon={icon} size="md" /> : null}
      <span className={icon ? "hidden lg:inline" : undefined}>{label}</span>
    </>
  );
  const actionClassName = `
    ${headerActionClassName}
    ${icon ? "" : "w-auto! px-3.5!"}
    ${headerActionToneClassName[tone]}
    ${disabled ? "cursor-not-allowed opacity-50" : ""}
    ${className}
  `;

  return (
    <button
      type="button"
      aria-label={label}
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={actionClassName}
    >
      {content}
    </button>
  );
}

type HeaderMoreMenuItem = {
  href: string;
  label: string;
  icon?: LucideIcon;
};

type HeaderMoreMenuProps = {
  label: string;
  items: HeaderMoreMenuItem[];
  className?: string;
};

/**
 * HeaderMoreMenu
 *
 * 모바일 헤더의 점 세 개 버튼을 누르면 페이지 메뉴를 엽니다.
 * 다른 페이지에서도 같은 버튼에 항목만 바꿔 쓸 수 있습니다.
 *
 * @param props - HeaderMoreMenu 컴포넌트 Props
 * @param props.label - 버튼을 설명하는 이름
 * @param props.items - 메뉴에 넣을 이동 항목
 * @param props.className - 메뉴에 더할 클래스
 */
export function HeaderMoreMenu({ label, items, className = "" }: HeaderMoreMenuProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <DropdownMenu
        label={label}
        triggerClassName={headerIconButtonClassName()}
        panelClassName="z-40"
      >
        {(close) =>
          items.map((item) => (
            <DropdownMenuLink
              key={`${item.href}-${item.label}`}
              href={item.href}
              icon={item.icon}
              onClick={close}
            >
              {item.label}
            </DropdownMenuLink>
          ))
        }
      </DropdownMenu>
    </div>
  );
}
