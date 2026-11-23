# Tessera

할 일 하나하나를 조각처럼 남기고, 이어서 나만의 프로젝트와 기록을 만드는 **개인 프로젝트 기록 앱**입니다.
프로젝트 · 목표 · 태스크 · 메모를 각각 따로 만들고, 필요할 때 서로 연결합니다.

> 지금은 리팩터링 중입니다. 진행 상황은 [docs/roadmap.md](docs/roadmap.md)에서 볼 수 있습니다.

## 기술 스택

- [Next.js](https://nextjs.org) 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4
- TanStack Query (서버 데이터)
- React Hook Form + zod (폼과 검증)
- dnd-kit (태스크 보드 드래그)

## 실행 방법

```bash
npm i
npm run dev -- -p 3001
```

브라우저에서 [http://localhost:3001](http://localhost:3001)을 엽니다.

## 문서

기획, 디자인 규칙, 작업 계획은 [`docs/`](docs/README.md)에 있습니다.

| 문서 | 내용 |
|---|---|
| [PRD](docs/PRD.md) | 무엇을, 왜 만드는가 |
| [roadmap](docs/roadmap.md) | 단계별 작업 계획 |
| [guides/](docs/guides/) | 디자인 · 스타일 · 레이아웃 · 컴포넌트 · 코드 · Git 규칙 |
