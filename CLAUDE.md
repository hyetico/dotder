@AGENTS.md

# CLAUDE.md

AI 도구(Claude Code)가 이 저장소에서 일할 때 따르는 규칙의 **목차**입니다. 자세한 내용은 `docs/`에 있고, 여기에는 연결과 꼭 지킬 규칙만 둡니다.

- 앱 이름: **Dotder** (2026-11-24 변경, 이전 Tessera). 로고 글자는 소문자 `dotder` · 700 · 자간 −0.02em, 문장 안에서는 `Dotder`, package.json `name`은 `dotder`. 저장된 데이터의 키 이름(`projectflow:` 등)은 바꾸지 않는다 (tech-debt D-5).

## 작업 전에 읽을 문서

**화면 작업은 `design/_handoff/2026-11-24/REBUILD.md`를 먼저 읽고, 그 0장 방식만 따른다.**

| 하려는 일 | 문서 |
|---|---|
| 만드는 방법 · 순서 · 끝 기준 · 정해진 값 | `design/_handoff/2026-11-24/REBUILD.md` |
| 화면 모양 · 크기 · 간격 · 색 (1순위) | `design/_handoff/2026-11-24/boards/PR-*.dc.html` |
| 보드에 없는 상태 · 동작 · 문구 | `design/_handoff/2026-11-24/prototype/index.html` |
| 토큰 · 규칙 · 정책 | `design/_handoff/2026-11-24/boards/DOC1~5` |
| 코드 작성 (JSDoc, 이름, import, 확인) | `docs/guides/code-guide.md` |
| 브랜치 · 커밋 · push · PR | `docs/guides/git-guide.md` |

- **보드와 문서가 다르면 보드를 따른다.** 묻지 않고, 다른 곳은 보고 끝에 표로 적는다.
- 화면 컴포넌트는 `src/components/kit/`만 쓴다. kit 밖 기존 컴포넌트는 고치지도 import 하지도 않는다. 없으면 kit에 추가한다.
- `design/boards/` · `design/prototype/` · `design/screens/` · `docs/guides/`의 design · style · layout · component 가이드 · `docs/PRD.md`는 옛 기준이라 보지 않는다.

## 꼭 지킬 규칙

1. **값은 토큰으로.** 하드코딩 색, 임의 px, 홀수 글자 크기, `bg-white`·`text-black` 금지. 토큰이 없으면 globals.css에 먼저 추가한다.
2. **반응형은 Tailwind 이름만.** `md:` `lg:` `xl:` `2xl:`. `min-[1025px]:` 같은 임의 기준점 금지.
3. **라이트·다크 둘 다.** 새 색 토큰은 두 모드 값을 같이 정의하고, 화면은 두 모드에서 확인한다.
4. **만들기 전에 찾기.** 새 UI는 `src/components/kit/`에서 먼저 찾는다. 있으면 그대로 쓰고, 없을 때만 보드대로 kit에 추가한다.
5. (삭제 — 컴포넌트 기준은 보드와 DOC3)
6. **문서 주석.** export 함수·훅과 `components/ui` 컴포넌트에는 TSDoc 주석을 단다. 형식은 code-guide 1장.
7. **UI 역할.** 만들기 · 수정은 드로어, 확인창 · 페이지 제목은 kit 컴포넌트로.
8. **정리 목록 갱신.** tech-debt 항목을 해결하면 지우고, 새로 발견하면 추가한다. 단계를 끝내면 roadmap을 체크한다.

## 일하는 방식

- 답변과 보고는 자연스러운 한국어로, 짧고 분명하게.
- **내용을 지어내지 않는다.** 화면에 나오는 글·숫자·링크를 만들어 넣지 않는다. 디자인 보드와 캡처 속 글은 크기·줄바꿈을 보기 위한 자리 표시라서 화면에 옮기지 않는다.
- **요청하지 않은 것은 바꾸지 않는다.** 개선 아이디어는 먼저 제안하고, 확인 후 적용한다.
- 큰 시각 변경은 적용 전에 스크린샷으로 먼저 보여준다.
- 같은 역할은 같은 값(간격·글자 크기·색·높이). 회색 가는 선(hairline)과 잡다한 장식은 피한다.
- 모르면 모른다고 말한다. 확인하지 않은 것을 된 것처럼 말하지 않는다.
- **먼저 묻기:** 되돌리기 어려운 것, 의견이 갈릴 수 있는 것, 새 패키지 설치, 화면 모양이 바뀌는 것, 외부로 보내는 것. **바로 하고 보고에 적기:** 규칙에 이미 정해진 것, 되돌리기 쉬운 작은 정리.
- 프로젝트가 iCloud 동기화 폴더 안에 있다. 폴더를 iCloud 밖으로 옮기자는 제안은 하지 않는다.
- **handoff를 받으면** `design/_handoff/2026-11-24/` 안의 boards · prototype · REBUILD.md만 바꾼다.
- **보고 형식** (이 순서, 해당 없는 칸은 생략): 만든 것 · 확인한 것 · 확인하지 못한 것 · 기준과 달라서 정한 것 · 비어 있는 내용 · 커밋 제안
- 연락처·개인정보 값을 두는 곳: [확인]
- 화면 비교 · 끝 기준은 REBUILD 3장.

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
