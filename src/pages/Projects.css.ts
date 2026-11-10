import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

const mobile = 'screen and (max-width: 760px)'

// ── 머리 프레임 ─────────────────────────────────────────

export const head = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[4],
  padding: '40px 44px 36px',
  '@media': {
    [mobile]: {
      padding: '26px 22px 24px',
    },
  },
})

export const title = style({
  fontSize: 'clamp(2rem, 4vw, 2.75rem)',
  fontWeight: vars.fontWeight.extrabold,
  letterSpacing: '-0.03em',
  color: vars.color.textPrimary,
})

export const lead = style({
  fontSize: vars.fontSize.bodyLg,
  color: vars.color.textSecondary,
})

export const tools = style({
  position: 'relative',
  // 태그 목록이 아래 카드들 위로 펼쳐지게
  zIndex: 5,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  gap: vars.space[3],
  marginTop: vars.space[2],
})

/** 카드 안의 태그. 누르면 그 태그로 거릅니다(카드 전체 링크보다 위에 있어야 눌립니다) */
export const tagButton = style({
  position: 'relative',
  zIndex: 1,
  display: 'inline-flex',
  alignItems: 'center',
  height: '28px',
  padding: `0 ${vars.space[3]}`,
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.blue50,
  color: vars.color.blue600,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  transition: `background-color ${vars.transition.fast}, color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.blue100,
    },
    '&[aria-pressed="true"]': {
      backgroundColor: vars.color.blue500,
      color: vars.color.white,
    },
  },
})

/** 연도 고르기. 몇 개 안 되는 선택지라 드롭다운 대신 한 줄 버튼으로 둡니다 */
export const years = style({
  display: 'inline-flex',
  padding: '4px',
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.gray100,
})

export const year = style({
  height: '38px',
  padding: '0 14px',
  borderRadius: vars.radius.full,
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textSecondary,
  transition: `background-color ${vars.transition.fast}, color ${vars.transition.fast}, box-shadow ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      color: vars.color.textPrimary,
    },
    '&[aria-pressed="true"]': {
      backgroundColor: vars.color.white,
      color: vars.color.textPrimary,
      boxShadow: '0 1px 3px rgba(15, 23, 42, 0.12)',
    },
  },
})

// ── 결과 ────────────────────────────────────────────────

export const resultRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[3],
  marginTop: `calc(-1 * ${vars.space[4]})`,
  paddingLeft: vars.space[1],
  fontSize: vars.fontSize.small,
  color: vars.color.textTertiary,
})

export const reset = style({
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.blue600,
})

export const group = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[4],
})

export const yearHead = style({
  display: 'flex',
  alignItems: 'baseline',
  gap: vars.space[3],
  paddingLeft: vars.space[1],
})

export const yearTitle = style({
  fontFamily: vars.font.mono,
  fontSize: vars.fontSize.h3,
  fontWeight: vars.fontWeight.bold,
  letterSpacing: '-0.02em',
  color: vars.color.textPrimary,
})

export const yearCount = style({
  fontSize: vars.fontSize.small,
  color: vars.color.textTertiary,
})

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.space[5],
  '@media': {
    [mobile]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
})

// ── 카드 ────────────────────────────────────────────────

export const tile = style({
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[4],
  height: '100%',
  padding: vars.space[4],
  selectors: {
    '&[data-bt-visible="true"]:not([data-bt-raw="true"]):hover': {
      transform: 'translateY(-4px)',
    },
  },
})

export const thumb = style({
  position: 'relative',
  aspectRatio: '16 / 9',
  overflow: 'hidden',
})

export const thumbInner = style({
  position: 'absolute',
  inset: 0,
})

export const thumbImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

export const thumbFallback = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  fontSize: vars.fontSize.h2,
  fontWeight: vars.fontWeight.extrabold,
  color: vars.color.blue300,
})

export const tileBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[2],
  padding: `0 ${vars.space[2]} ${vars.space[2]}`,
})

export const meta = style({
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textTertiary,
})

export const tileTitle = style({
  fontSize: '1.1875rem',
  fontWeight: vars.fontWeight.extrabold,
  lineHeight: 1.4,
  letterSpacing: '-0.01em',
  color: vars.color.textPrimary,
})

/** 카드 전체를 덮는 링크 */
export const stretchedLink = style({
  outline: 'none',
  '::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '24px',
  },
})

globalStyle(`${tile}:has(${stretchedLink}:focus-visible)`, {
  outline: `3px solid ${vars.color.blue300}`,
  outlineOffset: '4px',
})

export const summary = style({
  fontSize: '0.9375rem',
  lineHeight: 1.7,
  color: vars.color.textSecondary,
})

export const tags = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  marginTop: vars.space[1],
})

export const empty = style({
  padding: `${vars.space[16]} 0`,
  textAlign: 'center',
  color: vars.color.textTertiary,
})
