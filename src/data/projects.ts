import type { Project } from '@/types/project'
import { getYear } from '@/lib/date'

/**
 * Add your own projects here — just append a new object to this array.
 * Nothing else in the app needs to change: the list, detail page, and
 * routing all pick up new entries automatically.
 *
 * Field-by-field guide (전체 설명은 README.md의 "프로젝트 추가하기" 참고):
 * - id           string, 필수. URL에 쓰입니다 (/projects/이-값). 영문/숫자/하이픈 권장.
 * - title        string, 필수. 프로젝트 이름.
 * - summary      string, 필수. 카드에 보이는 한 줄 요약.
 * - description  string, 필수. 상세 페이지 본문 — 마크다운 문법(헤딩 #/##, **굵게**,
 *                *기울임*, 표, 목록, [링크](url), ![이미지](경로))을 그대로 씁니다.
 *                이미지는 public/ 폴더에 파일을 넣고 '/파일명.png'로 참조하면 됩니다.
 *                유튜브 영상을 본문 중간에 넣고 싶으면 ```youtube 코드블록 안에
 *                영상 ID만 적으세요.
 * - role?        string, 선택. 예: 'Solo Developer', 'Team Lead, Frontend'.
 * - highlights?  string[], 선택. 상세 페이지 상단에 강조 표시되는 bullet 목록.
 * - thumbnail?   string, 선택. public/ 폴더 기준 절대경로(예: '/thumb.png') 또는 이미지 URL.
 *                카드 썸네일이자 상세 페이지 배너 이미지로 동시에 쓰입니다.
 * - youtubeId?   string, 선택. 유튜브 URL의 v= 뒤 부분. 상세 페이지에서 배너 이미지
 *                (있다면) 바로 아래에 표시됩니다 (본문 중간 임베드와는 별개).
 *                thumbnail도 youtubeId도 없으면 상세 페이지에 미디어 영역 자체가
 *                생기지 않습니다 — 빈 박스가 뜨지 않습니다.
 * - tags         string[], 필수. 기술 스택. Projects 페이지 필터에도 쓰입니다.
 * - links?       { label, url, icon? }[], 선택. icon은 'github' | 'external' | 'demo' |
 *                'figma' | 'notion' | 'youtube'.
 * - date         string, 필수. 'YYYY-MM-DD' 형식. 시작일이며 정렬 기준입니다.
 * - endDate?     string, 선택. 'YYYY-MM-DD'. 생략하면 "진행 중"으로 표시됩니다.
 * - featured?    boolean, 선택. true면 홈 화면 Featured 섹션에 노출됩니다. 프로젝트가
 *                많아지면 대표작 몇 개만 true로 골라서 홈 화면을 짧게 유지하세요.
 */
export const projects: Project[] = [
  {
    id: 'tailor',
    title: 'Tailor — Claude Code Skill 생성 서비스',
    summary:
      'AI와 문답하며 나만의 Claude Code Skill을 설계·생성하고, 참고한 공개 패턴의 출처까지 투명하게 보여주는 웹 서비스입니다.',
    role: 'Solo Developer (기획 · 디자인 · Claude Code와 협업 개발)',
    highlights: [
      '웹 마법사와 사용자 Claude 세션 이관, 두 가지 스킬 생성 경로를 기획·구현',
      '공개 스킬 12개를 파일 단위로 감사해 9개 카테고리·148개 패턴의 참고 코퍼스 구축',
      '출처·라이선스·실제 사용 패턴을 연결해 AI 생성 결과의 참고 근거를 투명하게 표시',
      '12종 시나리오 반복 실험과 전용 검사 도구로 생성 품질·파서·코퍼스 회귀 검증',
    ],
    description: `## 프로젝트 개요

Claude Code의 Skill(반복 작업을 위한 AI 지침 파일)을 직접 만들고 싶은 사용자가 AI와 문답하며 자신에게 맞는 \`SKILL.md\`를 설계·생성할 수 있도록 만든 웹 서비스입니다. 처음 접하는 사용자도 막히지 않게 용어 풀이와 설치 안내를 제공하되, 숙련자에게 필요한 구체적인 기술 용어와 설정값은 생략하지 않는 방향으로 기획했습니다.

## 문제 정의와 해결 방향

좋은 Skill을 만들려면 단순히 하고 싶은 일을 한 문장으로 적는 것만으로는 부족합니다. 언제 불려야 하는지, 어떤 순서로 실행할지, 어디까지 자동으로 처리해도 되는지, 완료를 어떻게 검증할지까지 함께 정해야 합니다. Tailor는 이 복잡한 설계를 질문형 인터페이스로 나누고, 사용 환경에 따라 두 가지 경로를 제공합니다.

- **이 사이트에서 바로 만들기**: 필수 질문과 선택형 고급 질문에 답하면 서버에서 Claude API를 호출해 초안 작성·자체 검토·다듬기를 한 번에 수행
- **내 Claude로 이어서 만들기**: 실제 프로젝트 파일을 참고할 수 있도록 작성 지침을 Claude 세션으로 넘기고, 딥링크가 열리지 않을 때를 위한 복사 폴백 제공

## 주요 기능

- 스킬·에이전트·CLI 등 21개 개념을 검색하고 쉬운 비유로 확인하는 용어 사전
- 일반/고급 모드와 한국어/영어 결과물 선택을 지원하는 단계형 생성 마법사
- 정보가 부족할 때 오류로 끝내지 않고 추가 질문을 받아 기존 답변과 합쳐 다시 생성하는 흐름
- 생성된 \`SKILL.md\` 미리보기, 수정 요청, 다운로드, 개인용/팀 공유용 설치 경로 안내
- 참고할 만한 완성형 스킬과 출처를 둘러볼 수 있는 갤러리

## 제품 설계와 개발

1인 프로젝트로 문제 정의, 기능 범위, UX, 시각 디자인, 프롬프트·모델 전략, 참고 자료의 라이선스 정책까지 직접 결정했습니다. 구현 과정에서는 Claude Code와 협업하되, 생성 결과를 반복 실행해 직접 읽고 비교하면서 의사결정의 근거와 실패 사례를 문서로 남겼습니다.

Next.js App Router에서 화면과 API Route를 함께 구성하고, Anthropic API 키는 서버 환경변수에만 두었습니다. GSAP은 홈 진입과 진행 표시처럼 시간축이 있는 모션에, Framer Motion은 마법사 단계와 패널 전환에 역할을 나눠 사용했습니다.

## 참고 코퍼스와 출처 투명성

AI가 형식만 그럴듯한 문서를 만들지 않도록 공개 Skill 12개의 구조와 패턴을 파일 단위로 감사해 9개 카테고리·148개 패턴의 참고 코퍼스로 정리했습니다. 라이선스가 확인된 소스는 구체값까지 활용하고, 라이선스가 확인되지 않은 소스는 아이디어와 방법만 우리 말로 요약하는 2단계 정책을 적용했습니다.

생성 결과에는 모든 참고 자료를 일괄 나열하지 않고, 모델이 이번 결과에서 실제로 사용했다고 보고한 패턴의 출처만 연결합니다. 별도의 블라인드 검토에서는 판정 가능한 35건 기준 출처 표시 정밀도 77.1~85.7%, 재현율 100%를 확인했고, 과장되는 경계 사례도 후속 개선 대상으로 기록했습니다.

## 검증과 트러블슈팅

12종 생성 시나리오와 반복 실행 자료를 축적하고, 코퍼스 규칙 검사·렌더 골든 파일 비교·응답 파서 회귀 검사·감사 반영률 계산 도구를 만들었습니다. 생성 API가 \`SKILL.md\` 대신 추가 질문만 반환하는 경우를 파싱 실패로 처리하던 문제는 별도 응답 상태와 보완 답변 흐름을 설계해 해결했습니다.

첫 배포 전에는 한 번의 요청으로 AI를 수십 회 호출하는 개발용 평가 API가 프로덕션에서도 열릴 수 있는 위험을 발견했습니다. 해당 라우트에 프로덕션 가드를 추가하고 실제 배포 빌드에서 404 응답을 확인해 비용·보안 위험을 차단했습니다.

## 기술 스택

- **프레임워크**: Next.js 16, React 19, TypeScript
- **AI**: Anthropic SDK, Claude Sonnet 기반 단일 호출 생성 파이프라인
- **스타일링·모션**: Tailwind CSS 4, GSAP, Framer Motion
- **품질 관리**: Biome, TypeScript 타입 검사, 자체 코퍼스·파서·렌더 검증 도구
- **배포**: Vercel — 2026년 8월 22일 첫 배포 완료, 현재 지속 개선 중

## 개인 회고

### 잘한 점

AI가 생성한 결과를 그럴듯해 보인다는 이유만으로 통과시키지 않고, 실제 출력물을 반복해서 읽고 비교할 수 있는 실험 기록과 검사 도구를 함께 만든 점이 가장 만족스럽습니다. 특히 참고 자료의 라이선스와 활용 범위를 소스별로 확인하고, 결과 화면에는 실제로 사용한 패턴의 출처만 보여주는 정책을 제품 기능으로 연결했습니다.

또한 "처음 쓰는 사람도 막히지 않게 한다"와 "초심자만을 위한 단순한 도구를 만든다"를 구분했습니다. 어려운 용어나 구체값을 없애는 대신 처음 등장할 때 짧은 풀이를 붙이는 방식으로, 접근성과 결과물의 정확성을 함께 가져가려 했습니다.

### 아쉬운 점

참고 코퍼스의 누락을 보완하는 과정에서 범위가 예상보다 크게 확장됐습니다. 특히 모든 스킬에 공통으로 적용되는 기본 카테고리는 다른 카테고리보다 훨씬 비대해졌고, 처음부터 핵심 패턴의 최소 범위와 종료 기준을 더 명확히 정했다면 실험과 정리에 드는 시간을 줄일 수 있었을 것 같습니다.

웹 생성 경로와 사용자 Claude로 이관하는 경로가 같은 제품 결정을 공유하면서도 프롬프트 코드가 분리돼 있다는 점도 뒤늦게 비용으로 돌아왔습니다. 웹에서 제거한 질문이나 수정한 표현이 이관 경로에는 남는 문제가 반복됐고, 공통 설정이나 두 경로를 함께 확인하는 회귀 검사를 더 일찍 마련했어야 했습니다.

첫 배포는 완료했지만 모바일에서 이관 경로를 숨기는 처리, 상황별 오류 화면, OG 이미지와 검색엔진용 메타데이터처럼 출시 이후 보완할 항목도 남아 있습니다.

### 배운 점

생성형 AI 기능에서는 "무엇을 측정하는가"가 구현만큼 중요하다는 걸 배웠습니다. 단어 출현 횟수 같은 간접 지표는 실제 품질을 잘못 설명할 수 있었고, 원하는 행동을 요구하는 시나리오를 먼저 만든 뒤 결과물을 직접 읽어야 의미 있는 판단을 할 수 있었습니다.

또한 프롬프트에 좋은 지식을 넣는 것만으로는 결과에 반영되지 않을 수 있다는 점을 체감했습니다. 모델이 그 지식을 사용할 자리를 결과 구조에 명시하고, 파서·출처 표시·완료 검증까지 하나의 파이프라인으로 설계해야 안정적인 생성 제품이 됩니다. 같은 정책이 여러 경로에 적용될 때는 문서상의 주의만 남기는 것이 아니라 코드와 검사로 함께 묶어야 한다는 것도 배웠습니다.`,
    tags: [
      'Next.js',
      'TypeScript',
      'Anthropic API',
      'Tailwind CSS',
      'GSAP',
      'Framer Motion',
      'Claude Code',
    ],
    links: [{ label: 'GitHub', url: 'https://github.com/Jammanb0/tailor', icon: 'github' }],
    thumbnail: '/project_thumbnail/Tailor_thumbnail.png',
    date: '2026-08-11',
    featured: true,
  },
  {
    id: 'ddok',
    title: 'DDOK! — 지도 기반 프로젝트·스터디 매칭 플랫폼',
    summary:
      '지도에서 프로젝트·스터디원을 매칭하고, 팀 협업(채팅·일정·랭킹)까지 한 곳에서 처리하는 플랫폼입니다.',
    role: 'Frontend Developer (7인 팀 · 구름 풀스택 부트캠프)',
    highlights: [
      '서비스 핵심 페이지 8개(인트로, 모집글 생성/수정/상세 6종, 사용자 랭킹) 직접 구현',
      '서비스 전반에서 재사용되는 공통 프로필 바(Profile Bar) 컴포넌트 제작·배포',
      '모집글 공통 UI 모듈화로 6개 페이지 코드 중복 최소화 및 유지보수 편의성 확보',
      '데이터 바인딩·API 연동 이슈 해결 및 인터페이스 일관성 점검',
    ],
    description:
      '## 프로젝트 개요\n\n지도 기반으로 프로젝트와 스터디원을 매칭하고 팀 협업을 지원하는 서비스입니다. 카카오맵에서 주변 스터디/프로젝트를 필터링해 탐색하고, 클릭 한 번으로 참여를 신청할 수 있습니다. 팀이 꾸려지면 자동 채팅방, 일정 조율, 온도(완주율·기여도) 기반 신뢰도 시스템까지 이어지는 구조입니다.\n\n## 주요 기능\n\n- 카카오맵 기반으로 주변 프로젝트·스터디 모집글을 필터링해 탐색\n- 프로젝트·스터디 모집글 생성/수정/상세, 지원 및 매칭\n- 팀이 꾸려지면 자동 생성되는 채팅방(WebSocket 실시간), 팀원 관리·평가\n- "온도(신뢰도)" 기반 랭킹과 Bronze/Silver/Gold 배지 시스템\n- 카카오 소셜 로그인, 포지션·기술스택·성향 온보딩(개인화) 플로우\n\n## 기술 스택\n\n- **프레임워크**: React 19 + TypeScript, Vite 7\n- **스타일링**: SCSS Modules — 컴포넌트마다 `.module.scss`를 함께 두고, reset·변수·믹스인은 전역 SCSS로 분리\n- **상태 관리**: Zustand(인증·채팅 UI 상태) + TanStack Query(서버 상태, 공통 API 훅으로 래핑)\n- **폼**: React Hook Form + Zod\n- **실시간 통신**: STOMP over WebSocket(채팅)\n- **코드 품질**: ESLint(Airbnb) + Stylelint + Prettier, Husky/lint-staged로 커밋 전 자동 검사\n\n## 담당 역할\n\n서비스 인트로, 프로젝트·스터디 모집글 생성/수정/상세(6종), 사용자 랭킹까지 핵심 8개 페이지를 직접 구현했습니다. 여러 페이지에서 반복되는 프로필 바와 모집글 UI를 공통 컴포넌트로 모듈화해 코드 중복을 줄이고, 팀장과 함께 데이터 바인딩·API 연동 이슈를 추적해 인터페이스 일관성을 맞췄습니다.\n\n## 팀 노션 문서화\n\n팀 노션(Notion) 구축과 전반적인 문서 관리 체계 설계를 총괄했습니다. 표준화된 문서 템플릿과 디자인 가이드를 배포해 프로젝트 진행 과정의 아카이빙 효율과 팀 내 소통 비용을 줄였습니다.\n\n## 트러블슈팅: 생성/수정 API 응답 구조 불일치\n\n**문제**: 모집글 생성/수정 페이지를 공통 로직으로 처리하되, 백엔드에서 내려주는 데이터에 따라 다르게 렌더링해야 했습니다. 그런데 생성 API와 수정 API를 각각 다른 백엔드 개발자가 맡다 보니 응답 구조 자체가 서로 달라 프론트에서 하나의 로직으로 처리하기 어려웠습니다.\n\n**시도한 방법**: 두 API의 응답 형식에 프론트가 각각 맞추는 대신, 프론트에서 다루는 데이터 구조를 먼저 공통 포맷으로 정의하고 백엔드에 그 형식에 맞춰 응답을 고정해달라고 맞춰나갔습니다.\n\n**결과**: 데이터 형식이 통일되면서 생성/수정 페이지의 공통 로직을 하나로 유지할 수 있었고, 이후 페이지가 늘어나도 같은 방식으로 대응할 수 있게 됐습니다.\n\n**배운 점**: 여러 백엔드 담당자가 나눠서 작업하는 기능일수록, 프론트 쪽에서 먼저 데이터 계약(포맷)을 정의하고 맞춰달라고 요청하는 편이 나중 유지보수 비용을 크게 줄인다는 걸 체감했습니다.\n\n## 회고\n\n### 잘한 점\n\n여러 페이지에서 반복되는 프로필 바와 모집글 UI를 미리 공통 컴포넌트로 뽑아낸 덕분에, 이후 페이지가 늘어나도 한 곳만 고치면 되는 구조를 유지할 수 있었습니다. 팀장과 함께 데이터 바인딩·API 연동 이슈를 하나씩 추적하며 인터페이스를 맞춰간 과정도 협업 감각을 키우는 데 도움이 됐습니다.\n\n### 아쉬운 점\n\n7명이 짧은 기간에 함께 만들다 보니 마무리하지 못한 부분도 있습니다. 채팅방 멤버 클릭 인터랙션, 지도 패널 일부 버튼 컴포넌트 통일 등은 다음 개선 과제로 남겨뒀고, 자동화된 테스트 코드는 아직 작성하지 못했습니다.\n\n### 배운 점\n\n여러 명이 동시에 건드리는 공통 UI일수록 초반에 인터페이스를 맞춰두는 게 나중 수정 비용을 크게 줄인다는 걸 체감했습니다. 온도(신뢰도)·배지처럼 여러 화면(랭킹, 프로필, 배지)에 걸쳐 있는 기능일수록 데이터 흐름을 미리 그려두는 습관이 중요하다는 것도 배웠습니다.',
    tags: [
      'React',
      'TypeScript',
      'Vite',
      'SCSS Modules',
      'Zustand',
      'TanStack Query',
      'Kakao Maps API',
    ],
    links: [
      { label: 'GitHub (FE)', url: 'https://github.com/DeepDirect/ddok-fe', icon: 'github' },
      { label: 'GitHub (BE)', url: 'https://github.com/DeepDirect/ddok-be', icon: 'github' },
      {
        label: 'Notion',
        url: 'https://married-oxygen-86f.notion.site/DDOK-246058b1ded88026acb0f89c85ddaa18?source=copy_link',
        icon: 'notion',
      },
    ],
    thumbnail: '/project_thumbnail/DDOK!_thumbnail.png',
    youtubeId: 'tJxeeBno15E',
    date: '2025-08-01',
    endDate: '2025-09-30',
    featured: true,
  },
  {
    id: 'deepwebide',
    title: '실시간 협업 웹 IDE (DeepWebIDE)',
    summary:
      '브라우저 환경에서 실시간 코드 동시 편집, 채팅, 파일 업로드/다운로드를 지원하는 웹 IDE입니다.',
    role: 'Frontend Developer (7인 팀 · 구름 풀스택 부트캠프)',
    highlights: [
      '프로젝트 파일 시스템 구조 설계 및 Yjs 연동 실시간 동기화 작업 참여',
      '모달 5종·토스트 31종·Alert Dialog 14종 등 UI 컴포넌트 50개 모듈화',
      '코드 편집기 다중 파일 탭 전환 로직, 반응형 레이아웃 구현',
      '인증 토큰 재발급 로직 구현으로 보안·연결 안정성 확보',
    ],
    description:
      '## 프로젝트 개요\n\n브라우저에서 실시간 코드 동시 편집과 팀 협업을 지원하는 웹 IDE입니다. 서비스의 초기 와이어프레임 설계부터 전반적인 파일 시스템 구조 구축까지 프론트엔드 개발의 기반을 마련했습니다.\n\n## 주요 기능\n\n- Monaco Editor 기반 코드 편집, 다중 파일 탭 관리\n- Yjs 기반 실시간 협업 편집 — 코드 내용은 물론 파일 트리·세이브포인트 상태까지 공유하고, 원격 커서·선택 영역을 실시간으로 표시\n- 파일 트리 드래그앤드롭으로 생성·이동·이름변경\n- GitHub OAuth 팝업 로그인\n- 코드 실행(CodeRunner), 세이브 포인트(버전 이력) 관리\n- 실시간 채팅\n\n## 기술 스택\n\n- **프레임워크**: React 19 + TypeScript, Vite 7(+ vite-plugin-svgr로 SVG를 컴포넌트처럼 import)\n- **스타일링**: SCSS + CSS Modules 혼용\n- **라우팅**: TanStack Router\n- **상태 관리**: Zustand(인증·협업·에디터·탭·테마 등 8개 스토어) + TanStack Query\n- **실시간 동기화**: Yjs + y-websocket + y-monaco — 별도 Node.js WebSocket 서버(팀 리포 `deepwebide-yjs`)와 연결되며, 그중 CodeRunner 룸 동기화 기능을 구현\n- **코드 품질**: ESLint(Airbnb) + Stylelint + Prettier + Husky/lint-staged\n\n## 담당 역할\n\n프로젝트 전반의 파일 시스템 구조를 설계하고, 코드 에디터의 핵심인 파일 트리 체계 구축과 Yjs 연동을 통한 실시간 데이터 동기화 작업에 참여했습니다. 모달(5종), 토스트(31종), Alert Dialog(14종) 등 총 50개의 공통 UI 컴포넌트를 재사용 가능한 형태로 모듈화해 팀 전체의 개발 효율성과 코드 일관성을 확보했습니다.\n\n코드 편집기의 다중 파일 관리·전환을 위한 탭(Tab) 기능 로직을 개발했고, Repo 페이지와 헤더의 반응형 레이아웃, PathArea, 사이드바/채팅 UI 인터랙션을 구현했습니다. 인증 토큰 재발급 로직으로 보안과 연결 안정성을 확보했고, 개발 과정에서 발생한 예외 상황을 추적해 완성도를 높였습니다.\n\n## 팀 노션 문서화\n\n팀 노션 구축과 문서 관리 체계 설계를 총괄해 템플릿 제작과 디자인 표준화를 통해 팀원 간 정보 공유 효율을 높였습니다.\n\n## 트러블슈팅: 실시간 채팅 전송 방식\n\n**문제**: 실시간 채팅 기능의 전송 방식을 무엇으로 할지가 개발 도중에도 계속 흔들렸습니다.\n\n**시도한 방법들**: STOMP/SockJS, socket.io, 자체 구현 WebSocket 서버까지 총 세 가지 방식을 시도했습니다(정확한 시도 순서는 별도로 기록해두지 않았습니다).\n\n**결과**: 방식을 여러 번 갈아타는 과정에서 코드에는 완전히 정리되지 못한 의존성이 일부 남았고, 자동화된 테스트가 없는 상태라 방식을 바꿀 때마다 회귀 여부를 빠르게 검증하기도 어려웠습니다.\n\n**배운 점**: 실시간 협업 기능은 구현 중에도 요구사항이 계속 바뀌기 쉽다는 걸 체감했습니다. 다음에는 전송 방식(트랜스포트)을 더 일찍 확정하고, 그 위의 UI·상태 관리는 유연하게 설계하는 순서로 접근하고 싶습니다.\n\n## 회고\n\n### 잘한 점\n\n모달·토스트·Alert Dialog 등 자주 쓰이는 UI를 총 50개 컴포넌트로 모듈화해둔 덕분에, 팀원들이 각자 기능을 만들 때 UI를 새로 짜지 않고 가져다 쓸 수 있었습니다. 파일 트리 구조와 Yjs 실시간 동기화처럼 복잡한 영역에 참여하면서 실시간 협업 기능이 어떤 지점에서 까다로워지는지 직접 부딪혀볼 수 있었습니다.\n\n### 아쉬운 점\n\n채팅 실시간 인원수 표시, 저장소 이름 변경 모달의 API 연동 등 일부 기능은 완성하지 못한 채로 남았습니다. 자동화된 테스트 코드도 아직 없습니다.',
    tags: [
      'React',
      'TypeScript',
      'Vite',
      'TanStack Router',
      'Yjs',
      'Monaco Editor',
      'STOMP WebSocket',
    ],
    links: [
      { label: 'GitHub (FE)', url: 'https://github.com/DeepDirect/deepwebide-fe', icon: 'github' },
      { label: 'GitHub (BE)', url: 'https://github.com/DeepDirect/deepwebide-be', icon: 'github' },
      {
        label: 'Notion',
        url: 'https://married-oxygen-86f.notion.site/Web-IDE-22b058b1ded880daae3bfb1604de1c28?source=copy_link',
        icon: 'notion',
      },
    ],
    thumbnail: '/project_thumbnail/DD_thumbnail.png',
    youtubeId: '-I3UiIWDW2s',
    date: '2025-07-01',
    endDate: '2025-08-31',
    featured: true,
  },
  {
    id: 'smart-streetlight-ems',
    title: '지능형 가로등 태양광수소 하이브리드 에너지 관리 시스템(EMS)',
    summary:
      '공공데이터와 교내 태양광 발전량 데이터를 활용해 하이브리드 에너지 시스템을 관리·시각화하는 웹 서비스입니다.',
    role: '프로젝트 기획 · 논문 작성 총괄 · 프론트엔드 개발 (대학교 4학년 캡스톤 디자인)',
    highlights: [
      '캡스톤 디자인 대회 동상 수상 · 한국디지털콘텐츠학회 우수 논문상 수상',
      '서비스 기획, 논문 작성, AI 모델링, 프론트엔드 구현까지 전 과정 주도',
      '목재·LED 스트립 기반 물리적 하드웨어 모형과 연계한 시연 설계',
    ],
    description:
      '## 프로젝트 개요\n\n공공데이터와 교내 태양광 발전량 데이터를 활용해, 태양광 및 수소 하이브리드 에너지 시스템의 효율을 관리하고 시각화하는 지능형 가로등 EMS 웹 서비스입니다. 물리적 하드웨어 모형과 연계한 연구를 통해 캡스톤 디자인 대회 동상과 한국디지털콘텐츠학회 우수 논문상을 수상했습니다.\n\n## 담당 역할\n\n서비스 로드맵 수립과 아이디어 구체화를 포함한 프로젝트 총기획 및 연구 감독을 맡았습니다. 핵심 데이터 분석과 논리 구조 설계를 바탕으로 논문 작성을 주도했고, AI 모델 학습 방향성 수립과 데이터 소스별 학습 데이터셋 설계도 함께 진행했습니다.\n\n에너지 데이터 시각화 대시보드의 UI/UX 설계와 프론트엔드 인터페이스 구현을 담당했으며, 시연 현장의 전달력을 높이기 위해 목재와 LED 스트립 기반 물리적 하드웨어 흐름도까지 직접 제작했습니다.\n\n## 트러블슈팅: AI 모델 검증용 데이터 부족\n\n**문제**: 학습시킨 AI 모델을 대조군과 비교해 검증해야 했는데, 참고할 만한 정확한 공공데이터가 충분하지 않았습니다.\n\n**시도한 방법**: 확보 가능한 공공데이터와 교내 태양광 발전량 데이터를 최대한 활용해 학습과 비교를 진행했습니다.\n\n**한계**: 데이터의 양과 정확도가 제한적이어서 대조군과의 비교가 충분히 정밀하지는 못했습니다.\n\n**배운 점**: 더 정확하고 풍부한 공공데이터가 있었다면 모델 검증의 신뢰도를 높일 수 있었을 것이라는 아쉬움이 남았습니다. 데이터 기반 프로젝트일수록 초기 단계에서 데이터 소스 확보 가능성을 더 꼼꼼히 검토해야 한다는 걸 배웠습니다.',
    tags: ['Data Visualization', 'HTML', 'CSS', 'JavaScript'],
    thumbnail: '/project_thumbnail/EMS_thumbnail.png',
    date: '2024-03-01',
    endDate: '2024-09-30',
    featured: false,
  },
  {
    id: 'swiftfolio-template',
    title: 'Swiftfolio Template — 포트폴리오 사이트 템플릿',
    summary:
      '화이트 배경에 블루 포인트 컬러를 쓴 깔끔한 UI의 React + TypeScript 포트폴리오 템플릿. 이 사이트도 이걸로 만들었습니다.',
    role: 'Solo Developer (기획 · Claude Code와 협업 개발)',
    highlights: [
      'vanilla-extract 기반 디자인 시스템, Framer Motion·GSAP 애니메이션을 Claude Code와 함께 구현',
      '마크다운 콘텐츠 + 커스텀 유튜브 임베드 문법 등 기능 기획·구현',
      '검색·태그·연도 필터, 다크 없는 클린 UI 등 UX 설계',
      'v1.3.0까지 버전 관리하며 오픈소스로 공개, 지속 업데이트 중',
    ],
    description:
      '## 프로젝트 개요\n\n제 개인 포트폴리오 사이트(지금 보고 계신 이 사이트)를 만들면서, 다른 사람도 재사용할 수 있도록 별도 오픈소스 템플릿으로 분리했습니다.\n\n## 주요 기능\n\n- 검색 + 태그(any/all) + 연도 필터를 지원하는 프로젝트 목록\n- `description` 필드에 GitHub-flavored Markdown 지원, ` ```youtube ` 코드블록으로 영상을 본문에 임베드하는 커스텀 문법\n- vanilla-extract 디자인 토큰(색상·타이포·spacing·radius·shadow) 기반 테마 시스템\n- Framer Motion 페이지 전환·마이크로 인터랙션, GSAP 스크롤 기반 히어로 애니메이션\n- `src/data/projects.ts`에 항목 하나만 추가하면 목록·홈 Featured·상세 페이지에 모두 반영되는 구조\n\n## 개발 과정\n\nClaude Code(AI 코딩 에이전트)를 활용해 기획부터 구현, 배포까지 전 과정을 진행했습니다. 화이트 배경에 블루 포인트 컬러를 쓴 깔끔한 UI라는 디자인 방향, 기능 요구사항(마크다운 지원, 필터, 유튜브 임베드), Fork 기반 배포 전략(포크 수를 눈에 보이는 지표로 남기기 위함)은 직접 정했습니다. 이를 구현할 구체적인 기술 스택과 아키텍처(vanilla-extract 단일 채택 등)는 Claude Code가 정하고 구현했고, 매 기능 단위로 브라우저에서 직접 테스트하며 반복 개선했습니다.\n\n## 트러블슈팅: 정적 호스팅 제약과 범용성\n\n**문제**: GitHub Pages(정적 호스팅)에 올린다는 전제가 있어 백엔드 연동이 원천적으로 불가능하고, 정적 데이터만으로 모든 기능을 구현해야 했습니다. 여기에 더해 나 혼자 쓰는 게 아니라 누구나 포크해서 자기 정보로 바꿔 쓸 수 있도록 범용적으로 설계해야 한다는 제약도 함께 있었습니다.\n\n**접근**: 서버 없이 동작하도록 프로젝트·프로필 데이터를 `src/data/*.ts` 정적 파일로 관리하는 구조로 설계하고, 검색·태그·연도 필터 같은 기능도 전부 클라이언트 사이드 로직으로 구현했습니다. 다른 사람이 그대로 포크해서 바로 커스터마이징할 수 있도록 데이터 필드마다 사용법 주석을 남기고, README에 별도 가이드를 작성했습니다.\n\n**결과**: 백엔드 없이도 검색·필터·마크다운 콘텐츠·유튜브 임베드 등 필요한 기능을 정적 사이트 안에서 모두 구현했고, 실제로 포크해서 바로 커스터마이징할 수 있는 구조를 갖췄습니다.\n\n**배운 점**: 나 혼자 쓸 도구가 아니라 남도 쓸 도구를 만들 때는, 기능 구현 자체보다 "다른 사람이 봤을 때 바로 이해하고 고칠 수 있는가"에 훨씬 더 많은 시간이 든다는 걸 체감했습니다. 실제로 이 부분에 가장 많은 시간을 썼습니다.\n\n## 기술 스택\n\n- **vanilla-extract**: 스타일링 솔루션을 하나로 통일해 유지보수 부담을 줄이고, zero-runtime이라 성능과 타입 안전성을 함께 챙길 수 있어 채택했습니다.\n- **Framer Motion**: 페이지 전환 애니메이션, 버튼·카드의 hover/tap 같은 컴포넌트 단위 마이크로 인터랙션에 사용했습니다.\n- **GSAP + ScrollTrigger**: Framer Motion의 선언적 variants만으로는 표현하기 어려운, 스크롤 연동 히어로 인트로 같은 복잡한 타임라인 애니메이션에 사용했습니다.\n- **react-markdown + remark-gfm**: 프로젝트 설명을 마크다운으로 작성할 수 있게 하고, 코드블록 문법을 재활용해 새 의존성 추가 없이 유튜브 영상을 본문에 임베드하는 커스텀 문법을 구현했습니다.\n- **react-router-dom**: 클라이언트 사이드 라우팅. 무거운 마크다운 렌더러는 상세 페이지(`/projects/:id`)에서만 로드되도록 라우트 단위로 지연 로딩했습니다.\n\n## 결과 & 계획\n\n`v1.3.0`까지 버전을 관리하며 공개 오픈소스 템플릿으로 유지 중입니다. 프로젝트 수가 늘어나면 지금처럼 배열 하나(`projects.ts`)로 관리하는 대신, `import.meta.glob`으로 프로젝트별 파일을 자동 인식하는 구조로 분리할 계획입니다.',
    tags: ['React', 'TypeScript', 'vanilla-extract', 'Framer Motion', 'GSAP', 'Claude Code'],
    links: [
      { label: 'GitHub', url: 'https://github.com/Jammanb0/swiftfolio-template', icon: 'github' },
      {
        label: 'Figma',
        url: 'https://www.figma.com/design/RSAlSN3YEDq3Yx1E2Uatua/swiftfolio-template?node-id=1-2&t=U4ugtsIce3YJzeIE-1',
        icon: 'figma',
      },
    ],
    thumbnail: '/project_thumbnail/swiftfolio-template_thumbnail.png',
    date: '2026-07-15',
    featured: true,
  },
]

export const sortedProjects = [...projects].sort((a, b) => b.date.localeCompare(a.date))

export const featuredProjects = sortedProjects.filter((p) => p.featured)

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

/** All unique tags across every project, sorted alphabetically — powers the tag filter. */
export const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort((a, b) =>
  a.localeCompare(b),
)

/**
 * Every year a project was active in, not just its start year — a project
 * that starts in one year and ends (or is still running) in a later one
 * matches the year filter for every year in between. A project with no
 * `endDate` is still ongoing, so it runs through the current year (read at
 * view time, in the visitor's browser — never stale even if the site
 * itself hasn't been redeployed since).
 */
export function getProjectYearRange(p: Project): number[] {
  const start = getYear(p.date)
  const end = p.endDate ? getYear(p.endDate) : new Date().getFullYear()
  const years: number[] = []
  for (let y = start; y <= end; y++) years.push(y)
  return years
}

/** All years any project was active in, newest first — powers the year filter. */
export const allYears = Array.from(new Set(projects.flatMap((p) => getProjectYearRange(p)))).sort(
  (a, b) => b - a,
)
