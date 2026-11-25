"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useId, useRef, useState, type FormEvent, type ReactNode } from "react";

import Button from "@/components/kit/Button";
import ColorSwatches from "@/components/kit/ColorSwatches";
import { DiscardConfirmDialog } from "@/components/kit/ConfirmDialog";
import DateField from "@/components/kit/DateField";
import Drawer from "@/components/kit/Drawer";
import Field from "@/components/kit/Field";
import TagField from "@/components/kit/TagField";
import { GrowingInput, TextArea } from "@/components/kit/TextInput";
import { useToast } from "@/components/kit/Toast";
import { ChevronDown } from "@/components/ui/icon";

import { BUTTON_LABEL, TOAST_TEXT } from "@/content/ui";
import { PROJECT_TAG_PRESETS } from "@/features/projects/constants/projectTags";
import { useProjectMutations } from "@/features/projects/hooks/useProjectMutations";
import { getAutoProjectStatus } from "@/features/projects/utils/projectUtils";

import { cn } from "@/lib/cn";
import { toDateKey } from "@/lib/date";
import { currentUser } from "@/lib/mock/users";
import { DEFAULT_PROJECT_COLOR, type ProjectColorKey } from "@/lib/projectPalette";
import { NEW_PROJECT_PARAM } from "@/lib/projectRoutes";

const NAME_MAX = 50;

type FormState = {
  name: string;
  color: ProjectColorKey;
  startDate: string;
  endDate: string;
  description: string;
  tags: string[];
};

const initialState = (): FormState => ({
  name: "",
  color: DEFAULT_PROJECT_COLOR,
  // 새로 만들 때 시작일은 오늘 (REBUILD 5-3)
  startDate: toDateKey(new Date()),
  endDate: "",
  description: "",
  // 기본 태그 3개 (프로토타입 defTags.slice(0, 3))
  tags: PROJECT_TAG_PRESETS.slice(0, 3),
});

/**
 * 프로젝트 만들기 드로어 (보드 01-a · 01-a2 · 프로토타입 projectForm · REBUILD 5-3).
 * 이름 * → 색상 → 「추가 설정 · 기간, 설명, 태그」(누르면 버튼은 사라지고 시작일/마감일 → 설명 → 태그).
 * 상태는 자동(시작일 기준), 메인은 ⋯ 메뉴에서. [취소][만들기], 이름이 비면 [만들기]는 못 누른다.
 * ⌘/Ctrl+Enter로도 만든다. 바꾼 채로 닫으면 「저장하지 않고 닫을까요?」.
 */
function ProjectCreateDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const toast = useToast();
  const nameId = useId();
  const descriptionId = useId();
  const colorLabelId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [form, setForm] = useState<FormState>(initialState);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [showNameError, setShowNameError] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { createProjectAsync, isCreating } = useProjectMutations();
  const today = toDateKey(new Date());
  const [initial, setInitial] = useState<FormState>(initialState);
  const isDirty = JSON.stringify(form) !== JSON.stringify(initial);

  const update = (next: Partial<FormState>) => setForm((current) => ({ ...current, ...next }));

  const reset = () => {
    const next = initialState();
    setInitial(next);
    setForm(next);
    setIsMoreOpen(false);
    setShowNameError(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const requestClose = () => (isDirty ? setIsConfirmOpen(true) : close());

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    const name = form.name.trim();

    if (!name) {
      setShowNameError(true);
      return;
    }

    try {
      await createProjectAsync({
        name,
        description: form.description.trim(),
        teamId: null,
        isPersonal: true,
        color: form.color,
        startDate: form.startDate,
        endDate: form.endDate,
        completedAt: null,
        status: getAutoProjectStatus(form.startDate, today),
        isStatusManual: false,
        isMain: false,
        tags: form.tags,
        creatorId: currentUser.id,
      });
      toast(TOAST_TEXT.saved);
      close();
    } catch {
      toast(TOAST_TEXT.saveFailed, { retry: () => void submit() });
    }
  };

  const wrap = (children: ReactNode) => (
    <form
      noValidate
      onSubmit={submit}
      onKeyDown={(event) => {
        if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
          event.preventDefault();
          void submit();
        }
      }}
      className="flex min-h-0 flex-1 flex-col"
    >
      {children}
    </form>
  );

  return (
    <>
      <Drawer
        isOpen={isOpen}
        onClose={requestClose}
        title="프로젝트 추가"
        panelRef={panelRef}
        wrap={wrap}
        footer={
          <>
            <Button onClick={requestClose} disabled={isCreating}>
              {BUTTON_LABEL.cancel}
            </Button>
            <Button type="submit" variant="primary" disabled={isCreating || !form.name.trim()}>
              {BUTTON_LABEL.create}
            </Button>
          </>
        }
      >
        <Field
          label="이름"
          htmlFor={nameId}
          required
          error={showNameError ? "이름을 입력해 주세요." : undefined}
        >
          <GrowingInput
            id={nameId}
            value={form.name}
            maxLength={NAME_MAX}
            placeholder="프로젝트 이름 입력"
            invalid={showNameError}
            aria-required="true"
            onChange={(event) => {
              update({ name: event.target.value });
              setShowNameError(false);
            }}
          />
        </Field>
        <Field label="색상" labelId={colorLabelId}>
          <ColorSwatches
            value={form.color}
            onChange={(color) => update({ color })}
            labelledBy={colorLabelId}
          />
        </Field>
        <Button
          variant="ghost"
          size="sm"
          aria-expanded={isMoreOpen}
          onClick={() => setIsMoreOpen((open) => !open)}
          className="-ml-2 self-start"
        >
          {/* 펼쳐도 버튼은 남고 화살표만 위로 (REBUILD 6) */}
          <ChevronDown
            size={16}
            aria-hidden
            className={cn("transition-transform duration-150", isMoreOpen && "rotate-180")}
          />
          추가 설정
          <span className="font-normal text-[var(--t3)]">· 기간, 설명, 태그</span>
        </Button>
        {isMoreOpen ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="시작일">
                <DateField
                  label="시작일"
                  value={form.startDate}
                  min={today}
                  onChange={(startDate) =>
                    update({
                      startDate,
                      // 마감일이 시작일보다 앞이면 비운다
                      endDate:
                        form.endDate && startDate && form.endDate < startDate ? "" : form.endDate,
                    })
                  }
                />
              </Field>
              <Field label="마감일">
                <DateField
                  label="마감일"
                  value={form.endDate}
                  min={form.startDate || today}
                  onChange={(endDate) => update({ endDate })}
                />
              </Field>
            </div>
            <Field label="설명" htmlFor={descriptionId}>
              <TextArea
                id={descriptionId}
                value={form.description}
                maxLength={500}
                placeholder="설명 입력"
                onChange={(event) => update({ description: event.target.value })}
              />
            </Field>
            <TagField tags={form.tags} onChange={(tags) => update({ tags })} />
          </>
        ) : null}
      </Drawer>
      <DiscardConfirmDialog
        isOpen={isConfirmOpen}
        withinRef={panelRef}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          close();
        }}
      />
    </>
  );
}

function FromQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get(NEW_PROJECT_PARAM) === "1";

  const close = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(NEW_PROJECT_PARAM);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  return <ProjectCreateDrawer isOpen={isOpen} onClose={close} />;
}

/**
 * 주소에 `?new=1`이 있으면 만들기 드로어를 연다 (PRD IA `/projects?new=1`). 닫으면 주소에서 뺀다.
 */
export default function ProjectCreateRoute() {
  return (
    <Suspense fallback={null}>
      <FromQuery />
    </Suspense>
  );
}
