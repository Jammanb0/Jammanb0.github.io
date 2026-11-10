import { globalStyle, keyframes, style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

const blink = keyframes({
  '0%, 49%': { opacity: 1 },
  '50%, 100%': { opacity: 0 },
})

/**
 * 상자 대상. 아직 그리기 전에는 점선 자리표시만 보이고, 그린 뒤에는
 * 터미널에 찍힌 CSS가 한 줄씩 붙으면서 모습이 바뀝니다.
 */
export const box = style({
  transition: [
    'opacity 0.25s ease',
    'background-color 0.35s ease',
    'border-color 0.35s ease',
    'border-radius 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    'box-shadow 0.4s ease',
    'color 0.3s ease',
    'outline-color 0.3s ease',
    'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  ].join(', '),
  selectors: {
    '&[data-bt-visible="false"], &[data-bt-raw="true"]': {
      outline: `1.5px dashed ${vars.color.placeholder}`,
      outlineOffset: '-1.5px',
    },
    '&[data-bt-visible="false"]': {
      pointerEvents: 'none',
    },
  },
})

// 틀이 그려지기 전에는 안쪽 내용(장식, 안쪽 틀의 자리표시 포함)을 감춥니다
globalStyle(`${box}[data-bt-visible="false"] > *`, {
  opacity: 0,
})

export const text = style({
  selectors: {
    '&[data-bt-visible="false"]': {
      opacity: 0,
    },
  },
})

/** 아직 입력되지 않은 글자. 자리는 차지해서 줄바꿈이 튀지 않습니다 */
export const ghost = style({
  color: 'transparent',
})

export const caret = style({
  display: 'inline-block',
  width: '2px',
  height: '1em',
  marginLeft: '1px',
  marginRight: '-3px',
  verticalAlign: '-0.12em',
  backgroundColor: vars.color.selection,
  animation: `${blink} 1s steps(1) infinite`,
})

export const reveal = style({
  transition: 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  selectors: {
    '&[data-bt-visible="false"]': {
      opacity: 0,
      transform: 'translateY(6px)',
      pointerEvents: 'none',
    },
  },
})

/** 헤더·푸터가 처음 조립되기 직전 한순간 내용을 감춥니다(배경은 그대로) */
export const chromePending = style({})

globalStyle(`${chromePending} *`, {
  visibility: 'hidden',
})
