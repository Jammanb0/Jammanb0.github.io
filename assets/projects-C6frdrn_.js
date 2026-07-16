import{r as e}from"./index-Di3LwcPc.js";var t=`q3m19m0`,n=e();function r({children:e,className:r}){return(0,n.jsx)(`div`,{className:r?`${t} ${r}`:t,children:e})}var i=`b1wqs30`;function a({children:e}){return(0,n.jsx)(`span`,{className:i,children:e})}function o(e){let t=new Date(e);return`${t.getFullYear()}.${String(t.getMonth()+1).padStart(2,`0`)}`}function s(e,t){return`${o(e)} - ${t?o(t):`진행 중`}`}var c=[{id:`ddok`,title:`DDOK! — 지도 기반 프로젝트·스터디 매칭 플랫폼`,summary:`지도에서 프로젝트·스터디원을 매칭하고, 팀 협업(채팅·일정·랭킹)까지 한 곳에서 처리하는 플랫폼입니다.`,role:`Frontend Developer (7인 팀 · 구름 풀스택 부트캠프)`,highlights:[`서비스 핵심 페이지 8개(인트로, 모집글 생성/수정/상세 6종, 사용자 랭킹) 직접 구현`,`서비스 전반에서 재사용되는 공통 프로필 바(Profile Bar) 컴포넌트 제작·배포`,`모집글 공통 UI 모듈화로 6개 페이지 코드 중복 최소화 및 유지보수 편의성 확보`,`데이터 바인딩·API 연동 이슈 해결 및 인터페이스 일관성 점검`],description:`## 프로젝트 개요

지도 기반으로 프로젝트와 스터디원을 매칭하고 팀 협업을 지원하는 서비스입니다. 카카오맵에서 주변 스터디/프로젝트를 필터링해 탐색하고, 클릭 한 번으로 참여를 신청할 수 있습니다. 팀이 꾸려지면 자동 채팅방, 일정 조율, 온도(완주율·기여도) 기반 신뢰도 시스템까지 이어지는 구조입니다.

## 담당 역할

서비스 인트로, 프로젝트·스터디 모집글 생성/수정/상세(6종), 사용자 랭킹까지 핵심 8개 페이지를 직접 구현했습니다. 여러 페이지에서 반복되는 프로필 바와 모집글 UI를 공통 컴포넌트로 모듈화해 코드 중복을 줄이고, 팀장과 함께 데이터 바인딩·API 연동 이슈를 추적해 인터페이스 일관성을 맞췄습니다.

## 팀 노션 문서화

팀 노션(Notion) 구축과 전반적인 문서 관리 체계 설계를 총괄했습니다. 표준화된 문서 템플릿과 디자인 가이드를 배포해 프로젝트 진행 과정의 아카이빙 효율과 팀 내 소통 비용을 줄였습니다.`,tags:[`React`,`TypeScript`,`Vite`,`Zustand`,`TanStack Query`,`Kakao Maps API`],links:[{label:`GitHub (FE)`,url:`https://github.com/DeepDirect/ddok-fe`,icon:`github`},{label:`GitHub (BE)`,url:`https://github.com/DeepDirect/ddok-be`,icon:`github`}],thumbnail:`/project_thumbnail/DDOK!_thumbnail.png`,youtubeId:`tJxeeBno15E`,date:`2025-08-01`,endDate:`2025-09-30`,featured:!0},{id:`deepwebide`,title:`실시간 협업 웹 IDE (DeepWebIDE)`,summary:`브라우저 환경에서 실시간 코드 동시 편집, 채팅, 파일 업로드/다운로드를 지원하는 웹 IDE입니다.`,role:`Frontend Developer (7인 팀 · 구름 풀스택 부트캠프)`,highlights:[`프로젝트 파일 시스템 구조 설계 및 Yjs 연동 실시간 동기화 작업 참여`,`모달 5종·토스트 31종·Alert Dialog 14종 등 UI 컴포넌트 50개 모듈화`,`코드 편집기 다중 파일 탭 전환 로직, 반응형 레이아웃 구현`,`인증 토큰 재발급 로직 구현으로 보안·연결 안정성 확보`],description:`## 프로젝트 개요

브라우저에서 실시간 코드 동시 편집과 팀 협업을 지원하는 웹 IDE입니다. 서비스의 초기 와이어프레임 설계부터 전반적인 파일 시스템 구조 구축까지 프론트엔드 개발의 기반을 마련했습니다.

## 담당 역할

프로젝트 전반의 파일 시스템 구조를 설계하고, 코드 에디터의 핵심인 파일 트리 체계 구축과 Yjs 연동을 통한 실시간 데이터 동기화 작업에 참여했습니다. 모달(5종), 토스트(31종), Alert Dialog(14종) 등 총 50개의 공통 UI 컴포넌트를 재사용 가능한 형태로 모듈화해 팀 전체의 개발 효율성과 코드 일관성을 확보했습니다.

코드 편집기의 다중 파일 관리·전환을 위한 탭(Tab) 기능 로직을 개발했고, Repo 페이지와 헤더의 반응형 레이아웃, PathArea, 사이드바/채팅 UI 인터랙션을 구현했습니다. 인증 토큰 재발급 로직으로 보안과 연결 안정성을 확보했고, 개발 과정에서 발생한 예외 상황을 추적해 완성도를 높였습니다.

## 팀 노션 문서화

팀 노션 구축과 문서 관리 체계 설계를 총괄해 템플릿 제작과 디자인 표준화를 통해 팀원 간 정보 공유 효율을 높였습니다.`,tags:[`React`,`TypeScript`,`Vite`,`Yjs`,`Monaco Editor`,`STOMP WebSocket`],links:[{label:`GitHub (FE)`,url:`https://github.com/DeepDirect/deepwebide-fe`,icon:`github`},{label:`GitHub (BE)`,url:`https://github.com/DeepDirect/deepwebide-be`,icon:`github`}],thumbnail:`/project_thumbnail/DD_thumbnail.png`,youtubeId:`-I3UiIWDW2s`,date:`2025-07-01`,endDate:`2025-08-31`,featured:!0},{id:`smart-streetlight-ems`,title:`지능형 가로등 태양광수소 하이브리드 에너지 관리 시스템(EMS)`,summary:`공공데이터와 교내 태양광 발전량 데이터를 활용해 하이브리드 에너지 시스템을 관리·시각화하는 웹 서비스입니다.`,role:`프로젝트 기획 · 논문 작성 총괄 · 프론트엔드 개발 (대학교 4학년 캡스톤 디자인)`,highlights:[`캡스톤 디자인 대회 동상 수상 · 한국디지털콘텐츠학회 우수 논문상 수상`,`서비스 기획, 논문 작성, AI 모델링, 프론트엔드 구현까지 전 과정 주도`,`목재·LED 스트립 기반 물리적 하드웨어 모형과 연계한 시연 설계`],description:`## 프로젝트 개요

공공데이터와 교내 태양광 발전량 데이터를 활용해, 태양광 및 수소 하이브리드 에너지 시스템의 효율을 관리하고 시각화하는 지능형 가로등 EMS 웹 서비스입니다. 물리적 하드웨어 모형과 연계한 연구를 통해 캡스톤 디자인 대회 동상과 한국디지털콘텐츠학회 우수 논문상을 수상했습니다.

## 담당 역할

서비스 로드맵 수립과 아이디어 구체화를 포함한 프로젝트 총기획 및 연구 감독을 맡았습니다. 핵심 데이터 분석과 논리 구조 설계를 바탕으로 논문 작성을 주도했고, AI 모델 학습 방향성 수립과 데이터 소스별 학습 데이터셋 설계도 함께 진행했습니다.

에너지 데이터 시각화 대시보드의 UI/UX 설계와 프론트엔드 인터페이스 구현을 담당했으며, 시연 현장의 전달력을 높이기 위해 목재와 LED 스트립 기반 물리적 하드웨어 흐름도까지 직접 제작했습니다.`,tags:[`Data Visualization`,`HTML`,`CSS`,`JavaScript`],thumbnail:`/project_thumbnail/EMS_thumbnail.png`,date:`2024-03-01`,endDate:`2024-09-30`,featured:!1},{id:`swiftfolio-template`,title:`Swiftfolio Template — 포트폴리오 사이트 템플릿`,summary:`Toss 스타일의 React + TypeScript 포트폴리오 템플릿. 이 사이트도 이걸로 만들었습니다.`,role:`Solo Developer (기획 · Claude Code와 협업 개발)`,highlights:[`vanilla-extract 디자인 시스템, Framer Motion·GSAP 애니메이션 직접 설계`,`마크다운 콘텐츠 + 커스텀 유튜브 임베드 문법 등 기능 기획·구현`,`검색·태그·연도 필터, 다크 없는 클린 UI 등 UX 설계`,`v1.2.0까지 버전 관리하며 오픈소스로 공개, 지속 업데이트 중`],description:`## 프로젝트 개요

제 개인 포트폴리오 사이트(지금 보고 계신 이 사이트)를 만들면서, 다른 사람도 재사용할 수 있도록 별도 오픈소스 템플릿으로 분리했습니다.

## 담당 역할

Claude Code(AI 코딩 에이전트)를 활용해 기획부터 구현, 배포까지 전 과정을 주도했습니다. 디자인 방향(Toss 스타일 UI), 기능 요구사항(마크다운 지원, 필터, 유튜브 임베드), 아키텍처 의사결정(vanilla-extract 단일 채택, Fork 기반 배포 전략)을 직접 정하고, 매 기능 단위로 브라우저에서 직접 테스트하며 반복 개선했습니다.

## 기술 스택

React 19, TypeScript, Vite, vanilla-extract, Framer Motion, GSAP, react-markdown, react-router-dom

## 결과

\`v1.2.0\`까지 버전을 관리하며 공개 오픈소스 템플릿으로 유지 중입니다.`,tags:[`React`,`TypeScript`,`vanilla-extract`,`Framer Motion`,`GSAP`,`Claude Code`],links:[{label:`GitHub`,url:`https://github.com/Jammanb0/swiftfolio-template`,icon:`github`}],thumbnail:`/project_thumbnail/swiftfolio-template_thumbnail.png`,date:`2026-07-15`,featured:!0}],l=[...c].sort((e,t)=>new Date(t.date).getTime()-new Date(e.date).getTime()),u=l.filter(e=>e.featured);function d(e){return c.find(t=>t.id===e)}var f=Array.from(new Set(c.flatMap(e=>e.tags))).sort((e,t)=>e.localeCompare(t)),p=Array.from(new Set(c.map(e=>new Date(e.date).getFullYear()))).sort((e,t)=>t-e);export{l as a,r as c,d as i,p as n,s as o,u as r,a as s,f as t};