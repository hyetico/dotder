# Git 가이드

> 상태: v0.1 · 2026-11-21
> 브랜치, 커밋, push, PR 규칙을 다룹니다. 검사 명령은 [code-guide](code-guide.md) 7장, 단계와 브랜치 이름은 [roadmap](../roadmap.md)을 봅니다.

이 규칙은 Claude Code가 작업할 때 읽고 따르는 약속이다. Git에 자동으로 걸리는 설정이 아니므로, 직접 커밋할 때는 적용되지 않는다.

## 1. 저장소

- 공개(public) 예정. README를 프로젝트 소개로 바꾼 뒤 공개로 전환한다.
- **`.gitignore` 확인:** `.env*`, `.tmp/`, `.design-ref/`, `*.pem`이 들어 있는지 커밋 전에 확인한다. 새 비공개 파일이 생기면 먼저 추가한다.
- **iCloud 동기화 제외 (`.nosync`):** 프로젝트가 iCloud로 동기화되는 Desktop에 있어서, `node_modules`와 `.next`는 실제 폴더 `node_modules.nosync`·`.next.nosync`를 가리키는 심볼릭 링크로 둔다. 이 설정을 유지한다.
  - `npm ci`·`npm install`은 링크를 지우고 실제 폴더를 새로 만들 수 있다. 실행한 뒤에는 `ls -la | grep -E "node_modules|\.next"`로 링크(`->`)인지 확인하고, 아니면 다시 만든다.
    ```bash
    rm -rf node_modules.nosync && mv node_modules node_modules.nosync && ln -s node_modules.nosync node_modules
    ```
  - 두 `.nosync` 폴더는 `.gitignore`, `tsconfig.json`의 `exclude`, `eslint.config.mjs`의 `globalIgnores`에서 빠지면 안 된다.

## 2. 브랜치

- `main`(배포) · `develop`(개발 통합).
- 작업 브랜치(`feat/` `refactor/` `fix/` `docs/` `chore/` + 짧은 영어 이름)는 `develop`에서 딴다. 이름은 [roadmap](../roadmap.md) 단계 표를 따른다.
- `main`, `develop`에 직접 커밋하지 않는다.

## 3. 커밋

- 한 커밋에는 한 가지 변경만 담는다.
- 새 작업을 시작하기 전이나, 작업 중간에 수정·추가 요청이 생기면 **먼저 지금까지를 커밋할지 묻는다.**
- 문서 변경은 `docs:`로 따로 커밋한다.
- 커밋은 사용자가 **"응"이라고 답한 뒤에** 한다. 물을 때는 바뀐 파일과 커밋 메시지(안)를 함께 보여준다.
- **커밋 전 검사:** [code-guide](code-guide.md) 7장의 "커밋 전" 검사가 통과해야 커밋한다. 실패하면 커밋을 제안하지 않고 실패 내용부터 알린다. 사용자가 예외를 허락하면 커밋 메시지 본문에 이유를 적는다.
  - **`.md` 파일만 바뀐 커밋은 `tsc`·`lint`를 생략해도 된다.** 코드·설정 파일(`.ts` `.tsx` `.mjs` `.json` 등)이 하나라도 섞이면 생략하지 않는다.

### 3-1. 메시지 형식

`type: 한국어 한 줄` (예: `refactor: 드로어 공통 틀 추출`). 필요하면 빈 줄 뒤에 `- 바뀐 점`을 적는다.

| type | 뜻 |
|---|---|
| `feat` | 새 기능 |
| `fix` | 버그 |
| `style` | 화면 값만 변경 |
| `refactor` | 구조 개선 |
| `docs` | 문서 |
| `chore` | 설정·정리 |

- **공동 작성자 표시:** `Co-Authored-By: Claude`는 지우지 않고 그대로 둔다.

## 4. push와 PR

- push는 **roadmap 단계가 끝날 때** 확인을 받고 한다. 이때 PR 제목·본문(안)도 함께 보여준다.
- 단계 끝(push 전)에는 [code-guide](code-guide.md) 7장의 "단계 끝" 검사까지 통과해야 한다.
- PR은 `develop`으로 보내고 **Squash and merge**로 합친다. `develop` → `main`은 배포할 때만.

```bash
git switch develop && git pull
git switch -c <브랜치 이름>
# 작업, 의미 단위로 커밋
git push -u origin <브랜치 이름>
# GitHub에서 Compare & pull request → base: develop
# Squash and merge → Delete branch
```

## 5. 기타

- 이미 push한 커밋은 고치지 않는다(amend, rebase, force push 금지). 고칠 게 있으면 새 커밋으로.
- 이미지는 webp로, 한 장에 500KB 이하로 올린다.
- 리팩터링 전 상태는 `before-refactor` 태그로 남아 있다. 지우거나 옮기지 않는다.
