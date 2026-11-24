# 컴포넌트 가이드

> 상태: v0.2 · 2026-11-21
> **디자인 값의 원본은 `design/boards/docs/` (handoff)입니다. 이 문서는 코드 쪽 이름과 쓰는 곳을 적습니다.** 값이 다르면 원본을 따르고, handoff를 받으면 `design/_handoff/CHANGES-*.md` 목록대로 이 문서도 고칩니다.
> "어떤 부품을 언제, 어떻게 쓰는가"를 다룹니다.
> **컴포넌트를 새로 만들거나, 이름·위치·props·용도를 바꾸거나, 지우면 같은 커밋에서 이 문서를 고친다.**

## 0. 원칙

1. **만들기 전에 찾는다.** 이 문서, `src/components/ui`, 같은 기능 폴더(`src/features/<기능>/components`)를 먼저 본다.
2. **두 기능 이상에서 쓰면 `ui`로.** 한 기능에서만 쓰면 그 기능 폴더에 둔다.
3. **도메인을 알면 `features`로.** 프로젝트·목표·태스크 데이터를 아는 컴포넌트는 `ui`에 두지 않는다.
4. **변형은 props로.** 비슷한 컴포넌트를 새로 만들지 않고 `variant`, `size`를 추가한다.
5. **바깥에서 스타일을 덮어쓰지 않는다.** `className="!h-[...]"` 같은 강제 덮어쓰기 금지. 필요하면 컴포넌트에 `size`·`variant`를 추가한다. (지금 `!` 덮어쓰기 55곳)
6. **한 파일은 300줄(약 15KB) 안쪽.** 넘으면 하위 컴포넌트나 훅으로 나눈다.

## 1. 폴더 구조

```
src/components/
  layout/            앱 골격 (AppLayout, Header, Sidebar, pages/)
  ui/                도메인을 모르는 공통 부품
src/features/<기능>/
  components/        그 기능 전용 부품
  modals/            그 기능의 드로어·모달
  content/           페이지 본문 (app/의 page.tsx가 불러옴)
  hooks/ api/ schemas/ types/ utils/ constants/
```

## 2. 상태 표시

✅ 그대로 사용 · 🔧 정리 필요 · ⛔ 합치거나 삭제 · ★ 새로 만들 것 · 💤 v1에서 숨김 (건드리지 않음)

괄호 안 숫자는 2026-11-21 기준 사용하는 파일 수입니다.

## 3. 공통 컴포넌트 (`src/components/ui`)

### 버튼

| 컴포넌트 | 언제 | 상태 |
|---|---|---|
| `PrimaryButton` | 화면에서 가장 중요한 행동 하나 | ✅ |
| `SecondaryButton` | 취소, 변경, 연결 같은 보조 행동 | ✅ |
| `IconButton` | 아이콘만 있는 버튼. `aria-label` 필수 | ✅ |
| `CloseButton` | 모달·드로어 닫기 | ✅ |
| `Button` | 위 버튼들의 바탕. 화면에서 직접 쓰지 않는다 (`TabMenu` 같은 `ui` 바탕에서만) | ✅ |

- 크기는 `buttonSize.ts`의 `size`로만 바꾼다.
- 한 영역에 `PrimaryButton`은 하나만.

### 입력

| 컴포넌트 | 언제 | 상태 |
|---|---|---|
| `Input`, `Textarea`, `SearchInput` | 한 줄, 여러 줄, 검색 | ✅ |
| `Select` | 정해진 선택지 | ✅ |
| `DatePicker` | 날짜 (`variant="button"`은 드로어 행용). `md` 이상은 입력칸 아래 팝오버 282(오늘 · 지우기), 모바일은 바텀시트(날짜 칸 44). 칸 기본은 아이콘 앞(`iconPosition="start"`), 빈 칸 글자 「날짜 고르기」 | ✅ (부르는 곳의 「~ 선택」 빈 칸 글자는 tech-debt C-9) |
| `Switch` | 켜기·끄기 | ✅ |
| `SegmentedControl` ★ | 2~4개 중 하나 (아이콘·글자) | `SegmentedIconToggle`을 넓혀서 대체 |
| `FieldNotice` | 입력칸 아래 안내 | ✅ |
| `fieldControl.ts` | 입력칸 공통 스타일 | ✅ |

### 드로어 · 모달 · 알림

| 컴포넌트 | 언제 | 상태 |
|---|---|---|
| `Drawer` (+`Body`, `Footer`) | 드로어 바탕 | ✅ |
| `DrawerFrame` | (역할 확인 후 `Drawer`와 합칠지 결정) | 🔧 |
| `CreateDrawer` ★ | 생성 드로어 공통 틀 ([design-guide](design-guide.md) 4장) | ★ |
| `DrawerRow` ★ | 라벨 80 + 값 + 오른쪽 보조 | ★ |
| `Modal` | 선택·설정 모달 바탕. 기본 너비 `--modal-width` 480 (handoff B2), 검색은 `--search-width` 600. 모바일(767 이하)은 바텀시트(손잡이 36 × 4 · 위 모서리 16 · 최대 90% · 주 버튼 남은 폭, Layout Spec 08) — `mobileSheet={false}`면 가운데 (확인창 · 통합 검색) | ✅ |
| `AlertModal` | 삭제·상태 변경 확인. 너비 `--confirm-width` 320, 모바일도 가운데 | ✅ |
| `Toast` | 결과 알림 + 되돌리기 하나. 4초(되돌리기 있으면 6초), 마우스·초점 동안 멈춤, `role="status"` | ✅ (handoff B5, `DeadlineToast`·`FavoriteRemovedToast` 삭제) |
| `Notice` | 화면 안에 계속 보이는 한 줄 안내. i 16 + 글자 14/20 보조색, 바탕 · 테두리 · 닫기 없음, `role="status"`, 툴바 바로 아래 8 (Components 12). 행동이 필요하면 글 끝에 링크 1개 | ✅ `components/ui/Notice.tsx` (`HoldAddNotice`가 사용) |

### 화면 상태

| 컴포넌트 | 언제 | 상태 |
|---|---|---|
| `Skeleton` | 로딩 자리 표시 막대 (`--color-skeleton`, 1.2초 깜빡임, 움직임 줄이기면 멈춤). 크기는 `className`, 감싸는 쪽에 `aria-busy` | ✅ `components/ui/state` (프로젝트 · 목표 목록에서 사용) |
| `EmptyState` | 비어 있음, 결과 없음. 점선 상자 + 아이콘 56 + 제목 18 + 한 줄 설명 + 버튼 최대 2개 (Components 12). 문구는 부르는 쪽이 넘김 | ✅ `components/ui/state` (프로젝트 목록에서 사용) |
| `ErrorState` | 불러오기 실패. 그 영역 안에 빨간 기운 테두리 + 「다시 시도」 주 버튼, `role="alert"` | ✅ `components/ui/state` (목업 API가 실패하지 않아 아직 쓰는 곳 없음, 10단계) |

### 목록 · 표시

| 컴포넌트 | 언제 | 상태 |
|---|---|---|
| `List` | 행 목록 | 🔧 21KB, 나누기 |
| `ExpandableList` | 펼쳐지는 행 목록 | 🔧 17KB, `List`와 합칠 수 있는지 확인 |
| `Badge` | 글자 뱃지 | ✅ |
| `StatusBadge` | 알약형 상태 뱃지 (높이 24 · 모서리 8 · 점 6 + 글자 12/500 · 연한 바탕). `tone`, `showDot`(지연 뱃지는 끔), `onColor`(색 카드 위 흰 바탕). 색 연결은 `lib/statusColors.ts`의 `getStatusTone` | ✅ (Components 10) |
| `StatusText` | 폴더 카드 전용 글자형 상태 (점 6 + 상태 12/500 + 지연 12/600). 흰 바탕 목록·상세에서는 쓰지 않는다 | ✅ (handoff B9) |
| `CrownBadge` | 메인 프로젝트 표시 | ✅ |
| `MemberAvatar`, `ProfileSummary` | 사람 | ✅ |
| `StatCountCard`, `StatCountGrid` | 요약 숫자 카드. 목록 페이지에서는 쓰지 않는다(제목 아래 한 줄 요약으로 바뀜). 지금은 메인 프로젝트 탭만 | ✅ |
| `InfoTooltip` | ⓘ 설명 (13KB) | 🔧 |
| `IconTitle`, `StatusMark`, `ExpandablePreviewText` | | ✅ |
| `SplitTitlePreview` | (용도 확인) | 🔧 |
| `AppIcon` + `icons.ts` | 모든 아이콘. `lucide-react` 직접 import 금지 (현재 위반 0곳) | ✅ |

### 탭 · 필터 · 메뉴

| 컴포넌트 | 언제 | 상태 |
|---|---|---|
| `TabMenu` | 탭 바탕 | ✅ |
| `LineTabMenu` (11) | **모든 탭은 이것으로** (`FolderTabMenu`, `TileTabMenu`는 5단계에서 삭제) | ✅ |
| `ScopeTabs` ★ | 기본 탭 + 맞춤 탭 + `+` | ★ `ProjectsScopeTabs`, `GoalsScopeTabs`, `MemosScopeTabs`를 합침. `ProjectsScopeTabs` · `GoalsScopeTabs` · `MemosScopeTabs`는 `placement="page"`면 제목 아래 본문 폭 줄(목록 페이지), 기본 `top`은 화면 맨 위 줄. 이름은 「전체 · 메인(메인 프로젝트) · 즐겨찾기」 |
| `StatusFilterChips` (8) | 목록 위 상태 필터 | ✅ 기준 |
| `StatusFilterBar` (3), `StatusFilterPills` (1) | | ⛔ StatusFilterChips로 합침 (`StatFilterButtons`는 쓰는 곳이 없어 5단계에서 삭제) |
| `FilterBottomSheet` (1) | 모바일 필터 시트 (`StatusFilterBar` 안) | 🔧 (`FilterButton`, `MobileFilterDrawer`는 쓰는 곳이 없어 5단계에서 삭제) |
| `StatusChoiceButton` | 상태 하나 고르기 | ✅ |
| `DropdownMenu`, `MenuLink` | `···` 메뉴. 너비 `--popover-menu` 220 (handoff B4), 쓰는 쪽에서 너비를 바꾸지 않는다 | ✅ |

## 4. 레이아웃 컴포넌트 (`src/components/layout`)

| 컴포넌트 | 언제 | 상태 |
|---|---|---|
| `AppLayout` | 앱 전체 골격 | ✅ |
| `Header`, `HeaderActions`, `HeaderSearchButton` | 헤더, 페이지별 액션 | ✅ |
| `Sidebar` | 사이드바 (19KB) | ✅ 로고는 `<h1>` 아님 |
| `SidebarMainProject` · `ProjectSwitcherPanel` | 사이드바 프로젝트 전환 칸(높이 44 · 점 · 왕관 + 메인 이름 + ▾)과 전환 팝오버 320(검색 · 메인 · 즐겨찾기 n/3 · 최근 3 · 프로젝트 추가 · 모든 프로젝트 보기). 모바일은 바텀시트, 접힌 사이드바는 칸 오른쪽에 연다 (Layout Spec 02 · 07) | ✅ (예전 `SidebarDrawer`는 지움 — 메인은 프로젝트 수정의 「메인」, 즐겨찾기는 즐겨찾기 탭에서) |
| `PageInset` | 페이지 바깥 여백 | ✅ |
| `PageHeading` | 페이지 제목. `<h1>`은 여기서만. `variant`(`page` 목록 · `form` 수정·생성), `align`, `icon` | ✅ (프로젝트 상세 `DetailTitle`의 `<h1>`은 7단계) |
| `CreatePageFrame`, `BottomAppBar` | 수정 페이지 틀, 하단 바 | ✅ |

## 5. 기능별 주요 컴포넌트

| 위치 | 컴포넌트 | 상태 |
|---|---|---|
| `projects/components` | `ProjectBoardCard` (폴더 카드) | 🔧 평소엔 링크, 즐겨찾기 편집에서는 `<label>`로 감싸 카드를 누르면 체크가 눌림. 본문은 이름 2줄 → `StatusText` → 기간·목표·태스크·진행률 → 활동 모자이크 (handoff C1, `activity`를 넘길 때만) |
| | `ActivityMosaic` | ✅ 폴더 카드 활동 모자이크 (7줄 × 20주 · 칸 11 · 간격 3 · 빈 날 점 3 · 1–4단계 5 · 7 · 9 · 11, Design Guide 11). 색은 프로젝트 색 하나(`--mosaic-color`), 다크는 흰색 30% 섞음. 계산은 `utils/activityMosaic.ts`, 기록은 `getProjectActivity` |
| | `ProjectMark` | ✅ 고르는 목록 · 프로젝트 전환의 프로젝트 표시. 색 점 10, 메인은 프로젝트 색 왕관 14 (읽는 이름 「메인」, 다크는 흰색 30%, handoff B8) |
| | `ProjectListItem` (`ProjectPicker`) | ✅ 고르는 목록 한 줄: 라디오 · 체크 18 + `ProjectMark` + 이름(자르지 않음) + 상태. 줄 높이 웹 40 · 터치 44 (C-16 · B7 · B11) |
| | `ProjectFolder` | 🔧 목록 카드 전용으로 단순화 (디테일 모드 제거) |
| | `ProjectStatusBadge` | ✅ `StatusBadge` 위. 진행 중 + 지연이면 「지연」 뱃지를 옆에 붙임 |
| | `ProjectCreateWizard` | ⛔ 드로어로 대체 |
| `projects/content` | `ProjectDetailPageContent` | 🔧 일반 페이지로 재구성 |
| | `ProjectListRow` | 🔧 16KB. 즐겨찾기 편집에서는 `<label>`로 감싸 줄을 누르면 체크가 눌림 |
| `projects/modals` | `ChangeProjectDeadlineModal` (22KB) | 🔧 나누기 |
| | `TeamScopeModal` (22KB), `ProjectDetailTeam` | 💤 v1에서 숨김. 지우지도 고치지도 않는다 (PRD 5-4) |
| `goals/components` | `GoalForm` (44KB) | 🔧 가장 먼저 나눌 파일 |
| | `GoalStatusBadge` | ✅ `StatusBadge` 위. 완료가 아니고 지연이면 「지연」 뱃지를 옆에 붙임 |
| `goals/modals` | `GoalCreateDrawer` (25KB), `GoalDetailDrawer` (28KB) | 🔧 `CreateDrawer` 틀로, 이모지 아이콘 제거 |
| `tasks/components` | `TaskBoard`, `TaskCard`, `BoardColumn` | ✅ |
| | `TaskCalendarView` (21KB) | 🔧 나누기 |
| | `TaskStatusBadge` | ✅ `StatusBadge` 위 |
| `memos/components` | `MemoCards`, `MemoRegisterDrawer` | 🔧 `CreateDrawer` 틀로 |
| `search/modals` | `IntegratedSearchModal` (26KB) | 🔧 나누기 |

## 6. 생성 드로어 사용법 (예정)

```tsx
<CreateDrawer
  open={open}
  icon={<AppIcon icon={Folder} size="lg" />}
  titlePlaceholder="새 프로젝트"
  title={name}
  onTitleChange={setName}
  hint="이름만 있으면 바로 만들 수 있어요."
  submitLabel="프로젝트 추가"
  canSubmit={name.trim().length > 0}
  onSubmit={handleSubmit}
  onClose={handleClose}
  more={{ summary: "목표 태그 기본 4개 · 메인 프로젝트", content: <ProjectMoreSettings /> }}
>
  {settings.useProjectColor ? <DrawerRow label="색상">…</DrawerRow> : null}
  <DrawerRow label="기간">…</DrawerRow>
  <DrawerRow label="상태" aside={<AutoCalcInfo />}>…</DrawerRow>
</CreateDrawer>
```

## 7. 새 컴포넌트 등록 형식

공통(`ui`) 컴포넌트를 만들면 3장 표에 한 줄을 넣고, 맨 아래 "부록"에 아래 형식으로 추가한다.

```md
### ComponentName
- 위치: src/components/ui/…
- 언제: 한 문장
- 쓰지 말 때: 한 문장 (대신 쓸 것)
- 변형: variant / size 목록
- 예시: 짧은 코드
```

코드 안 주석은 [code-guide](code-guide.md)의 JSDoc 규칙을 따른다.

## 부록: 컴포넌트 상세

(새 컴포넌트를 만들 때마다 여기에 추가)

### StatusText
- 위치: src/components/ui/StatusText.tsx
- 언제: 색 바탕 폴더 카드 안의 상태 한 줄
- 쓰지 말 때: 흰 바탕 목록·상세 (알약 모양 상태 뱃지)
- 변형: `tone` neutral · info · warning · success · danger, `delayLabel`
- 예시: `<StatusText label="진행 중" tone="info" delayLabel="81일 지연" />`

### Toast
- 위치: src/components/ui/Toast.tsx
- 언제: 저장 · 삭제 · 해제처럼 끝난 일을 알릴 때. 화면 아래 가운데
- 쓰지 말 때: 오류 (그 영역 안에 보여준다), 화면 안 안내 띠 (`Notice`)
- 변형: `tone` default · success, `action` (되돌리기 하나)
- 예시: `<Toast message="즐겨찾기에서 해제했어요." action={{ label: "실행 취소", onClick: undo }} onClose={hide} />`
