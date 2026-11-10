import { createVar, style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

/** 작업자 역할 색. 상자 테두리, 손잡이, 이름표, 크기 표시가 함께 씁니다 */
export const roleColor = createVar()

export const root = style({
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: vars.zIndex.overlay,
  overflow: 'hidden',
})

export const box = style({
  vars: { [roleColor]: vars.color.selection },
  position: 'absolute',
  top: 0,
  left: 0,
  border: `1.5px solid ${roleColor}`,
  borderRadius: '2px',
  opacity: 0,
  transition: 'opacity 0.16s ease',
  willChange: 'transform, width, height',
  selectors: {
    '&[data-visible="true"]': {
      opacity: 1,
    },
  },
})

export const handle = style({
  position: 'absolute',
  width: '7px',
  height: '7px',
  backgroundColor: vars.color.white,
  border: `1.5px solid ${roleColor}`,
})

export const tl = style({ top: '-4px', left: '-4px' })
export const tr = style({ top: '-4px', right: '-4px' })
export const bl = style({ bottom: '-4px', left: '-4px' })
export const br = style({ bottom: '-4px', right: '-4px' })

/** 디자인 도구에서 함께 작업하는 사람 이름처럼 상자 왼쪽 위에 붙는 역할 이름표 */
export const tag = style({
  position: 'absolute',
  left: '-1.5px',
  bottom: '100%',
  marginBottom: '4px',
  padding: '1px 6px',
  borderRadius: '4px 4px 4px 0',
  backgroundColor: roleColor,
  color: vars.color.white,
  fontFamily: vars.font.family,
  fontSize: '10.5px',
  fontWeight: vars.fontWeight.bold,
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
})

export const badge = style({
  position: 'absolute',
  top: '100%',
  left: '50%',
  transform: 'translateX(-50%)',
  marginTop: '8px',
  padding: '2px 6px',
  borderRadius: '4px',
  backgroundColor: roleColor,
  color: vars.color.white,
  fontFamily: vars.font.mono,
  fontSize: '11px',
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
  selectors: {
    '&[data-visible="false"]': {
      display: 'none',
    },
  },
})

/** 지금 적용하는 CSS 한 줄을 보여주는 말풍선 */
export const bubble = style({
  position: 'absolute',
  top: '100%',
  left: '-1.5px',
  marginTop: '8px',
  padding: '4px 8px',
  borderRadius: '6px',
  borderTop: `2px solid ${roleColor}`,
  backgroundColor: vars.term.bg,
  color: vars.term.fg,
  fontFamily: vars.font.mono,
  fontSize: '11.5px',
  lineHeight: 1.5,
  whiteSpace: 'nowrap',
  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.22)',
  selectors: {
    '&[data-visible="false"]': {
      display: 'none',
    },
  },
})

export const bubbleProp = style({ color: vars.term.blue })
export const bubbleValue = style({ color: vars.term.orange })
