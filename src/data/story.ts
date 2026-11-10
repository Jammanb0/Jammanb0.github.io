import type { StoryChapter } from '@/types/story'
import { profile } from './profile'

/**
 * 홈 화면 '내 이야기' 구역. 배열 순서대로 위에서부터 보입니다.
 * 항목을 추가하면 안내 문장 → 조립 → 커밋까지 자동으로 붙습니다.
 *
 * 남에게 보여지는 글이므로 실제로 있었던 일만 적습니다.
 * 날짜와 수상·수료 내역은 GitHub 프로필과 projects.ts에 이미 공개된 내용을 따랐습니다.
 */
export const story: StoryChapter[] = [
  {
    id: 'origin',
    title: '개발을 시작한 계기',
    guide: '개발을 시작한 이야기를 보여드릴게요!',
    commit: 'feat: 개발을 시작한 계기',
    // 실제 내용을 적은 뒤 draft를 지우면 배포된 사이트에도 나옵니다
    draft: true,
    paragraphs: [
      '이 자리에 개발을 시작한 계기를 적어주세요. 지금은 작성 중이라 개발 서버에서만 보이고, 배포된 사이트에는 나오지 않습니다.',
    ],
  },
  {
    id: 'path',
    title: '지나온 길',
    guide: '지금까지 걸어온 길을 시간 순서대로 보여드릴게요.',
    commit: 'feat: 지나온 길',
    date: '2024 – 2026',
    items: [
      {
        period: '2024',
        text: '대학교 4학년 캡스톤 디자인으로 지능형 가로등 에너지 관리 시스템(EMS)을 만들었습니다. 기획과 논문 작성을 맡고 프론트엔드를 개발했으며, 캡스톤 디자인 대회 동상과 한국디지털콘텐츠학회 우수 논문상을 받았습니다.',
        projectIds: ['smart-streetlight-ems'],
      },
      {
        period: '2025.03 – 2025.09',
        text: '구름(goorm) × 인프런 자바 스프링 & 리액트 풀스택 개발자 성장 과정 13회차를 수료했습니다. 과정 중 7인 팀의 프론트엔드 개발자로 실시간 협업 웹 IDE와 DDOK!을 만들었습니다.',
        projectIds: ['deepwebide', 'ddok'],
      },
      {
        period: '2026',
        text: '혼자 기획하고 만든 도구들이 늘었습니다. 대부분 Claude Code와 협업해 개발했고, 그중 두 개는 실제 업무에 쓰고 있습니다.',
        projectIds: ['swiftfolio-template', 'tailor', 'doltap', 'lesserdam', 'ilsa-work-helper'],
      },
    ],
  },
  {
    id: 'approach',
    title: '이렇게 일합니다',
    guide: '제가 일하는 방식도 소개할게요.',
    commit: 'feat: 일하는 방식',
    paragraphs: [profile.bio],
  },
]

/** 배포된 사이트에서는 작성 중(draft)인 이야기를 뺍니다 */
export const visibleStory = story.filter((chapter) => !chapter.draft || import.meta.env.DEV)
