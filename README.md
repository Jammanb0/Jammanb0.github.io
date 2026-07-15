# Swiftfolio Template

React + TypeScript로 만든, 흰 배경과 파란 포인트 컬러를 사용하는 빠르고 담백한 포트폴리오 사이트 템플릿입니다.
누구나 fork/clone해서 자신의 GitHub Pages 포트폴리오(`your-id.github.io`)로 바로 사용할 수 있도록 만들어졌습니다.

> AI(Claude Code)를 활용해 기획부터 구현까지 진행한 프로젝트입니다. 과정이 궁금하다면 [PROCESS.md](PROCESS.md)를 참고하세요.

## 특징

- **React 19 + TypeScript + Vite** — 빠른 개발 서버와 빌드
- **vanilla-extract** — zero-runtime CSS-in-TS, 타입 안전한 디자인 토큰
- **Framer Motion** — 페이지 전환, 카드 호버, 버튼 인터랙션
- **GSAP + ScrollTrigger** — 히어로 섹션 등장 애니메이션
- **react-router-dom** — 프로젝트 상세 페이지 라우팅 (GitHub Pages SPA 리다이렉트 포함)
- **마크다운 지원 상세 설명** — react-markdown + remark-gfm으로 헤딩/표/굵게/목록/링크를 자유롭게 작성, 본문 중간에 유튜브 임베드도 가능
- **검색 + 태그 + 연도 필터** — Projects 페이지에서 프로젝트를 바로 찾을 수 있음
- 프로젝트는 **TypeScript 배열 하나(`src/data/projects.ts`)**로 관리 — 별도 CMS 없이 커밋만으로 포트폴리오 추가

## 시작하기

```bash
npm install
npm run dev
```

`http://localhost:5173` 에서 확인할 수 있습니다.

## 커스터마이징

### 1. 내 정보 입력하기

[`src/data/profile.ts`](src/data/profile.ts) 에서 이름, 역할, 소개, 이메일, 소셜 링크를 수정하세요.

`heroCta`는 홈 화면 히어로의 두 번째 버튼입니다. 기본은 메일 앱을 여는 "이메일 보내기"이지만, `label`/`href`를 자유롭게 바꿔서 이력서 PDF, 연락처 폼, Calendly 링크 등으로 써도 됩니다. `href`가 `http`로 시작하면 새 탭으로 열립니다.

`avatar`는 Header 로고 옆에 표시되는 원형 프로필 사진입니다. `public/` 폴더에 이미지를 넣고 `/파일명.jpg` 형태로 지정하세요 — 정사각형이 아니어도 자동으로 원형 크롭됩니다. 빈 문자열이면 아무것도 표시되지 않습니다.

### 2. 프로젝트 추가하기

[`src/data/projects.ts`](src/data/projects.ts) 배열에 새 객체를 추가하면 목록 페이지와 상세 페이지에 자동으로 반영됩니다.

```ts
{
  id: 'my-new-project',        // URL: /projects/my-new-project
  title: '내 프로젝트',
  summary: '카드에 보이는 한 줄 요약',
  description: '## 상세 페이지 본문\n\n마크다운을 그대로 씁니다. **굵게**, 표, 목록, [링크](https://...) 전부 가능합니다.',
  role: 'Solo Developer',      // 상세 페이지에 기간과 함께 표시 (선택)
  highlights: ['핵심 성과 1', '핵심 성과 2'], // 상세 페이지 상단 강조 bullet (선택)
  thumbnail: '/my-thumb.png',  // public 폴더 기준 경로 (선택)
  youtubeId: 'VIDEO_ID',       // 유튜브 URL의 v= 뒤 부분 — 상세 페이지 최상단 히어로 영상 (선택)
  tags: ['React', 'TypeScript'],
  links: [
    { label: 'GitHub', url: 'https://github.com/...', icon: 'github' },
    { label: '라이브 데모', url: 'https://...', icon: 'demo' },
  ],
  date: '2026-07-01',          // 시작일, 정렬 기준
  endDate: '2026-08-01',       // 생략하면 "진행 중"으로 표시 (선택)
  featured: true,               // 홈 화면 Featured 섹션에 노출 (선택)
}
```

각 필드에 대한 설명은 [`src/data/projects.ts`](src/data/projects.ts) 상단 주석에도 동일하게 적혀 있습니다.

- `description`은 **GitHub-flavored Markdown**을 지원합니다 — `#`/`##` 헤딩, `**굵게**`, `*기울임*`, 표, 목록, `[텍스트](url)` 링크를 그대로 쓰면 됩니다.
- 본문 중간에 유튜브 영상을 넣고 싶으면 코드블록 언어를 `youtube`로 지정하고 영상 ID만 적으세요. 하나의 프로젝트에 여러 개 넣어도 됩니다.

  ````
  ```youtube
  dQw4w9WgXcQ
  ```
  ````

- `youtubeId` 필드는 이것과 별개로, 상세 페이지 최상단에 오는 **대표 히어로 영상**을 지정할 때 씁니다.
- `thumbnail`은 카드 썸네일이자 상세 페이지 배너 이미지로 동시에 쓰입니다. 없으면 카드에 그라데이션 플레이스홀더가 대신 표시됩니다.
- `thumbnail`과 `youtubeId`가 **둘 다 있으면** 상세 페이지에 배너 이미지가 먼저, 유튜브 영상이 그 아래에 순서대로 표시됩니다. **둘 다 없으면** 미디어 영역 자체가 생기지 않고 곧바로 본문으로 이어집니다 — 빈 박스가 뜨지 않습니다.
- 이미지는 `public/` 폴더에 넣고 `/파일명.png` 형태의 절대 경로로 참조하세요.

### 3. 색상 / 타이포그래피 / 여백

[`src/styles/theme.css.ts`](src/styles/theme.css.ts) 에서 모든 디자인 토큰(색상, 폰트 크기, 간격, radius, shadow)을 한 곳에서 관리합니다. `color.blue500` 값만 바꿔도 전체 포인트 컬러가 바뀝니다.

## GitHub Pages로 배포하기

이 템플릿은 `your-id.github.io` 형태의 **사용자 페이지**(레포 루트가 곧 사이트가 되는 경우)를 기본값으로 가정합니다.

### 브랜치가 두 개로 나뉘는 이유

- **`main`** — 우리가 실제로 편집하는 소스 코드(TypeScript, JSX 등). 코드 수정은 **항상 여기서만** 합니다.
- **`gh-pages`** — `npm run deploy`를 실행하면 **자동으로 생성**되는 브랜치. `main`의 소스 코드를 빌드한 **결과물(순수 HTML/CSS/JS)** 만 들어있고, GitHub Pages가 실제로 서빙하는 게 이 브랜치입니다.

`gh-pages`는 직접 만들 필요도, 손으로 수정할 필요도 없습니다 — `npm run deploy`를 실행할 때마다 최신 빌드 결과로 자동 덮어써집니다. SourceTree 등 git 클라이언트에서도 일반 브랜치처럼 조회되지만(최초 배포 후), 여기서 직접 커밋하거나 `main`에 합칠 일은 없습니다.

### 최초 설정

1. GitHub에서 `your-id.github.io` 이름으로 새 레포지토리를 만들고, 이 템플릿의 내용을 push합니다.
2. 배포:
   ```bash
   npm run deploy
   ```
   `gh-pages` 패키지가 빌드 결과(`dist/`)를 `gh-pages` 브랜치로 push합니다 (브랜치가 없으면 이때 자동 생성됩니다).
3. 레포 Settings → Pages에서 Source를 `gh-pages` 브랜치로 지정합니다. **이 설정은 최초 1회만 필요**하고, `npm run deploy`가 대신 해주지 않습니다.
4. 몇 분 후 `https://your-id.github.io` 에서 확인할 수 있습니다.

### 이후 콘텐츠를 수정할 때마다

최초 설정이 끝나면, 이후엔 다음 절차만 반복하면 됩니다.

```bash
# 1. profile.ts, projects.ts 등 main에서 수정

# 2. 소스 코드를 GitHub에 백업 (사이트 반영과는 별개로 항상 하는 걸 권장)
git add .
git commit -m "..."
git push origin main

# 3. 실제 사이트에 반영
npm run deploy
```

`git push`만으로는 사이트가 바뀌지 않고, `npm run deploy`만으로는 소스 코드가 GitHub에 백업되지 않습니다 — 두 단계 모두 필요합니다. (나중에 push할 때마다 자동으로 배포까지 되게 하고 싶다면 GitHub Actions로 전환할 수 있는데, 그때는 Pages Source를 `gh-pages` 브랜치 대신 "GitHub Actions"로 바꾸고 워크플로 파일을 추가해야 합니다 — 지금의 수동 방식을 대체하는 것이지 함께 쓰는 게 아닙니다.)

### `dist/` 폴더란

`npm run build`(또는 `deploy`가 내부적으로 먼저 실행하는 빌드 과정)를 돌릴 때마다 새로 생성되는 폴더입니다. `.gitignore`에 포함되어 있어 `main`에는 커밋되지 않고, `gh-pages`로 push되고 나면 로컬에 남아있어도 신경 쓰지 않아도 되는 임시 산출물입니다. 이 안의 파일들이 Vite가 `src/`의 TypeScript/JSX/vanilla-extract 코드를 브라우저가 바로 실행 가능한 순수 HTML/CSS/JS로 변환·번들링한 최종 결과물이며, 방문자의 브라우저가 실제로 다운로드해서 렌더링하는 게 바로 이 파일들입니다.

> **쉽게 말하면**: `npm run deploy`를 실행하면 → 이 `dist/` 폴더가 새로 만들어지고 → 그 안의 내용을 `gh-pages` 브랜치에 **자동으로 git push**합니다. 이 push가 곧 "사이트 업데이트"입니다 — 우리가 따로 배포 버튼을 누르거나 서버에 파일을 올리는 과정이 없고, `npm run deploy` 명령어 하나가 "빌드 + gh-pages 브랜치로 push"까지 전부 알아서 해줍니다.
> 때문에 추가한 정보는 별도로 `git push`를 통해 백업을 진행하세요.

### 프로젝트 페이지(`your-id.github.io/repo-name`)로 배포하는 경우

레포 이름이 `username.github.io`가 아니라면 다음 두 곳을 수정하세요:

- [`vite.config.ts`](vite.config.ts) — `base: '/repo-name/'`
- [`public/404.html`](public/404.html) — `pathSegmentsToKeep = 1`

### 라우팅이 GitHub Pages에서 동작하는 원리

GitHub Pages는 정적 호스팅이라 `/projects/foo`처럼 깊은 경로를 새로고침하면 기본적으로 404가 뜹니다. 이 템플릿은 [spa-github-pages](https://github.com/rafgraph/spa-github-pages) 방식의 리다이렉트를 `public/404.html`과 `index.html`에 미리 넣어뒀기 때문에 별도 설정 없이 클린 URL이 그대로 동작합니다.

## 스크립트

| 명령어            | 설명                        |
| ----------------- | --------------------------- |
| `npm run dev`     | 개발 서버 실행              |
| `npm run build`   | 타입 체크 + 프로덕션 빌드   |
| `npm run preview` | 빌드 결과 로컬 미리보기     |
| `npm run lint`    | oxlint로 코드 검사          |
| `npm run format`  | prettier로 코드 포맷팅      |
| `npm run deploy`  | 빌드 후 GitHub Pages로 배포 |

## 폴더 구조

```
src/
  components/
    layout/     Header, Footer, Layout, Container
    ui/         Button, Tag 같은 범용 컴포넌트
    portfolio/  ProjectCard, YoutubeEmbed, LinkList, Markdown, ProjectFilters
    home/       Hero (GSAP 애니메이션)
  data/
    profile.ts   내 정보
    projects.ts  프로젝트 목록 — 여기에 계속 추가하면 됩니다
  lib/
    date.ts      기간 포맷 유틸 ('2026.03 - 진행 중' 형태)
    gsap.ts      GSAP + ScrollTrigger 등록
  pages/         Home, Projects, ProjectDetail, NotFound
  styles/        theme.css.ts (디자인 토큰), global.css.ts
  types/         Project 타입 정의
```

## 라이선스

자유롭게 fork하고 커스터마이징해서 사용하세요.
