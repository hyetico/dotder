"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

import CloseButton from "@/components/ui/button/CloseButton";

import { useProjectAccentStyle } from "@/features/projects/components/ProjectAccent";

import { useIsClient } from "@/hooks/useIsClient";
import { useModalScrollLock } from "@/hooks/useModalScrollLock";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  panelClassName?: string;
  maxWidthClassName?: string;
  zIndexClassName?: string;
  padded?: boolean;
  labelledBy?: string;
  describedBy?: string;
  maxHeightClassName?: string;
};

const ModalPadContext = createContext(true);

export const modalSidePaddingClassName = `
  px-[var(--page-padding-x)]
  md:px-[16px]
`;

/**
 * 검색·선택 모달이 목록 길이에 따라 높이가 바뀌지 않게 고정합니다.
 * 검색창과 필터가 위를 차지해도 목록이 6~7줄은 보이도록 높이를 넉넉히 둡니다.
 */
export const stableListModalPanelClassName = `
  h-[min(34rem,calc(100dvh-2rem))]
  min-h-[min(34rem,calc(100dvh-2rem))]

  xl:h-[min(36rem,calc(100dvh-2rem))]
  xl:min-h-[min(36rem,calc(100dvh-2rem))]
`;

function ModalRoot({
  isOpen,
  onClose,
  children,
  panelClassName = "",
  maxWidthClassName = "max-w-[640px]",
  zIndexClassName = "z-[var(--z-modal)]",
  padded = true,
  labelledBy,
  describedBy,
  maxHeightClassName = "max-h-[min(720px,calc(100dvh-2rem))]",
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const accentStyle = useProjectAccentStyle();

  const setScrollRoot = useModalScrollLock(isOpen);

  const isClient = useIsClient();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      const dialogs = document.querySelectorAll('[role="dialog"]');

      const topDialog = dialogs[dialogs.length - 1];

      if (topDialog !== dialogRef.current) {
        return;
      }

      onClose();
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isClient) {
    return null;
  }

  return createPortal(
    <div
      ref={setScrollRoot}
      style={accentStyle}
      className={`fixed inset-0 ${zIndexClassName} overflow-y-auto overscroll-none`}
    >
      <div
        role="presentation"
        className="flex min-h-full items-center justify-center bg-[var(--color-overlay)] p-4 backdrop-blur-[1px]"
        onMouseDown={(event) => {
          event.stopPropagation();
          onClose();
        }}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className={`flex w-full ${maxHeightClassName} flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-overlay)] ${maxWidthClassName} ${panelClassName} `}
          onMouseDown={(event) => {
            event.stopPropagation();
          }}
        >
          <ModalPadContext.Provider value={padded}>{children}</ModalPadContext.Provider>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type ModalHeaderProps = {
  id?: string;
  title: string;
  description?: string;
  onClose: () => void;
  closeLabel?: string;
  icon?: ReactNode;
  accessory?: ReactNode;
  descriptionClassName?: string;
};

function ModalHeader({
  id,
  title,
  description,
  onClose,
  closeLabel = "닫기",
  icon,
  accessory,
  descriptionClassName = "",
}: ModalHeaderProps) {
  const descriptionText = description?.trim() ?? "";

  return (
    <div className={`shrink-0 bg-[var(--color-surface)] ${modalSidePaddingClassName} py-2`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {icon ? (
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary-soft)] text-[var(--color-primary)] [&_svg]:size-4">
              {icon}
            </span>
          ) : null}

          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <h2 id={id} className="text-card-title min-w-0 truncate text-[var(--color-text)]">
              {title}
            </h2>

            {accessory}
          </div>
        </div>

        <CloseButton onClick={onClose} label={closeLabel} />
      </div>

      {descriptionText ? (
        <div className={descriptionClassName}>
          <p className="text-caption mt-1 line-clamp-2 text-[var(--color-text-secondary)]">
            {descriptionText}
          </p>
        </div>
      ) : null}
    </div>
  );
}

type ModalBodyProps = {
  children: ReactNode;
  className?: string;
};

function ModalBody({ children, className = "" }: ModalBodyProps) {
  const padded = useContext(ModalPadContext);

  return (
    <div
      className={`min-h-0 overflow-y-auto overscroll-contain ${
        padded ? ` ${modalSidePaddingClassName} py-4 md:py-5` : ""
      } ${className} `}
    >
      {children}
    </div>
  );
}

type ModalFooterProps = {
  children: ReactNode;
  className?: string;
};

function ModalFooter({ children, className = "" }: ModalFooterProps) {
  return (
    <div
      className={`flex min-h-[var(--bottom-app-bar-height)] shrink-0 items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface)] ${modalSidePaddingClassName} py-2 ${className} `}
    >
      {children}
    </div>
  );
}

const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});

export default Modal;
