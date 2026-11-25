"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

import Button from "@/components/kit/Button";
import { CircleAlert, Check } from "@/components/ui/icon";

import { BUTTON_LABEL, TOAST_TEXT } from "@/content/ui";

type ToastKind = "ok" | "bad";
type ToastOptions = {
  /** ok(기본) · bad(오류) */
  kind?: ToastKind;
  /** 「되돌리기」를 붙인다 (6초) */
  undo?: () => void;
  /** 「다시 시도」를 붙인다 (오류 토스트, 6초) */
  retry?: () => void;
  /** 「열기」를 붙인다 (복제 토스트 · 보드 03-h, 6초) */
  open?: () => void;
};
type ToastItem = ToastOptions & { id: number; text: string; kind: ToastKind };
type ShowToast = (text: string, options?: ToastOptions) => void;

const ToastContext = createContext<ShowToast | null>(null);

// 4초 · 되돌리기가 있으면 6초 · 마우스 · 초점이 올라가면 멈춤 (Components 01 ① 시간)
const DURATION_MS = 4000;
const UNDO_DURATION_MS = 6000;

/**
 * 토스트를 띄우는 함수를 돌려준다. `ToastProvider` 안에서만 쓴다.
 *
 * @example
 * const toast = useToast();
 * toast(TOAST_TEXT.saved);
 * toast(TOAST_TEXT.deleted, { undo: restore });
 * toast(TOAST_TEXT.saveFailed, { retry: save });
 * toast(duplicatedToast(copy.name), { open: () => router.push(path) });
 */
export function useToast(): ShowToast {
  const show = useContext(ToastContext);

  if (!show) {
    throw new Error("useToast는 ToastProvider 안에서만 쓸 수 있어요");
  }

  return show;
}

/**
 * 토스트 자리 (프로토타입 toast). 아래 가운데 24 · 높이 48 · 폭 280–420 · 모서리 12 ·
 * 두 모드 모두 어두운 바탕 --toast-bg. 읽는 기기에는 role="status"로 알린다.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);

  const remove = useCallback((id: number) => {
    setItems((list) => list.filter((item) => item.id !== id));
  }, []);

  const show = useCallback<ShowToast>((text, options) => {
    seq.current += 1;
    setItems((list) => [
      ...list,
      { ...options, id: seq.current, text, kind: options?.kind ?? (options?.retry ? "bad" : "ok") },
    ]);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[var(--z-toast)] flex -translate-x-1/2 flex-col items-center gap-2">
        {items.map((item) => (
          <ToastRow
            key={item.id}
            item={item}
            onDone={() => remove(item.id)}
            onAction={() => {
              remove(item.id);

              if (item.undo) {
                item.undo();
                show(TOAST_TEXT.undone);
              } else if (item.open) {
                item.open();
              } else {
                item.retry?.();
              }
            }}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastRow({
  item,
  onDone,
  onAction,
}: {
  item: ToastItem;
  onDone: () => void;
  onAction: () => void;
}) {
  const timer = useRef<number | null>(null);
  const hasAction = Boolean(item.undo || item.retry || item.open);
  const left = useRef(hasAction ? UNDO_DURATION_MS : DURATION_MS);
  const startedAt = useRef(0);

  const start = useCallback(() => {
    startedAt.current = Date.now();
    timer.current = window.setTimeout(onDone, Math.max(left.current, 1000));
  }, [onDone]);

  const pause = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      left.current -= Date.now() - startedAt.current;
    }
  };

  return (
    <div
      ref={(node) => {
        if (node && timer.current === null) {
          start();
        }
      }}
      role="status"
      onMouseEnter={pause}
      onMouseLeave={start}
      onFocus={pause}
      onBlur={start}
      className="pointer-events-auto flex h-12 max-w-105 min-w-70 items-center gap-2.5 rounded-[var(--radius-md)] bg-[var(--toast-bg)] pr-2 pl-4 text-sm text-[var(--toast-fg)] shadow-[0_8px_24px_rgb(0_0_0/25%)]"
    >
      {item.kind === "ok" ? (
        <Check size={16} aria-hidden className="shrink-0 text-[var(--toast-ok)]" />
      ) : (
        <CircleAlert size={16} aria-hidden className="shrink-0 text-[var(--toast-bad)]" />
      )}
      <span className="min-w-0 flex-1 truncate">{item.text}</span>
      {hasAction ? (
        <Button variant="onToast" size="xs" onClick={onAction}>
          {item.undo ? BUTTON_LABEL.undo : item.open ? BUTTON_LABEL.open : BUTTON_LABEL.retry}
        </Button>
      ) : null}
    </div>
  );
}
