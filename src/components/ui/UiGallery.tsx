"use client";

import { useId, useRef, useState, type ReactNode } from "react";

import Button from "@/components/ui/Button";
import { Chip, Tag } from "@/components/ui/Chip";
import ColorSwatches from "@/components/ui/ColorSwatches";
import { DeleteConfirmDialog, DiscardConfirmDialog } from "@/components/ui/ConfirmDialog";
import Drawer from "@/components/ui/Drawer";
import EmptyState from "@/components/ui/EmptyState";
import Field from "@/components/ui/Field";
import FolderCard from "@/components/ui/FolderCard";
import {
  CircleAlert,
  ChevronDown,
  Folder,
  LayoutGrid,
  ListChecks,
  Plus,
} from "@/components/ui/icon";
import Kbd from "@/components/ui/Kbd";
import { MenuItem, MenuSeparator, MoreMenu, PickRow } from "@/components/ui/Menu";
import Mosaic from "@/components/ui/Mosaic";
import Popover from "@/components/ui/Popover";
import QuickAddInput from "@/components/ui/QuickAddInput";
import SearchField from "@/components/ui/SearchField";
import Segmented from "@/components/ui/Segmented";
import Tabs from "@/components/ui/Tabs";
import TagField from "@/components/ui/TagField";
import { TextArea, TextInput } from "@/components/ui/TextInput";
import { ToastProvider, useToast } from "@/components/ui/Toast";

import { BUTTON_LABEL, QUICK_ADD_PLACEHOLDER, TOAST_TEXT } from "@/content/ui";

import { DEFAULT_PROJECT_COLOR, type ProjectColorKey } from "@/lib/projectPalette";

// 견본에 쓰는 글은 프로토타입 문구 그대로 (projectForm · pmenu · toast)
const SAMPLE_DAYS = Array.from({ length: 140 }, (_, index) => ({
  date: new Date(Date.now() - index * 86400000).toISOString().slice(0, 10),
  count: (index * 7) % 5,
}));

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section data-kit={id} className="flex flex-col gap-3 border-t border-[var(--border)] pt-6">
      <h2 className="text-sm font-semibold text-[var(--t3)]">{title}</h2>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </section>
  );
}

/**
 * 공통 컴포넌트 견본 (REBUILD 3-0 확인용, `/kit`). 라이트 · 다크를 오가며 보드 값과 잰다.
 */
export default function UiGallery() {
  return (
    <ToastProvider>
      <Gallery />
    </ToastProvider>
  );
}

function Gallery() {
  const toast = useToast();
  const nameId = useId();
  const descId = useId();
  const colorLabelId = useId();
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [query, setQuery] = useState("");
  const [seg, setSeg] = useState("all");
  const [view, setView] = useState("card");
  const [late, setLate] = useState(false);
  const [color, setColor] = useState<ProjectColorKey>(DEFAULT_PROJECT_COLOR);
  const [tags, setTags] = useState(["기획", "개발", "디자인"]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPopOpen, setIsPopOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(1);
  const panelRef = useRef<HTMLElement>(null);
  const popAnchorRef = useRef<HTMLButtonElement>(null);

  const switchTheme = (next: "light" | "dark") => {
    setTheme(next);
    document.documentElement.dataset.theme = next;
  };

  return (
    <main className="min-h-dvh bg-[var(--bg)] px-4 py-8 text-[var(--text)] md:px-10">
      <div className="mx-auto flex max-w-280 flex-col gap-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold">공통 컴포넌트</h1>
          <Segmented
            label="테마"
            value={theme}
            onChange={switchTheme}
            items={[
              { value: "light", label: "라이트" },
              { value: "dark", label: "다크" },
            ]}
          />
        </header>

        <Section id="button" title="버튼 · md 40/16 · sm 36/12 · xs 28/8">
          {(["md", "sm", "xs"] as const).map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-2">
              <Button variant="primary" size={size}>
                <Plus size={16} aria-hidden />
                추가
              </Button>
              <Button size={size}>취소</Button>
              <Button variant="ghost" size={size}>
                더보기
              </Button>
              <Button variant="danger" size={size}>
                삭제
              </Button>
              <Button variant="secondary" size={size} iconOnly aria-label="추가">
                <Plus size={16} aria-hidden />
              </Button>
              <Button variant="primary" size={size} disabled>
                추가
              </Button>
            </div>
          ))}
        </Section>

        <Section id="input" title="입력칸 · 검색칸">
          <div className="flex w-90 max-w-full flex-col gap-6">
            <Field label="이름" htmlFor={nameId} required>
              <TextInput id={nameId} placeholder="프로젝트 이름 입력" maxLength={50} />
            </Field>
            <Field label="이름" required error="이름을 입력해 주세요.">
              <TextInput placeholder="프로젝트 이름 입력" invalid />
            </Field>
            <Field label="설명" htmlFor={descId}>
              <TextArea id={descId} placeholder="설명 입력" />
            </Field>
            <TextInput placeholder="프로젝트 이름 입력" disabled />
          </div>
          <div className="flex w-60 max-w-full flex-col gap-3">
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="프로젝트 검색"
              ariaLabel="프로젝트 검색"
            />
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="프로젝트 찾기"
              ariaLabel="프로젝트 찾기"
              size="md"
            />
          </div>
        </Section>

        <Section id="chip" title="칩 · 태그 · 세그먼트 · 탭">
          <Segmented
            label="프로젝트 상태"
            value={seg}
            onChange={setSeg}
            items={[
              { value: "all", label: "전체", count: 15 },
              { value: "plan", label: "계획", count: 2 },
              { value: "active", label: "진행 중", count: 5 },
            ]}
          />
          <Chip
            selected={late}
            onClick={() => setLate((value) => !value)}
            icon={<CircleAlert size={16} aria-hidden />}
            count={3}
          >
            마감 지남만
          </Chip>
          <Segmented
            label="보기 방식"
            value={view}
            onChange={setView}
            items={[
              {
                value: "card",
                label: <LayoutGrid size={16} aria-hidden />,
                ariaLabel: "카드 보기",
              },
              {
                value: "list",
                label: <ListChecks size={16} aria-hidden />,
                ariaLabel: "목록 보기",
              },
            ]}
          />
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <Tag
                key={tag}
                removeLabel={`${tag} 태그 지우기`}
                onRemove={() => setTags((list) => list.filter((item) => item !== tag))}
              >
                {tag}
              </Tag>
            ))}
          </div>
          <Tabs
            className="w-full"
            label="프로젝트 범위"
            value="all"
            items={[
              { key: "all", label: "전체" },
              { key: "main", label: "메인 프로젝트" },
              { key: "fav", label: "즐겨찾기" },
            ]}
          />
        </Section>

        <Section id="swatch" title="색 칸 · 28 · 한 줄 10개">
          <span id={colorLabelId} className="sr-only">
            색상
          </span>
          <ColorSwatches value={color} onChange={setColor} labelledBy={colorLabelId} />
        </Section>

        <Section id="layer" title="드로어 · 확인창 · 팝오버 · 메뉴 · 토스트">
          <Button variant="primary" onClick={() => setIsDrawerOpen(true)}>
            드로어 열기
          </Button>
          <Button ref={popAnchorRef} onClick={() => setIsPopOpen((open) => !open)}>
            프로젝트 고르기
            <ChevronDown size={16} aria-hidden />
          </Button>
          <MoreMenu label="프로젝트 메뉴">
            {(close) => (
              <>
                <MenuItem onSelect={close}>열기</MenuItem>
                <MenuItem onSelect={close}>메인 프로젝트로 지정</MenuItem>
                <MenuSeparator />
                <MenuItem danger onSelect={close}>
                  삭제
                </MenuItem>
              </>
            )}
          </MoreMenu>
          <Button onClick={() => toast(TOAST_TEXT.saved)}>토스트</Button>
          <span className="inline-flex items-center gap-2 text-sm">
            빠른 입력 <Kbd>Enter ↵</Kbd>
          </span>
          <Button onClick={() => toast(TOAST_TEXT.deleted, { undo: () => undefined })}>
            되돌리기 토스트
          </Button>
          <Button onClick={() => toast(TOAST_TEXT.saveFailed, { retry: () => undefined })}>
            오류 토스트
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            삭제 확인
          </Button>
          <div className="w-90 max-w-full">
            <QuickAddInput
              placeholder={QUICK_ADD_PLACEHOLDER.task}
              ariaLabel="태스크 추가"
              onSubmit={(value) => toast(`${value} · ${TOAST_TEXT.saved}`)}
            />
          </div>
          <Popover
            isOpen={isPopOpen}
            onClose={() => setIsPopOpen(false)}
            anchorRef={popAnchorRef}
            title="프로젝트 선택"
            width={320}
            role="listbox"
          >
            <PickRow
              selected={picked === null}
              onSelect={() => setPicked(null)}
              leading={
                <span className="size-2.5 rounded-full border border-[var(--t3)]" aria-hidden />
              }
            >
              <span className="text-[var(--t2)]">프로젝트 없음</span>
            </PickRow>
            <PickRow
              selected={picked === 1}
              onSelect={() => setPicked(1)}
              leading={<span className="size-2.5 rounded-full bg-[var(--c-project)]" aria-hidden />}
            >
              팀 업무와 목표와 일정과 담당자를 한곳에서 관리하는 전사 협업 워크스페이스 구축
              프로젝트
            </PickRow>
          </Popover>
        </Section>

        <Section id="empty" title="빈 상태">
          <EmptyState
            className="w-full"
            icon={<Folder size={24} />}
            title="프로젝트가 없어요"
            actions={<Button variant="primary">추가</Button>}
          />
        </Section>

        <Section id="folder" title="폴더 카드 · 모자이크">
          <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            <FolderCard
              color={color}
              isMain
              title="팀 업무와 목표와 일정과 담당자를 한곳에서 관리하는 전사 협업 워크스페이스 구축 프로젝트"
              titleAction={
                <MoreMenu label="프로젝트 메뉴">
                  {(close) => <MenuItem onSelect={close}>열기</MenuItem>}
                </MoreMenu>
              }
              meta="~ 2026.09.01 · 목표 1/4 · 태스크 6/9 · 진행률 67%"
              href="#"
            >
              <Mosaic days={SAMPLE_DAYS} color={color} />
            </FolderCard>
            <FolderCard color="teal" title="스토어 출시 준비" meta="~ 2026.08.20 · 진행률 50%">
              <Mosaic days={SAMPLE_DAYS.slice(40)} color="teal" />
            </FolderCard>
          </div>
        </Section>
      </div>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsConfirmOpen(true)}
        title="프로젝트 추가"
        panelRef={panelRef}
        footer={
          <>
            <Button onClick={() => setIsConfirmOpen(true)}>{BUTTON_LABEL.cancel}</Button>
            <Button variant="primary">{BUTTON_LABEL.create}</Button>
          </>
        }
      >
        <Field label="이름" htmlFor={`${nameId}-d`} required>
          <TextInput id={`${nameId}-d`} placeholder="프로젝트 이름 입력" maxLength={50} />
        </Field>
        <Field label="색상" labelId={`${colorLabelId}-d`}>
          <ColorSwatches value={color} onChange={setColor} labelledBy={`${colorLabelId}-d`} />
        </Field>
        <Button variant="ghost" size="sm" className="-ml-2 self-start" aria-expanded={false}>
          <ChevronDown size={16} aria-hidden />
          추가 설정
          <span className="text-[var(--t3)]">· 기간, 설명, 태그</span>
        </Button>
        <TagField tags={tags} onChange={setTags} />
      </Drawer>
      <DiscardConfirmDialog
        isOpen={isConfirmOpen}
        withinRef={panelRef}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          setIsDrawerOpen(false);
        }}
      />
      <DeleteConfirmDialog
        target="프로젝트"
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={() => {
          setIsDeleteOpen(false);
          toast(TOAST_TEXT.deleted, { undo: () => undefined });
        }}
      />
    </main>
  );
}
