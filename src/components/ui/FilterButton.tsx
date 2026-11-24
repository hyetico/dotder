"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import {
  AppIcon,
  CheckCircle2,
  Circle,
  Folder,
  LoaderCircle,
  PauseCircle,
  TriangleAlert,
  type LucideIcon,
} from "@/components/ui/icon";

import { getStatusColor, type StatusColorKey } from "@/lib/statusColors";

type FilterButtonProps = {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  count?: number;
  icon?: ReactNode;
  tone?: StatusColorKey;
  disabled?: boolean;
  size?: "sm" | "md";
  variant?: "solid" | "outline";
};

const STATUS_FILTER_ICONS: Record<StatusColorKey, LucideIcon> = {
  all: Folder,
  planned: Circle,
  inProgress: LoaderCircle,
  onHold: PauseCircle,
  done: CheckCircle2,
  delayed: TriangleAlert,
};

/**
 * StatusFilterIcon
 *
 * 상태 필터 버튼의 기본 아이콘을 그립니다.
 *
 * @param props - StatusFilterIcon 컴포넌트 Props
 * @param props.tone - 상태 컬러 키
 */
function StatusFilterIcon({ tone }: { tone: StatusColorKey }) {
  const Icon = STATUS_FILTER_ICONS[tone];

  return <AppIcon icon={Icon} size="md" />;
}

export default function FilterButton({
  selected,
  onClick,
  children,
  count,
  icon,
  tone,
  disabled = false,
  size = "sm",
  variant = "solid",
}: FilterButtonProps) {
  const color = tone ? getStatusColor("all") : null;

  const isSmall = size === "sm";
  const isOutline = variant === "outline";

  const style: CSSProperties | undefined = color
    ? ({
        "--filter-text": color.text,
        "--filter-bg": color.background,
        "--filter-hover-text": color.hoverText,
        "--filter-hover-bg": color.hoverBackground,
        "--filter-active-bg": color.activeBackground,
        "--filter-active-text": color.activeText,
      } as CSSProperties)
    : undefined;

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      style={style}
      className={
        isOutline
          ? `text-caption inline-flex h-8 max-h-8 min-h-8 shrink-0 items-center gap-1.5 self-center rounded-full border px-3 leading-5 font-medium whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${
              selected
                ? `bg-primary-gradient border-transparent text-[var(--color-text-inverse)] hover:shadow-none! active:shadow-none!`
                : `border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]`
            } `
          : color
            ? ` ${
                isSmall
                  ? "h-7 max-h-7 min-h-7 gap-1 px-2 text-xs"
                  : "h-9 max-h-9 min-h-9 gap-1.5 px-3 text-sm"
              } inline-flex shrink-0 items-center self-center rounded-full border-0 leading-5 font-medium whitespace-nowrap transition-[background-image,background-color,color] focus-visible:ring-2 focus-visible:ring-[var(--color-primary-ring)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 ${
                selected
                  ? `bg-primary-gradient text-[var(--color-text-inverse)] hover:shadow-none! active:shadow-none!`
                  : `bg-[var(--color-surface)] [background-image:var(--filter-bg)] text-[var(--filter-text)] hover:[background-image:var(--filter-hover-bg)] hover:text-[var(--filter-hover-text)]`
              } `
            : ` ${
                isSmall
                  ? "h-7 max-h-7 min-h-7 gap-1 px-2 text-xs"
                  : "text-caption h-9 max-h-9 min-h-9 gap-1.5 px-3"
              } inline-flex shrink-0 items-center self-center rounded-full font-medium whitespace-nowrap transition-colors ${
                selected
                  ? `bg-primary-gradient text-[var(--color-text-inverse)] hover:shadow-none! active:shadow-none!`
                  : `bg-[var(--color-hover-soft)] text-[var(--color-text-secondary)] hover:bg-[var(--color-hover-strong)]`
              } `
      }
    >
      {color && tone ? (
        <span
          className={`inline-flex shrink-0 items-center justify-center self-center ${
            isSmall ? "size-3.5 [&>svg]:size-3.5" : "size-4 [&>svg]:size-4"
          } `}
        >
          {icon ?? <StatusFilterIcon tone={tone} />}
        </span>
      ) : (
        icon
      )}

      {children}

      {count != null &&
        (color ? (
          <span>{count}</span>
        ) : (
          <span
            className={`text-caption inline-flex min-w-5 items-center justify-center rounded-full px-1.5 font-semibold ${
              selected
                ? "bg-[var(--color-text-inverse)]/20 text-[var(--color-text-inverse)]"
                : "bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
            } `}
          >
            {count}
          </span>
        ))}
    </button>
  );
}

/**
 * useFilterChipScroll
 *
 * 좁은 화면에서 필터를 한 줄로 두고 가로로 넘기게 합니다.
 * 선택된 버튼은 화면 안에 맞춥니다.
 *
 * @param enabled - 가로 스크롤을 사용할지 여부
 * @param children - 선택 상태가 바뀌었는지 다시 확인할 내용
 * @returns 스크롤 영역 ref
 */
function useFilterChipScroll(enabled: boolean, children: ReactNode) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;

    if (!el || !enabled) {
      return;
    }

    const frame = requestAnimationFrame(() => {
      const selected = el.querySelector<HTMLElement>('[aria-pressed="true"]');

      if (!selected) {
        return;
      }

      const scrollerBox = el.getBoundingClientRect();
      const chipBox = selected.getBoundingClientRect();
      const gutter = 12;

      if (chipBox.left < scrollerBox.left + gutter) {
        el.scrollLeft -= scrollerBox.left + gutter - chipBox.left;
      } else if (chipBox.right > scrollerBox.right - gutter) {
        el.scrollLeft += chipBox.right - (scrollerBox.right - gutter);
      }
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [children, enabled]);

  return scrollerRef;
}

/**
 * FilterButtonGroup
 *
 * 상태 필터 버튼을 둥근 테두리와 바탕 안에 감쌉니다.
 *
 * @param props - FilterButtonGroup 컴포넌트 Props
 * @param props.children - 안에 둘 필터 버튼
 * @param props.className - 영역에 더할 클래스
 * @param props.scrollable - 좁은 화면에서 한 줄 가로 스크롤을 사용할지 여부
 */
export function FilterButtonGroup({
  children,
  className = "",
  scrollable = true,
}: {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
}) {
  const scrollerRef = useFilterChipScroll(scrollable, children);
  const trayRef = useRef<HTMLDivElement>(null);
  const [rowHeight, setRowHeight] = useState<number>();

  useLayoutEffect(() => {
    if (!scrollable) {
      return;
    }

    const tray = trayRef.current;

    if (!tray) {
      return;
    }

    const update = () => {
      const next = tray.offsetHeight;

      setRowHeight((current) => (current === next ? current : next));
    };

    update();

    const observer = new ResizeObserver(update);

    observer.observe(tray);

    return () => {
      observer.disconnect();
    };
  }, [scrollable]);

  const tray = (
    <div
      ref={trayRef}
      className={`inline-flex items-center ${
        className.includes("gap-") ? "" : "gap-1"
      } rounded-full border border-[var(--color-border)] bg-[var(--color-hover-soft)] p-1 ${
        scrollable
          ? `!m-0 w-max flex-nowrap lg:w-auto lg:max-w-full lg:flex-wrap`
          : "max-w-full flex-wrap"
      } ${className} `}
    >
      {children}
    </div>
  );

  if (!scrollable) {
    return tray;
  }

  return (
    <div
      style={
        rowHeight
          ? ({
              "--filter-row-h": `${rowHeight}px`,
            } as CSSProperties)
          : undefined
      }
      className={`relative z-10 min-w-0 max-lg:h-[var(--filter-row-h)] max-lg:w-full ${className} `}
    >
      <div
        ref={scrollerRef}
        className="[scrollbar-width:none] overflow-x-auto overflow-y-hidden overscroll-x-contain [-ms-overflow-style:none] max-lg:absolute max-lg:inset-y-0 max-lg:right-[calc(var(--page-padding-x)*-1)] max-lg:left-0 max-lg:z-10 lg:max-w-full lg:min-w-0 lg:overflow-visible [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex w-max items-center max-lg:pr-[var(--page-padding-x)] lg:w-auto lg:max-w-full">
          {tray}
        </div>
      </div>
    </div>
  );
}
