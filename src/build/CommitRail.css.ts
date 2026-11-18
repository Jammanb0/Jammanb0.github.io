import { keyframes, style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

/**
 * 조립 중인 구역의 점: 초록 고리가 숨 쉬듯 퍼집니다(완성되면 꽉 찬 초록).
 * 파랑은 '지금 보고 있는 곳'에만 씁니다
 */
const growing = keyframes({
  '0%': { boxShadow: '0 0 0 0 rgba(74, 194, 107, 0.5)' },
  '70%': { boxShadow: '0 0 0 5px rgba(74, 194, 107, 0)' },
  '100%': { boxShadow: '0 0 0 0 rgba(74, 194, 107, 0)' },
})

const pop = keyframes({
  '0%': { transform: 'scale(1)' },
  '40%': { transform: 'scale(1.45)' },
  '100%': { transform: 'scale(1)' },
})

const rise = keyframes({
  from: { opacity: 0, transform: 'translateY(6px)' },
  to: { opacity: 1, transform: 'none' },
})

export const rail = style({
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  padding: vars.space[4],
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.frame,
  boxShadow: vars.shadow.card,
})

export const head = style({
  display: 'flex',
  alignItems: 'baseline',
  justifyContent: 'space-between',
  marginBottom: vars.space[3],
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.textSecondary,
})

export const count = style({
  fontFamily: vars.font.mono,
  fontWeight: vars.fontWeight.regular,
  color: vars.color.textTertiary,
})

export const list = style({
  position: 'relative',
  // 강조 띠(z-index -1)가 목록 밖으로 빠지지 않고 줄과 세로선 뒤에만 깔리게 합니다
  isolation: 'isolate',
  overflowY: 'auto',
  minHeight: 0,
  scrollbarWidth: 'thin',
  '::before': {
    content: '""',
    position: 'absolute',
    top: '12px',
    bottom: '12px',
    left: '9px',
    width: '2px',
    borderRadius: '1px',
    backgroundColor: vars.color.gray200,
  },
})

export const item = style({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[3],
  width: '100%',
  padding: `7px ${vars.space[2]} 7px 0`,
  borderRadius: vars.radius.sm,
  textAlign: 'left',
  transition: `background-color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(15, 23, 42, 0.04)',
    },
  },
})

/**
 * 지금 보고 있는 줄 뒤에 깔리는 연한 파란 띠 하나. 줄마다 따로 칠하지 않고 이 띠가 줄 사이를
 * 미끄러지듯 옮겨 가서, 두 줄이 함께 파래지거나 깜빡이지 않습니다(위치·높이는 CommitList가 넣음)
 */
export const mark = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: -1,
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.blue50,
  pointerEvents: 'none',
  opacity: 0,
  transition: 'opacity 0.2s ease',
  selectors: {
    '&[data-visible="true"]': {
      opacity: 1,
    },
    '&[data-ready="true"]': {
      transition: [
        'transform 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        'height 0.38s cubic-bezier(0.16, 1, 0.3, 1)',
        'opacity 0.2s ease',
      ].join(', '),
    },
  },
})

export const node = style({
  position: 'relative',
  flexShrink: 0,
  width: '20px',
  height: '20px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '::before': {
    content: '""',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: `2px solid ${vars.color.gray300}`,
    backgroundColor: vars.color.frame,
    boxSizing: 'border-box',
    // 강조 띠가 미끄러져 오는 동안 점 색도 함께 서서히 바뀝니다
    transition: 'background-color 0.3s ease, border-color 0.3s ease',
  },
  selectors: {
    // 아직 안 만든 곳: 회색 빈 점 / 조립 중: 초록 빈 점이 숨 쉬듯 / 완성: 꽉 찬 초록
    '&[data-status="building"]::before': {
      borderColor: vars.term.green,
      animation: `${growing} 1.4s ease-out infinite`,
    },
    '&[data-status="done"]::before': {
      borderColor: vars.term.green,
      backgroundColor: vars.term.green,
    },
    // 지금 보고 있는 줄(파란 띠가 있는 줄)의 점만 파랗게 칠하고 옅은 고리를 둘러 위치를 짚어 줍니다
    [`${item}[aria-current="true"] &::before`]: {
      borderColor: vars.color.selection,
      backgroundColor: vars.color.selection,
      boxShadow: '0 0 0 4px rgba(49, 130, 246, 0.2)',
      animation: 'none',
    },
  },
})

export const text = style({
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  flex: 1,
})

export const message = style({
  fontFamily: vars.font.mono,
  fontSize: '12px',
  lineHeight: 1.45,
  color: vars.color.textPrimary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  selectors: {
    [`${item}[data-status="pending"] &`]: {
      color: vars.color.textTertiary,
    },
    [`${item}[aria-current="true"] &`]: {
      color: vars.color.blue600,
      fontWeight: vars.fontWeight.semibold,
    },
  },
})

export const date = style({
  fontFamily: vars.font.mono,
  fontSize: '11px',
  color: vars.color.textTertiary,
})

// ── 좁은 화면: 작은 터미널 위의 커밋 알약 ─────────────────

const peekShadow = '0 1px 2px rgba(15, 23, 42, 0.08), 0 10px 28px rgba(15, 23, 42, 0.14)'

/** 터미널 바 바로 위에 오른쪽으로 붙습니다. 빈 곳은 클릭이 아래로 지나가게 둡니다 */
export const peek = style({
  position: 'absolute',
  right: 0,
  bottom: 'calc(100% + 8px)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: vars.space[2],
  width: '100%',
  pointerEvents: 'none',
  // 터미널이 모양을 다 바꾼 뒤에 떠오릅니다
  animation: `${rise} 0.32s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both`,
})

export const peekButton = style({
  pointerEvents: 'auto',
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[2],
  height: '30px',
  padding: `0 ${vars.space[3]}`,
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.frame,
  boxShadow: peekShadow,
  fontFamily: vars.font.mono,
  fontSize: '12px',
  color: vars.color.textSecondary,
  transition: `background-color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray50,
    },
  },
})

export const peekDots = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
})

/**
 * 구역 하나에 점 하나. 지금 보는 구역은 길쭉한 파란 알약이 되고, 나머지는 진행 상황 색
 * (안 만든 곳 회색, 조립 중 옅은 초록이 숨 쉬듯, 완성 초록)입니다. 큰 화면의 커밋 기록과 같은 규칙입니다
 */
export const peekDot = style({
  width: '7px',
  height: '7px',
  borderRadius: '4px',
  backgroundColor: vars.color.gray300,
  transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease',
  selectors: {
    '&[data-status="building"]': {
      backgroundColor: 'rgba(74, 194, 107, 0.45)',
      animation: `${growing} 1.4s ease-out infinite`,
    },
    '&[data-status="done"]': {
      backgroundColor: vars.term.green,
    },
    '&[data-current="true"]': {
      width: '16px',
      backgroundColor: vars.color.selection,
      animation: 'none',
    },
    '&[data-highlighted="true"]': {
      animation: `${pop} 0.6s ease-out`,
    },
  },
})

export const peekPanel = style({
  pointerEvents: 'auto',
  display: 'flex',
  flexDirection: 'column',
  width: 'min(340px, 100%)',
  maxHeight: 'min(300px, 50vh)',
  padding: vars.space[4],
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.frame,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.08), 0 18px 40px rgba(15, 23, 42, 0.18)',
  animation: `${rise} 0.24s cubic-bezier(0.16, 1, 0.3, 1)`,
})
