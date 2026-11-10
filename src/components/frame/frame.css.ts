import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

/** 모든 페이지가 함께 쓰는 프레임 꼴(디자인 도구 캔버스 위의 프레임) */

/** 조립 단위 하나. 이름표 + 프레임 */
export const section = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[2],
})

/** 디자인 도구의 프레임 이름처럼 프레임 왼쪽 위에 붙는 이름표 */
export const frameLabel = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  paddingLeft: vars.space[1],
  fontFamily: vars.font.mono,
  fontSize: '12px',
  fontWeight: vars.fontWeight.medium,
  color: vars.color.gray500,
  transition: `color ${vars.transition.base}`,
  selectors: {
    [`${section}[data-bt-status="building"] &`]: {
      color: vars.color.selection,
    },
  },
})

export const frameMark = style({
  opacity: 0.7,
})

export const draftBadge = style({
  padding: '1px 6px',
  borderRadius: '4px',
  backgroundColor: '#FFF4E5',
  color: '#B25E09',
  fontFamily: vars.font.family,
  fontSize: '11px',
  fontWeight: vars.fontWeight.bold,
})

/** 홈이 아닌 페이지의 본문 폭 */
export const page = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[10],
  width: '100%',
  maxWidth: '1040px',
  margin: '0 auto',
  padding: `${vars.space[8]} ${vars.space[6]} ${vars.space[24]}`,
  '@media': {
    'screen and (max-width: 760px)': {
      gap: vars.space[8],
      padding: `${vars.space[6]} ${vars.space[4]} 120px`,
    },
  },
})

/** 흰 프레임 안쪽 여백 */
export const framePad = style({
  padding: '40px 44px',
  '@media': {
    'screen and (max-width: 760px)': {
      padding: '26px 22px',
    },
  },
})
