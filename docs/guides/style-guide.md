# 스타일 가이드

> 상태: v0.2 · 2026-11-21
> "어떤 값을 쓰는가"만 다룹니다. 모든 값은 `src/app/globals.css`의 CSS 변수(토큰)로 정의하고, 코드에서는 토큰으로만 씁니다.
> 관련 결정: [0001 짝수 글자 크기](../decisions/0001-even-font-sizes.md), [0002 라이트·다크 모드](../decisions/0002-light-and-dark-mode.md)

## 0. 원칙

1. **하드코딩 금지.** `text-[#292D32]`, `px-[62px]`, `text-[13px]`, `bg-white` 같은 값을 쓰지 않는다. 필요한 값이 없으면 토큰을 먼저 추가하고 이 문서에 적는다.
2. **이름은 용도로.** `--color-text-secondary` O, `--color-gray-600` X
3. **모든 색 토큰은 라이트와 다크 값을 둘 다 가진다.**
4. **글자 크기와 줄 높이는 짝수만.**
5. **간격은 4px 단위.**

`★` = 아직 globals.css에 없어서 새로 추가할 토큰 · `◆` = 이름을 바꿀 토큰

## 1. 색

### 1-1. 바탕

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--color-background` | `#ffffff` | `#24282d` | 앱 배경 |
| `--color-surface` | `#ffffff` | `#24282d` | 카드, 드로어, 모달 (`bg-white` 대신) |
| `--color-surface-raised` ★ | `#ffffff` | `#2c3138` | 메뉴, 팝오버처럼 위에 뜨는 면 |
| `--color-page` | `#f4f5f4` | `#191b1e` | 회색 페이지 배경 (설정 등) |
| `--color-muted` | `#f8f8f7` | `#2a2f35` | 약한 면 |
| `--color-hover` | `#f1f1ef` | `#30353c` ★다크 | 호버 |
| `--color-hover-soft` | `#f7f7f5` | `#2a2f35` ★다크 | 아주 약한 호버, 아이콘 블록 |
| `--color-hover-strong` | `#e9ebef` | `#3a4047` ★다크 | 눌림 |
| `--color-border` | `#e2e5e7` | `#3a4047` | 테두리 |
| `--color-border-subtle` ★ | `#f0f0ee` | `#30353c` | 드로어 안 구분선 |
| `--color-overlay` ★ | `rgb(0 0 0 / 40%)` | `rgb(0 0 0 / 60%)` | 모달·드로어 뒤 어둡게 |

### 1-2. 글자

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--color-text` | `#292d32` | `#f2f3f4` | 본문, 제목 |
| `--color-text-secondary` | `#475569` | `#c3c9d0` ★다크 | 설명 |
| `--color-text-muted` | `#6b7280` | `#9aa3ad` ★다크 | 라벨, 메타 |
| `--color-text-disabled` | `#9ca3af` | `#6b737c` ★다크 | 비활성 |
| `--color-text-placeholder` ★ | `#c9c7c3` | `#5b636c` | 큰 제목 입력칸 placeholder |
| `--color-text-inverse` ★ | `#ffffff` | `#24282d` | 진한 버튼 위 글자 (`text-white` 대신) |

### 1-3. 주요 색

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--color-primary` | `#343840` | `#f2f3f4` ★다크 | 주 버튼, 선택된 메뉴 |
| `--color-primary-hover` | `#2c3037` | `#ffffff` ★다크 | 주 버튼 호버 |
| `--color-primary-soft` | `#f4f5f7` | `#30353c` ★다크 | 약한 강조 |
| `--color-primary-ring` | `#d1d5db` | `#5b636c` ★다크 | 포커스 링 |

- `--color-primary-mid`, `--gradient-primary`, `--gradient-primary-hover`, `--gradient-nav-bar`는 쓰는 곳을 확인한 뒤 **그라데이션은 주 버튼에만** 남기고 나머지는 지운다.

### 1-4. 입력칸

| 토큰 | 라이트 | 다크 |
|---|---|---|
| `--color-field` | `#ffffff` | `#2a2f35` |
| `--color-field-disabled` | `#f8f8f7` | `#24282d` |
| `--color-field-text` | `#292d32` | `#f2f3f4` |
| `--color-field-placeholder` | `#68717a` | `#a8b0b8` |
| `--color-field-border` | `#e2e5e7` | `#3a4047` |
| `--color-field-focus` | `#343840` | `#f2f3f4` |
| `--color-field-error` | `#ef4444` | `#f87171` ★다크 |

### 1-5. 상태

| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--color-success` | `#22c55e` | `#4ade80` ★다크 | 완료 |
| `--color-info` ★ | `#3b82f6` | `#60a5fa` | 진행 중 |
| `--color-warning` | `#f97316` | `#fb923c` ★다크 | 보류 |
| `--color-danger` | `#ef4444` | `#f87171` ★다크 | 지연, 삭제, 오류 |
| `--color-neutral` ★ | `#9ca3af` | `#6b737c` | 계획, 미시작, 할 일 |
| `--color-*-soft` ★ | 각 색 10% | 각 색 20% | 뱃지 배경 |
| `--color-info-text` ★ | `#2563eb` | `#93c5fd` | 진행 중 글자·작은 아이콘 |
| `--color-success-text` ★ | `#15803d` | `#86efac` | 완료 글자·작은 아이콘 |
| `--color-warning-text` ★ | `#c2410c` | `#fdba74` | 보류·오늘 마감 글자 |
| `--color-danger-text` ★ | `#dc2626` | `#fca5a5` | 지연·오류 글자 |

- **글자와 작은 아이콘에는 `-text` 토큰을 쓴다.** 기본 상태 색(`#3b82f6`, `#ef4444` 등)은 흰 배경 위 글자 대비가 4.5:1이 안 된다. 기본 색은 막대, 점, 넓은 면에만 쓴다.
- 상태와 색의 연결은 **한 파일**(`src/lib/statusColors.ts`)에서만 정한다. 지금 나뉜 `features/projects/constants/projectStatusColors.ts`는 합친다.

### 1-6. 프로젝트 색

기준 파일: `src/features/projects/utils/projectColors.ts`

| 코드 `label` | 값 | 비고 |
|---|---|---|
| (없음) | `#9ca3af` (`PROJECT_NEUTRAL_ACCENT`) | 설정에서 "프로젝트 색상"을 끄면 모두 이 색 |
| Pine | `#2f6b5a` | |
| Ivory | `#e7ddd0` | 밝은 색: 위 글자는 진한 색 |
| Sand | `#c4a574` | |
| Lilac | `#a78bfa` | |
| Violet | `#6d28d9` | |
| Plum | `#6b2d5b` | |
| Cocoa | `#6f4e37` | |
| Ink | `#2a2430` | |

- 카드 배경 같은 옅은 색은 `color-mix()`로 계산한다(현재 방식 유지). 다크 모드용 계산식도 같은 파일에 둔다.
- 색 이름은 코드의 `label`(`PROJECT_COLOR_OPTIONS`)을 기준으로 한다. 화면에 한국어 이름이 필요해지면 같은 파일에 추가한다.

## 2. 글자

글꼴: **Pretendard Variable** (CDN) → `system-ui, sans-serif`

### 2-1. 크기 체계 (짝수만)

| 토큰 | 크기 / 줄 높이 |
|---|---|
| `--type-2xs` ★ | 10 / 12 |
| `--type-xs` | 12 / **18** (16 → 18로 변경) |
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
| `text-card-title` | 16 / 24 | 600 | 카드 제목 |
| `text-project-card-title` | 16 / 18 | 600 | 폴더 카드 제목 (아이콘 높이에 맞춘 예외) |
| `text-body` | 14 / 20 | 400 | 본문, 행 값 |
| `text-label` ★ | 14 / 20 | 500 | 폼·드로어 라벨 |
| `text-caption` | 12 / 18 | 400 | 메타, 안내, 보조 |
| `text-badge` | 12 / 18 | 500 | 뱃지 |
| `text-badge-sm` | 10 / 12 | 500 | 작은 뱃지 |

- **없앨 것:** `text-body-sm` (`text-caption`과 같음 → `text-caption`으로 바꾼다), `text-badge-sm-mobile` (`text-badge-sm` + `lg:text-badge`로 대체)
- Tailwind 기본 크기(`text-sm`, `text-xl` …)는 쓰지 않는다. 의미 클래스만 쓴다.
- 숫자가 바뀌는 자리에는 `tabular-nums`.

## 3. 간격

| 토큰 | 값 |
|---|---|
| `--space-1` ~ `--space-10` | 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 (`--space-7`, `--space-9`는 없음) |
| `--space-12` ★ | 48 |
| `--space-16` ★ | 64 |

| 용도 토큰 | 값 | 설명 |
|---|---|---|
| `--page-padding-x` | 16 → 24(md) → 32(lg) → 40(xl) | 페이지 좌우 |
| `--page-padding` | 12 → 24(md) | 페이지 위아래 |
| `--page-title-above` | 32 | 탭 아래 ~ 제목 |
| `--page-title-gap` | 8 | 제목 ~ 설명 |
| `--page-title-below` | 32 | 제목 영역 ~ 다음 블록 |
| `--section-gap` | 24 | 페이지 안 섹션 사이 |
| `--drawer-padding-x` ★ | 56 (모바일 20) | 드로어 본문 좌우 (지금 `62px` 하드코딩) |
| `--drawer-label-width` ★ | 80 | 드로어 라벨 |
| `--drawer-row-py` ★ | 16 | 드로어 행 위아래 |

## 4. 크기

| 토큰 | 값 | 용도 |
|---|---|---|
| `--header-height` | 56 | 헤더 |
| `--sidebar-width` | 245 | 사이드바 |
| `--sidebar-collapsed-width` | 57 | 접힌 사이드바 |
| `--page-frame-max` | 1280 | 본문 최대 너비 |
| `--drawer-width` ◆ | 560 | 드로어 (`--goal-drawer-width`를 이름 변경) |
| `--drawer-offset` ◆ | 0 | 드로어가 밀어낸 너비 (`--goal-drawer-offset` 이름 변경) |
| `--control-sm` / `-md` / `-lg` | 32 / 40 / 44 | 입력칸·버튼 높이 |
| `--button-height` | 40 → 36(md) | 기본 버튼 |
| `--button-icon` / `--button-icon-hit` | 36 / 44 | 아이콘 버튼 / 터치 영역 |
| `--tab-height` | 40 → 36(md) | 탭 |
| 아이콘 | sm 14 · md 16 · lg 20 · xl 24 | `components/ui/icon/iconSize.ts` |

- 버튼 높이 변형(`-action`, `-modal`, `-title`, `-xs`)은 컴포넌트의 `size`로만 고른다.

## 5. 모서리

| 토큰 | 값 | 용도 |
|---|---|---|
| `--radius-xs` ★ | 4 | 체크박스, 잔디 타일 |
| `--radius-sm` | 8 | 버튼, 입력칸, 태그 |
| `--radius-md` | 12 | 아이콘 블록, 메뉴, 작은 카드 |
| `--radius-lg` | 16 | 카드, 모달, 폴더 카드 |
| `--radius-xl` ★ | 28 | 큰 패널 (필요할 때만) |
| `--radius-full` ★ | 9999 | 칩, 뱃지, 스위치 |

- `rounded-[6px]`, `[18px]`, `[22px]` 같은 값은 가까운 토큰으로 맞춘다.

## 6. 그림자

| 토큰 | 용도 |
|---|---|
| `--shadow-card` | 기본 카드 |
| `--shadow-project-card` / `-hover` | 폴더 카드 |
| `--shadow-dropdown` | 메뉴, 팝오버 |
| `--shadow-drawer` ★ `-8px 0 24px rgb(0 0 0 / 8%)` | 드로어 |
| `--shadow-modal` ★ `0 20px 48px rgb(0 0 0 / 16%)` | 모달 |

- 다크 모드에서는 그림자 대신 `--color-border`로 구분하는 것을 기본으로 한다.
- `shadow-[...]` 직접 값 금지.

## 7. 겹침 순서 (z-index) ★

| 토큰 | 값 | 용도 |
|---|---|---|
| `--z-sticky` | 10 | 고정 헤더, 하단 바 |
| `--z-sidebar` | 20 | 사이드바 |
| `--z-drawer` | 100 | 드로어 |
| `--z-modal` | 200 | 모달 |
| `--z-popover` | 300 | 날짜 선택, 드롭다운 (모달 위에서도 뜸) |
| `--z-toast` | 400 | 토스트 |

- 지금 `z-[110]`~`z-[200]` 6종류 18곳을 이 표로 바꾼다.

## 8. 움직임

| 토큰 | 값 | 용도 |
|---|---|---|
| `--duration-fast` ★ | 150ms | 호버, 색 |
| `--duration-base` ★ | 250ms | 메뉴, 모달 |
| `--duration-drawer` ★ | 400ms | 드로어 (지금 `SLIDE_MS = 400`) |
| `--ease-standard` ★ | `cubic-bezier(0.2, 0, 0, 1)` | 기본 |

- `prefers-reduced-motion: reduce`이면 움직임을 끈다. (globals.css에 이미 있음)

## 9. 날짜와 숫자 표기

| 상황 | 형식 | 예 |
|---|---|---|
| 기본 날짜 | `YYYY.MM.DD` | 2026.11.21 |
| 기간 | `YYYY.MM.DD ~ YYYY.MM.DD` | 2026.11.21 ~ 2026.12.31 |
| 같은 해 짧게 | `MM.DD` | 11.21 |
| 상대 시간 | `n분 전`, `n시간 전`, `어제`, 그 이상은 날짜 | 3시간 전 |
| 남은 기간 | `D-n`, 지나면 `n일 지연` | D-12 |
| 마감 없음 | `마감 없음` | |

- 날짜 형식 함수는 `src/lib/date.ts` 한 곳에만 둔다. 지금 14개 파일에 비슷한 `format...Date` 함수가 따로 있다.
