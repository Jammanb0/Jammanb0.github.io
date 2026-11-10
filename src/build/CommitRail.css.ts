import { keyframes, style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

const pulse = keyframes({
  '0%': { boxShadow: '0 0 0 0 rgba(49, 130, 246, 0.45)' },
  '70%': { boxShadow: '0 0 0 6px rgba(49, 130, 246, 0)' },
  '100%': { boxShadow: '0 0 0 0 rgba(49, 130, 246, 0)' },
})

/** 다 그린 뒤 잠시 머문 구역의 줄이 한 번 은은하게 빛납니다 */
const flash = keyframes({
  '0%': { backgroundColor: 'rgba(49, 130, 246, 0)' },
  '25%': { backgroundColor: 'rgba(49, 130, 246, 0.14)' },
  '100%': { backgroundColor: 'rgba(49, 130, 246, 0)' },
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
      backgroundColor: vars.color.gray50,
    },
    '&[data-highlighted="true"]': {
      animation: `${flash} 1.8s ease-out`,
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
  },
  selectors: {
    '&[data-status="building"]::before': {
      borderColor: vars.color.selection,
      backgroundColor: vars.color.selection,
      animation: `${pulse} 1.4s ease-out infinite`,
    },
    '&[data-status="done"]::before': {
      borderColor: vars.term.green,
      backgroundColor: vars.term.green,
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

/** 구역 하나에 점 하나. 지금 보는 구역은 길쭉해집니다 */
export const peekDot = style({
  width: '7px',
  height: '7px',
  borderRadius: '4px',
  backgroundColor: vars.color.gray300,
  transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease',
  selectors: {
    '&[data-status="building"]': {
      backgroundColor: vars.color.selection,
      animation: `${pulse} 1.4s ease-out infinite`,
    },
    '&[data-status="done"]': {
      backgroundColor: vars.term.green,
    },
    '&[data-current="true"]': {
      width: '16px',
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
