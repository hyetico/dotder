"use client";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import { createPortal } from "react-dom";

import CloseButton from "@/components/ui/button/CloseButton";
import IconButton from "@/components/ui/button/IconButton";
import DrawerFrame from "@/components/ui/drawer/DrawerFrame";
import { AppIcon, ChevronsRight, Maximize2, Minimize2 } from "@/components/ui/icon";

import { useModalScrollLock } from "@/hooks/useModalScrollLock";

const overlayClassName =
  "fixed inset-0 z-[110] bg-black/20 transition-opacity duration-[400ms] ease-in-out motion-reduce:duration-[1ms]";
const panelClassName =
  "fixed inset-y-0 right-0 z-[120] flex h-full w-full flex-col bg-[var(--color-surface)] shadow-[var(--shadow-dropdown)] transition-[transform,max-width] duration-[400ms] ease-in-out motion-reduce:duration-[1ms]";
const barShellClassName = "flex h-[54px] shrink-0 items-center border-[var(--color-border)]";
const headerFrameClassName = "flex h-full items-center gap-2 px-3";
const headerControlsClassName = "hidden shrink-0 items-center gap-0.5 md:flex";
const headerButtonClassName = "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]";
const fullscreenIconClassName = "origin-center scale-[0.67]";
const bodyScrollClassName =
  "thin-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain py-5 ![scrollbar-gutter:auto]";
const bodyFrameClassName = "flex min-h-full flex-col gap-4 px-5";
const footerFrameClassName = "flex h-full items-center justify-end gap-2 px-5";

type DrawerProps = {
  isEntered: boolean;
  title: string;
  titleId: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
  headerAction?: ReactNode;
  overlay?: boolean;
  lockScroll?: boolean;
  panelRef?: Ref<HTMLElement | null>;
};

type DrawerBodyProps = {
  children: ReactNode;
  className?: string;
};

type DrawerFooterProps = {
  children: ReactNode;
  className?: string;
};

/**
 * assignDrawerRef
 *
 * 드로어 패널 노드를 내부 ref와 바깥 ref에 함께 연결합니다.
 *
 * @param ref - 바깥에서 전달한 ref
 * @param node - 연결할 패널 요소
 */
function assignDrawerRef(ref: Ref<HTMLElement | null> | undefined, node: HTMLElement | null) {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    ref(node);
    return;
  }

  ref.current = node;
}

/**
 * DrawerBody
 *
 * 드로어에서 스크롤되는 본문입니다.
 * 내용은 페이지 최대 너비 안에 둡니다.
 *
 * @param props - DrawerBody 컴포넌트 Props
 * @param props.children - 본문에 둘 내용
 * @param props.className - 본문 프레임에 더할 클래스
 */
function DrawerBody({ children, className = "" }: DrawerBodyProps) {
  return (
    <div className={bodyScrollClassName}>
      <DrawerFrame className={[bodyFrameClassName, className].filter(Boolean).join(" ")}>
        {children}
      </DrawerFrame>
    </div>
  );
}

/**
 * DrawerFooter
 *
 * 드로어 아래쪽 버튼 줄입니다.
 * 버튼은 페이지 최대 너비 안에서 오른쪽으로 붙습니다.
 *
 * @param props - DrawerFooter 컴포넌트 Props
 * @param props.children - 아래쪽에 둘 버튼
 * @param props.className - 버튼 줄에 더할 클래스
 */
function DrawerFooter({ children, className = "" }: DrawerFooterProps) {
  return (
    <div className={`${barShellClassName} border-t`}>
      <DrawerFrame className={[footerFrameClassName, className].filter(Boolean).join(" ")}>
        {children}
      </DrawerFrame>
    </div>
  );
}

/**
 * Drawer
 *
 * 오른쪽에서 들어오는 드로어의 겉면입니다.
 * 전체 화면은 화면을 덮고, 안의 내용은 페이지 최대 너비에 맞춥니다.
 * 뒤 화면을 덮지 않을 때는 왼쪽 페이지를 누르면 닫힙니다.
 *
 * @param props - Drawer 컴포넌트 Props
 * @param props.isEntered - 드로어가 화면 안에 들어와 있는지 여부
 * @param props.title - 드로어 제목
 * @param props.titleId - 제목 요소 id
 * @param props.onClose - 드로어를 닫을 때 실행되는 함수
 * @param props.children - 제목 아래에 둘 본문
 * @param props.closeLabel - 닫기 버튼 이름
 * @param props.headerAction - 제목 오른쪽에 둘 버튼
 * @param props.overlay - 뒤 화면을 덮는 배경을 둘지 여부
 * @param props.lockScroll - 뒤 화면 스크롤을 잠글지 여부
 * @param props.panelRef - 패널 요소에 연결할 ref
 */
function DrawerRoot({
  isEntered,
  title,
  titleId,
  onClose,
  children,
  closeLabel = "닫기",
  headerAction,
  overlay = true,
  lockScroll = false,
  panelRef,
}: DrawerProps) {
  const internalRef = useRef<HTMLElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const setScrollRoot = useModalScrollLock(lockScroll);
  const panelWidthClassName = isExpanded
    ? "max-w-[100vw]"
    : "max-w-[var(--goal-drawer-width)] border-l border-[var(--color-border)]";
  const panelMotionClassName = isEntered ? "translate-x-0" : "translate-x-full";
  const panelStateClassName = [panelClassName, panelWidthClassName, panelMotionClassName].join(" ");
  const overlayStateClassName = [overlayClassName, isEntered ? "opacity-100" : "opacity-0"].join(
    " ",
  );
  const hasTitle = title.trim().length > 0;

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const dialogs = document.querySelectorAll("[role='dialog']");

      if (dialogs[dialogs.length - 1] !== internalRef.current) {
        return;
      }

      onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  useEffect(() => {
    if (overlay || !isEntered) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const panel = internalRef.current;
      const target = event.target;

      if (!(target instanceof Node) || panel == null || panel.contains(target)) {
        return;
      }

      const dialogs = document.querySelectorAll("[role='dialog']");

      if (dialogs[dialogs.length - 1] !== panel) {
        return;
      }

      onClose();
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isEntered, onClose, overlay]);

  const setPanelNode = (node: HTMLElement | null) => {
    internalRef.current = node;

    if (lockScroll) {
      setScrollRoot(node);
    }

    assignDrawerRef(panelRef, node);
  };

  return createPortal(
    <>
      {overlay ? (
        <button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          className={overlayStateClassName}
        />
      ) : null}

      <aside
        ref={setPanelNode}
        role="dialog"
        aria-modal={overlay ? true : undefined}
        aria-labelledby={hasTitle ? titleId : undefined}
        aria-label={hasTitle ? undefined : closeLabel}
        className={panelStateClassName}
      >
        <div className={`${barShellClassName} border-b`}>
          <DrawerFrame className={headerFrameClassName}>
            <div className={headerControlsClassName}>
              {isExpanded ? null : (
                <IconButton
                  label="닫기"
                  title="닫기"
                  hoverSize="icon"
                  onClick={onClose}
                  className={headerButtonClassName}
                >
                  <AppIcon icon={ChevronsRight} size="md" />
                </IconButton>
              )}

              <IconButton
                label={isExpanded ? "접기" : "전체 화면"}
                title={isExpanded ? "접기" : "전체 화면"}
                hoverSize="icon"
                aria-pressed={isExpanded}
                onClick={() => setIsExpanded((expanded) => !expanded)}
                className={headerButtonClassName}
              >
                <AppIcon
                  icon={isExpanded ? Minimize2 : Maximize2}
                  size="md"
                  className={fullscreenIconClassName}
                />
              </IconButton>
            </div>

            {hasTitle ? (
              <h2
                id={titleId}
                className="text-section-title min-w-0 flex-1 truncate text-[var(--color-text)]"
              >
                {title}
              </h2>
            ) : (
              <div className="min-w-0 flex-1" />
            )}

            {headerAction ? <div className="shrink-0">{headerAction}</div> : null}

            <div className="md:hidden">
              <CloseButton label={closeLabel} onClick={onClose} />
            </div>
          </DrawerFrame>
        </div>

        {children}
      </aside>
    </>,
    document.body,
  );
}

const Drawer = Object.assign(DrawerRoot, {
  Body: DrawerBody,
  Footer: DrawerFooter,
});

export default Drawer;
