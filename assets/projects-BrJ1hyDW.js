import{r as e}from"./index-lCuDga8N.js";var t=`q3m19m0`,n=e();function r({children:e,className:r}){return(0,n.jsx)(`div`,{className:r?`${t} ${r}`:t,children:e})}var i=`b1wqs30`;function a({children:e}){return(0,n.jsx)(`span`,{className:i,children:e})}function o(e){let t=new Date(e);return`${t.getFullYear()}.${String(t.getMonth()+1).padStart(2,`0`)}`}function s(e,t){return`${o(e)} - ${t?o(t):`진행 중`}`}var c=[{id:`ddok`,title:`DDOK! — 지도 기반 프로젝트·스터디 매칭 플랫폼`,summary:`지도에서 프로젝트·스터디원을 매칭하고, 팀 협업(채팅·일정·랭킹)까지 한 곳에서 처리하는 플랫폼입니다.`,role:`Frontend Developer (7인 팀 · 구름 풀스택 부트캠프)`,highlights:[`서비스 핵심 페이지 8개(인트로, 모집글 생성/수정/상세 6종, 사용자 랭킹) 직접 구현`,`서비스 전반에서 재사용되는 공통 프로필 바(Profile Bar) 컴포넌트 제작·배포`,`모집글 공통 UI 모듈화로 6개 페이지 코드 중복 최소화 및 유지보수 편의성 확보`,`데이터 바인딩·API 연동 이슈 해결 및 인터페이스 일관성 점검`],description:`## 프로젝트 개요

지도 기반으로 프로젝트와 스터디원을 매칭하고 팀 협업을 지원하는 서비스입니다. 카카오맵에서 주변 스터디/프로젝트를 필터링해 탐색하고, 클릭 한 번으로 참여를 신청할 수 있습니다. 팀이 꾸려지면 자동 채팅방, 일정 조율, 온도(완주율·기여도) 기반 신뢰도 시스템까지 이어지는 구조입니다.

## 주요 기능

- 카카오맵 기반으로 주변 프로젝트·스터디 모집글을 필터링해 탐색
- 프로젝트·스터디 모집글 생성/수정/상세, 지원 및 매칭
- 팀이 꾸려지면 자동 생성되는 채팅방(WebSocket 실시간), 팀원 관리·평가
- "온도(신뢰도)" 기반 랭킹과 Bronze/Silver/Gold 배지 시스템
- 카카오 소셜 로그인, 포지션·기술스택·성향 온보딩(개인화) 플로우

## 기술 스택

- **프레임워크**: React 19 + TypeScript, Vite 7
- **스타일링**: SCSS Modules — 컴포넌트마다 \`.module.scss\`를 함께 두고, reset·변수·믹스인은 전역 SCSS로 분리
- **상태 관리**: Zustand(인증·채팅 UI 상태) + TanStack Query(서버 상태, 공통 API 훅으로 래핑)
- **폼**: React Hook Form + Zod
- **실시간 통신**: STOMP over WebSocket(채팅)
- **코드 품질**: ESLint(Airbnb) + Stylelint + Prettier, Husky/lint-staged로 커밋 전 자동 검사

## 담당 역할

서비스 인트로, 프로젝트·스터디 모집글 생성/수정/상세(6종), 사용자 랭킹까지 핵심 8개 페이지를 직접 구현했습니다. 여러 페이지에서 반복되는 프로필 바와 모집글 UI를 공통 컴포넌트로 모듈화해 코드 중복을 줄이고, 팀장과 함께 데이터 바인딩·API 연동 이슈를 추적해 인터페이스 일관성을 맞췄습니다.

## 팀 노션 문서화

팀 노션(Notion) 구축과 전반적인 문서 관리 체계 설계를 총괄했습니다. 표준화된 문서 템플릿과 디자인 가이드를 배포해 프로젝트 진행 과정의 아카이빙 효율과 팀 내 소통 비용을 줄였습니다.

## 회고

### 잘한 점

여러 페이지에서 반복되는 프로필 바와 모집글 UI를 미리 공통 컴포넌트로 뽑아낸 덕분에, 이후 페이지가 늘어나도 한 곳만 고치면 되는 구조를 유지할 수 있었습니다. 팀장과 함께 데이터 바인딩·API 연동 이슈를 하나씩 추적하며 인터페이스를 맞춰간 과정도 협업 감각을 키우는 데 도움이 됐습니다.

### 아쉬운 점

7명이 짧은 기간에 함께 만들다 보니 마무리하지 못한 부분도 있습니다. 채팅방 멤버 클릭 인터랙션, 지도 패널 일부 버튼 컴포넌트 통일 등은 다음 개선 과제로 남겨뒀고, 자동화된 테스트 코드는 아직 작성하지 못했습니다.

### 배운 점

여러 명이 동시에 건드리는 공통 UI일수록 초반에 인터페이스를 맞춰두는 게 나중 수정 비용을 크게 줄인다는 걸 체감했습니다. 온도(신뢰도)·배지처럼 여러 화면(랭킹, 프로필, 배지)에 걸쳐 있는 기능일수록 데이터 흐름을 미리 그려두는 습관이 중요하다는 것도 배웠습니다.`,tags:[`React`,`TypeScript`,`Vite`,`SCSS Modules`,`Zustand`,`TanStack Query`,`Kakao Maps API`],links:[{label:`GitHub (FE)`,url:`https://github.com/DeepDirect/ddok-fe`,icon:`github`},{label:`GitHub (BE)`,url:`https://github.com/DeepDirect/ddok-be`,icon:`github`},{label:`Notion`,url:`https://married-oxygen-86f.notion.site/DDOK-246058b1ded88026acb0f89c85ddaa18?source=copy_link`,icon:`notion`}],thumbnail:`/project_thumbnail/DDOK!_thumbnail.png`,youtubeId:`tJxeeBno15E`,date:`2025-08-01`,endDate:`2025-09-30`,featured:!0},{id:`deepwebide`,title:`실시간 협업 웹 IDE (DeepWebIDE)`,summary:`브라우저 환경에서 실시간 코드 동시 편집, 채팅, 파일 업로드/다운로드를 지원하는 웹 IDE입니다.`,role:`Frontend Developer (7인 팀 · 구름 풀스택 부트캠프)`,highlights:[`프로젝트 파일 시스템 구조 설계 및 Yjs 연동 실시간 동기화 작업 참여`,`모달 5종·토스트 31종·Alert Dialog 14종 등 UI 컴포넌트 50개 모듈화`,`코드 편집기 다중 파일 탭 전환 로직, 반응형 레이아웃 구현`,`인증 토큰 재발급 로직 구현으로 보안·연결 안정성 확보`],description:`## 프로젝트 개요

브라우저에서 실시간 코드 동시 편집과 팀 협업을 지원하는 웹 IDE입니다. 서비스의 초기 와이어프레임 설계부터 전반적인 파일 시스템 구조 구축까지 프론트엔드 개발의 기반을 마련했습니다.

## 주요 기능

- Monaco Editor 기반 코드 편집, 다중 파일 탭 관리
- Yjs 기반 실시간 협업 편집 — 코드 내용은 물론 파일 트리·세이브포인트 상태까지 공유하고, 원격 커서·선택 영역을 실시간으로 표시
- 파일 트리 드래그앤드롭으로 생성·이동·이름변경
- GitHub OAuth 팝업 로그인
- 코드 실행(CodeRunner), 세이브 포인트(버전 이력) 관리
- 실시간 채팅

## 기술 스택

- **프레임워크**: React 19 + TypeScript, Vite 7(+ vite-plugin-svgr로 SVG를 컴포넌트처럼 import)
- **스타일링**: SCSS + CSS Modules 혼용
- **라우팅**: TanStack Router
- **상태 관리**: Zustand(인증·협업·에디터·탭·테마 등 8개 스토어) + TanStack Query
- **실시간 동기화**: Yjs + y-websocket + y-monaco — 별도 Node.js WebSocket 서버(팀 리포 \`deepwebide-yjs\`)와 연결되며, 그중 CodeRunner 룸 동기화 기능을 구현
- **코드 품질**: ESLint(Airbnb) + Stylelint + Prettier + Husky/lint-staged

## 담당 역할

프로젝트 전반의 파일 시스템 구조를 설계하고, 코드 에디터의 핵심인 파일 트리 체계 구축과 Yjs 연동을 통한 실시간 데이터 동기화 작업에 참여했습니다. 모달(5종), 토스트(31종), Alert Dialog(14종) 등 총 50개의 공통 UI 컴포넌트를 재사용 가능한 형태로 모듈화해 팀 전체의 개발 효율성과 코드 일관성을 확보했습니다.

코드 편집기의 다중 파일 관리·전환을 위한 탭(Tab) 기능 로직을 개발했고, Repo 페이지와 헤더의 반응형 레이아웃, PathArea, 사이드바/채팅 UI 인터랙션을 구현했습니다. 인증 토큰 재발급 로직으로 보안과 연결 안정성을 확보했고, 개발 과정에서 발생한 예외 상황을 추적해 완성도를 높였습니다.

## 팀 노션 문서화

팀 노션 구축과 문서 관리 체계 설계를 총괄해 템플릿 제작과 디자인 표준화를 통해 팀원 간 정보 공유 효율을 높였습니다.

## 회고

### 잘한 점

모달·토스트·Alert Dialog 등 자주 쓰이는 UI를 총 50개 컴포넌트로 모듈화해둔 덕분에, 팀원들이 각자 기능을 만들 때 UI를 새로 짜지 않고 가져다 쓸 수 있었습니다. 파일 트리 구조와 Yjs 실시간 동기화처럼 복잡한 영역에 참여하면서 실시간 협업 기능이 어떤 지점에서 까다로워지는지 직접 부딪혀볼 수 있었습니다.

### 아쉬운 점

채팅 실시간 인원수 표시, 저장소 이름 변경 모달의 API 연동 등 일부 기능은 완성하지 못한 채로 남았습니다. 채팅 전송 방식도 개발 과정에서 STOMP/SockJS, socket.io, 자체 WebSocket 서버 등 여러 방식을 시도하며 정리되지 못한 의존성이 남아 있고, 자동화된 테스트 코드도 아직 없습니다.

### 배운 점

실시간 협업 기능은 구현 중에도 요구사항이 계속 바뀌기 쉽다는 걸 채팅 전송 방식을 여러 번 갈아탄 경험으로 체감했습니다. 다음에는 전송 방식(트랜스포트)을 더 일찍 확정하고, 그 위의 UI·상태 관리를 유연하게 설계하는 순서로 접근해보고 싶습니다.`,tags:[`React`,`TypeScript`,`Vite`,`TanStack Router`,`Yjs`,`Monaco Editor`,`STOMP WebSocket`],links:[{label:`GitHub (FE)`,url:`https://github.com/DeepDirect/deepwebide-fe`,icon:`github`},{label:`GitHub (BE)`,url:`https://github.com/DeepDirect/deepwebide-be`,icon:`github`},{label:`Notion`,url:`https://married-oxygen-86f.notion.site/Web-IDE-22b058b1ded880daae3bfb1604de1c28?source=copy_link`,icon:`notion`}],thumbnail:`/project_thumbnail/DD_thumbnail.png`,youtubeId:`-I3UiIWDW2s`,date:`2025-07-01`,endDate:`2025-08-31`,featured:!0},{id:`smart-streetlight-ems`,title:`지능형 가로등 태양광수소 하이브리드 에너지 관리 시스템(EMS)`,summary:`공공데이터와 교내 태양광 발전량 데이터를 활용해 하이브리드 에너지 시스템을 관리·시각화하는 웹 서비스입니다.`,role:`프로젝트 기획 · 논문 작성 총괄 · 프론트엔드 개발 (대학교 4학년 캡스톤 디자인)`,highlights:[`캡스톤 디자인 대회 동상 수상 · 한국디지털콘텐츠학회 우수 논문상 수상`,`서비스 기획, 논문 작성, AI 모델링, 프론트엔드 구현까지 전 과정 주도`,`목재·LED 스트립 기반 물리적 하드웨어 모형과 연계한 시연 설계`],description:`## 프로젝트 개요

공공데이터와 교내 태양광 발전량 데이터를 활용해, 태양광 및 수소 하이브리드 에너지 시스템의 효율을 관리하고 시각화하는 지능형 가로등 EMS 웹 서비스입니다. 물리적 하드웨어 모형과 연계한 연구를 통해 캡스톤 디자인 대회 동상과 한국디지털콘텐츠학회 우수 논문상을 수상했습니다.

## 담당 역할

서비스 로드맵 수립과 아이디어 구체화를 포함한 프로젝트 총기획 및 연구 감독을 맡았습니다. 핵심 데이터 분석과 논리 구조 설계를 바탕으로 논문 작성을 주도했고, AI 모델 학습 방향성 수립과 데이터 소스별 학습 데이터셋 설계도 함께 진행했습니다.

에너지 데이터 시각화 대시보드의 UI/UX 설계와 프론트엔드 인터페이스 구현을 담당했으며, 시연 현장의 전달력을 높이기 위해 목재와 LED 스트립 기반 물리적 하드웨어 흐름도까지 직접 제작했습니다.`,tags:[`Data Visualization`,`HTML`,`CSS`,`JavaScript`],thumbnail:`/project_thumbnail/EMS_thumbnail.png`,date:`2024-03-01`,endDate:`2024-09-30`,featured:!1},{id:`swiftfolio-template`,title:`Swiftfolio Template — 포트폴리오 사이트 템플릿`,summary:`토스 스타일의 React + TypeScript 포트폴리오 템플릿. 이 사이트도 이걸로 만들었습니다.`,role:`Solo Developer (기획 · Claude Code와 협업 개발)`,highlights:[`vanilla-extract 디자인 시스템, Framer Motion·GSAP 애니메이션 직접 설계`,`마크다운 콘텐츠 + 커스텀 유튜브 임베드 문법 등 기능 기획·구현`,`검색·태그·연도 필터, 다크 없는 클린 UI 등 UX 설계`,`v1.3.0까지 버전 관리하며 오픈소스로 공개, 지속 업데이트 중`],description:`## 프로젝트 개요

제 개인 포트폴리오 사이트(지금 보고 계신 이 사이트)를 만들면서, 다른 사람도 재사용할 수 있도록 별도 오픈소스 템플릿으로 분리했습니다.

## 주요 기능

- 검색 + 태그(any/all) + 연도 필터를 지원하는 프로젝트 목록
- \`description\` 필드에 GitHub-flavored Markdown 지원, \` \`\`\`youtube \` 코드블록으로 영상을 본문에 임베드하는 커스텀 문법
- vanilla-extract 디자인 토큰(색상·타이포·spacing·radius·shadow) 기반 테마 시스템
- Framer Motion 페이지 전환·마이크로 인터랙션, GSAP 스크롤 기반 히어로 애니메이션
- \`src/data/projects.ts\`에 항목 하나만 추가하면 목록·홈 Featured·상세 페이지에 모두 반영되는 구조

## 개발 과정

Claude Code(AI 코딩 에이전트)를 활용해 기획부터 구현, 배포까지 전 과정을 주도했습니다. 디자인 방향(토스 스타일 UI), 기능 요구사항(마크다운 지원, 필터, 유튜브 임베드), 아키텍처 의사결정(vanilla-extract 단일 채택, Fork 기반 배포 전략)을 직접 정하고, 매 기능 단위로 브라우저에서 직접 테스트하며 반복 개선했습니다.

## 기술 스택

React 19, TypeScript, Vite, vanilla-extract, Framer Motion, GSAP, react-markdown, react-router-dom

## 결과 & 계획

\`v1.3.0\`까지 버전을 관리하며 공개 오픈소스 템플릿으로 유지 중입니다. 프로젝트 수가 늘어나면 지금처럼 배열 하나(\`projects.ts\`)로 관리하는 대신, \`import.meta.glob\`으로 프로젝트별 파일을 자동 인식하는 구조로 분리할 계획입니다.`,tags:[`React`,`TypeScript`,`vanilla-extract`,`Framer Motion`,`GSAP`,`Claude Code`],links:[{label:`GitHub`,url:`https://github.com/Jammanb0/swiftfolio-template`,icon:`github`},{label:`Figma`,url:`https://www.figma.com/design/RSAlSN3YEDq3Yx1E2Uatua/swiftfolio-template?node-id=1-2&t=U4ugtsIce3YJzeIE-1`,icon:`figma`}],thumbnail:`/project_thumbnail/swiftfolio-template_thumbnail.png`,date:`2026-07-15`,featured:!0}],l=[...c].sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime()),u=l.filter(e=>e.featured);function d(e){return c.find(t=>t.id===e)}var f=Array.from(new Set(c.flatMap(e=>e.tags))).sort((e,t)=>e.localeCompare(t)),p=Array.from(new Set(c.map(e=>new Date(e.date).getFullYear()))).sort((e,t)=>t-e);export{l as a,r as c,d as i,p as n,s as o,u as r,a as s,f as t};