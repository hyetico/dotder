"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import { AppIcon, Info, TriangleAlert, type LucideIcon } from "@/components/ui/icon";
import Modal from "@/components/ui/modal/Modal";

export type AlertTone = "default" | "info" | "warning" | "danger";

export type AlertOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: AlertTone;
  icon?: LucideIcon;
};

type AlertMode = "alert" | "confirm";

type AlertItem = AlertOptions & {
  id: number;
  mode: AlertMode;
};

type AlertContextValue = {
  alert: (options: AlertOptions) => Promise<void>;
  confirm: (options: AlertOptions) => Promise<boolean>;
};

const toneIcons: Record<AlertTone, LucideIcon> = {
  default: Info,
  info: Info,
  warning: TriangleAlert,
  danger: TriangleAlert,
};

type AlertModalProps = {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: AlertTone;
  icon?: LucideIcon;
  hideCancel?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

export default function AlertModal({
  isOpen,
  title,
  description,
  confirmLabel = "확인",
  cancelLabel = "취소",
  tone = "default",
  icon,
  hideCancel = false,
  onConfirm,
  onClose,
}: AlertModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const ToneIcon = icon ?? toneIcons[tone];
  const focusCancel = tone === "danger" && !hideCancel;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClassName="max-w-[320px]"
      zIndexClassName="z-[200]"
      labelledBy={titleId}
      describedBy={description ? descriptionId : undefined}
    >
      <Modal.Header
        id={titleId}
        title={title}
        onClose={onClose}
        icon={<AppIcon icon={ToneIcon} size="sm" />}
      />

      {description ? (
        <Modal.Body>
          <p
            id={descriptionId}
            className="text-caption text-center whitespace-pre-line text-[var(--color-text)]"
          >
            {description}
          </p>
        </Modal.Body>
      ) : null}

      <Modal.Footer>
        {!hideCancel && (
          <SecondaryButton size="modal" onClick={onClose} autoFocus={focusCancel}>
            {cancelLabel}
          </SecondaryButton>
        )}

        {tone === "danger" ? (
          <button
            type="button"
            onClick={onConfirm}
            autoFocus={!focusCancel}
            className="inline-flex h-[var(--button-height-modal)] items-center justify-center rounded-[var(--radius-sm)] bg-red-500 px-[var(--button-px-modal)] text-[length:var(--button-font)] leading-[var(--button-line)] font-medium whitespace-nowrap text-[var(--color-text-inverse)] transition-colors duration-150 hover:bg-red-600 active:bg-red-700"
          >
            {confirmLabel}
          </button>
        ) : (
          <PrimaryButton size="modal" onClick={onConfirm} autoFocus={!focusCancel}>
            {confirmLabel}
          </PrimaryButton>
        )}
      </Modal.Footer>
    </Modal>
  );
}

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<AlertItem[]>([]);

  const resolvers = useRef(new Map<number, (value: boolean) => void>());

  const idRef = useRef(0);

  const settle = useCallback((id: number, value: boolean) => {
    const resolve = resolvers.current.get(id);

    if (!resolve) {
      return;
    }

    resolvers.current.delete(id);
    resolve(value);

    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const enqueue = useCallback((options: AlertOptions, mode: AlertMode) => {
    const id = ++idRef.current;

    return new Promise<boolean>((resolve) => {
      resolvers.current.set(id, resolve);

      setQueue((prev) => [
        ...prev,
        {
          ...options,
          id,
          mode,
        },
      ]);
    });
  }, []);

  useEffect(() => {
    const pending = resolvers.current;

    return () => {
      pending.forEach((resolve) => {
        resolve(false);
      });
      pending.clear();
    };
  }, []);

  const alert = useCallback(
    async (options: AlertOptions) => {
      await enqueue(options, "alert");
    },
    [enqueue],
  );

  const confirm = useCallback(
    (options: AlertOptions) => {
      return enqueue(options, "confirm");
    },
    [enqueue],
  );

  const value = useMemo(
    () => ({
      alert,
      confirm,
    }),
    [alert, confirm],
  );

  const current = queue[0] ?? null;

  return (
    <AlertContext.Provider value={value}>
      {children}

      {current && (
        <AlertModal
          isOpen
          title={current.title}
          description={current.description}
          confirmLabel={current.confirmLabel}
          cancelLabel={current.cancelLabel}
          tone={current.tone}
          icon={current.icon}
          hideCancel={current.mode === "alert"}
          onConfirm={() => settle(current.id, true)}
          onClose={() => settle(current.id, current.mode === "alert")}
        />
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlert는 AlertProvider 안에서 사용해야 합니다.");
  }

  return context;
}
