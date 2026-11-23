"use client";

import { useRouter } from "next/navigation";
import { useId, useState, type ReactNode } from "react";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import { AppIcon, ArrowRight, Info } from "@/components/ui/icon";
import Modal, { modalSidePaddingClassName } from "@/components/ui/modal/Modal";

export type InfoTooltipItem = {
  label: string;
  description: string | readonly string[];
  note?: string;
  current?: boolean;
  icon?: ReactNode;
  inlineAction?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  action?: {
    href: string;
    label: string;
  };
  nested?: {
    label: string;
    description?: string | readonly string[];
    icon?: ReactNode;
    body?: ReactNode;
    action?: {
      href: string;
      label: string;
    };
  };
};

function PageMoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-body-sm inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-3 font-medium text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)]"
    >
      {label}
      <AppIcon icon={ArrowRight} size="sm" />
    </button>
  );
}

function NestedTooltipSection({
  item,
  onAction,
}: {
  item: NonNullable<InfoTooltipItem["nested"]>;
  onAction: (href: string) => void;
}) {
  const descriptionLines = (
    item.description == null
      ? []
      : Array.isArray(item.description)
        ? item.description
        : [item.description]
  ).filter((line) => line.trim().length > 0);

  return (
    <div className="pt-3.5">
      <div className={item.icon ? `grid grid-cols-[auto_minmax(0,1fr)] gap-x-1` : ""}>
        {item.icon ? (
          <div className="col-start-1 row-start-1 flex shrink-0 items-center justify-center self-center">
            {item.icon}
          </div>
        ) : null}

        <p
          className={`text-body min-w-0 font-bold text-[var(--color-text)] ${
            item.icon ? "col-start-2 row-start-1 self-center" : ""
          } `}
        >
          {item.label}
        </p>

        <div className={item.icon ? "col-start-2 row-start-2 min-w-0" : ""}>
          {descriptionLines.length > 0 ? (
            <div className="mt-1 space-y-1">
              {descriptionLines.map((line) => (
                <p key={line} className="text-body-sm text-[var(--color-text-secondary)]">
                  {line}
                </p>
              ))}
            </div>
          ) : null}

          {item.body ? <div className="mt-2.5">{item.body}</div> : null}

          {item.action ? (
            <div className="mt-3 flex justify-end">
              <PageMoveButton
                label={item.action.label}
                onClick={() => onAction(item.action!.href)}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type InfoTooltipProps = {
  title: string;
  description?: string | readonly string[];
  items?: readonly InfoTooltipItem[];
  label?: string;
  triggerLabel?: string;
  className?: string;
  maxWidthClassName?: string;
  centered?: boolean;
};

export default function InfoTooltip({
  title,
  description,
  items,
  label,
  triggerLabel,
  className = "",
  maxWidthClassName = "max-w-[400px]",
  centered = false,
}: InfoTooltipProps) {
  const router = useRouter();
  const titleId = useId();
  const descriptionId = useId();

  const [isOpen, setIsOpen] = useState(false);

  const close = () => {
    setIsOpen(false);
  };

  const openAction = (href: string) => {
    close();
    router.push(href);
  };

  const paragraphs =
    description == null ? [] : Array.isArray(description) ? description : [description];

  return (
    <>
      <button
        type="button"
        aria-label={triggerLabel ?? label ?? `${title} 설명`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen(true);
        }}
        className={
          triggerLabel
            ? `text-caption inline-flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-white px-2.5 leading-none font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-hover-soft)] hover:text-[var(--color-text)] ${className} `
            : `inline-flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-full p-0 leading-none text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] ${className} `
        }
      >
        <AppIcon icon={Info} size="sm" />

        {triggerLabel}
      </button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        padded={false}
        labelledBy={titleId}
        describedBy={descriptionId}
        maxWidthClassName={maxWidthClassName}
      >
        <Modal.Header
          id={titleId}
          title={title}
          onClose={close}
          icon={<AppIcon icon={Info} size="sm" />}
        />

        <div
          className={`max-h-[min(70vh,36rem)] overflow-y-auto ${modalSidePaddingClassName} py-4`}
        >
          <div id={descriptionId} className="space-y-3">
            {items ? (
              <div className="space-y-2.5">
                {items.map((item) => {
                  const descriptionLines = Array.isArray(item.description)
                    ? item.description
                    : [item.description];

                  return (
                    <div
                      key={item.label}
                      className={`rounded-[var(--radius-md)] border px-[8px] py-[10px] ${
                        centered ? "text-center" : ""
                      } ${
                        item.current
                          ? "border-[var(--color-text)] bg-[var(--color-surface)]"
                          : "border-[var(--color-border)] bg-[var(--color-muted)]"
                      } `}
                    >
                      <div
                        className={` ${
                          item.icon ? `grid grid-cols-[auto_minmax(0,1fr)] gap-x-1` : ""
                        } ${item.nested ? `border-b border-[var(--color-border)] pb-3.5` : ""} `}
                      >
                        {item.icon ? (
                          <div className="col-start-1 row-start-1 flex shrink-0 items-center justify-center self-center">
                            {item.icon}
                          </div>
                        ) : null}

                        <div
                          className={item.icon ? "col-start-2 row-start-1 min-w-0 self-center" : ""}
                        >
                          <div
                            className={`flex items-center gap-2 ${
                              centered ? "justify-center" : "justify-between"
                            } `}
                          >
                            <div
                              className={`flex min-w-0 flex-wrap items-center gap-2 ${
                                centered ? "w-full justify-center" : ""
                              } `}
                            >
                              <p
                                className={`text-body flex min-w-0 items-center gap-1.5 font-bold text-[var(--color-text)] ${
                                  centered ? "w-full justify-center text-center" : ""
                                } `}
                              >
                                {item.label}
                              </p>

                              {item.inlineAction ? (
                                <span className="inline-flex shrink-0 items-center">
                                  <span
                                    aria-hidden
                                    className="inline-flex h-7 w-8 shrink-0 -translate-x-[2px] items-center justify-center text-[18px] leading-none font-medium text-[var(--color-text-muted)]"
                                  >
                                    |
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      close();
                                      item.inlineAction?.onClick();
                                    }}
                                    className="text-body-sm inline-flex h-7 shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] px-2 font-medium whitespace-nowrap text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover-soft)]"
                                  >
                                    {item.inlineAction.icon}
                                    {item.inlineAction.label}
                                  </button>
                                </span>
                              ) : null}
                            </div>

                            {item.current ? (
                              <span className="text-caption shrink-0 rounded-full bg-[var(--color-primary-soft)] px-2 py-0.5 font-medium text-[var(--color-primary)]">
                                현재
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className={item.icon ? "col-start-2 row-start-2 min-w-0" : ""}>
                          <div className="mt-1 space-y-1">
                            {descriptionLines.map((line) => (
                              <p
                                key={line}
                                className={`text-body-sm text-[var(--color-text-secondary)] ${
                                  centered ? "text-center" : ""
                                } `}
                              >
                                {line}
                              </p>
                            ))}
                          </div>

                          {item.note || item.action ? (
                            <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                              {item.note ? (
                                <p className="text-body-sm text-[var(--color-text-secondary)]">
                                  {item.note}
                                </p>
                              ) : null}

                              {item.action ? (
                                <div className="mt-3 flex justify-end">
                                  <PageMoveButton
                                    label={item.action.label}
                                    onClick={() => openAction(item.action!.href)}
                                  />
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {item.nested ? (
                        <NestedTooltipSection item={item.nested} onAction={openAction} />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-muted)] px-[8px] py-[10px]">
                {paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-body text-[var(--color-text)]">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
            {items && paragraphs.length > 0 ? (
              <div
                className={
                  centered ? "border-t border-[var(--color-border)] pt-3 text-center" : "space-y-2"
                }
              >
                {paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className={
                      centered
                        ? "text-body-sm leading-5 text-[var(--color-text-secondary)]"
                        : "text-body text-[var(--color-text)]"
                    }
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <Modal.Footer>
          <PrimaryButton size="modal" onClick={close}>
            확인
          </PrimaryButton>
        </Modal.Footer>
      </Modal>
    </>
  );
}
