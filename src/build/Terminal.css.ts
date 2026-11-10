import { globalStyle, keyframes, style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

const blink = keyframes({
  '0%, 49%': { opacity: 1 },
  '50%, 100%': { opacity: 0 },
})

const pulse = keyframes({
  '0%': { boxShadow: `0 0 0 0 rgba(74, 194, 107, 0.55)` },
  '70%': { boxShadow: `0 0 0 6px rgba(74, 194, 107, 0)` },
  '100%': { boxShadow: `0 0 0 0 rgba(74, 194, 107, 0)` },
})

export const terminal = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  height: '100%',
  minHeight: 0,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.term.bg,
  color: vars.term.fg,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08), 0 18px 40px rgba(15, 23, 42, 0.16)',
  overflow: 'hidden',
  selectors: {
    '&[data-compact="true"]': {
      borderRadius: vars.radius.full,
    },
  },
})

/** 작은 바에서 보여주는 마지막 한 줄 */
export const lastLine = style({
  display: 'flex',
  gap: vars.space[2],
  minWidth: 0,
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  fontSize: '12px',
  marginTop: 0,
})

export const bar = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  padding: `${vars.space[2]} ${vars.space[3]}`,
  backgroundColor: vars.term.bar,
  borderBottom: `1px solid ${vars.term.line}`,
  selectors: {
    [`${terminal}[data-compact="true"] &`]: {
      height: '100%',
      // 펼치기 버튼이 둥근 끝과 같은 중심을 갖도록 위·아래·오른쪽 여백을 같게(10px) 둡니다
      padding: `0 10px 0 ${vars.space[4]}`,
      backgroundColor: 'transparent',
      borderBottom: 'none',
    },
  },
})

export const dots = style({
  display: 'flex',
  gap: '6px',
  marginRight: vars.space[1],
})

export const dot = style({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  backgroundColor: vars.term.line,
})

export const title = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  flex: 1,
  minWidth: 0,
  fontFamily: vars.font.mono,
  fontSize: '12px',
  color: vars.term.dim,
})

export const live = style({
  width: '7px',
  height: '7px',
  borderRadius: '50%',
  backgroundColor: vars.term.dim,
  selectors: {
    '&[data-live="true"]': {
      backgroundColor: vars.term.green,
      animation: `${pulse} 1.6s ease-out infinite`,
    },
  },
})

/** 작은 바의 펼치기·접기 버튼. 바 높이(46px)에서 위아래 10px씩 남는 26px 원입니다 */
export const toggle = style({
  flexShrink: 0,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '26px',
  height: '26px',
  borderRadius: '50%',
  color: vars.term.fg,
  backgroundColor: 'rgba(255, 255, 255, 0.08)',
  transition: `background-color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.16)',
    },
  },
})

export const chevron = style({
  width: '14px',
  height: '14px',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  selectors: {
    [`${toggle}[aria-expanded="true"] &`]: {
      transform: 'rotate(180deg)',
    },
  },
})

export const body = style({
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: `${vars.space[3]} ${vars.space[4]} ${vars.space[4]}`,
  fontFamily: vars.font.mono,
  fontSize: '12.5px',
  lineHeight: 1.65,
  scrollbarWidth: 'thin',
  scrollbarColor: `${vars.term.line} transparent`,
})

export const line = style({
  display: 'flex',
  gap: vars.space[2],
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-all',
})

/**
 * 안내하는 말. 빌드 도구가 단계를 알리는 줄처럼 앞에 파란 '==>'를 붙이고 굵게 써서
 * 작업 로그와 구분합니다(말풍선이 아니라 터미널 출력처럼)
 */
export const say = style({ color: vars.term.fg, fontWeight: vars.fontWeight.bold })
export const work = style({ color: vars.term.dim })
export const commit = style({ color: vars.term.fg })
export const info = style({ color: vars.term.dim, fontStyle: 'italic' })

export const mark = style({ flexShrink: 0, width: '1.2em' })
/** 작업 로그 앞에 붙는 작업자 역할 이름(레이아웃·스타일·텍스트·배치) */
export const roleTag = style({
  flexShrink: 0,
  width: '4.6em',
  fontWeight: vars.fontWeight.bold,
  whiteSpace: 'nowrap',
})
export const detail = style({ color: vars.term.dim })
export const markSay = style({
  width: 'auto',
  color: vars.term.blue,
  fontWeight: vars.fontWeight.bold,
  // 합자 글꼴(Cascadia Code 등)에서 '==>'가 화살표 하나로 합쳐지지 않게 합니다
  fontVariantLigatures: 'none',
  whiteSpace: 'nowrap',
})
export const markCommit = style({ color: vars.term.green })
export const content = style({ flex: 1, minWidth: 0 })

export const selector = style({ color: vars.term.purple })
export const property = style({ color: vars.term.blue })
export const value = style({ color: vars.term.orange })
export const punct = style({ color: vars.term.dim })
export const commitType = style({ color: vars.term.green })
export const meta = style({ flexShrink: 0, color: vars.term.dim, marginLeft: 'auto' })

export const cursor = style({
  display: 'inline-block',
  width: '0.6em',
  height: '1.1em',
  marginLeft: '1px',
  verticalAlign: '-0.2em',
  backgroundColor: vars.term.fg,
  opacity: 0.85,
  animation: `${blink} 1s steps(1) infinite`,
})

// 작은 바의 마지막 한 줄은 넘치면 말줄임표로 자릅니다
globalStyle(`${lastLine} ${content}`, {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

// 로그 안에서 말하는 줄은 새 단계의 머리처럼 위를 띄웁니다
globalStyle(`${body} ${say}`, {
  marginTop: vars.space[3],
})

globalStyle(`${body} ${say}:first-child`, {
  marginTop: 0,
})

globalStyle(`${body} ${info}`, {
  marginTop: vars.space[2],
})
