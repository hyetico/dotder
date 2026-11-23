# 기술 부채 · 정리할 목록

> 기준: 2026-11-21, `before-refactor` 태그 시점 코드
> "고쳐야 하는데 아직 안 고친 것"을 모으는 곳입니다. 해결하면 지우고, 새로 발견하면 추가합니다.
> 단계 번호는 [roadmap](roadmap.md)의 단계입니다.

## 분류

- **B** 버그 · **P** PRD와 다른 동작 · **S** 스타일 규칙 위반 · **C** 컴포넌트 · **A** 접근성 · **D** 문서 · **X** 기타

## 목록

| ID | 내용 | 규모 | 단계 |
|---|---|---|---|
| **B-1** | 반응형 기준점 1024/1025 혼용 (62곳). 너비 1024px에서 스타일이 겹치거나 빠짐. 그 밖의 임의 기준점(768·1280·1440) 6곳 포함 전체 68곳 | 68곳 | 3 |
| **B-2** | 서버 컴포넌트와 클라이언트가 서로 다른 목업 데이터를 봄. 새로 만든 프로젝트 상세가 "찾을 수 없음" | 구조 | 10 |
| **B-3** | 다크 모드 토큰 일부 누락. 켜면 어두운 배경에 어두운 글자 | 토큰 10여 개 | 4 |
| **B-4** | `/goals` 첫 화면에서 하이드레이션 불일치 경고 (서버 HTML과 클라이언트 속성이 다름). `GoalsScopeTabs` → `LineTabMenu` 부근. `before-refactor` 시점부터 있음 (2026-11-23 확인) | 1곳 | 미정 |
| **P-1** | 목표 진행률을 저장값으로 가짐. 태스크를 완료해도 목표 진행률이 안 바뀜 | 구조 | 10 |
| **P-2** | 프로젝트 상태를 사용자가 직접 고름 (PRD: 자동 계산) | 스키마·UI | 6, 10 |
| **P-3** | 마감일 필수 (PRD: 비워도 됨) | 스키마 | 6 |
| **P-4** | 기본 목표 태그가 상수(`PROJECT_TAG_PRESETS`)에 고정 (PRD: 설정에서) | 1곳 | 8 |
| **P-5** | 프로젝트 생성이 3단계 위저드 페이지 (PRD: 드로어) | 화면 | 6 |
| **P-6** | 팀·리포트·플레이그라운드가 메뉴에 보이고, 프로젝트 생성·수정에 팀 선택이 있음 (PRD: v1 숨김) | 메뉴 · 폼 | 5 |
| **P-7** | 스프린트 페이지가 빈 화면 (PRD: 제거) | 1곳 | 5 |
| **S-1** | 하드코딩 색 hex. 전체 301곳 중 **UI 코드 154곳 / 36파일**이 고칠 대상 (색 정의 파일 109곳, 목업 데이터 38곳은 제외. 아래 "숫자 다시 세는 법" 참고) | 154곳 | 4 |
| **S-2** | 홀수 글자 크기 (`13px` 51 · `15px` 8 · `9px` 1) | 60곳 | 4 |
| **S-3** | 임의 글자 크기 `text-[Npx]` 전체 / 임의 줄 높이 | 150 / 40곳 | 4 |
| **S-4** | 고정 색 클래스 (`bg-white` 86 · `text-white` 29 · `text-black` 21 · `bg-black` 10 · `border-white` 1) | 147곳 | 4 |
| **S-5** | 체계 밖 모서리 (`rounded-[6px]` 등) | 26곳 | 4 |
| **S-6** | 임의 그림자 `shadow-[...]` | 52곳 | 4 |
| **S-7** | 임의 z-index (`z-[110]`~`z-[200]`) | 18곳 | 4 |
| **S-8** | 강제 덮어쓰기 `!` | 55곳 | 4, 5 |
| **S-9** | 임의 px 값 전체 | 490곳 | 4 (점진) |
| **S-10** | 상태 색 정의 파일 2개로 분리, hex 직접 사용 (`statusColors.ts` 61 · `projectStatusColors.ts` 30) → 하나로 합치고 토큰 참조로 | 91곳 | 4 |
| **S-11** | `text-body-sm`과 `text-caption`이 같은 값 | 1 | 4 |
| **S-12** | 프로젝트 색이 원본 9색과 다름. 코드에만 있는 Ivory `#e7ddd0` · Ink `#2a2430`을 지우고 블루 · 코랄을 추가해야 함. 이미 저장된 Ivory · Ink 값은 가까운 색으로 옮긴다 (안: Ivory → 골드 `#c4a574`, Ink → 플럼 `#6b2d5b`. 확정 전). `label` 이름도 화면 이름에 맞춤 (style-guide 1-8) | 2색 + 저장값 | 4 |
| **C-2** | 탭 3종 (`Line`, `Folder`, `Tile`) | 3 | 5 |
| **C-3** | 상태 필터 4종 | 4 | 5 |
| **C-4** | 모바일 필터 3종 | 3 | 5 |
| **C-5** | 상태 뱃지 3종 바탕 없음, 토스트 2종 따로 | 5 | 5 |
| **C-6** | 날짜 형식 함수가 14곳에 따로 있음 | 14 | 4 |
| **C-7** | 15KB 넘는 파일 12개 (`GoalForm` 44KB 최대) | 12 | 5~7 |
| **C-8** | 쿼리 스코프 탭 3종 (`ProjectsScopeTabs` 등) | 3 | 9 |
| **A-1** | `div onClick` (`ProjectBoardCard`, `ProjectListRow`) | 2곳 | 5 |
| **A-2** | 사이드바 로고가 `<h1>` → 페이지에 h1 두 개 | 1곳 | 5 |
| **A-3** | `PageHeading` 대신 `<h1>` 직접 사용 | 5곳 | 5 |
| **A-4** | 이모지를 아이콘으로 사용 | 6곳 | 5 |
| **D-2** | ✅ 완료 — README가 create-next-app 기본 → 프로젝트 소개로 교체 | 1 | 1 |
| **D-3** | 프로젝트 디테일의 메모 하위 주소가 아직 `/projects/[id]/backlog` (메모 목록 `/memos`와 코드 이름은 2단계에서 바꿈) | 라우트 1 | 7 |
| **D-4** | 앱 이름은 Tessera로 통일했지만 GitHub 저장소 이름이 아직 `flow-choice`. 바꾸면 원격 주소(`git remote`)도 갱신 | 1 | 공개 전 |
| **D-5** | localStorage 키 앞머리가 옛 이름 `projectflow:` (`projectSwitcherPreferences.ts` 3개). 바꾸면 저장된 즐겨찾기·최근 목록이 사라지므로 옮기는 코드와 함께 | 3 | 8 |
| **X-4** | 학습용 긴 주석 (`useTaskMutations.ts` 등) | - | 2 |
| **X-5** | 문서 주석이 없는 **export 함수** (`export function`, `export const 이름 = (`) | 412개 중 190개 | 수시 |
| **X-8** | lint 경고 7개 (오류는 0, `npm run lint` 통과). `@next/next/no-img-element` 3 (`SidebarProfile`, `ProfileSummary`, `ProjectAdminField` 아바타 — `next/image`로 바꾸려면 이미지 주소 설정이 필요) · `react-hooks/incompatible-library` 4 (react-hook-form `watch()`를 쓰는 `GoalForm`, `ProjectForm`, `ProjectEditForm`, `ProjectCreateWizard` — `useWatch`로 바꾸거나 폼을 나눌 때 함께) | 7 | 6 |
| **X-10** | `npm run build` 경고 116개 (빌드는 통과). 전부 `node_modules.nosync` 안의 Next·sharp 내부 파일에서 나옴. `node_modules`가 심볼릭 링크라서 Turbopack이 외부 패키지로 알아보지 못하는 것으로 보임 (원인 미확인, 2026-11-23) | 116 | 미정 |

## 숫자 다시 세는 법

저장소 맨 위에서 실행한다. 맥 기본 셸(zsh)에서도 되도록 `--include` 값은 반드시 따옴표로 감싼다.

**하드코딩 색 제외 규칙:** 아래 파일은 S-1 숫자에서 뺀다.
- 색 정의 파일: `src/lib/statusColors.ts`, `src/features/projects/constants/projectStatusColors.ts` (S-10에서 따로 셈), `src/features/projects/utils/projectColors.ts` (팔레트 원본이라 hex 허용)
- 목업 데이터: `src/lib/mock/` (데이터 값이라 허용)

```bash
# S-1 하드코딩 색 (UI 코드만, 제외 규칙 적용)
grep -rhoE '#[0-9A-Fa-f]{6}\b' --include='*.ts' --include='*.tsx' src \
  --exclude='statusColors.ts' --exclude='projectStatusColors.ts' --exclude='projectColors.ts' \
  --exclude-dir='mock' | wc -l

# 하드코딩 색 전체 (참고용)
grep -rhoE '#[0-9A-Fa-f]{6}\b' --include='*.ts' --include='*.tsx' src | wc -l

# S-3 임의 글자 크기
grep -rhoE 'text-\[[0-9]+px\]' --include='*.tsx' src | wc -l

# S-2 홀수 글자 크기
grep -rhoE 'text-\[(9|11|13|15|17|19|21|23)px\]' --include='*.tsx' src | wc -l

# B-1 임의 기준점
grep -rhoE '(min|max)-\[[0-9]+px\]:' --include='*.tsx' src | wc -l

# S-4 고정 색
grep -rhoE '\b(bg|text|border)-(white|black)\b' --include='*.tsx' src | wc -l
```

2026-11-21 기준 결과: S-1 154 · 전체 301 · S-3 150 · S-2 60 · B-1 68 · S-4 147

> 숫자를 적을 때는 반드시 위 명령으로 센 값을 쓴다. 다른 방법(`grep -c` 등)으로 세면 한 줄에 여러 개 있는 경우를 놓친다.
