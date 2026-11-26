"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import Button, { type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { Check, MoreHorizontal } from "@/components/ui/icon";
import Popover from "@/components/ui/Popover";

import { cn } from "@/lib/cn";

// 보드 .mi: 최소 36 · 모서리 8 · 14 --text (메뉴 줄 좌우 · 사이 10, 고르는 줄 8), 호버 · 고름 --s3. 모바일(터치)은 최소 52 (보드 M 03-e 시트).
const rowClassName =
  "kit-focus flex min-h-9 w-full cursor-pointer items-center rounded-[var(--radius-sm)] text-left text-sm transition-colors duration-120 hover:bg-[var(--s3)] focus-visible:bg-[var(--s3)] max-md:min-h-13";

type MenuItemProps = {
  onSelect: () => void;
  icon?: ReactNode;
  /** 오른쪽 작은 글 (단축키 등, 12 --t3) */
  hint?: ReactNode;
  /** 이름 아래 설명 (12/18 --t3 · 보드 03-e 「메인 프로젝트로 지정」) */
  help?: ReactNode;
  /** 지우기 같은 위험한 일 (--bad) */
  danger?: boolean;
  disabled?: boolean;
  children: ReactNode;
};

/** 메뉴 한 줄 (보드 .mi). 아이콘 16 · 오른쪽 작은 글. */
export function MenuItem({
  onSelect,
  icon,
  hint,
  help,
  danger,
  disabled,
  children,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        rowClassName,
        // 메뉴 줄은 좌우 10 · 사이 10 (프로토타입 .it · 보드 03-e)
        "gap-2.5 px-2.5",
        // 글자색은 한 번만 준다 (둘 다 주면 빨강이 덮일 수 있다)
        danger ? "text-[var(--bad)]" : "text-[var(--text)]",
        "disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      {icon ? <span className="inline-flex shrink-0 [&_svg]:size-4">{icon}</span> : null}
      {help ? (
        <span className="flex min-w-0 flex-1 flex-col py-1.5">
          {children}
          <span className="text-xs text-[var(--t3)]">{help}</span>
        </span>
      ) : (
        <span className="min-w-0 flex-1">{children}</span>
      )}
      {hint ? <span className="ml-auto text-xs text-[var(--t3)]">{hint}</span> : null}
    </button>
  );
}

/** 메뉴 묶음 제목 (보드 .mh). 12/18 600 --t3. */
export function MenuHeader({ children }: { children: ReactNode }) {
  return <div className="px-2 pt-2 pb-1 text-xs font-semibold text-[var(--t3)]">{children}</div>;
}

/** 메뉴 구분선 (보드 .sep). 1 --divider · 위아래 4. */
export function MenuSeparator() {
  return <div role="separator" className="my-1 h-px bg-[var(--divider)]" />;
}

type PickRowProps = {
  selected: boolean;
  onSelect: () => void;
  /** 이름 앞 표시 (프로젝트 점 · 왕관 · 빈 원). 이름 첫 줄 가운데에 맞춘다 */
  leading?: ReactNode;
  children: ReactNode;
};

/**
 * 고르는 목록 줄 (보드 .mi · 프로토타입 selItem · C-16). 이름은 자르지 않고 줄바꿈하며,
 * 고른 줄은 오른쪽에 체크. 표시(점 · 왕관)가 있으면 위 맞춤 · 위아래 7(모바일 11).
 *
 * @example
 * <PickRow selected={id === value} onSelect={() => pick(id)} leading={<ProjectDot color={color} />}>{name}</PickRow>
 */
export function PickRow({ selected, onSelect, leading, children }: PickRowProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        rowClassName,
        "gap-2 px-2 text-[var(--text)]",
        leading != null && "items-start py-1.75 max-md:py-2.75",
      )}
    >
      {leading ? <span className="flex h-5.5 shrink-0 items-center">{leading}</span> : null}
      <span className="min-w-0 flex-1 leading-5.5 [overflow-wrap:anywhere] break-keep">
        {children}
      </span>
      {selected ? (
        <Check size={16} aria-hidden className={cn("shrink-0", leading != null && "mt-0.75")} />
      ) : null}
    </button>
  );
}

type MoreMenuProps = {
  /** 읽는 이름. 예: "‘스토어 출시 준비’ 메뉴" */
  label: string;
  /** 버튼 크기. 카드 제목 줄은 xs 28 (REBUILD 6-1) */
  size?: ButtonSize;
  /** 카드 제목 줄: 본문 글자색 · 투명도 0.7 (보드 01) */
  onCard?: boolean;
  /** 버튼 모양. 상세 헤더(웹)는 secondary (보드 03) */
  variant?: ButtonVariant;
  /** 메뉴 너비. 기본 220, 설명 줄이 있는 상세 메뉴는 280 (보드 03-e) */
  width?: 220 | 280;
  /** 모바일 시트 제목. 없으면 `label` (보드 M 03-e 「프로젝트」) */
  title?: string;
  /** 메뉴 내용. `close`를 불러 닫는다 */
  children: (close: () => void) => ReactNode;
};

/**
 * ⋯ 메뉴 (보드 03-e · 프로토타입 pmenu). ghost 아이콘 버튼 + 메뉴 팝오버(220, 끝 맞춤),
 * ↑ ↓로 줄을 옮기고 Esc로 닫는다. 모바일은 아래 시트.
 *
 * @example
 * <MoreMenu label="프로젝트 메뉴" size="xs">{(close) => <MenuItem onSelect={() => { open(); close(); }}>열기</MenuItem>}</MoreMenu>
 */
export function MoreMenu({
  label,
  size = "xs",
  onCard = false,
  variant = "ghost",
  width = 220,
  title,
  children,
}: MoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const close = () => setIsOpen(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();
    const items = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)'),
    ];
    const index = items.indexOf(document.activeElement as HTMLElement);
    const step = event.key === "ArrowDown" ? 1 : -1;
    items[(index + step + items.length) % items.length]?.focus();
  };

  return (
    <>
      <Button
        ref={buttonRef}
        variant={onCard ? "ghostText" : variant}
        size={size}
        className={onCard ? "opacity-70 hover:opacity-100" : undefined}
        iconOnly
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(event) => {
          // 카드 링크 안에 있어도 이동하지 않게 한다
          event.preventDefault();
          event.stopPropagation();
          setIsOpen((open) => !open);
        }}
      >
        <MoreHorizontal size={16} aria-hidden />
      </Button>
      <Popover
        isOpen={isOpen}
        onClose={close}
        anchorRef={buttonRef}
        title={title ?? label}
        role="menu"
        align="end"
        width={width}
        sheetBleed={false}
      >
        {/* 팝오버는 body로 옮겨 그리지만 React 이벤트는 부모로 올라가서, 카드 링크가 눌리지 않게 막는다 */}
        <div
          onKeyDown={handleKeyDown}
          onClick={(event) => event.stopPropagation()}
          className="flex flex-col"
        >
          {children(close)}
        </div>
      </Popover>
    </>
  );
}
