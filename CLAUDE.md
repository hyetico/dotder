@AGENTS.md

# CLAUDE.md

AI 도구(Claude Code)가 이 저장소에서 일할 때 따르는 규칙의 **목차**입니다. 자세한 내용은 `docs/`에 있고, 여기에는 연결과 꼭 지킬 규칙만 둡니다.

## 작업 전에 읽을 문서

| 하려는 일 | 문서 |
|---|---|
| 기능 범위, 용어, 규칙 | `docs/PRD.md` |
| 화면 패턴 (드로어·모달·페이지, 탭, 상태 화면, 문구) | `docs/guides/design-guide.md` |
| 색·글자·간격·모서리·그림자·z-index 값 | `docs/guides/style-guide.md` |
| 페이지 뼈대, 반응형, 드로어·모달 크기 | `docs/guides/layout-guide.md` |
| 컴포넌트 고르기·만들기 | `docs/guides/component-guide.md` |
| 코드 작성 (JSDoc, 이름, import, 데이터, 확인) | `docs/guides/code-guide.md` |
| 브랜치·커밋·push·PR | `docs/guides/git-guide.md` |
| 무엇을 할 차례인지 | `docs/roadmap.md` |
| 남은 정리 목록 | `docs/tech-debt.md` |
| 결정의 이유 | `docs/decisions/` |

- **문서 우선순위**와 **문서와 코드가 다를 때** 어떻게 할지는 `docs/README.md`에서만 정한다. 요약: 규칙 문서는 PRD → design → style → layout → component → code → git 순으로 우선하고, 문서는 목표 상태이므로 **지금 작업 범위 밖의 코드는 문서에 맞추겠다고 고치지 않는다.** 범위 밖 차이는 `tech-debt.md`를 확인하고 사용자에게 알린다.

## 꼭 지킬 규칙

1. **값은 토큰으로.** 하드코딩 색, 임의 px, 홀수 글자 크기, `bg-white`·`text-black` 금지. 토큰이 없으면 globals.css와 style-guide에 먼저 추가한다.
2. **반응형은 Tailwind 이름만.** `md:` `lg:` `xl:` `2xl:`. `min-[1025px]:` 같은 임의 기준점 금지.
3. **라이트·다크 둘 다.** 새 색 토큰은 두 모드 값을 같이 정의하고, 화면은 두 모드에서 확인한다.
4. **만들기 전에 찾기.** 새 UI는 component-guide에서 먼저 찾는다. 비슷한 컴포넌트를 새로 만들지 않는다.
5. **컴포넌트 가이드 갱신 (필수).** 컴포넌트를 만들거나, 이름·위치·props·용도를 바꾸거나, 지우면 같은 커밋에서 `docs/guides/component-guide.md`를 고친다.
6. **문서 주석.** export 함수·훅과 `components/ui` 컴포넌트에는 TSDoc 주석을 단다. 형식은 code-guide 1장.
7. **UI 역할.** 만들기는 드로어, 확인은 `AlertModal`, 많은 항목 수정은 페이지. 페이지 제목은 `PageHeading`.
8. **정리 목록 갱신.** tech-debt 항목을 해결하면 지우고, 새로 발견하면 추가한다. 단계를 끝내면 roadmap을 체크한다.

## Git

@docs/guides/git-guide.md

## 확인

검사 명령과 시점은 code-guide 7장 "확인".

@docs/guides/code-guide.md

## 임시 파일

- 스크린샷, 검증 스크립트 같은 임시 파일은 프로젝트 루트에 흩어 놓지 말고 반드시 `.tmp/` 폴더 안에 만든다. (git 제외됨)
- 디자인 가이드 참고 이미지는 `.design-ref/`에 있다. 지우지 말 것. (git 제외됨)

## 이 파일을 고칠 때

- 자세한 설명은 `docs/`에 쓰고, 여기에는 한두 줄과 연결만 둔다.
