import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

const mobile = 'screen and (max-width: 760px)'

export const frame = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[4],
  padding: '40px 44px 44px',
  '@media': {
    [mobile]: {
      padding: '26px 22px 28px',
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

export const channels = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: vars.space[3],
  marginTop: vars.space[3],
  '@media': {
    [mobile]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
    },
  },
})

export const channel = style({
  position: 'relative',
  selectors: {
    // 이메일은 두 칸을 다 씁니다
    '&[data-primary="true"]': {
      gridColumn: '1 / -1',
    },
    '&[data-bt-visible="true"]:not([data-bt-raw="true"]):hover': {
      transform: 'translateY(-3px)',
    },
  },
})

export const channelLink = style({
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  gridTemplateRows: 'auto auto auto',
  columnGap: vars.space[3],
  rowGap: '2px',
  padding: '20px 22px',
  outline: 'none',
  borderRadius: '18px',
  selectors: {
    '&:focus-visible': {
      boxShadow: `0 0 0 3px ${vars.color.blue300}`,
    },
  },
})

export const channelLabel = style({
  gridColumn: 1,
  fontSize: vars.fontSize.bodyLg,
  fontWeight: vars.fontWeight.extrabold,
  color: vars.color.textPrimary,
})

export const channelDesc = style({
  gridColumn: 1,
  fontSize: vars.fontSize.small,
  color: vars.color.textSecondary,
})

export const channelUrl = style({
  gridColumn: 1,
  marginTop: vars.space[2],
  fontFamily: vars.font.mono,
  fontSize: '12px',
  color: vars.color.blue600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
})

export const arrow = style({
  gridColumn: 2,
  gridRow: '1 / span 3',
  alignSelf: 'center',
  fontSize: vars.fontSize.h4,
  color: vars.color.textTertiary,
})

export const colophon = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[3],
  padding: '36px 44px 40px',
  '@media': {
    [mobile]: {
      padding: '26px 22px 28px',
    },
  },
})

export const colophonTitle = style({
  fontSize: vars.fontSize.h4,
  fontWeight: vars.fontWeight.extrabold,
})

export const colophonText = style({
  lineHeight: 1.8,
  opacity: 0.8,
})

export const colophonLinks = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[3],
  marginTop: vars.space[2],
})

export const colophonLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  height: '40px',
  padding: '0 16px',
  borderRadius: vars.radius.full,
  border: '1px solid rgba(255, 255, 255, 0.24)',
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  transition: `background-color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
})
