# 기술 부채 · 정리할 목록

> 기준: 2026-11-21, `before-refactor` 태그 시점 코드
> "고쳐야 하는데 아직 안 고친 것"을 모으는 곳입니다. 해결하면 지우고, 새로 발견하면 추가합니다.
> 단계 번호는 [roadmap](roadmap.md)의 단계입니다.

## 분류

- **B** 버그 · **P** PRD와 다른 동작 · **S** 스타일 규칙 위반 · **C** 컴포넌트 · **A** 접근성 · **D** 문서 · **X** 기타

## 목록

| ID | 내용 | 규모 | 단계 |
|---|---|---|---|
| **B-2** | 서버 컴포넌트와 클라이언트가 서로 다른 목업 데이터를 봄. 새로 만든 프로젝트 상세가 "찾을 수 없음" | 구조 | 10 |
| **B-4** | `/goals` 첫 화면에서 하이드레이션 불일치 경고 (서버 HTML과 클라이언트 속성이 다름). `GoalsScopeTabs` → `LineTabMenu` 부근. `before-refactor` 시점부터 있음 (2026-11-23 확인) | 1곳 | 미정 |
| **P-1** | 목표 진행률을 저장값으로 가짐. 태스크를 완료해도 목표 진행률이 안 바뀜 | 구조 | 10 |
| **P-2** | 프로젝트 상태를 사용자가 직접 고름 (PRD: 자동 계산) | 스키마·UI | 6, 10 |
| **P-3** | 마감일 필수 (PRD: 비워도 됨) | 스키마 | 6 |
| **P-4** | 기본 목표 태그가 상수(`PROJECT_TAG_PRESETS`)에 고정 (PRD: 설정에서) | 1곳 | 8 |
| **P-5** | 프로젝트 생성이 3단계 위저드 페이지 (PRD: 드로어) | 화면 | 6 |
| **P-6** | 팀 메뉴 · 리포트 · 팀 선택은 5단계에서 숨김(`lib/v1Scope.ts`). 남은 곳: 프로젝트 상세의 팀 탭 · 팀/담당자 줄, 메모 카드의 팀 이름 | 화면 일부 | 7 |
| **S-1** | 하드코딩 색 hex. UI 코드에 **10곳** 남음: `TeamScopeModal` 9 (v1 숨김, PRD 5-4라 손대지 않음), `MemoRegisterDrawer` 기본 프로젝트 색 1 (팔레트 값). 4단계에서 154곳 → 10곳 | 10곳 | 5 (팀 화면 정리 때) |
| **S-3** | 임의 줄 높이 `leading-[Npx]` (글자 크기 `text-[Npx]`는 4단계에서 0곳) | 27곳 | 5 (점진) |
| **S-5** | 체계 밖 모서리 1곳: `TeamScopeModal` `rounded-[6px]` (v1 숨김) | 1곳 | v2 |
| **S-6** | 폴더 카드 그림자: `--shadow-project-card`(`-hover`), `ProjectBoardCard`·`ProjectFolder`의 `shadow-[0_…]` 7곳. 폴더 카드 모양(handoff C1)과 같이 정리. (입력칸 포커스 링 `shadow-[0_0_0_1px_var(…)]`은 토큰을 쓰는 테두리라 제외) | 9곳 | 5 |
| **S-8** | 강제 덮어쓰기 `!` | 55곳 | 4, 5 |
| **S-9** | 임의 px 값 전체 | 490곳 | 4 (점진) |
| **S-12** | 이미 저장된 Ivory `#e7ddd0` · Ink `#2a2430` 프로젝트 색을 가까운 색으로 옮기기 (안: Ivory → 골드 `#c4a574`, Ink → 플럼 `#6b2d5b`. 확정 전). 고르는 9색과 화면 이름은 4단계에서 바꿈. 지금 목업 데이터에 Ivory 6곳 | 저장값 | 8 (D-5와 같이) |
| **S-13** | `text-badge-sm-mobile` 5곳. 의미 클래스(`text-*`)가 `@layer` 밖 일반 CSS라 `lg:` 같은 변형을 못 붙이고, `font-medium` 같은 유틸리티보다 항상 이긴다(굵기를 덮어씀). Tailwind `@utility`로 옮기면 변형이 되지만 굵기가 함께 쓰인 101곳의 모양이 바뀐다 | 5 / 101곳 | 5 |
| **S-14** | 컨트롤 높이 토큰이 style-guide와 다름: `--control-sm` 32 (가이드 36), `--control-xs`(28) 없음 | 2 | 5 |
| **S-17** | 사이드바 로고(아이콘 · 글자)가 `design/screens/web-1440/01-*`보다 4~6px 오른쪽으로 밀림 (2026-11-24 측정, A5 로고 교체 때부터) | 1곳 | 5 |
| **S-16** | 숨김 화면(`TeamScopeModal`, `ProjectDetailTeam`)도 4단계 일괄 치환(글자 크기 · 색 토큰)으로 바뀜. 동작은 그대로 | 기록 | - |
| **C-3** | 상태 필터 3종(`StatusFilterBar` · `StatusFilterChips` · `StatusFilterPills`)과 모바일 시트(`FilterBottomSheet`). 원본(Components 17)은 "Segmented(트랙 36 · 버튼 32) + 필터 팝오버 280"과 바텀시트 1개. **마감(2026-11-24) 뒤로 미룸** | 3 + 1 | 마감 뒤 |
| **C-4** | 모바일 필터: `FilterButton` · `MobileFilterDrawer`는 5단계에서 삭제(쓰는 곳 0). 남은 `FilterBottomSheet`는 C-3과 같이 | 1 | 마감 뒤 |
| **C-5** | 상태 뱃지 3종(`ProjectStatusBadge` · `GoalStatusBadge` · `TaskStatusBadge`) 공통 바탕 `StatusBadge` 없음 (토스트 2종은 공통 `Toast`로 합침, handoff B5) | 5 | 5 |
| **C-7** | 15KB 넘는 파일 12개 (`GoalForm` 44KB 최대) | 12 | 5~7 |
| **C-8** | 쿼리 스코프 탭 3종 (`ProjectsScopeTabs` 등) | 3 | 9 |
| **C-9** | `DatePicker` 모바일이 아직 가운데 모달 · 칸 36 (handoff B6: 바텀시트 · 칸 44). 공통 바텀시트가 없음(`FilterBottomSheet`는 필터 전용). 부르는 곳의 빈 칸 글자가 「시작일 선택」 「마감일 선택」 등 「~ 선택」으로 남음 | 1 + 부르는 곳 | 5 |
| **A-1** | `div onClick` (`ProjectBoardCard`, `ProjectListRow`) | 2곳 | 5 |
| **A-3** | `PageHeading` 대신 `<h1>` 직접 사용: 프로젝트 상세 `DetailTitle` 1곳 (폼 4곳은 5단계에서 바꿈) | 1곳 | 7 |
| **A-4** | 이모지 아이콘: 숨긴 팀 목업 데이터(`lib/mock/teams.ts`) 6개만 남음 | 6곳 | v2 |
| **D-3** | 프로젝트 디테일의 메모 하위 주소가 아직 `/projects/[id]/backlog` (메모 목록 `/memos`와 코드 이름은 2단계에서 바꿈) | 라우트 1 | 7 |
| **D-5** | localStorage 키 앞머리가 옛 이름 `projectflow:` (`projectSwitcherPreferences.ts` 3개). 바꾸면 저장된 즐겨찾기·최근 목록이 사라지므로 옮기는 코드와 함께 | 3 | 8 |
| **X-4** | 학습용 긴 주석 (`useTaskMutations.ts` 등) | - | 2 |
| **X-5** | 문서 주석이 없는 **export 함수** (`export function`, `export const 이름 = (`) | 412개 중 190개 | 수시 |
| **X-8** | lint 경고 7개 (오류는 0, `npm run lint` 통과). `@next/next/no-img-element` 3 (`SidebarProfile`, `ProfileSummary`, `ProjectAdminField` 아바타 — `next/image`로 바꾸려면 이미지 주소 설정이 필요) · `react-hooks/incompatible-library` 4 (react-hook-form `watch()`를 쓰는 `GoalForm`, `ProjectForm`, `ProjectEditForm`, `ProjectCreateWizard` — `useWatch`로 바꾸거나 폼을 나눌 때 함께) | 7 | 6 |
| **X-10** | `npm run build` 경고 116개 (빌드는 통과). 전부 `node_modules.nosync` 안의 Next·sharp 내부 파일에서 나옴. `node_modules`가 심볼릭 링크라서 Turbopack이 외부 패키지로 알아보지 못하는 것으로 보임 (원인 미확인, 2026-11-23) | 116 | 미정 |

## 숫자 다시 세는 법

저장소 맨 위에서 실행한다. 맥 기본 셸(zsh)에서도 되도록 `--include` 값은 반드시 따옴표로 감싼다.

**하드코딩 색 제외 규칙:** 아래 파일은 S-1 숫자에서 뺀다.
- 색 정의 파일: `src/lib/statusColors.ts` (4단계부터 hex 0), `src/features/projects/utils/projectColors.ts` (팔레트 원본이라 hex 허용)
- 목업 데이터: `src/lib/mock/` (데이터 값이라 허용)

```bash
# S-1 하드코딩 색 (UI 코드만, 제외 규칙 적용)
grep -rhoE '#[0-9A-Fa-f]{6}\b' --include='*.ts' --include='*.tsx' src \
  --exclude='statusColors.ts' --exclude='projectColors.ts' \
  --exclude-dir='mock' | wc -l

# 하드코딩 색 전체 (참고용)
grep -rhoE '#[0-9A-Fa-f]{6}\b' --include='*.ts' --include='*.tsx' src | wc -l

# S-3 임의 글자 크기
grep -rhoE 'text-\[[0-9]+px\]' --include='*.tsx' src | wc -l

# S-2 홀수 글자 크기
grep -rhoE 'text-\[(9|11|13|15|17|19|21|23)px\]' --include='*.tsx' src | wc -l

# 임의 기준점 (B-1 해결, 0이어야 한다)
grep -rhoE '(min|max)-\[[0-9]+px\]:' --include='*.tsx' src | wc -l

# S-4 고정 색
grep -rhoE '\b(bg|text|border)-(white|black)\b' --include='*.tsx' src | wc -l
```

2026-11-21 기준 결과: S-1 154 · 전체 301 · S-3 150 · S-2 60 · B-1 68 · S-4 147 (B-1은 2026-11-24 3단계에서 0곳. 2단계 정리 뒤 실제로 바꾼 곳은 67곳)

2026-11-24 4단계 뒤: S-1 10 · 전체 65 · S-3(글자) 0 · S-2 0 · S-4 0 · 임의 기준점 0

> 숫자를 적을 때는 반드시 위 명령으로 센 값을 쓴다. 다른 방법(`grep -c` 등)으로 세면 한 줄에 여러 개 있는 경우를 놓친다.
