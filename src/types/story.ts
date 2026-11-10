export interface StoryItem {
  /** 예: '2024', '2025.03 – 2025.09' */
  period: string
  text: string
  /** 함께 보여줄 프로젝트 id(src/data/projects.ts). 상세 페이지로 가는 칩이 붙습니다 */
  projectIds?: string[]
}

export interface StoryChapter {
  /** 구역 id이자 `#story-이-값` 앵커. 영문·숫자·하이픈 */
  id: string
  title: string
  /** 이 이야기를 조립하기 시작할 때 안내 터미널에 찍을 문장 */
  guide: string
  /** 조립이 끝나면 남길 커밋 메시지 */
  commit: string
  /** 커밋 옆 날짜. 사실인 날짜만 적고, 모르면 비워 둡니다 */
  date?: string
  paragraphs?: string[]
  items?: StoryItem[]
  /** true면 개발 서버에서만 보이고 배포된 사이트에는 나오지 않습니다(작성 중인 글) */
  draft?: boolean
}
