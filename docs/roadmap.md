# 로드맵 (단계별 작업 계획)

> 상태: v0.1 · 2026-11-21
> 한 단계 = 한 브랜치 = 한 PR. 모든 작업 브랜치는 `develop`에서 따고 `develop`으로 합친다.
> 단계를 끝내면 체크하고, `tech-debt.md`에서 해결한 항목을 지운다.

## 진행 상황

| 단계 | 브랜치 | 상태 |
|---|---|---|
| 0. 준비 | - | ✅ |
| 1. 문서 확정 | `docs/guides` | ✅ |
| 2. 청소 | `chore/cleanup` | ✅ |
| 3. 반응형 버그 | `fix/breakpoints` | ✅ |
| 4. 디자인 토큰 | `refactor/design-tokens` | ✅ |
| 5. 공통 컴포넌트 정리 | `refactor/ui-components` | ⬜ |
| 6. 생성 드로어 통일 | `refactor/create-drawer` | ⬜ |
| 7. 디테일 페이지 | `refactor/project-detail-page` | ⬜ |
| 8. 설정 페이지 + 테마 | `feat/settings` | ⬜ |
| 9. 맞춤 탭 | `feat/custom-tabs` | ⬜ |
| 10. 데이터 계층 | `refactor/data-layer` | ⬜ (v1.x) |

---

## 0. 준비 ✅

- [x] 리팩터링 전 상태 커밋, `before-refactor` 태그
- [x] GitHub 연결, `develop` 브랜치
- [x] 임시 파일 `.tmp/`, 참고 이미지 `.design-ref/` 규칙

## 1. 문서 확정 — `docs/guides` ✅

- [x] `docs/` 구조로 문서 넣기 (README, PRD, roadmap, tech-debt, guides 6개, decisions)
- [x] CLAUDE.md를 목차형으로 교체
- [x] 예전 규칙 폴더(`.cursor/`) 삭제 — Cursor는 쓰지 않음
- [x] 문서 읽고 고칠 점 반영
- [x] README.md를 프로젝트 소개로 교체

**완료 기준:** 문서만 읽고 2~9단계를 시작할 수 있다.

## 2. 청소 — `chore/cleanup` ✅

동작은 바뀌지 않는 작업만.

- [x] lint 오류 18개 · 경고 13개 정리 (tech-debt X-7). 오류 0 · 경고 7 남음 (X-8). 2단계 완료 기준이 lint 통과라서 가장 먼저 한다
- [x] `cn()` 유틸 추가 (`src/lib/cn.ts`, 조건부 className 합치기)
- [x] 쓰지 않는 컴포넌트 삭제: `MobileFilterMenu`
- [x] `console.log` 8개 삭제
- [x] 주석 처리된 옛 코드 삭제 (`task.ts` 등)
- [x] import 자동 정렬 설정 (ESLint `import/order` 또는 Prettier 플러그인)
- [x] 화면 문구 "업무" → "태스크" (16곳. 목업 데이터 6곳은 데이터 값이라 제외)
- [x] 주소 `/backlog` → `/memos` (리다이렉트 남김), 코드 이름 `Backlog*` → `Memo*`. 디테일 하위 주소 `/projects/[id]/backlog`는 7단계
- [x] Prettier 형식 맞추기 42파일 (tech-debt X-9). 단계 끝 검사 `format:check` 통과용
- [x] 앱 이름 통일: package.json `name`, 탭 제목, 사이드바 로고, `navConfig.tsx` (2026-11-24 Dotder로 변경, handoff N1–N6)

**완료 기준:** `npm run lint`, `npm run build` 통과. 화면 변화 없음.

## 3. 반응형 버그 — `fix/breakpoints` ✅

- [x] `min-[1025px]:` 34곳, `min-[1024px]:` 17곳, `max-[1024px]:` 10곳 → `lg:` / `max-lg:`
- [x] `min-[768px]:` 2곳, `min-[1280px]:` 1곳, `min-[1440px]:` 3곳 → `md:`, `xl:`, `2xl:` (`2xl`은 globals.css에서 1440으로 지정)
- [x] 1023 · 1024 · 1025px에서 화면 확인 (20개 화면 × 6개 너비 전후 비교, 1024에서만 바뀜)

- [x] 1024~1279에서 사이드바 64로 접기, 펼치기 가능 (layout-guide 2장, 원본 Layout Spec 01) — 동작은 이미 있었고 너비만 57 → 64

**완료 기준:** 임의 기준점 0곳.

## 4. 디자인 토큰 — `refactor/design-tokens` ✅

양이 많아서 커밋을 나눈다.

> ⚠️ **이 단계는 앱 전체에 눈에 보이는 변화가 생긴다.** 2·3단계와 달리 "화면 변화 없음"이 아니다.
> - `--type-xs` 줄 높이 16 → 18: `text-caption`, `text-xs`, 버튼 작은 글자(`--button-font-xs`) 등 12px 글자가 쓰인 모든 곳의 높이가 조금 커진다.
> - 13px → 12px/14px: 메타 정보 크기가 바뀐다.
> - 색 토큰 정리로 비슷하던 회색들이 하나로 맞춰진다.
>
> 커밋마다 주요 화면(프로젝트 목록·목표·태스크 보드·드로어)을 캡처해서 `.tmp/`에 전후 비교를 남긴다.

- [x] globals.css: style-guide의 ★ 토큰 추가, ◆ 토큰 이름 변경
- [x] 다크 모드 값 전부 채우기 (주 버튼 그라데이션도 토큰으로)
- [x] 글자: 홀수 크기 60곳 → 짝수, 임의 크기 150곳 → 0, `text-body-sm` → `text-caption` (`text-badge-sm-mobile`은 S-13)
- [x] 색: 하드코딩 hex, UI 코드 154곳 → 10곳 (남은 곳은 v1 숨김 팀 모달 · 팔레트 값, tech-debt S-1). Tailwind 기본 팔레트(`red-500` 등) 약 200곳도 토큰으로
- [x] 고정 색 147곳 (`bg-white` 86 · `text-white` 29 · `text-black` 21 · `bg-black` 10 · `border-white` 1) → 토큰
- [x] 상태 색 파일 2개 → `lib/statusColors.ts` 하나로
- [x] 모서리·그림자·z-index 임의 값 → 토큰 (폴더 카드 그림자는 5단계 C1, S-6)
- [x] `lib/date.ts` 만들고 날짜 형식 함수 합치기 (18개 삭제)

- [x] (시작 전) 저장소 docs 가이드를 `design/boards/docs/` 값과 맞추기 — `docs/design-handoff`
- [x] handoff A1 입력칸 선 대비 3:1 (`--color-field-border`, `-hover`) (handoff A1 등은 `design/_handoff/CHANGES-2026-11-23.md`의 번호)
- [x] handoff A2 지연 글자·뱃지 `#b91c1c` / `#ff8a8a`
- [x] handoff A3 다크 폴더 카드 바탕 20% · 카드 위 보조 글자 `#aab2bb`
- [x] handoff A4 다크 메인 왕관 색 (프로젝트 색 + 흰색 30%) — 5단계에서 반영
- [x] handoff A5 다크 로고: `design/svg/` 로고로 교체 — 5단계에서 반영
- [x] handoff A6 글자 11 · 13 → 12 (위 "홀수 크기"와 같이)
- [x] 프로젝트 9색으로 바꾸기 (이미 저장된 Ivory · Ink 옮기기는 8단계, S-12)

**완료 기준:** 하드코딩 색·글자 크기 0곳. `data-theme="dark"`를 붙여도 글자가 다 보인다.

## 5. 공통 컴포넌트 정리 — `refactor/ui-components`

- [x] 탭: `FolderTabMenu`, `TileTabMenu` → `LineTabMenu` (쓰는 곳이 없어 삭제)
- [ ] 필터: `StatusFilterBar`, `StatusFilterPills`, `StatFilterButtons` → `StatusFilterChips` — 마감 뒤로 미룸 (tech-debt C-3). `StatFilterButtons`는 삭제
- [x] `StatusBadge` 만들고 상태 뱃지 3종을 그 위로
- [x] `Toast`, `Notice`, `EmptyState`, `Skeleton`, `ErrorState` 만들기 (`Notice`는 2026-11-24 Components 12 규격으로)
- [x] `PageHeading` `variant="form"` 추가, 직접 쓴 `<h1>` 4곳 교체, 사이드바 로고 `<h1>` 제거 (상세 1곳은 7단계)
- [x] `div onClick` 2곳 → 즐겨찾기 편집 선택이라 링크 대신 `<label>`로 (체크 버튼이 눌림)
- [x] 이모지 아이콘 → `AppIcon` (숨긴 팀 목업 데이터만 남음)
- [x] `Button` 직접 사용 교체
- [x] 팀 관련 화면 숨김: 팀 메뉴, 생성·수정의 팀 선택 (PRD 5-4, P-6). 디테일의 팀 탭은 7단계
- [x] 메뉴 정리: 리포트 숨김, 플레이그라운드는 개발 환경에서만, 스프린트 페이지 제거 (P-6, P-7)
- [ ] component-guide 상태 표시 갱신

- [ ] handoff B1 드로어 너비 400 (웹·태블릿), 드로어 안 확인창은 드로어 가운데 — 너비 400 완료, 확인창 위치 남음
- [x] handoff B2 모달 480, 모바일은 바텀시트 (확인창만 가운데)
- [x] handoff B3 모든 오버레이의 닫기는 X 버튼 하나 + 툴팁 "닫기 · Esc"
- [ ] handoff B4 팝오버 너비 (메뉴 220 · 필터 280) — 메뉴 220 완료, 필터 280은 상태 필터 통합(C-3)과 같이
- [x] handoff B5 토스트 4초 / 6초 · 멈춤 · `role="status"` · reduced-motion
- [x] handoff B6 `DatePicker`: 브라우저 기본 날짜 입력 없애기, 달력 팝오버 282, 모바일 바텀시트 (칸 44)
- [x] handoff B7 고르는 목록에서 이름 자르지 않기 (프로젝트 고르는 목록 `ProjectListItem`)
- [x] handoff B8 고르는 목록의 메인 표시 = 프로젝트 색 왕관 (`ProjectMark`)
- [x] handoff A4 다크 메인 왕관 색 · A5 다크 로고
- [ ] 폴더 카드 그림자 정리 (handoff C1과 같이, tech-debt S-6)
- [x] handoff B9 `StatusText` ★ (폴더 카드 전용 글자형 상태)
- [ ] handoff B10 체크 목록 (상자 18 + 색 점 + 이름) — 상자 18 완료, 체크 목록은 맞춤 탭(9단계)에서
- [x] handoff B11 모바일 선택 시트 줄 (터치 44)
- [x] handoff C1 폴더 카드: 폴더 탭 글씨는 메인만, 제목 16/24 2줄, 상태 줄 (바탕 18% · 패딩 18 포함. 활동 모자이크 7줄 × 20주 포함)
- [ ] handoff C3 태스크 목록 줄 끝 `⋯` 메뉴, 모바일 줄 높이 56 — 태스크 목록 보기가 아직 없음 (tech-debt C-17)
- [x] 목록 페이지 순서: 제목 + 요약 → 탭 → 툴바 → 내용 (layout-guide 5-1) — 프로젝트 · 목표 · 태스크 · 메모
- [x] 모바일: 햄버거 + 왼쪽 시트 300, 드로어·팝오버·모달은 바텀시트 (layout-guide 2장) — 통합 검색 모바일 전체 화면 · 시트 끌기는 남음 (tech-debt C-19)

**완료 기준:** component-guide의 ⛔ 항목 0개.

## 6. 생성 드로어 통일 — `refactor/create-drawer`

- [x] 드로어 공통 틀(`Drawer` 원본 규격) · `FormField`(라벨 위) · `useDrawerPresence` — 예전 계획 `CreateDrawer` · `DrawerRow`(라벨 80 왼쪽) 대신
- [x] 목표 생성 드로어를 새 틀로 옮기기 (`GoalCreateDrawer` 758 → 646줄)
- [x] 프로젝트 생성 드로어 만들기 (시안 기준, 이름만 필수, 마감 없음 허용, 상태 자동)
- [x] 메모 등록 드로어 옮기기
- [ ] 드로어 밀어내기(`--drawer-offset`)를 공통으로
- [x] `/projects/new` 위저드 연결 끊기 (파일은 남김, `/projects?new=1`로 넘김)
- [ ] `GoalForm` 44KB 나누기

- [x] 드로어 안 모양: 헤더 56 · 제목 18/28 · 본문 패딩 24 · 필드 간격 24 · 푸터 72 (layout-guide 6장, 원본 Layout Spec 05)
- [ ] handoff C4 입력칸 이름: 첫 칸은 모두 "이름 *", 프로젝트는 "색상" — 만들기 드로어 3종 · 「태그」 완료, 수정 화면 · 태스크 모달 · 목표 상세 남음
- [ ] 필수 칸 표시: 빨간 `*` + `aria-required="true"` + 비운 채 제출하면 칸 아래 오류 글, "(선택)" 없앰 (design-guide 7-3) — 만들기 드로어 3종 완료

**완료 기준:** 생성 드로어 3종이 같은 틀을 쓴다. 프로젝트를 이름만으로 만들 수 있다.

## 7. 디테일 페이지 — `refactor/project-detail-page`

- [ ] 폴더 틀 제거, 일반 페이지 구조로 ([layout-guide](guides/layout-guide.md) 5-2)
- [ ] 헤더 정보 + 메타 칩
- [ ] 탭 한 줄, 주소 연결 (개요 · 목표 · 태스크 · 메모 · 기록)
- [ ] 개요: 다음에 할 일, 목표, 진행률, 다가오는 일정
- [ ] 기록 탭: 타임라인 + 마감 변경 이력
- [ ] 팀 탭 제거 (v1 개인용, PRD 5-4)
- [ ] `ProjectFolder`에서 디테일 모드 코드 제거
- [ ] 디테일 하위 라우트 정리 (`board`, `calendar`를 태스크 탭 안으로, `backlog` → `memos`)

- [ ] handoff C4 프로젝트 수정 화면의 "색" → "색상"

**완료 기준:** 디테일 페이지가 페이지 전체로 스크롤되고 탭이 한 줄이다.

## 8. 설정 페이지 + 테마 — `feat/settings`

- [ ] 설정 데이터 구조(`UserSettings`)와 저장 (우선 localStorage)
- [ ] 설정 페이지 UI (시안 기준)
- [ ] 테마 전환 (라이트 / 다크 / 시스템)
- [ ] 기능 끄기 반영: 메인 프로젝트, 목표, 프로젝트 색상
- [ ] 기본 목표 태그 → 프로젝트 생성 시 복사
- [ ] 전체 내보내기 (JSON)

**완료 기준:** 설정을 바꾸면 사이드바·드로어·목록에 바로 반영되고 새로고침해도 유지된다.

## 9. 맞춤 탭 — `feat/custom-tabs`

- [ ] 탭 데이터 구조 (즐겨찾기 포함)
- [ ] `ScopeTabs` 만들고 프로젝트·목표·메모 화면에 적용
- [ ] 탭 만들기 (`+` → 이름 + 프로젝트 고르기), 이름 변경, 편집, 삭제, 순서 변경
- [ ] 최대 5개, 넘치면 `···`

- [ ] handoff C2 맞춤 탭은 프로젝트를 직접 체크해서 고름 (이름 12자 이하, 1개 이상, 추가하면 그 탭으로 이동)
- [ ] handoff D2 `CustomTab` (`id · name · pids[]`), 프로젝트를 지우면 `pids`에서도 뺌
- [ ] handoff D1 `Project.label` 삭제

**완료 기준:** 맞춤 탭 하나를 만들면 세 화면에 모두 나타난다.

## 10. 데이터 계층 — `refactor/data-layer` (v1.x)

- [ ] 저장 방식 결정 (localStorage / Supabase 등)
- [ ] 서버·클라이언트가 같은 데이터를 보게 수정 (목업 불일치 버그)
- [ ] 목표 진행률을 저장값 → 계산값으로
- [ ] 프로젝트 상태 자동 계산
- [ ] 태스크 생성·수정도 드로어로

---

## 단계 진행 방법

브랜치·커밋·push·PR 규칙과 명령은 [git-guide](guides/git-guide.md)를 따른다.

- 단계 안에서 예상보다 커지면 브랜치를 더 쪼갠다. (예: 4단계 → `refactor/tokens-color`, `refactor/tokens-type`)
- v1 범위(1~9단계)가 끝나면 `develop` → `main` PR을 만들고 `v1.0.0` 태그를 단다.
