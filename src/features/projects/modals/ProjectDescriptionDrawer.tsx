"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import Drawer from "@/components/ui/drawer/Drawer";
import Textarea from "@/components/ui/input/Textarea";
import { FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import { PROJECT_DESCRIPTION_LIMIT } from "@/features/projects/constants/projectFormDefaults";

const SLIDE_MS = 400;

type ProjectDescriptionDrawerProps = {
  isOpen: boolean;
  value: string;
  onClose: () => void;
  onApply: (value: string) => void;
};

/**
 * ProjectDescriptionDrawerPanel
 *
 * 프로젝트 설명을 넓은 입력창에 쓰는 드로어 본문입니다.
 * 전체 화면은 화면을 덮고, 안의 입력은 페이지 최대 너비에 맞춥니다.
 *
 * @param props - ProjectDescriptionDrawerPanel 컴포넌트 Props
 * @param props.isClosing - 드로어가 오른쪽으로 나가는 중인지 여부
 * @param props.value - 폼에 들어 있는 현재 설명
 * @param props.onClose - 드로어를 닫을 때 실행되는 함수
 * @param props.onApply - 쓴 설명을 적용할 때 실행되는 함수
 */
function ProjectDescriptionDrawerPanel({
  isClosing,
  value,
  onClose,
  onApply,
}: Omit<ProjectDescriptionDrawerProps, "isOpen"> & { isClosing: boolean }) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState(value);
  const [isEntered, setIsEntered] = useState(false);
  const isActive = isEntered && !isClosing;

  useLayoutEffect(() => {
    if (isClosing) {
      setIsEntered(false);
      return;
    }

    const panel = panelRef.current;

    if (panel) {
      void panel.offsetWidth;
    }

    let innerFrame = 0;
    const outerFrame = window.requestAnimationFrame(() => {
      innerFrame = window.requestAnimationFrame(() => {
        setIsEntered(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(outerFrame);
      window.cancelAnimationFrame(innerFrame);
    };
  }, [isClosing]);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    setDraft(value);

    const textarea = textareaRef.current;

    textarea?.focus({ preventScroll: true });
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [isActive, value]);

  return (
    <Drawer
      isEntered={isActive}
      title="프로젝트 설명"
      titleId={titleId}
      onClose={onClose}
      closeLabel="프로젝트 설명 닫기"
      overlay
      lockScroll
      panelRef={panelRef}
    >
      <Drawer.Body>
        <FormLabel
          htmlFor="project-description-drawer"
          label="설명"
          counter={`${draft.length}/${PROJECT_DESCRIPTION_LIMIT}`}
        />

        <Textarea
          id="project-description-drawer"
          ref={textareaRef}
          value={draft}
          maxLength={PROJECT_DESCRIPTION_LIMIT}
          placeholder="프로젝트의 목적, 범위, 진행 방식을 자세히 적어주세요"
          onChange={(event) => setDraft(event.target.value)}
          className="min-h-0 flex-1"
        />
      </Drawer.Body>

      <Drawer.Footer>
        <SecondaryButton size="modal" onClick={onClose} className="min-w-[80px] justify-center">
          취소
        </SecondaryButton>

        <PrimaryButton
          size="modal"
          onClick={() => {
            onApply(draft);
            onClose();
          }}
          className="min-w-[80px] justify-center"
        >
          적용
        </PrimaryButton>
      </Drawer.Footer>
    </Drawer>
  );
}

/**
 * ProjectDescriptionDrawer
 *
 * 프로젝트 설명을 길게 쓰는 오른쪽 드로어입니다.
 * 오른쪽에서 들어오고, 전체 화면으로 넓힐 수 있습니다. 적용을 눌러야 폼의 설명에 반영됩니다.
 *
 * @param props - ProjectDescriptionDrawer 컴포넌트 Props
 * @param props.isOpen - 드로어가 열려 있는지 여부
 * @param props.value - 폼에 들어 있는 현재 설명
 * @param props.onClose - 드로어를 닫을 때 실행되는 함수
 * @param props.onApply - 쓴 설명을 적용할 때 실행되는 함수
 */
export default function ProjectDescriptionDrawer({
  isOpen,
  value,
  onClose,
  onApply,
}: ProjectDescriptionDrawerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      return;
    }

    if (!isVisible) {
      return;
    }

    setIsClosing(true);

    const timeout = window.setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, SLIDE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isMounted, isOpen, isVisible]);

  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <ProjectDescriptionDrawerPanel
      isClosing={isClosing}
      value={value}
      onClose={onClose}
      onApply={onApply}
    />
  );
}
