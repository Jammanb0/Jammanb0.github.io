import type { Decl } from '@/build/types'

/**
 * 조립할 때 보이고 그 순간 실제로 적용되는 CSS. 여기 값이 곧 완성된 화면의
 * 모습입니다(조립을 건너뛰어도 똑같이 적용됩니다). 배열이 바뀌지 않게 모듈 상수로 둡니다.
 */

/** 페이지의 큰 흰 프레임 */
export const FRAME: readonly Decl[] = [
  ['background-color', '#ffffff'],
  ['border-radius', '28px'],
  ['box-shadow', '0 24px 48px -28px rgba(15, 23, 42, 0.3)'],
]

/** 이야기·프로젝트 카드 */
export const CARD: readonly Decl[] = [
  ['background-color', '#ffffff'],
  ['border-radius', '24px'],
  ['box-shadow', '0 18px 40px -26px rgba(15, 23, 42, 0.28)'],
]

/** 어두운 마무리 카드 */
export const DARK: readonly Decl[] = [
  ['background-color', '#191f28'],
  ['color', '#ffffff'],
  ['border-radius', '28px'],
]

export const CHIP: readonly Decl[] = [
  ['background-color', '#eef6ff'],
  ['color', '#2272eb'],
  ['border-radius', '999px'],
]

export const THUMB: readonly Decl[] = [
  ['background-color', '#f2f4f6'],
  ['border-radius', '16px'],
]

/** 프레임 안의 옅은 회색 판(연락 채널, 핵심 요약 등) */
export const PANEL: readonly Decl[] = [
  ['background-color', '#f6f7f9'],
  ['border-radius', '18px'],
]
