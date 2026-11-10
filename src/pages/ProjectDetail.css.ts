import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

const mobile = 'screen and (max-width: 760px)'

export const head = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[4],
  padding: '36px 44px 40px',
  '@media': {
    [mobile]: {
      padding: '24px 22px 28px',
    },
  },
})

export const back = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[1],
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textSecondary,
  selectors: {
    '&:hover': {
      color: vars.color.textPrimary,
    },
  },
})

export const meta = style({
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textTertiary,
})

export const title = style({
  fontSize: 'clamp(1.875rem, 4vw, 2.75rem)',
  fontWeight: vars.fontWeight.extrabold,
  lineHeight: 1.25,
  letterSpacing: '-0.03em',
  color: vars.color.textPrimary,
})

export const tags = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[2],
})

export const media = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[4],
  padding: vars.space[4],
})

export const banner = style({
  width: '100%',
  aspectRatio: '16 / 9',
  objectFit: 'cover',
  borderRadius: '16px',
})

export const highlights = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[3],
  padding: '28px 32px',
  '@media': {
    [mobile]: {
      padding: '22px 20px',
    },
  },
})

export const highlightItem = style({
  display: 'flex',
  gap: vars.space[3],
  fontSize: vars.fontSize.small,
  lineHeight: vars.lineHeight.body,
  color: vars.color.textSecondary,
})

export const highlightMark = style({
  flexShrink: 0,
  color: vars.color.blue500,
  fontWeight: vars.fontWeight.bold,
})

export const body = style({
  padding: '40px 48px 44px',
  '@media': {
    [mobile]: {
      padding: '26px 20px 30px',
    },
  },
})

export const pager = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.space[4],
  '@media': {
    [mobile]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
})

export const pagerLink = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  height: '100%',
  padding: '20px 22px',
  borderRadius: '20px',
  backgroundColor: vars.color.frame,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.05)',
  transition: `transform ${vars.transition.fast}, box-shadow ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      transform: 'translateY(-3px)',
      boxShadow: '0 12px 28px -18px rgba(15, 23, 42, 0.35)',
    },
  },
})

export const pagerNext = style({
  textAlign: 'right',
  gridColumn: 2,
  '@media': {
    [mobile]: {
      gridColumn: 1,
    },
  },
})

export const pagerHint = style({
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textTertiary,
})

export const pagerTitle = style({
  fontWeight: vars.fontWeight.bold,
  color: vars.color.textPrimary,
})
