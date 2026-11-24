"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import CloseButton from "@/components/ui/button/CloseButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import { useDrawerPanel } from "@/components/ui/drawer/Drawer";
import { AppIcon, Check } from "@/components/ui/icon";
import SearchInput from "@/components/ui/input/SearchInput";

import ProjectMark from "@/features/projects/components/ProjectMark";

import type { Project } from "@/features/projects/types/project";

type ProjectPickFieldProps = {
  /** 고를 수 있는 프로젝트 (보류 빼기 같은 거르기는 부르는 쪽에서) */
  projects: Project[];
  /** 고른 프로젝트 id. 없으면 null */
  value: number | null;
  onChange: (projectId: number | null) => void;
  /** 「프로젝트 없음」을 고를 수 있게 한다 (목표 · 메모) */
  allowNone?: boolean;
  /** 라벨과 이어 줄 id (`aria-labelledby`) */
  labelledBy?: string;
};

const MOBILE_QUERY = "(max-width: 767px)";
const POPOVER_GAP = 8;
const NONE_LABEL = "프로젝트 없음";

const rowClassName =
  "text-body flex min-h-9 w-full cursor-pointer items-start gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[var(--color-text)] transition-colors hover:bg-[var(--color-hover)] focus-visible:bg-[var(--color-hover)] focus-visible:outline-none max-md:min-h-11 max-md:items-center";

/**
 * 드로어 안 「프로젝트」 칸 (목표 · 메모 드로어 공통). 점 · 왕관 + 이름(1줄 …) + [변경].
 *
 * [변경]을 누르면 드로어 위 모달 대신 드로어 안 팝오버(웹 · 태블릿, 칸 폭)나 시트 안 화면(모바일)으로
 * 검색 + 고르는 목록(C-16) + 「프로젝트 없음」을 연다. Esc · 바깥 누르기로 닫고 [변경]으로 초점을 돌린다.
 *
 * @example
 * <FormField label="프로젝트"><ProjectPickField projects={projects} value={id} onChange={setId} allowNone /></FormField>
 */
export default function ProjectPickField({
  projects,
  value,
  onChange,
  allowNone = false,
  labelledBy,
}: ProjectPickFieldProps) {
  const panelLabelId = useId();
  const fieldRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const drawerPanel = useDrawerPanel();
  const [isOpen, setIsOpen] = useState(false);
  const [isSheet, setIsSheet] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<{ top: number; left: number; width: number } | null>(
    null,
  );

  const selected = projects.find((project) => project.id === value) ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const results = normalizedQuery
    ? projects.filter((project) => project.name.toLowerCase().includes(normalizedQuery))
    : projects;

  const open = () => {
    setIsSheet(window.matchMedia(MOBILE_QUERY).matches);
    setQuery("");
    setPosition(null);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  const pick = (projectId: number | null) => {
    onChange(projectId);
    close();
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // 드로어 패널은 transform이 있어 fixed 자식의 기준이 된다 → 패널 안 좌표로 놓는다
    const place = () => {
      if (isSheet) {
        return;
      }

      const field = fieldRef.current?.getBoundingClientRect();
      const base = drawerPanel?.getBoundingClientRect() ?? { top: 0, left: 0 };

      if (field) {
        setPosition({
          top: field.bottom - base.top + POPOVER_GAP,
          left: field.left - base.left,
          width: field.width,
        });
      }
    };

    const closeOnOutside = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        !popoverRef.current?.contains(target) &&
        !fieldRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }

      // 드로어의 Esc(닫기)보다 먼저 받아서 팝오버만 닫는다
      event.preventDefault();
      event.stopImmediatePropagation();
      setIsOpen(false);
      buttonRef.current?.focus();
    };

    place();
    window.addEventListener("resize", place);
    drawerPanel?.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape, true);

    return () => {
      window.removeEventListener("resize", place);
      drawerPanel?.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [drawerPanel, isOpen, isSheet]);

  const isReady = isOpen && (isSheet || position !== null);

  useEffect(() => {
    if (isReady) {
      popoverRef.current?.querySelector("input")?.focus({ preventScroll: true });
    }
  }, [isReady]);

  const list = (
    <ul className="min-h-0 overflow-y-auto overscroll-contain p-1 md:max-h-72">
      {allowNone ? (
        <li>
          <button type="button" onClick={() => pick(null)} className={rowClassName}>
            <span className="min-w-0 flex-1 text-[var(--color-text-secondary)]">{NONE_LABEL}</span>
            {value == null ? <AppIcon icon={Check} size="sm" className="mt-0.5 shrink-0" /> : null}
          </button>
        </li>
      ) : null}
      {results.map((project) => (
        <li key={project.id}>
          <button type="button" onClick={() => pick(project.id)} className={rowClassName}>
            <span className="flex h-5 shrink-0 items-center">
              <ProjectMark color={project.color} isMain={project.isMain} />
            </span>
            {/* 고르는 목록은 이름을 자르지 않는다 (C-16 · B7) */}
            <span className="min-w-0 flex-1 break-words">{project.name}</span>
            {project.id === value ? (
              <AppIcon icon={Check} size="sm" className="mt-0.5 shrink-0" />
            ) : null}
          </button>
        </li>
      ))}
    </ul>
  );

  const popover = isOpen
    ? createPortal(
        isSheet ? (
          // 모바일: 시트 안에서 화면을 바꿔 목록을 보인다
          <div
            ref={popoverRef}
            role="dialog"
            aria-labelledby={panelLabelId}
            className="fixed inset-0 z-[var(--z-popover)] flex flex-col bg-[var(--color-surface)]"
          >
            <div className="flex h-14 shrink-0 items-center border-b border-[var(--color-border)] pr-3 pl-6">
              <h3 id={panelLabelId} className="text-section-title min-w-0 flex-1 truncate">
                프로젝트 선택
              </h3>
              <CloseButton label="프로젝트 선택 닫기" onClick={close} />
            </div>
            <div className="px-4 pt-3">
              <SearchInput value={query} onChange={setQuery} placeholder="프로젝트 찾기" />
            </div>
            <div className="flex min-h-0 flex-1 flex-col px-3 pb-4">{list}</div>
          </div>
        ) : (
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="프로젝트 선택"
            className="fixed z-[var(--z-popover)] flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-1 shadow-[var(--shadow-overlay)]"
            style={
              position
                ? { top: position.top, left: position.left, width: position.width }
                : { top: 0, left: 0, visibility: "hidden" }
            }
          >
            <div className="p-1">
              <SearchInput value={query} onChange={setQuery} placeholder="프로젝트 찾기" />
            </div>
            {list}
          </div>
        ),
        drawerPanel ?? document.body,
      )
    : null;

  return (
    <div ref={fieldRef} className="flex min-w-0 items-center gap-2" aria-labelledby={labelledBy}>
      {selected ? (
        <>
          <ProjectMark color={selected.color} isMain={selected.isMain} />
          <span
            className="text-body min-w-0 flex-1 truncate text-[var(--color-text)]"
            title={selected.name}
          >
            {selected.name}
          </span>
        </>
      ) : (
        <span className="text-body min-w-0 flex-1 truncate text-[var(--color-field-placeholder)]">
          프로젝트 선택
        </span>
      )}
      <SecondaryButton
        ref={buttonRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => (isOpen ? close() : open())}
      >
        {selected ? "변경" : "고르기"}
      </SecondaryButton>
      {popover}
    </div>
  );
}
