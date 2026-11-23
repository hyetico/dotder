# 코드 가이드

> 상태: v0.1 · 2026-11-21
> 코드를 어떻게 쓰는가를 다룹니다. UI 값은 [style-guide](style-guide.md), 컴포넌트 선택은 [component-guide](component-guide.md)를 봅니다.

## 1. 문서 주석 (JSDoc / TSDoc)

TypeScript 프로젝트에서 널리 쓰는 **TSDoc** 방식을 따릅니다. 핵심은 **타입이 이미 말해 주는 건 쓰지 않고, 타입이 못 말하는 것(의도, 단위, 예외, 주의점)만 쓴다**는 것입니다.

### 1-1. 언제 쓰나

| 대상 | 주석 |
|---|---|
| `export`하는 함수, 훅, 유틸, API 함수 | **필수** |
| `components/ui`의 컴포넌트와 그 Props | **필수** |
| `features`의 컴포넌트 | 하는 일이 이름만으로 분명하지 않을 때 |
| 파일 안에서만 쓰는 작은 함수, 이벤트 핸들러 | 쓰지 않음 (이름으로 설명) |
| `page.tsx`, `layout.tsx` 기본 내보내기 | 쓰지 않음 |

### 1-2. 형식

```ts
/**
 * 마감일이 지났는지와 며칠 지났는지를 계산한다.
 *
 * 완료·보류 상태인 프로젝트는 지연으로 보지 않는다.
 *
 * @param endDate - 마감일. `YYYY-MM-DD` 형식, 비어 있으면 마감 없음
 * @param today - 기준 날짜. 테스트할 때만 넘긴다
 * @returns 지난 일수. 지나지 않았으면 0
 *
 * @example
 * getOverdueDays("2026-11-01", new Date("2026-11-21")) // 20
 */
export function getOverdueDays(endDate: string, today = new Date()): number {
```

규칙:
- **첫 줄은 요약 한 문장.** 함수 이름을 다시 쓰지 않는다. "~한다." 로 끝낸다.
- 빈 줄 뒤에 필요하면 자세한 설명 (조건, 주의점).
- `@param 이름 - 설명`: 하이픈(`-`) 사용, **타입은 쓰지 않는다** (TypeScript가 보여줌). 단위, 형식, 빈 값의 의미처럼 타입이 못 알려주는 것을 쓴다.
- `@returns`: 반환값이 이름만으로 분명하지 않을 때만.
- `@example`: 유틸 함수, 공통 컴포넌트에 권장.
- 그 외 쓸 수 있는 태그: `@remarks`(주의할 배경), `@throws`(던지는 오류), `@deprecated 대신 쓸 것`, `@see 관련 링크`.
- 설명은 한국어로 쓴다.

### 1-3. 컴포넌트는 Props 타입에 쓴다

`@param props.xxx`를 나열하지 않고, **Props 타입의 각 속성 위에** 주석을 단다. 이렇게 하면 컴포넌트를 쓰는 쪽에서 속성에 마우스를 올렸을 때 설명이 바로 보인다.

```tsx
type DrawerRowProps = {
  /** 왼쪽 라벨. 80px 너비에 한 줄로 들어가게 짧게 쓴다. */
  label: string;
  /** 라벨과 연결할 입력칸 id. 넘기면 `<label for>`로 그린다. */
  htmlFor?: string;
  /** 오른쪽 끝 보조 영역. "자동 계산" 표시 같은 것. */
  aside?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * 드로어 안에서 라벨과 값을 한 줄로 보여주는 행.
 *
 * @example
 * <DrawerRow label="기간" aside={<AutoCalcInfo />}>
 *   <DatePicker variant="button" … />
 * </DrawerRow>
 */
export function DrawerRow({ label, htmlFor, aside, children }: DrawerRowProps) {
```

- 이름만으로 분명한 속성(`children`, `className`, `onClick`)에는 주석을 달지 않는다.

### 1-4. 예전 규칙에서 바뀐 점

| 예전 규칙 | 지금 |
|---|---|
| 첫 줄에 함수 이름 | 첫 줄은 요약 문장 (이름은 코드에 이미 있음) |
| 모든 새 함수에 필수 | export·공통 컴포넌트만 필수 |
| `@param props.이름`으로 Props 나열 | Props 타입의 각 속성에 주석 |
| 형식만 정함 | 타입은 쓰지 않고 의도·단위·예외를 씀 |

- 기존 주석은 한꺼번에 바꾸지 않는다. 그 파일을 고칠 때 같이 바꾼다.

### 1-5. 일반 주석

- **왜**를 쓴다. **무엇**은 코드가 말한다.
  ```ts
  // 나쁨: 1을 더한다
  // 좋음: 서버 페이지 번호는 1부터 시작해서 맞춘다
  ```
- 지금 코드에 남아 있는 학습용 긴 설명(예: `useTaskMutations.ts`의 useQuery 설명)은 `docs/`의 학습 노트로 옮기거나 줄인다.
- 주석 처리한 옛 코드는 남기지 않는다. Git에 기록이 있다.
- 나중에 할 일은 `// TODO(이름): 내용`으로 쓰고 `tech-debt.md`에도 적는다.

## 2. 이름

| 대상 | 규칙 | 예 |
|---|---|---|
| 컴포넌트, 컴포넌트 파일 | PascalCase | `ProjectBoardCard.tsx` |
| 훅 | `use` + camelCase | `useProjectMutations.ts` |
| 유틸, API, 상수 파일 | camelCase | `projectUtils.ts` |
| 상수 값 | UPPER_SNAKE_CASE | `PROJECT_TAG_LIMIT` |
| 타입 | PascalCase, `I` 접두어 없음 | `Project`, `ProjectListItem` |
| Props 타입 | `컴포넌트이름Props` | `DrawerRowProps` |
| 불리언 | `is`, `has`, `can`, `should` | `isMain`, `canSubmit` |
| 이벤트 props | `on` + 동사 | `onSelect` |
| 이벤트 핸들러 | `handle` + 동사 | `handleSelect` |
| className 상수 | `xxxClassName` | `drawerRowClassName` |

## 3. 폴더와 import

- 폴더 구조는 [component-guide](component-guide.md) 1장.
- import는 `@/` 절대 경로를 쓴다. `../../` 금지.
- import 순서 (빈 줄로 구분): ① react, next ② 외부 라이브러리 ③ `@/components` ④ `@/features` ⑤ `@/lib`, `@/hooks` ⑥ 타입 (`import type`)
  - ESLint `import/order`(`eslint.config.mjs`)가 검사한다. `npx eslint --fix`로 자동 정렬된다. 그룹 안에서는 알파벳순이다.
  - `import "./globals.css"`처럼 값을 받지 않는 import는 자동으로 옮겨지지 않는다. 적용 순서가 중요하므로 손으로 맨 위에 둔다.
- 순환 import 금지. `features/A`가 `features/B`를 가져오면 `B`는 `A`를 가져오지 않는다.

## 4. 스타일 (Tailwind)

- 값은 토큰으로만. ([style-guide](style-guide.md) 0장)
- 클래스는 한 줄로 이어 쓴다. 길어지면 문자열을 쪼개지 말고 컴포넌트 위에 `const xxxClassName = "..."`로 뺀다.
- 조건부 클래스는 `cn()`(`@/lib/cn`)으로 합친다. 예: `cn(base, isActive && activeClassName, className)`. 겹치는 Tailwind 클래스는 정리해 주지 않으니 같은 속성을 두 번 넘기지 않는다.
- 클래스 순서는 `prettier-plugin-tailwindcss`가 자동으로 정렬한다.
- 반응형은 Tailwind 이름(`md:`, `lg:`, `xl:`)만. ([layout-guide](layout-guide.md) 2장)

## 5. 데이터

- 서버 데이터는 TanStack Query로만 읽고 쓴다. 컴포넌트에서 API 함수를 직접 부르지 않는다.
- 쿼리 키는 `src/lib/queryKeys.ts`에서만 만든다.
- 생성·수정·삭제는 기능별 `useXxxMutations` 훅에 모은다.
- 계산할 수 있는 값(진행률, 지연, 상태)은 저장하지 않고 `utils`의 함수로 계산한다.
- 폼 검증은 zod 스키마(`features/<기능>/schemas`)에서만. 오류 문구도 스키마에 둔다.
- 날짜 다루기와 형식은 `src/lib/date.ts`(★)에서만.

## 6. 금지

- `console.log` (디버깅 후 지운다. 남겨야 하면 `console.error`만)
- `any` (꼭 필요하면 `unknown` 후 좁히기)
- `div`·`span`에 `onClick`
- 이모지를 아이콘으로 사용
- `eslint-disable` (꼭 필요하면 이유를 같은 줄에)

## 7. 확인

| 시점 | 검사 |
|---|---|
| 커밋 전 | `npx tsc --noEmit`, `npm run lint` |
| 단계 끝 (push 전) | 위 두 가지 + `npm run format:check`, `npm run build` |

```bash
npx tsc --noEmit
npm run lint
npm run format:check
npm run build
```

- 실패했을 때 어떻게 할지는 [git-guide](git-guide.md) 3장.
- 화면을 바꿨다면 모바일(375) · 데스크톱(1280) 너비, 라이트·다크 모드에서 확인한다.
- 스크린샷과 검증 스크립트는 `.tmp/`에만 만든다.
