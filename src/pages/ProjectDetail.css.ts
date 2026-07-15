import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const wrapper = style({
  padding: `${vars.space[10]} 0 ${vars.space[24]}`,
})

export const back = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[1],
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textSecondary,
  marginBottom: vars.space[8],
  selectors: {
    '&:hover': {
      color: vars.color.textPrimary,
    },
  },
})

export const header = style({
  marginBottom: vars.space[8],
})

export const metaRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
  fontSize: vars.fontSize.caption,
  color: vars.color.textTertiary,
  fontWeight: vars.fontWeight.semibold,
  marginBottom: vars.space[3],
})

export const metaDivider = style({
  color: vars.color.gray300,
})

export const title = style({
  fontSize: vars.fontSize.h1,
  fontWeight: vars.fontWeight.extrabold,
  letterSpacing: '-0.02em',
  color: vars.color.textPrimary,

  '@media': {
    'screen and (max-width: 640px)': {
      fontSize: vars.fontSize.h2,
    },
  },
})

export const tagRow = style({
  display: 'flex',
  gap: vars.space[2],
  marginTop: vars.space[5],
})

export const media = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[5],
  marginBottom: vars.space[10],
})

export const bannerImage = style({
  width: '100%',
  aspectRatio: '16 / 9',
  borderRadius: vars.radius.lg,
  objectFit: 'cover',
})

export const description = style({
  maxWidth: '68ch',
  marginBottom: vars.space[10],
})

export const highlights = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[3],
  padding: vars.space[6],
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.backgroundAlt,
  marginBottom: vars.space[10],
})

export const highlightItem = style({
  display: 'flex',
  gap: vars.space[3],
  fontSize: vars.fontSize.small,
  color: vars.color.textSecondary,
  lineHeight: vars.lineHeight.body,
})

export const highlightMark = style({
  flexShrink: 0,
  color: vars.color.blue500,
  fontWeight: vars.fontWeight.bold,
})
