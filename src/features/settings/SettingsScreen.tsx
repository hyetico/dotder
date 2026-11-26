"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";

import Button from "@/components/kit/Button";
import Card from "@/components/kit/Card";
import { Tag } from "@/components/kit/Chip";
import ColorSwatches from "@/components/kit/ColorSwatches";
import RadioDot from "@/components/kit/RadioDot";
import Segmented from "@/components/kit/Segmented";
import Select from "@/components/kit/Select";
import Switch from "@/components/kit/Switch";
import { usePageMeta } from "@/components/shell/PageMeta";
import { applyThemeMode, readThemeMode, type ThemeMode } from "@/components/shell/theme";
import { ChevronRight, Plus } from "@/components/ui/icon";

import packageJson from "@/../package.json";
import { PROJECT_TAG_PRESETS } from "@/features/projects/constants/projectTags";
import { useDataActions } from "@/features/settings/useDataActions";

import { cn } from "@/lib/cn";
import { DEFAULT_PROJECT_COLOR, type ProjectColorKey } from "@/lib/projectPalette";

// 테마와 데이터(내보내기 · 모두 지우기)만 실제로 동작한다. 나머지 칸은 화면만 있고 값은 이번 화면 안에서만 바뀐다 (사용자 결정: 동작은 나중)
const themeListeners = new Set<() => void>();
const useThemeMode = () =>
  useSyncExternalStore(
    (onChange) => {
      themeListeners.add(onChange);
      return () => themeListeners.delete(onChange);
    },
    readThemeMode,
    () => "system" as ThemeMode,
  );
const setThemeMode = (mode: ThemeMode) => {
  applyThemeMode(mode);
  themeListeners.forEach((listener) => listener());
};

const SECTIONS = [
  { id: "general", label: "일반" },
  { id: "defaults", label: "기본값" },
  { id: "features", label: "기능" },
  { id: "tabs", label: "맞춤 탭" },
  { id: "data", label: "데이터" },
  { id: "about", label: "정보" },
];

const THEME_ITEMS: { value: ThemeMode; label: string }[] = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템" },
];

// 정보 칸 링크 (사용자가 준 주소)
const PORTFOLIO_URL = "https://hyetico-portfolio-sigma.vercel.app/";

/**
 * 설정 (REBUILD 3-7 · 보드 12 · T · M 12).
 * 웹: 제목 + 안내 → 왼쪽 목차 200(붙어 있음) | 묶음(제목 18 + 설명 12) · 카드(좌우 20) · 줄(최소 64 · 라벨 500 + 설명 | 칸).
 * 태블릿 · 모바일: 묶음 이름 12 600 → 카드(좌우 16) · 줄 56.
 * 테마만 이 기기에 저장해 적용하고, 나머지는 화면만 있다 (보고 참고).
 */
export default function SettingsScreen() {
  const theme = useThemeMode();
  const [active, setActive] = useState("general");
  const [start, setStart] = useState("projects");
  const [weekStart, setWeekStart] = useState<"sun" | "mon">("mon");
  const [dateFormat, setDateFormat] = useState("dot");
  const [color, setColor] = useState<ProjectColorKey>(DEFAULT_PROJECT_COLOR);
  const [tags, setTags] = useState<string[]>([...PROJECT_TAG_PRESETS]);
  const [priority, setPriority] = useState("MEDIUM");
  const [features, setFeatures] = useState({
    goals: true,
    main: true,
    color: true,
    mosaic: true,
    hideDone: false,
  });

  const dataActions = useDataActions();

  // 태블릿 · 모바일 헤더는 ← 뒤로 (보드 T · M 12)
  usePageMeta("설정", undefined, "/projects");

  const feature = (key: keyof typeof features) => ({
    checked: features[key],
    onChange: (checked: boolean) => setFeatures((current) => ({ ...current, [key]: checked })),
  });

  return (
    <div className="min-h-full bg-[var(--bg)]">
      <div className="mx-auto flex w-full max-w-320 flex-col gap-3 px-4 pt-6 pb-8 md:px-6 md:pt-8 lg:gap-6 lg:px-10 lg:pt-10 lg:pb-16">
        <header className="flex flex-col gap-1 max-lg:hidden">
          <h1 className="text-2xl font-bold">설정</h1>
          <p className="text-sm text-[var(--t2)]">이 기기에만 저장돼요 (v1 · 로그인 없음)</p>
        </header>

        {/* 웹 (보드 12) */}
        <div className="grid grid-cols-[--spacing(50)_minmax(0,1fr)] items-start gap-10 max-lg:hidden">
          <nav aria-label="설정 목차" className="sticky top-18 flex flex-col gap-0.5">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setActive(section.id)}
                aria-current={active === section.id ? "true" : undefined}
                className={cn(
                  "kit-focus flex h-9 items-center rounded-[var(--radius-sm)] px-2.5 text-sm transition-colors duration-120",
                  active === section.id ? "bg-[var(--s3)] font-semibold" : "hover:bg-[var(--s2)]",
                )}
              >
                {section.label}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-10">
            <WideSection id="general" title="일반" text="보기와 언어">
              <WideRow label="테마" help="라이트 · 다크 · 시스템 설정 따르기">
                <div
                  role="radiogroup"
                  aria-label="테마"
                  className="flex flex-wrap justify-end gap-2"
                >
                  {THEME_ITEMS.map((item) => (
                    <ThemeCard
                      key={item.value}
                      mode={item.value}
                      label={item.label}
                      checked={theme === item.value}
                      onSelect={() => setThemeMode(item.value)}
                    />
                  ))}
                </div>
              </WideRow>
              <WideRow label="시작 화면" help="앱을 열면 처음 보일 화면">
                <div className="w-50">
                  <Select
                    label="시작 화면"
                    value={start}
                    onChange={setStart}
                    options={START_OPTIONS}
                  />
                </div>
              </WideRow>
              <WideRow label="한 주 시작" help="캘린더·'이번 주' 묶음 기준">
                <Segmented
                  label="한 주 시작"
                  value={weekStart}
                  onChange={setWeekStart}
                  items={[
                    { value: "sun", label: "일요일" },
                    { value: "mon", label: "월요일" },
                  ]}
                />
              </WideRow>
              <WideRow label="날짜 형식" help="목록·카드에 보이는 날짜">
                <div className="w-50">
                  <Select
                    label="날짜 형식"
                    value={dateFormat}
                    onChange={setDateFormat}
                    options={DATE_OPTIONS}
                  />
                </div>
              </WideRow>
            </WideSection>

            <WideSection id="defaults" title="기본값" text="새로 만들 때 미리 채워지는 값">
              <WideRow
                label="새 프로젝트 기본 색"
                help="색을 고르지 않으면 이 색"
                labelId="settings-color"
              >
                <ColorSwatches value={color} onChange={setColor} labelledBy="settings-color" />
              </WideRow>
              <div className="flex flex-col gap-3 border-t border-[var(--divider)] py-3 first:border-t-0">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">기본 목표 태그</span>
                  <span className="text-xs text-[var(--t3)]">
                    새 프로젝트에 복사돼요 · {tags.length} / 10
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {tags.map((tag) => (
                    <Tag
                      key={tag}
                      removeLabel={`‘${tag}’ 빼기`}
                      onRemove={() => setTags(tags.filter((item) => item !== tag))}
                    >
                      {tag}
                    </Tag>
                  ))}
                  <Button variant="ghost" size="xs" pending>
                    <Plus size={14} aria-hidden />
                    태그 추가
                  </Button>
                </div>
              </div>
              <WideRow label="새 태스크 기본 우선순위">
                <div className="w-50">
                  <Select
                    label="새 태스크 기본 우선순위"
                    value={priority}
                    onChange={setPriority}
                    options={PRIORITY_OPTIONS}
                  />
                </div>
              </WideRow>
            </WideSection>

            <WideSection id="features" title="기능" text="쓰지 않는 기능은 꺼서 화면을 단순하게">
              <WideRow label="목표 사용" help="끄면 목표 메뉴·탭이 숨겨지고 태스크만 써요">
                <Switch label="목표 사용" {...feature("goals")} />
              </WideRow>
              <WideRow
                label="메인 프로젝트 표시"
                help="사이드바와 목록 맨 앞에 메인 프로젝트를 보여줘요"
              >
                <Switch label="메인 프로젝트 표시" {...feature("main")} />
              </WideRow>
              <WideRow label="프로젝트 색 사용" help="끄면 폴더 카드가 모두 회색">
                <Switch label="프로젝트 색 사용" {...feature("color")} />
              </WideRow>
              <WideRow label="활동 잔디" help="프로젝트 카드에 최근 20주 활동 표시">
                <Switch label="활동 잔디" {...feature("mosaic")} />
              </WideRow>
              <WideRow label="완료 항목 숨기기" help="목록에서 완료를 기본으로 접어 둬요">
                <Switch label="완료 항목 숨기기" {...feature("hideDone")} />
              </WideRow>
            </WideSection>

            <WideSection
              id="tabs"
              title="맞춤 탭"
              text="원하는 프로젝트만 모아 보는 탭 · 프로젝트·목표·메모 화면에 같이 보여요 · 0 / 5"
            >
              <div className="py-3">
                <Button size="sm" pending>
                  <Plus size={16} aria-hidden />탭 만들기
                </Button>
              </div>
            </WideSection>

            <WideSection id="data" title="데이터" text="v1은 브라우저에 저장돼요">
              <WideRow label="내보내기" help="모든 프로젝트·목표·태스크·메모를 JSON 파일로">
                <Button size="sm" onClick={() => void dataActions.exportJson()}>
                  내보내기
                </Button>
              </WideRow>
              <WideRow label="가져오기" help="내보낸 파일로 되돌리기">
                <Button size="sm" pending>
                  파일 선택
                </Button>
              </WideRow>
              <WideRow
                label="모든 데이터 지우기"
                help="삭제하면 되돌릴 수 없어요. 확인 창이 한 번 더 열려요."
                danger
              >
                <Button size="sm" onClick={() => void dataActions.requestClear()}>
                  지우기
                </Button>
              </WideRow>
            </WideSection>

            <WideSection id="about" title="정보">
              <WideRow label="버전" help={`v${packageJson.version}`} />
              <WideRow label="만든 사람" help="hyetico-portfolio-sigma.vercel.app">
                <Button variant="ghost" size="sm" href={PORTFOLIO_URL}>
                  포트폴리오
                </Button>
              </WideRow>
              <WideRow label="소스 코드" help="github.com/hyetico/dotder">
                <Button variant="ghost" size="sm" href="https://github.com/hyetico/dotder">
                  GitHub
                </Button>
              </WideRow>
            </WideSection>
          </div>
        </div>

        {/* 태블릿 · 모바일 (보드 T · M 12) */}
        <div className="flex flex-col gap-3 lg:hidden">
          <CompactGroup title="일반">
            <CompactRow label="테마">
              <Segmented label="테마" value={theme} onChange={setThemeMode} items={THEME_ITEMS} />
            </CompactRow>
            <CompactRow label="시작 화면">
              <Select
                variant="text"
                label="시작 화면"
                value={start}
                onChange={setStart}
                options={START_OPTIONS}
              />
            </CompactRow>
            <CompactRow label="한 주 시작">
              <Select
                variant="text"
                label="한 주 시작"
                value={weekStart}
                onChange={setWeekStart}
                options={[
                  { value: "sun", label: "일요일" },
                  { value: "mon", label: "월요일" },
                ]}
              />
            </CompactRow>
          </CompactGroup>
          <CompactGroup title="기능">
            <CompactRow label="목표 사용">
              <Switch label="목표 사용" {...feature("goals")} />
            </CompactRow>
            <CompactRow label="메인 프로젝트">
              <Switch label="메인 프로젝트" {...feature("main")} />
            </CompactRow>
            <CompactRow label="프로젝트 색" help="폴더 카드 · 점에 보여 줘요">
              <Switch label="프로젝트 색" {...feature("color")} />
            </CompactRow>
            <CompactRow label="활동 모자이크" help="폴더 카드에 보여 줘요">
              <Switch label="활동 모자이크" {...feature("mosaic")} />
            </CompactRow>
          </CompactGroup>
          <CompactGroup title="데이터">
            <CompactRow label="내보내기" onClick={() => void dataActions.exportJson()}>
              <ChevronRight size={16} aria-hidden className="text-[var(--t3)]" />
            </CompactRow>
            <CompactRow
              label="모두 지우기"
              danger
              onClick={() => void dataActions.requestClear()}
            />
          </CompactGroup>
        </div>
      </div>
      {dataActions.dialog}
    </div>
  );
}

const START_OPTIONS = [
  { value: "projects", label: "프로젝트" },
  { value: "goals", label: "목표" },
  { value: "tasks", label: "태스크" },
  { value: "memos", label: "메모" },
];

const DATE_OPTIONS = [
  { value: "dot", label: "2026.09.01" },
  { value: "dash", label: "2026-09-01" },
];

const PRIORITY_OPTIONS = [
  { value: "HIGH", label: "높음" },
  { value: "MEDIUM", label: "보통" },
  { value: "LOW", label: "낮음" },
];

function WideSection({
  id,
  title,
  text,
  children,
}: {
  id: string;
  title: string;
  text?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="flex scroll-mt-20 flex-col gap-2">
      <div className="flex flex-col">
        <h2 id={`${id}-title`} className="text-lg font-semibold">
          {title}
        </h2>
        {text ? <span className="text-xs text-[var(--t3)]">{text}</span> : null}
      </div>
      <Card className="px-5 py-1">{children}</Card>
    </section>
  );
}

function WideRow({
  label,
  help,
  danger = false,
  labelId,
  children,
}: {
  label: string;
  help?: string;
  danger?: boolean;
  /** 칸을 이 라벨로 읽게 할 때 (색 칸) */
  labelId?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex min-h-16 flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--divider)] py-3 first:border-t-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <span id={labelId} className={cn("text-sm font-medium", danger && "text-[var(--bad)]")}>
          {label}
        </span>
        {help ? <span className="text-xs text-[var(--t3)]">{help}</span> : null}
      </div>
      {children}
    </div>
  );
}

function ThemeCard({
  mode,
  label,
  checked,
  onSelect,
}: {
  mode: ThemeMode;
  label: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={onSelect}
      className={cn(
        "kit-focus flex w-37.5 cursor-pointer flex-col gap-2 rounded-[var(--radius-md)] border bg-[var(--surface)] p-2.5 text-left text-sm transition-colors duration-120",
        checked
          ? "border-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]"
          : "border-[var(--border)] hover:border-[var(--border-2)]",
      )}
    >
      {/* 미리보기: 왼쪽 30% 사이드바 + 본문 막대 (보드 12) */}
      <span
        aria-hidden
        className="flex h-18 overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]"
        style={
          mode === "system"
            ? {
                background:
                  "linear-gradient(90deg, var(--preview-light-body) 50%, var(--preview-dark-body) 50%)",
              }
            : undefined
        }
      >
        <span
          className="w-[30%]"
          style={{
            background:
              mode === "light"
                ? "var(--preview-light-side)"
                : mode === "dark"
                  ? "var(--preview-dark-side)"
                  : "transparent",
          }}
        />
        <span
          className="flex flex-1 flex-col p-2"
          style={{
            background:
              mode === "light"
                ? "var(--preview-light-body)"
                : mode === "dark"
                  ? "var(--preview-dark-body)"
                  : "transparent",
          }}
        >
          <span
            className="h-1.5 w-[60%] rounded-[var(--radius-kbd)]"
            style={{
              background:
                mode === "light"
                  ? "var(--preview-light-side)"
                  : mode === "dark"
                    ? "var(--preview-dark-side)"
                    : "var(--preview-bar)",
            }}
          />
        </span>
      </span>
      <span className="flex items-center gap-2">
        <RadioDot checked={checked} />
        {label}
      </span>
    </button>
  );
}

function CompactGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2 [&+&]:mt-2">
      <h2 className="text-xs font-semibold text-[var(--t3)]">{title}</h2>
      <Card className="px-4">{children}</Card>
    </section>
  );
}

const compactRowClassName =
  "flex min-h-14 items-center gap-3 border-t border-[var(--divider)] first:border-t-0";

function CompactRow({
  label,
  help,
  danger = false,
  onClick,
  children,
}: {
  label: string;
  help?: string;
  danger?: boolean;
  /** 넘기면 줄 전체가 버튼 (데이터 「내보내기」 · 「모두 지우기」) */
  onClick?: () => void;
  children?: ReactNode;
}) {
  const content = (
    <>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className={cn("text-sm", danger && "text-[var(--bad)]")}>{label}</span>
        {help ? <span className="text-xs text-[var(--t3)]">{help}</span> : null}
      </div>
      {children}
    </>
  );

  return onClick ? (
    <button
      type="button"
      onClick={onClick}
      className={cn(compactRowClassName, "kit-focus w-full cursor-pointer text-left")}
    >
      {content}
    </button>
  ) : (
    <div className={compactRowClassName}>{content}</div>
  );
}
