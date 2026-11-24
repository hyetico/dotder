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

**PR 합치기도 Claude Code가 한다.** 단계(또는 작업 브랜치)가 끝나면 이 순서로 한다.

1. [code-guide](code-guide.md) 7장의 "단계 끝" 검사 4가지(`tsc` · `lint` · `format:check` · `build`)를 돌린다. 하나라도 실패하면 멈추고 실패 내용부터 알린다.
2. 보고한다: 검사 결과 · 바뀐 점 · PR 제목·본문(안).
3. 사용자가 **"응"**이라고 답하면 push → PR 만들기(base `develop`) → `gh pr merge --squash --delete-branch`로 합친다. 오타처럼 보이는 답이면 다시 묻는다.
4. `git switch develop && git pull` 뒤 roadmap의 다음 단계 브랜치를 만들어 바로 시작한다.

- PR은 `develop`으로만 보낸다. `develop` → `main`은 배포할 때만, 사용자가 따로 요청할 때 한다.
- **합치는 방법은 브랜치마다 다르다** (GitHub ruleset `protect-develop` · `protect-main`이 강제한다).
  - 작업 브랜치 → `develop`: **squash** (`gh pr merge --squash --delete-branch`). `develop`은 선형 기록만 허용한다.
  - `develop` → `main`: **merge commit** (`gh pr merge --merge`). `develop` 브랜치는 지우지 않는다. squash로 합치면 두 브랜치 기록이 갈라져 다음 배포 PR이 충돌한다 (2026-11-24 #13).
  - `main`에 바로 보내는 급한 수정도 merge commit으로 합치고, 같은 내용을 `develop`에도 PR로 보낸다.

```bash
# 배포 (사용자가 요청했을 때만)
git switch develop && git pull
gh pr create --base main --head develop --title "release: <내용>" --body-file <본문 파일>
gh pr merge <번호> --merge
git switch main && git pull && npm run build
git switch develop
```

```bash
git switch develop && git pull
git switch -c <브랜치 이름>
# 작업, 의미 단위로 커밋 (커밋마다 "응"을 받는다)
# 단계 끝 검사 4가지 → 보고 → "응"
git push -u origin <브랜치 이름>
gh pr create --base develop --title "<제목>" --body-file <본문 파일>
gh pr merge --squash --delete-branch
git switch develop && git pull
git switch -c <다음 단계 브랜치>
```

## 5. 기타

- 이미 push한 커밋은 고치지 않는다(amend, rebase, force push 금지). 고칠 게 있으면 새 커밋으로.
- 이미지는 webp로, 한 장에 500KB 이하로 올린다.
- 리팩터링 전 상태는 `before-refactor` 태그로 남아 있다. 지우거나 옮기지 않는다.
