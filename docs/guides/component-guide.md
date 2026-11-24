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

## 2-1. 다시 만들기 공통 컴포넌트 (`src/components/kit`) — REBUILD 3-0

> 버튼 이름 · 확인창 · 토스트 · 빠른 입력 글은 `src/content/ui.ts` 한 곳에 둔다(REBUILD 5-3): 만들기 드로어 [취소][만들기] · 수정 [취소][저장] · 헤더 「+ 추가」.

> 2026-11-24부터 새 화면은 이 폴더만 쓴다. 옛 `src/components/ui`는 화면을 다 옮긴 뒤 한 번에 지운다(REBUILD 2장). kit는 옛 UI 컴포넌트를 import하지 않는다.
> 값은 `design/_handoff/2026-11-24/`의 보드 CSS(1순위) → 프로토타입 → `design/snippets/tokens.css` · REBUILD.md 5-3(저장 방식 · 문구). 토큰은 `globals.css` 「REBUILD 토큰」 블록. 견본 페이지: `/kit`.

| 컴포넌트                                                             | 파일                | 기준                                    | 규격 · 쓰는 법                                                                                                                                                                                                                                                                                                                                                      |
| -------------------------------------------------------------------- | ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Button` · `buttonClassName`                                         | `Button.tsx`        | 보드 .btn · 5-1                         | 모양 primary · secondary · ghost · danger (+ 빨간 글자 `secondaryDanger` · 본문 글자색 `ghostText` · 토스트 안 `onToast`), 크기 md 40/16 · sm 36/12 · xs 28/8(토큰 `--btn-h-*` · `--btn-px-*`), `iconOnly` 정사각형, `tip` 툴팁(「닫기 · Esc」), `href`면 링크. 못 누를 때 primary는 --s3 바탕 · --t4 글자(5-3), 나머지는 40%. 화면에서 높이 · 패딩을 덧대지 않는다 |
| `Field`                                                              | `Field.tsx`         | 보드 .field                             | 라벨 14/20 500 · 라벨–칸 6 · 필수 `*` --bad · `labelAside`(라벨 옆 개수 등) · `hint`(라벨 아래) · `help` · `error` 12/18                                                                                                                                                                                                                                            |
| `TagField`                                                           | `TagField.tsx`      | 보드 01-a2 · 5-3                        | 라벨 옆 「3 / 10」 · 안내 「목표에서 이 태그를 선택할 수 있어요.」 · 칩(×) + 점선 「+ 태그 추가」 → 그 자리 입력 · Enter 추가 · Esc는 입력만 닫음(`data-esc-local`) · 다 차면 숨김                                                                                                                                                                                  |
| `QuickAddInput`                                                      | `QuickAddInput.tsx` | 프로토타입 data-quick · 5-3             | + 아이콘 · 입력 · 「Enter ↵」(글자 있을 때만) · Enter로 보내고 비움 · 초점 유지. 글은 `QUICK_ADD_PLACEHOLDER`                                                                                                                                                                                                                                                       |
| `TextInput` · `TextArea`                                             | `TextInput.tsx`     | 보드 .input · .input.ta                 | 40(sm 36) · 좌우 12 · 테두리 --input-line(호버 --input-line-h) · 초점 --primary + 3px 링 · 오류 --bad · 못 씀 --s2/--t4 · 여러 줄 최소 96 · 위아래 10. 안내 글은 입력할 때만 사라짐(`.kit-input`)                                                                                                                                                                   |
| `SearchField`                                                        | `SearchField.tsx`   | 보드 01 · 5-2                           | 테두리 --border(입력칸 선 아님) · 바탕 --surface · 아이콘 · 안내 글 --t3 · 도구 줄 36(sm) / 팝오버 40(md). 앱의 검색칸은 이것 하나                                                                                                                                                                                                                                  |
| `Chip` · `Tag`                                                       | `Chip.tsx`          | 프로토타입 .chip · 보드 .tag            | 칩 36 · 좌우 12 · 테두리 --border · 켜짐 --primary(「지연만 N」 숫자 --bad). 태그 24 · 둥근 끝 · ×로 지우기(`onRemove`)                                                                                                                                                                                                                                             |
| `Segmented`                                                          | `Segmented.tsx`     | 보드 .seg                               | 36 · 바탕 --s3 · 칸 32 · 고른 칸 --surface 600 · 숫자 12 --t3 · 아이콘 칸 32×32 · ← →                                                                                                                                                                                                                                                                               |
| `Tabs`                                                               | `Tabs.tsx`          | 보드 .tabs                              | 사이 24 · 40 · 고른 탭 600 + 밑줄 2 · 숫자 없음(6-3) · 링크 탭 가능                                                                                                                                                                                                                                                                                                 |
| `ColorSwatches`                                                      | `ColorSwatches.tsx` | 보드 01-a · REBUILD 3-0                 | 28 · 모서리 8 · 사이 6 · tint 바탕 · 테두리 --border · 점 10 · 고른 칸 2px 띄운 --primary 링 · 모든 기기 한 줄 10개 · ← →                                                                                                                                                                                                                                           |
| `MenuItem` · `MenuHeader` · `MenuSeparator` · `PickRow` · `MoreMenu` | `Menu.tsx`          | 보드 .mi · .mh · .sep · 03-e            | 줄 최소 36(모바일 44) · 좌우 8 · 호버 --s3. `PickRow`는 고르는 목록 줄(이름 줄바꿈 · 체크 · 앞 표시). `MoreMenu`는 ⋯ ghost 아이콘 버튼(카드 xs 28) + 메뉴 220, ↑ ↓ · Esc, 카드 링크로 클릭이 새지 않음                                                                                                                                                              |
| `Popover`                                                            | `Popover.tsx`       | 보드 .pop · 프로토타입 sheetOrPop       | 기준 아래 6 · 모자라면 위로 · 폭 200/220/280/320/기준 폭 · 모서리 12 · 안쪽 4 · Esc · 바깥으로 닫기 · 모바일은 아래 시트                                                                                                                                                                                                                                            |
| `Drawer`                                                             | `Drawer.tsx`        | 보드 01-a · M 01-a                      | 웹 400 · 헤더 56 · 본문 24 · 칸 사이 24 · 푸터 72 / 모바일 시트(모서리 20 · 손잡이 · 헤더 52 · 푸터 버튼 48 · 주 버튼 채움). `wrap`으로 form을 감싼다(form은 `flex min-h-0 flex-1 flex-col`)                                                                                                                                                                        |
| `Modal`                                                              | `Modal.tsx`         | 보드 .modal                             | 폼 480 · 검색 600 · 헤더 56 · 본문 0/24/24 · 푸터 16/24 + 위 선 --divider · 모바일 시트                                                                                                                                                                                                                                                                             |
| `ConfirmDialog` · `DiscardConfirmDialog` · `DeleteConfirmDialog`     | `ConfirmDialog.tsx` | 프로토타입 confirmBox · 5-3             | 320 · 안쪽 24 · 아이콘 상자 40 · 버튼 반반 · 열리면 [취소] 초점 · `withinRef`로 드로어 가운데. 닫기 확인 「저장하지 않고 닫을까요?」/「수정한 내용이 사라져요.」 [취소][닫기(빨강)] · 삭제 확인 「○○을/를 삭제할까요?」/「삭제하면 되돌릴 수 없어요.」 [취소][삭제(빨강)]                                                                                           |
| `ToastProvider` · `useToast`                                         | `Toast.tsx`         | 프로토타입 toast · 5-3                  | 아래 가운데 24 · 48 · 280–420 · 모서리 12 · 4초(되돌리기 · 다시 시도 6초) · 올리면 멈춤 · role=status. `undo` → 「되돌리기」, `retry` → 오류 표시 + 「다시 시도」. 글은 `TOAST_TEXT`                                                                                                                                                                                |
| `EmptyState`                                                         | `EmptyState.tsx`    | 프로토타입 empty                        | 점선 1.5 --border · 모서리 16 · 56/16 · 아이콘 상자 56                                                                                                                                                                                                                                                                                                              |
| `FolderCard`                                                         | `FolderCard.tsx`    | 보드 01 · REBUILD 5                     | 탭 SVG 180×31을 몸통 위 −30에 1px 겹침 · 몸통 0/16/16/16 · 20/22 · 사이 12 · tint · 테두리 없음 · drop-shadow 0 2px 6px 6% · 이름 링크가 카드를 덮고 ⋯는 따로 눌림                                                                                                                                                                                                  |
| `Mosaic`                                                             | `Mosaic.tsx`        | 보드 01 · 프로토타입 mosaic · REBUILD 5 | 7×20 · 칸 11 · 가로 사이 calc((100% − 220px) / 19)로 상자를 늘 꽉 채움(좌우 여백 12) · 세로 사이 3 · 조각 3/5/7/9/11 · 프로젝트 색 하나에 진하기 45 · 45 · 65 · 85 · 100% · 상자 --mosaic-box · 아래 줄(--folder-ink) 안 자름 · 범례는 좁으면 다음 줄                                                                                                               |
| `Kbd`                                                                | `Kbd.tsx`           | 보드 .kbd · REBUILD 5-3                 | 테두리 --border(아래 2) · 모서리 4 · 12/16 --t3 · 평소 숨기고 부모 호버 · 키보드 초점 때만 보임 · `keep`이면 늘 보임(단축키 안내 창)                                                                                                                                                                                                                                |
| `useLayer` · `usePresence` · `useIsMobile`                           | `useLayer.ts`       | Components 13                           | 레이어 공통: 첫 입력칸(없으면 첫 메뉴 줄) 초점 · Tab 가두기 · Esc는 맨 위만 · 초점 복귀 · 스크롤 잠금 · 들어오기 180ms                                                                                                                                                                                                                                              |
| `KitGallery`                                                         | `KitGallery.tsx`    | —                                       | `/kit` 견본 페이지. 개발 서버에서만 열리고 배포 사이트는 404                                                                                                                                                                                                                                                                                                        |

## 2-2. 앱 틀 · 프로젝트 목록 (REBUILD 3-1 · 3-2, 2번 묶음)

| 컴포넌트                                               | 파일                                             | 기준                                    | 규격 · 쓰는 법                                                                                                                                                                                                                 |
| ------------------------------------------------------ | ------------------------------------------------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `AppShell`                                             | `components/shell/AppShell.tsx`                  | 보드 01 · T 01 · M 01 · M 01-g          | 대시보드 레이아웃. 웹 사이드바 245(접으면 64, 브라우저에 기억) · 태블릿 64 막대 · 모바일 ☰ 왼쪽 300 시트. 옛 화면용 `HeaderActionsProvider` · `AlertProvider` · 상세 드로어 밀림을 그대로 받는다. `ToastProvider`(kit)도 여기 |
| `ShellSidebar` · `Avatar`                              | `components/shell/ShellSidebar.tsx`              | 보드 01                                 | 로고 행 32 · 프로젝트 전환 44 · 메뉴 36(고름 --nav-on-bg) · 아래 사람 24 + 설정 xs. 막대 모드는 아이콘 sm 36. 「이번 주 진행률」 없음(6-2)                                                                                     |
| `ShellHeader`                                          | `components/shell/ShellHeader.tsx`               | 보드 01 · T · M                         | 56 · 웹 좌우 40 · 위치(아이콘 + 메뉴 이름) · 검색 200(⌘K) · 화면 버튼 자리(`HeaderActionsSlot`). 태블릿 · 모바일은 제목 18/24 + 부제(`usePageMeta`) · 아이콘                                                                   |
| `ShellSearch`                                          | `components/shell/ShellSearch.tsx`               | 보드 01                                 | 검색 버튼 · ⌘K. 통합 검색 창은 아직 옛 `IntegratedSearchModal`(tech-debt R-5)                                                                                                                                                  |
| `ProjectSwitcher`                                      | `components/shell/ProjectSwitcher.tsx`           | 보드 01-b · 01-c                        | 팝오버 320 · 검색 · 메인 · 즐겨찾기 n/3 · 최근(시간) · 줄 40 · 별로 즐겨찾기 · 「새 프로젝트」(N) · 「모든 프로젝트 보기」 · 검색 결과 굵게                                                                                    |
| `PageMetaProvider` · `usePageMeta`                     | `components/shell/PageMeta.tsx`                  | 보드 T · M 01                           | 페이지가 태블릿 · 모바일 헤더 제목 · 부제를 알린다                                                                                                                                                                             |
| `useFavoriteProjectIds`                                | `components/shell/useFavoriteProjects.ts`        | —                                       | 즐겨찾기 id(최대 3) 구독                                                                                                                                                                                                       |
| `ProjectMarker`                                        | `components/kit/ProjectMarker.tsx`               | 프로토타입 pmark                        | 메인은 프로젝트 색 왕관 14(「메인」), 나머지 색 점 10                                                                                                                                                                          |
| `Badge` · `Switch` · `Checkbox` · `DateField`          | `components/kit/*`                               | 보드 .badge · .sw · .cb · Components 08 | 배지 24(점 6) · 스위치 36×20 · 체크 18 · 날짜 칸(「날짜 선택」 · 달력 282 · 7열 36 · 오늘 테두리 · 오늘/지우기 · min)                                                                                                          |
| `ProjectListScreen`                                    | `features/projects/list/ProjectListScreen.tsx`   | 보드 01 · 02                            | `/projects` · `/projects/main` · `/projects/favorites`. 본문 최대 1280 · 32/40/64, 제목 + 부제 · 「보관함 N」 · 탭(숫자 없음 · 맞춤 탭 숨김) · 도구 줄 · 카드(3/2/1열 · 사이 24) 또는 목록 · 헤더 「+ 추가」                   |
| `ProjectToolbar`                                       | `features/projects/list/ProjectToolbar.tsx`      | 보드 01 · 01-j · M 01-d                 | 웹: 상태 칸 · 지연만 · 검색 240 · 정렬 팝오버 200 · 보기 전환. 태블릿 · 모바일: 상태 칸 + 필터 시트(상태 · 마감 지난 것만 · 태그 · 정렬 · 「프로젝트 N개 보기」)                                                               |
| `ProjectCard` · `ProjectStatusLine` · `ProjectListRow` | `features/projects/list/*`                       | 보드 01 · 프로토타입 projRow            | 폴더 카드(상태 점 + 「N일 지연」 --late · 기간 줄 · 모자이크 · ⋯) · 목록 줄(14/16 · 모서리 12)                                                                                                                                 |
| `ProjectCardMenu` · `useProjectActions`                | `features/projects/list/*`                       | 6-1 · 프로토타입 pmenu                  | 열기 · 메인 지정/해제 · 즐겨찾기 · 복제 · 보관하기 · 삭제(확인창) · 토스트(보관 · 삭제는 되돌리기)                                                                                                                             |
| `ArchiveModal`                                         | `features/projects/list/ArchiveModal.tsx`        | 보드 01-h                               | 모달 480 · 헤더 아래 선 · 줄 60 · [되돌리기] · ⋯(삭제) · 아래 안내 · 빈 상태(프로토타입 글)                                                                                                                                    |
| `FavoritesPanel`                                       | `features/projects/list/FavoritesPanel.tsx`      | 보드 02 ~ 02-d                          | 안내 줄 · 순서 바꾸기(끌기) · 선택 모드 · 점선 「즐겨찾기 추가」 카드 → 340 팝오버 · 빈 상태                                                                                                                                   |
| `ProjectCreateRoute`                                   | `features/projects/list/ProjectCreateDrawer.tsx` | 보드 01-a · 01-a2 · 5-3                 | `?new=1`이면 만들기 드로어. 이름 * · 색상 · 「추가 설정 · 기간, 설명, 태그」 → 시작일(기본 오늘 · 이전 불가) · 마감일 · 설명 · 태그. [취소][만들기] · ⌘Enter · 닫기 확인                                                       |

## 3. 공통 컴포넌트 (`src/components/ui`)

### 버튼

| 컴포넌트          | 언제                                                                         | 상태 |
| ----------------- | ---------------------------------------------------------------------------- | ---- |
| `PrimaryButton`   | 화면에서 가장 중요한 행동 하나                                               | ✅   |
| `SecondaryButton` | 취소, 변경, 연결 같은 보조 행동                                              | ✅   |
| `IconButton`      | 아이콘만 있는 버튼. `aria-label` 필수                                        | ✅   |
| `CloseButton`     | 모달·드로어 닫기                                                             | ✅   |
| `Button`          | 위 버튼들의 바탕. 화면에서 직접 쓰지 않는다 (`TabMenu` 같은 `ui` 바탕에서만) | ✅   |

- 크기는 `buttonSize.ts`의 `size`로만 바꾼다.
- 한 영역에 `PrimaryButton`은 하나만.

### 입력

| 컴포넌트                           | 언제                                                                                                                                                                                                                                             | 상태                                |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| `Input`, `Textarea`, `SearchInput` | 한 줄, 여러 줄, 검색                                                                                                                                                                                                                             | ✅                                  |
| `Select`                           | 정해진 선택지                                                                                                                                                                                                                                    | ✅                                  |
| `DatePicker`                       | 날짜 (`variant="button"`은 드로어 행용). `md` 이상은 입력칸 아래 팝오버 282(오늘 · 지우기), 모바일은 바텀시트(날짜 칸 44). 칸 기본은 아이콘 앞(`iconPosition="start"`), 빈 칸 글자 「날짜 고르기」. 팝오버 · 시트 제목은 `title`(예: 「시작일」) | ✅                                  |
| `Switch`                           | 켜기·끄기                                                                                                                                                                                                                                        | ✅                                  |
| `SegmentedControl` ★               | 2~4개 중 하나 (아이콘·글자)                                                                                                                                                                                                                      | `SegmentedIconToggle`을 넓혀서 대체 |
| `FieldNotice`                      | 입력칸 아래 안내                                                                                                                                                                                                                                 | ✅                                  |
| `fieldControl.ts`                  | 입력칸 공통 스타일                                                                                                                                                                                                                               | ✅                                  |

### 드로어 · 모달 · 알림

| 컴포넌트                     | 언제                                                                                                                                                                                                                                                                                                                                           | 상태                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `Drawer` (+`Body`, `Footer`) | 드로어 바탕 (Layout Spec 05). 헤더 56(왼쪽 24 · 오른쪽 12 · 제목 18/28 · 닫기 X 36, 상세만 `expandable` 넓게 보기) · 본문 패딩 24 · 칸 간격 24 · 푸터 72(좌우 24 · [취소] → [주 버튼] · 간격 8). 웹 · 태블릿 오른쪽 400, 모바일은 바텀시트. 안에서 연 `AlertModal`은 드로어 가운데(`useDrawerPanel`). 열림 · 닫힘 움직임은 `useDrawerPresence` | ✅                                                           |
| `DrawerFrame`                | (역할 확인 후 `Drawer`와 합칠지 결정)                                                                                                                                                                                                                                                                                                          | 🔧                                                           |
| `FormField`                  | 칸 하나: 라벨(14/600) 위 · 필수 빨간 `*` · 칸 · 아래 안내/오류 12 (Components 08 · Layout Spec 05). 예전 계획 `DrawerRow`(라벨 80 왼쪽)는 원본과 달라 쓰지 않는다                                                                                                                                                                              | ✅ `components/ui/form/FormField.tsx`                        |
| `Modal`                      | 선택·설정 모달 바탕. 기본 너비 `--modal-width` 480 (handoff B2), 검색은 `--search-width` 600. 모바일(767 이하)은 바텀시트(손잡이 36 × 4 · 위 모서리 16 · 최대 90% · 주 버튼 남은 폭, Layout Spec 08) — `mobileSheet={false}`면 가운데 (확인창 · 통합 검색)                                                                                     | ✅                                                           |
| `AlertModal`                 | 삭제·상태 변경 확인 · 「수정을 취소할까요?」. 너비 `--confirm-width` 320, 모바일도 가운데. 드로어 안에서 열면 드로어 가운데                                                                                                                                                                                                                    | ✅                                                           |
| `Toast`                      | 결과 알림 + 되돌리기 하나. 4초(되돌리기 있으면 6초), 마우스·초점 동안 멈춤, `role="status"`                                                                                                                                                                                                                                                    | ✅ (handoff B5, `DeadlineToast`·`FavoriteRemovedToast` 삭제) |
| `Notice`                     | 화면 안에 계속 보이는 한 줄 안내. i 16 + 글자 14/20 보조색, 바탕 · 테두리 · 닫기 없음, `role="status"`, 툴바 바로 아래 8 (Components 12). 행동이 필요하면 글 끝에 링크 1개                                                                                                                                                                     | ✅ `components/ui/Notice.tsx` (`HoldAddNotice`가 사용)       |

### 화면 상태

| 컴포넌트     | 언제                                                                                                                        | 상태                                                                          |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `Skeleton`   | 로딩 자리 표시 막대 (`--color-skeleton`, 1.2초 깜빡임, 움직임 줄이기면 멈춤). 크기는 `className`, 감싸는 쪽에 `aria-busy`   | ✅ `components/ui/state` (프로젝트 · 목표 목록에서 사용)                      |
| `EmptyState` | 비어 있음, 결과 없음. 점선 상자 + 아이콘 56 + 제목 18 + 한 줄 설명 + 버튼 최대 2개 (Components 12). 문구는 부르는 쪽이 넘김 | ✅ `components/ui/state` (프로젝트 목록에서 사용)                             |
| `ErrorState` | 불러오기 실패. 그 영역 안에 빨간 기운 테두리 + 「다시 시도」 주 버튼, `role="alert"`                                        | ✅ `components/ui/state` (목업 API가 실패하지 않아 아직 쓰는 곳 없음, 10단계) |

### 목록 · 표시

| 컴포넌트                                           | 언제                                                                                                                                                                                        | 상태                                  |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `List`                                             | 행 목록                                                                                                                                                                                     | 🔧 21KB, 나누기                       |
| `ExpandableList`                                   | 펼쳐지는 행 목록                                                                                                                                                                            | 🔧 17KB, `List`와 합칠 수 있는지 확인 |
| `Badge`                                            | 글자 뱃지                                                                                                                                                                                   | ✅                                    |
| `StatusBadge`                                      | 알약형 상태 뱃지 (높이 24 · 모서리 8 · 점 6 + 글자 12/500 · 연한 바탕). `tone`, `showDot`(지연 뱃지는 끔), `onColor`(색 카드 위 흰 바탕). 색 연결은 `lib/statusColors.ts`의 `getStatusTone` | ✅ (Components 10)                    |
| `StatusText`                                       | 폴더 카드 전용 글자형 상태 (점 6 + 상태 12/500 + 지연 12/600). 흰 바탕 목록·상세에서는 쓰지 않는다                                                                                          | ✅ (handoff B9)                       |
| `CrownBadge`                                       | 메인 프로젝트 표시                                                                                                                                                                          | ✅                                    |
| `MemberAvatar`, `ProfileSummary`                   | 사람                                                                                                                                                                                        | ✅                                    |
| `InfoTooltip`                                      | ⓘ 설명 (13KB)                                                                                                                                                                               | 🔧                                    |
| `IconTitle`, `StatusMark`, `ExpandablePreviewText` |                                                                                                                                                                                             | ✅                                    |
| `SplitTitlePreview`                                | (용도 확인)                                                                                                                                                                                 | 🔧                                    |
| `AppIcon` + `icons.ts`                             | 모든 아이콘. `lucide-react` 직접 import 금지 (현재 위반 0곳)                                                                                                                                | ✅                                    |

### 탭 · 필터 · 메뉴

| 컴포넌트                                       | 언제                                                                                                             | 상태                                                                                                                                                                                                                                          |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TabMenu`                                      | 탭 바탕                                                                                                          | ✅                                                                                                                                                                                                                                            |
| `LineTabMenu` (11)                             | **모든 탭은 이것으로** (`FolderTabMenu`, `TileTabMenu`는 5단계에서 삭제)                                         | ✅                                                                                                                                                                                                                                            |
| `ScopeTabs` ★                                  | 기본 탭 + 맞춤 탭 + `+`                                                                                          | ★ `GoalsScopeTabs`, `MemosScopeTabs`를 합침. `ProjectsScopeTabs` · `GoalsScopeTabs` · `MemosScopeTabs`는 `placement="page"`면 제목 아래 본문 폭 줄(목록 페이지), 기본 `top`은 화면 맨 위 줄. 이름은 「전체 · 메인(메인 프로젝트) · 즐겨찾기」 |
| `StatusFilterChips` (8)                        | 목록 위 상태 필터                                                                                                | ✅ 기준                                                                                                                                                                                                                                       |
| `StatusFilterBar` (3), `StatusFilterPills` (1) |                                                                                                                  | ⛔ StatusFilterChips로 합침 (`StatFilterButtons`는 쓰는 곳이 없어 5단계에서 삭제)                                                                                                                                                             |
| `FilterBottomSheet` (1)                        | 모바일 필터 시트 (`StatusFilterBar` 안)                                                                          | 🔧 (`FilterButton`, `MobileFilterDrawer`는 쓰는 곳이 없어 5단계에서 삭제)                                                                                                                                                                     |
| `StatusChoiceButton`                           | 상태 하나 고르기                                                                                                 | ✅                                                                                                                                                                                                                                            |
| `DropdownMenu`                                 | `···` 메뉴. 너비 `--popover-menu` 220 (handoff B4), 쓰는 쪽에서 너비를 바꾸지 않는다. 모바일은 바텀시트(항목 44) | ✅                                                                                                                                                                                                                                            |

## 4. 레이아웃 컴포넌트 (`src/components/layout`)

| 컴포넌트                          | 언제                                                                                                       | 상태                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `PageInset`                       | 페이지 바깥 여백                                                                                           | ✅                                                |
| `PageHeading`                     | 페이지 제목. `<h1>`은 여기서만. `variant`(`page` 목록 · `form` 수정·생성), `align`, `icon`                 | ✅ (프로젝트 상세 `DetailTitle`의 `<h1>`은 7단계) |
| `CreatePageFrame`, `BottomAppBar` | 수정 페이지 틀, 하단 바                                                                                    | ✅                                                |
| `HeaderActions`                   | 화면별 헤더 버튼 자리. 새 앱 틀(`ShellHeader`)이 `HeaderActionsSlot`을 두고, 옛 화면과 새 목록이 함께 쓴다 | ✅                                                |

## 5. 기능별 주요 컴포넌트

| 위치                  | 컴포넌트                                      | 상태                                                                                                                                                                                                                                                                                                                                          |
| --------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `projects/components` | `ProjectBoardCard` (폴더 카드)                | 🔧 평소엔 링크, 즐겨찾기 편집에서는 `<label>`로 감싸 카드를 누르면 체크가 눌림. 본문은 이름 2줄 → `StatusText` → 기간·목표·태스크·진행률 → 활동 모자이크 (handoff C1, `activity`를 넘길 때만)                                                                                                                                                 |
|                       | `ActivityMosaic`                              | ✅ 폴더 카드 활동 모자이크 (7줄 × 20주 · 칸 11 · 간격 3 · 빈 날 점 3 · 1–4단계 5 · 7 · 9 · 11, Design Guide 11). 색은 프로젝트 색 하나(`--mosaic-color` = 팔레트 변수, 다크는 다크 값). 계산은 `utils/activityMosaic.ts`, 기록은 `getProjectActivity`                                                                                         |
|                       | `ProjectMark`                                 | ✅ 고르는 목록 · 프로젝트 전환의 프로젝트 표시. 색 점 10, 메인은 프로젝트 색 왕관 14 (읽는 이름 「메인」, 팔레트 변수라 다크는 다크 값, handoff B8)                                                                                                                                                                                           |
|                       | `ProjectListItem` (`ProjectPicker`)           | ✅ 고르는 목록 한 줄: 라디오 · 체크 18 + `ProjectMark` + 이름(자르지 않음) + 상태. 줄 높이 웹 40 · 터치 44 (C-16 · B7 · B11)                                                                                                                                                                                                                  |
|                       | `ProjectPickField`                            | ✅ 드로어 안 「프로젝트」 칸 (목표 · 메모 드로어 공통). 점 · 왕관 + 이름(1줄 …) + [변경], 비면 「프로젝트 선택」 + [고르기]. [변경]은 드로어 위 모달 대신 드로어 안 팝오버(칸 폭) · 모바일은 시트 안 화면으로 검색 + 고르는 목록 줄(이름 자르지 않음) + 「프로젝트 없음」(`allowNone`). Esc · 바깥 누르기로 닫히고 [변경]으로 초점이 돌아온다 |
|                       | `ProjectFolder`                               | 🔧 목록 카드 전용으로 단순화 (디테일 모드 제거)                                                                                                                                                                                                                                                                                               |
|                       | `ProjectStatusBadge`                          | ✅ `StatusBadge` 위. 진행 중 + 지연이면 「지연」 뱃지를 옆에 붙임                                                                                                                                                                                                                                                                             |
| `projects/content`    | `ProjectDetailPageContent`                    | 🔧 일반 페이지로 재구성                                                                                                                                                                                                                                                                                                                       |
|                       | `ProjectListRow`                              | 🔧 16KB. 즐겨찾기 편집에서는 `<label>`로 감싸 줄을 누르면 체크가 눌림                                                                                                                                                                                                                                                                         |
| `projects/modals`     | `ChangeProjectDeadlineModal` (22KB)           | 🔧 나누기                                                                                                                                                                                                                                                                                                                                     |
|                       | `TeamScopeModal` (22KB), `ProjectDetailTeam`  | 💤 v1에서 숨김. 지우지도 고치지도 않는다 (PRD 5-4)                                                                                                                                                                                                                                                                                            |
| `goals/components`    | `GoalForm` (44KB)                             | 🔧 가장 먼저 나눌 파일                                                                                                                                                                                                                                                                                                                        |
|                       | `GoalStatusBadge`                             | ✅ `StatusBadge` 위. 완료가 아니고 지연이면 「지연」 뱃지를 옆에 붙임                                                                                                                                                                                                                                                                         |
| `goals/modals`        | `GoalCreateDrawer`, `GoalDetailDrawer` (28KB) | 만들기 ✅ 원본 순서(이름 * → 프로젝트(`ProjectPickField`) → 태그 0/2 → 「더 설정하기 · 기간, 설명」), 「추가」로 저장 · 닫을 때 확인창. 상세 🔧 안쪽은 아직 라벨 왼쪽                                                                                                                                                                         |
| `tasks/components`    | `TaskBoard`, `TaskCard`, `BoardColumn`        | ✅                                                                                                                                                                                                                                                                                                                                            |
|                       | `TaskCalendarView` (21KB)                     | 🔧 나누기                                                                                                                                                                                                                                                                                                                                     |
|                       | `TaskStatusBadge`                             | ✅ `StatusBadge` 위                                                                                                                                                                                                                                                                                                                           |
| `memos/components`    | `MemoCards`, `MemoRegisterDrawer`             | 등록 드로어 ✅ `FormField`(등록 대상 · 프로젝트 `ProjectPickField` · 이름 * · 설명), 닫을 때 확인창                                                                                                                                                                                                                                           |
| `search/modals`       | `IntegratedSearchModal` (26KB)                | 🔧 나누기                                                                                                                                                                                                                                                                                                                                     |

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
  <DrawerRow label="상태" aside={<AutoCalcInfo />}>
    …
  </DrawerRow>
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
