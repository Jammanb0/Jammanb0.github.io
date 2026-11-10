import type { Role } from './types'

/** 작업자 역할별 이름표와 색. 선택 상자, 터미널 로그가 같은 색을 씁니다 */
export const ROLES: Record<Role, { label: string; color: string }> = {
  layout: { label: '레이아웃', color: '#3182F6' },
  style: { label: '스타일', color: '#8B5CF6' },
  copy: { label: '텍스트', color: '#0CA678' },
  place: { label: '배치', color: '#F08C00' },
}

/**
 * 동시에 움직이는 작업자 구성. 역할마다 둘씩, 모두 여덟이 함께 일합니다.
 * 카드가 많은 화면(프로젝트 목록)에서도 틀 그리기·CSS가 한 사람에게 몰려 늦어지지 않게 합니다.
 */
export const WORKER_ROLES: readonly Role[] = [
  'layout',
  'layout',
  'style',
  'style',
  'copy',
  'copy',
  'place',
  'place',
]
