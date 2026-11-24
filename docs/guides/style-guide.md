# 스타일 가이드

> 상태: v0.4 · 2026-11-24
> **디자인 값의 원본은 `design/boards/docs/` (handoff)입니다. 이 문서는 코드 쪽 이름과 쓰는 곳을 적습니다.** 값이 다르면 원본을 따르고, handoff를 받으면 `design/_handoff/CHANGES-*.md` 목록대로 이 문서도 고칩니다.
> "어떤 값을 쓰는가"만 다룹니다. 모든 값은 `src/app/globals.css`의 CSS 변수(토큰)로 정의하고, 코드에서는 토큰으로만 씁니다.
> 관련 결정: [0001 짝수 글자 크기](../decisions/0001-even-font-sizes.md), [0002 라이트·다크 모드](../decisions/0002-light-and-dark-mode.md)

## 0. 원칙

1. **하드코딩 금지.** `text-[#292D32]`, `px-[62px]`, `text-[13px]`, `bg-white` 같은 값을 쓰지 않는다. 필요한 값이 없으면 토큰을 먼저 추가하고 이 문서에 적는다.
2. **이름은 용도로.** `--color-text-secondary` O, `--color-gray-600` X
3. **모든 색 토큰은 라이트와 다크 값을 둘 다 가진다.**
4. **글자 크기와 줄 높이는 짝수만.**
5. **간격은 4px 단위.**

`★` = 아직 globals.css에 없어서 새로 추가할 토큰 · `◆` = 이름을 바꿀 토큰 (4단계에서 대부분 추가함. 남은 표시만 할 일)

## 1. 색

### 1-1. 바탕

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--color-background` | `#ffffff` | `#16181c` | 앱 배경 |
| `--color-surface` | `#ffffff` | `#1b1e22` | 카드, 드로어, 모달, 팝오버 (`bg-white` 대신) |
| `--color-surface-raised` | `#ffffff` | `#2c3138` | 메뉴, 팝오버처럼 위에 뜨는 면 |
| `--color-page` | `#f4f5f4` | `#191b1e` | 회색 페이지 배경 (설정 등) |
| `--color-muted` | `#f8f8f7` | `#2a2f35` | 약한 면 |
| `--color-hover` | `#f1f1ef` | `#30353c` | 호버 |
| `--color-hover-soft` | `#f7f7f5` | `#2a2f35` | 아주 약한 호버, 아이콘 블록 |
| `--color-hover-strong` | `#e9ebef` | `#3a4047` | 눌림 |
| `--color-border` | `#e2e5e7` | `#30353b` | 테두리, 구분선 |
| `--color-border-strong` | `#d1d5db` | `#3a4047` | 체크박스, 장식 테두리 (원본 `--border-2`) |
| `--color-border-subtle` | `#f0f0ee` | `#30353c` | 드로어 안 구분선 |
| `--color-overlay` | `rgb(15 18 22 / 35%)` | `rgb(0 0 0 / 55%)` | 모달·드로어·바텀시트 뒤 어둡게 (하나만 쓴다) |

### 1-2. 글자

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--color-text` | `#292d32` | `#e7e9ec` | 본문, 제목 |
| `--color-text-secondary` | `#475569` | `#aab2bb` | 설명 (원본 `--t2`) |
| `--color-text-muted` | `#6b7280` | `#8b949e` | 캡션, 메타, placeholder (원본 `--t3`) |
| `--color-text-disabled` | `#9ca3af` | `#6b737c` | 비활성 |
| `--color-text-placeholder` | `#c9c7c3` | `#5b636c` | 큰 제목 입력칸 placeholder |
| `--color-text-inverse` | `#ffffff` | `#16181c` | 주 버튼 위 글자 (`text-white` 대신, 원본 `--on-primary`) |

### 1-3. 주요 색

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--color-primary` | `#343840` | `#d1d5db` | 주 버튼, 포커스 링, 선택 칩 |
| `--color-primary-hover` | `#2c3037` | `#e5e7eb` | 주 버튼 호버 (다크는 한 단계 밝게) |
| `--color-primary-soft` | `#f4f5f7` | `#30353c` | 약한 강조 |
| `--color-primary-ring` | `#d1d5db` | `#5b636c` | 포커스 링 |

- 다크 주 버튼은 반전 색(`#e7e9ec`)이 눈부셔서 한 단계 낮춘 `#d1d5db`를 쓴다. 주 버튼 테두리는 바탕과 같은 색이다.
- **그라데이션은 주 버튼에만.** `--gradient-primary`(`-hover`)는 `--color-primary` · `--color-primary-mid` · `--color-primary-hover` · `--color-primary-hover-mid`로 만들어서 다크에서도 따라 바뀐다.

### 1-4. 입력칸

| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--color-field` | `#ffffff` | `#2a2f35` |
| `--color-field-disabled` | `#f8f8f7` | `#22262b` |
| `--color-field-text` | `#292d32` | `#e7e9ec` |
| `--color-field-placeholder` | `#68717a` | `#a8b0b8` |
| `--color-field-border` | `#868c94` | `#6b737c` |
| `--color-field-border-hover` | `#5f6670` | `#9aa2ab` |
| `--color-field-focus` | `#343840` | `#d1d5db` |
| `--color-field-error` | `#ef4444` | `#f87171` |

- 입력칸 선은 바탕 대비 3:1 이상이어야 한다 (원본 `--input-line` · `--input-line-h`). 장식 테두리(`--color-border`)와 섞어 쓰지 않는다.

### 1-5. 상태

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--color-success` | `#22c55e` | `#4ade80` | 완료 |
| `--color-info` | `#3b82f6` | `#60a5fa` | 진행 중 |
| `--color-warning` | `#f97316` | `#fb923c` | 보류 |
| `--color-danger` | `#ef4444` | `#f87171` | 지연, 삭제, 오류 |
| `--color-neutral` | `#9ca3af` | `#6b737c` | 계획, 미시작, 할 일 |
| `--color-neutral-soft` | `#f1f1ef` | `#262a30` | 계획 뱃지 배경 |
| `--color-info-soft` | `#eff6ff` | `#1c2a40` | 진행 중 뱃지 배경 |
| `--color-warning-soft` | `#fff7ed` | `#3a2716` | 보류 뱃지 배경 |
| `--color-success-soft` | `#ecfdf3` | `#16301f` | 완료 뱃지 배경 |
| `--color-danger-soft` | `#fef2f2` | `#3d1c1e` | 지연 뱃지 배경 |
| `--color-neutral-text` | `#475569` | `#aab2bb` | 계획 글자 |
| `--color-info-text` | `#1d4ed8` | `#8ab4ff` | 진행 중 글자·작은 아이콘 |
| `--color-success-text` | `#15803d` | `#6fd69a` | 완료 글자·작은 아이콘 |
| `--color-warning-text` | `#c2410c` | `#f5a66b` | 보류·오늘 마감 글자 |
| `--color-danger-text` | `#b91c1c` | `#ff8a8a` | 지연·오류 글자 (라이트 대비 5.91) |

- **글자와 작은 아이콘에는 `-text` 토큰을 쓴다.** 기본 상태 색(`#3b82f6`, `#ef4444` 등)은 흰 배경 위 글자 대비가 4.5:1이 안 된다. 기본 색은 막대, 점, 넓은 면에만 쓴다.
- 상태와 색의 연결은 **한 파일**(`src/lib/statusColors.ts`)에서만 정한다. 값은 토큰(`var(--color-…)`)과 `color-mix()`로만 쓴다.

### 1-6. 종류 색

사이드바 아이콘, 검색 결과 아이콘, 기록 점, 빈 상태 그림, 로고에만 쓴다. 버튼·탭·뱃지에는 쓰지 않는다.

| 토큰 | 라이트 | 다크 | 원본 |
|---|---|---|---|
| `--color-kind-project` | `#6b2d5b` | `#c98bb6` | `--c-project` |
| `--color-kind-goal` | `#2f6b5a` | `#6fc2a5` | `--c-goal` |
| `--color-kind-task` | `#6d28d9` | `#a78bfa` | `--c-task` |
| `--color-kind-memo` | `#c4a574` | `#d9bd8f` | `--c-memo` |

### 1-7. 사이드바 선택

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--color-nav-active` | `#343840` | `#2a2e35` | 선택된 메뉴 바탕 (다크는 반전하지 않고 차콜, 원본 `--nav-on-bg`) |
| `--color-nav-active-text` | `#ffffff` | `#f3f4f6` | 선택된 메뉴 글자 |

### 1-8. 프로젝트 색

기준 파일: `src/features/projects/utils/projectColors.ts`. 사용자가 고르는 9색이며 폴더 카드, 점, 모자이크, 진행 막대에만 쓴다.

| 화면 이름 | 값 | 코드 `label` |
|---|---|---|
| 회색 (기본, 색 없음) | `#9ca3af` | (없음) `PROJECT_NEUTRAL_ACCENT` |
| 세이지 | `#2f6b5a` | 세이지 |
| 블루 | `#3b82f6` | 블루 |
| 골드 | `#c4a574` | 골드 |
| 라벤더 | `#a78bfa` | 라벤더 |
| 바이올렛 | `#6d28d9` | 바이올렛 |
| 플럼 | `#6b2d5b` | 플럼 |
| 브라운 | `#6f4e37` | 브라운 |
| 코랄 | `#ef7f6b` | 코랄 |

- **없앤 색:** Ivory `#e7ddd0`, Ink `#2a2430`. 이미 저장된 값을 가까운 색으로 옮기는 일은 tech-debt S-12.
- 폴더 카드 바탕은 `color-mix()`로 프로젝트 색 **라이트 18% · 다크 20%** + 바탕. 다크 카드 위 보조 글자는 `--color-text-secondary`(`#aab2bb`, 대비 5.35 이상), 지연 글자는 `--color-danger-text`.
- 고르는 목록에서 메인 프로젝트는 색 점 대신 프로젝트 색 왕관을 쓴다. 다크에서는 프로젝트 색에 흰색 30%를 섞는다 (바탕 대비 3:1 이상).
- 설정에서 "프로젝트 색상"을 끄면 모두 회색.
- 폴더 바탕 비율은 `--project-tint` 토큰(라이트 18% · 다크 20%).

## 2. 글자

글꼴: **Pretendard** dynamic subset (한글을 나눠서 받음, `display: swap`) → `system-ui, sans-serif`. 통째로 받는 Pretendard Variable은 쓰지 않는다.

### 2-1. 크기 체계 (짝수만)

| 토큰 | 크기 / 줄 높이 |
|---|---|
| `--type-2xs` | 10 / 12 |
| `--type-xs` | 12 / 18 |
| `--type-sm` | 14 / 20 |
| `--type-md` | 16 / 24 |
| `--type-lg` | 18 / 28 |
| `--type-xl` | 20 / 28 |
| `--type-2xl` | 24 / 32 |
| `--type-3xl` | 28 / 36 |
| `--type-4xl` | 32 / 40 |

- 12px 줄 높이는 18px로 올린다. 16px은 한글 두 줄일 때 답답하다.

### 2-2. 의미 클래스 (코드에서는 이것만 쓴다)

| 클래스 | 크기 | 굵기 | 용도 |
|---|---|---|---|
| `text-page-title` | 24 / 32 | 700 | 페이지 제목, 드로어 제목 입력 |
| `text-section-title` | 18 / 28 | 600 | 섹션 제목 |
| `text-card-title` | 16 / 24 | 600 | 카드 제목, 폴더 카드 제목 (최대 2줄) |
| `text-body` | 14 / 20 | 400 | 본문, 행 값 |
| `text-label` | 14 / 20 | 600 | 폼·드로어 라벨 |
| `text-caption` | 12 / 18 | 400 | 메타, 안내, 보조 |
| `text-badge` | 12 / 18 | 500 | 뱃지 |
| `text-badge-sm` | 10 / 12 | 500 | 작은 뱃지 |

- `text-project-card-title`, `text-body-sm`은 4단계에서 지웠다. **남은 것:** `text-badge-sm-mobile` (5곳). 의미 클래스가 `@layer` 밖 일반 CSS라 `lg:text-badge` 같은 변형을 쓸 수 없어서 남겼다 (tech-debt S-13).
- Tailwind 기본 크기(`text-sm`, `text-xl` …)는 쓰지 않는다. 의미 클래스만 쓴다.
- 숫자가 바뀌는 자리에는 `tabular-nums`.

## 3. 간격

| 토큰 | 값 |
|---|---|
| `--space-1` ~ `--space-16` | 4 · 8 · 12 · 16 · 24 · 32 · 40 · 48 · 64 (`--space-1` 2 3 4 6 8 10 12 16) |

- **20(`--space-5`)은 쓰지 않는다.** 원본 간격 체계에 없다. 지금 20을 쓰는 곳은 4단계에서 16이나 24로 맞춘다. 폴더 카드 사이 간격은 24 (가로·세로).

| 용도 토큰 | 값 | 설명 |
|---|---|---|
| `--page-padding-x` | 16 → 24(md) → 32(lg) | 페이지 좌우 (xl 이상도 32) |
| `--page-padding` | 12 → 24(md) | 페이지 위아래 |
| `--page-title-above` | 32 | 탭 아래 ~ 제목 |
| `--page-title-gap` | 8 | 제목 ~ 설명 |
| `--page-title-below` | 32 | 제목 영역 ~ 다음 블록 |
| `--section-gap` | 24 | 페이지 안 섹션 사이 |
| `--drawer-padding-x` | 56 (모바일 20) | 드로어 본문 좌우 (지금 `62px` 하드코딩) |
| `--drawer-label-width` | 80 | 드로어 라벨 |
| `--drawer-row-py` | 16 | 드로어 행 위아래 |

## 4. 크기

| 토큰 | 값 | 용도 |
|---|---|---|
| `--header-height` | 56 | 헤더 |
| `--sidebar-width` | 245 | 사이드바 |
| `--sidebar-collapsed-width` | 64 | 접힌 사이드바 |
| `--page-frame-max` | 1200 | 본문 최대 너비 |
| `--drawer-width` | 400 | 드로어, 웹·태블릿 같음 (`--goal-drawer-width`를 이름 변경) |
| `--drawer-offset` | 0 | 드로어가 밀어낸 너비 (`--goal-drawer-offset` 이름 변경) |
| `--control-xs` / `-sm` / `-md` / `-lg` | 28 / 36 / 40 / 44 | 작은 버튼 / 툴바 / 기본 버튼·입력칸 / 터치 |
| `--button-height` | 40 | 기본 버튼 (md). 화면 너비로 바뀌지 않는다 |
| `--button-icon` / `--button-icon-hit` | 36 / 44 | 아이콘 버튼 / 터치 영역 |
| `--tab-height` | 40 | 탭 |
| `--modal-width` | 480 | 모달 (폼 · 맞춤 탭 추가 · 내보내기 · 보관함) |
| `--confirm-width` | 320 | 확인창 (`AlertModal`) |
| `--search-width` | 600 | 통합 검색 |
| `--popover-menu` | 220 | `⋯` 메뉴 |
| `--popover-sort` | 200 | 정렬 · 묶기 |
| `--popover-filter` | 280 | 필터 |
| `--popover-switcher` | 320 | 프로젝트 전환 |
| `--popover-calendar` | 282 | 달력 (7열 36) |
| 아이콘 | sm 14 · md 16 · lg 20 · xl 24 | `components/ui/icon/iconSize.ts` |

- 같은 줄의 버튼·검색칸·Segmented는 같은 높이로 맞춘다 (툴바 36).
- 누르는 영역은 웹 40 · 터치 44. 예외는 줄 끝 `⋯` 같은 xs 28 아이콘 버튼뿐이다.
- 버튼 높이 변형(`-action`, `-modal`, `-title`, `-xs`)은 컴포넌트의 `size`로만 고른다.

## 5. 모서리

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-xs` | 6 | xs 버튼 |
| `--radius-sm` | 8 | 버튼, 입력칸, 뱃지 |
| `--radius-md` | 12 | 카드, 팝오버, 메뉴, 토스트 |
| `--radius-lg` | 16 | 모달, 폴더 카드, 바텀시트 위 |
| `--radius-full` | 9999 | 알약 모양 칩·태그, 스위치 |

- 폴더 카드의 폴더 탭은 4 / 14 (탭 · 카드 모서리 조합). 폴더 카드 전용이다.
- `--radius-xl`(28)은 쓰지 않는다.

- `rounded-[6px]`, `[18px]`, `[22px]` 같은 값은 가까운 토큰으로 맞춘다.

## 6. 그림자

| 토큰 | 용도 |
|---|---|
| `--shadow-overlay` `0 12px 32px rgb(0 0 0 / 16%)` · 다크 50% | 팝오버, 메뉴, 드로어, 모달 (1종만) |

- 그림자는 이 하나만 쓴다. 같은 높이의 카드는 그림자 없이 테두리로 구분한다.
- `--shadow-card`, `--shadow-dropdown`은 4단계에서 지웠다. 폴더 카드의 `--shadow-project-card`(`-hover`)는 5단계 C1(폴더 카드)에서 정리한다.
- `shadow-[...]` 직접 값 금지.

## 7. 겹침 순서 (z-index)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--z-header` | 10 | 헤더, 사이드바 |
| `--z-overlay` | 50 | 오버레이 |
| `--z-drawer` | 60 | 드로어, 바텀시트 |
| `--z-modal` | 70 | 모달, 확인창 |
| `--z-popover` | 80 | 팝오버, 툴팁, 날짜 선택 (모달 위에서도 뜸) |
| `--z-toast` | 90 | 토스트 |

- 토큰은 `z-[var(--z-modal)]`처럼 쓴다. 확인창(`AlertModal`)은 모달과 같은 70이고, 나중에 열린 쪽이 위에 온다.

## 8. 움직임

| 토큰 | 값 | 용도 |
|---|---|---|
| `--duration-popover` | 120ms | 팝오버, 메뉴, 툴팁 페이드 |
| `--duration-overlay` | 150ms | 오버레이 페이드 |
| `--duration-drawer` | 180ms | 드로어 열기 (오른쪽에서, 모바일 바텀시트는 아래에서). 지금 `SLIDE_MS = 400` |
| `--duration-toast` | 200ms | 토스트 (아래에서 위로) |
| `--ease-out` | `ease-out` | 드로어 |

- `prefers-reduced-motion: reduce`이면 반복 움직임(스켈레톤 깜빡임 등)은 멈추고, 열고 닫기는 이동 없이 페이드만 한다.

## 9. 날짜와 숫자 표기

| 상황 | 형식 | 예 |
|---|---|---|
| 기본 날짜 | `YYYY.MM.DD` | 2026.11.21 |
| 기간 | `YYYY.MM.DD ~ YYYY.MM.DD` | 2026.11.21 ~ 2026.12.31 |
| 같은 해 짧게 | `MM.DD` | 11.21 |
| 상대 시간 | `n분 전`, `n시간 전`, `어제`, 그 이상은 날짜 | 3시간 전 |
| 남은 기간 | `D-n`, 지나면 `n일 지연` | D-12 |
| 마감 없음 | `마감 없음` | |

- 날짜 형식 함수는 `src/lib/date.ts` 한 곳에만 둔다 (`formatDate` · `formatDateRange` · `formatDateTime` · `formatRelativeTime` 등).
