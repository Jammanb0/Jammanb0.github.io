import type { Project } from '@/types/project'

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
 *                *기울임*, 표, 목록, [링크](url))을 그대로 씁니다.
 *                유튜브 영상을 본문 중간에 넣고 싶으면 ```youtube 코드블록 안에
 *                영상 ID만 적으세요 (아래 sample-design-system 예시 참고).
 * - role?        string, 선택. 예: 'Solo Developer', 'Team Lead, Frontend'.
 * - highlights?  string[], 선택. 상세 페이지 상단에 강조 표시되는 bullet 목록.
 * - thumbnail?   string, 선택. public/ 폴더 기준 절대경로(예: '/thumb.png') 또는 이미지 URL.
 *                카드 썸네일이자 상세 페이지 배너 이미지로 동시에 쓰입니다.
 * - youtubeId?   string, 선택. 유튜브 URL의 v= 뒤 부분. 상세 페이지에서 배너 이미지
 *                (있다면) 바로 아래에 표시됩니다 (본문 중간 임베드와는 별개).
 *                thumbnail도 youtubeId도 없으면 상세 페이지에 미디어 영역 자체가
 *                생기지 않습니다 — 빈 박스가 뜨지 않습니다.
 * - tags         string[], 필수. 기술 스택. Projects 페이지 필터에도 쓰입니다.
 * - links?       { label, url, icon? }[], 선택. icon은 'github' | 'external' | 'demo'.
 * - date         string, 필수. 'YYYY-MM-DD' 형식. 시작일이며 정렬 기준입니다.
 * - endDate?     string, 선택. 'YYYY-MM-DD'. 생략하면 "진행 중"으로 표시됩니다.
 * - featured?    boolean, 선택. true면 홈 화면 Featured 섹션에 노출됩니다.
 */
export const projects: Project[] = [
  {
    id: 'sample-web-app',
    title: '샘플 웹 애플리케이션',
    summary: 'React와 TypeScript로 만든 반응형 웹 서비스입니다.',
    role: 'Solo Developer (Fullstack)',
    highlights: [
      '이 항목은 상세 페이지 상단에 강조되는 bullet 목록입니다.',
      'src/data/projects.ts의 highlights 배열에 원하는 만큼 추가하세요.',
    ],
    description:
      '## 이 프로젝트는 템플릿 예시입니다\n\n`src/data/projects.ts` 파일의 이 항목을 자신의 프로젝트 정보로 바꾸거나, 배열에 새 항목을 추가해서 포트폴리오를 채워보세요.\n\n**설명(description)은 마크다운을 지원**합니다 — 표도 쓸 수 있어요.\n\n| 항목 | 설명 |\n| --- | --- |\n| 헤딩 | `##`, `###` |\n| 강조 | `**굵게**`, `*기울임*` |\n| 표 | 이 표처럼 |\n| 이미지 | `![alt](url)` |\n\n- 목록도 되고\n- 링크도 됩니다: [example.com](https://example.com)\n\n이미지도 기본 마크다운 문법으로 됩니다:\n\n![샘플 이미지](https://placehold.co/600x300)\n\n이 프로젝트는 thumbnail과 youtubeId가 둘 다 있어서, 상세 페이지에 배너 이미지가 먼저, 유튜브 영상이 그 아래에 순서대로 표시됩니다.',
    thumbnail: 'https://placehold.co/1200x675',
    youtubeId: 'dQw4w9WgXcQ',
    tags: ['React', 'TypeScript', 'Vite'],
    links: [
      { label: 'GitHub', url: 'https://github.com', icon: 'github' },
      { label: '라이브 데모', url: 'https://example.com', icon: 'demo' },
    ],
    date: '2026-06-01',
    featured: true,
  },
  {
    id: 'sample-design-system',
    title: '디자인 시스템 구축',
    summary: '팀의 일관된 UI를 위한 컴포넌트 라이브러리를 설계했습니다.',
    role: 'Frontend Developer',
    description:
      '두 번째 샘플 프로젝트입니다. `youtubeId` 없이 `thumbnail`만 있는 예시라, 상세 페이지엔 배너 이미지만 표시되고 그 아래 영상 자리는 아예 생기지 않습니다.\n\nendDate가 없으면 상세 페이지와 카드에 기간이 "진행 중"으로 표시됩니다.\n\n본문 중간에 유튜브 영상을 넣고 싶다면 이렇게 코드블록 언어를 `youtube`로 쓰고 영상 ID만 적으세요:\n\n```youtube\ndQw4w9WgXcQ\n```\n\n위 블록이 실제로는 반응형 플레이어로 렌더링됩니다. 하나의 프로젝트에 여러 개 넣어도 됩니다.',
    thumbnail: 'https://placehold.co/1200x675',
    tags: ['Storybook', 'vanilla-extract', 'Design System'],
    links: [{ label: 'GitHub', url: 'https://github.com', icon: 'github' }],
    date: '2026-03-15',
    featured: true,
  },
  {
    id: 'sample-side-project',
    title: '사이드 프로젝트',
    summary: '주말 동안 만들어본 작은 프로젝트입니다.',
    role: 'Solo Developer',
    description:
      '세 번째 샘플 프로젝트 설명입니다. `endDate`를 지정하면 기간이 "시작 - 종료"로 표시됩니다.\n\n이 프로젝트는 `thumbnail`도 `youtubeId`도 없어서, 상세 페이지에 미디어 영역 자체가 생기지 않고 곧바로 이 본문으로 이어집니다 — 빈 박스가 뜨지 않습니다.',
    tags: ['Next.js', 'GSAP'],
    links: [{ label: 'GitHub', url: 'https://github.com', icon: 'github' }],
    date: '2025-11-10',
    endDate: '2026-01-10',
    featured: false,
  },
]

export const sortedProjects = [...projects].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
)

export const featuredProjects = sortedProjects.filter((p) => p.featured)

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}

/** All unique tags across every project, sorted alphabetically — powers the tag filter. */
export const allTags = Array.from(new Set(projects.flatMap((p) => p.tags))).sort((a, b) =>
  a.localeCompare(b),
)

/** All years that have at least one project, newest first — powers the year filter. */
export const allYears = Array.from(
  new Set(projects.map((p) => new Date(p.date).getFullYear())),
).sort((a, b) => b - a)
