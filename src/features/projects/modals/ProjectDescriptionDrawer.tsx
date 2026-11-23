"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import PrimaryButton from "@/components/ui/button/PrimaryButton";
import SecondaryButton from "@/components/ui/button/SecondaryButton";
import Drawer from "@/components/ui/drawer/Drawer";
import Textarea from "@/components/ui/input/Textarea";

import { FormLabel } from "@/features/projects/components/ProjectForm/FormParts";
import { PROJECT_DESCRIPTION_LIMIT } from "@/features/projects/constants/projectFormDefaults";

import { useIsClient } from "@/hooks/useIsClient";

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
  const [syncedValue, setSyncedValue] = useState<string | null>(null);

  // 나가기 시작하면 들어온 상태를 풀어서, 다시 열릴 때 들어오는 움직임이 다시 나오게 한다.
  if (isClosing && isEntered) {
    setIsEntered(false);
  }

  // 다 들어온 뒤(또는 그동안 폼 값이 바뀌면) 쓰던 설명을 폼 값으로 맞춘다.
  if (!isActive && syncedValue !== null) {
    setSyncedValue(null);
  }

  if (isActive && syncedValue !== value) {
    setSyncedValue(value);
    setDraft(value);
  }

  useLayoutEffect(() => {
    if (isClosing) {
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

    const textarea = textareaRef.current;

    textarea?.focus({ preventScroll: true });
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [isActive]);

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
  const isClient = useIsClient();
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // 열리면 바로 보이고, 닫히면 나가는 움직임이 끝날 때까지 남겨 둔다.
  if (isOpen && (!isVisible || isClosing)) {
    setIsVisible(true);
    setIsClosing(false);
  }

  if (!isOpen && isVisible && !isClosing) {
    setIsClosing(true);
  }

  useEffect(() => {
    if (!isClosing) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, SLIDE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isClosing]);

  if (!isClient || !isVisible) {
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
