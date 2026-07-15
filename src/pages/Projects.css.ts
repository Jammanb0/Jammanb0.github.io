import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const header = style({
  padding: `${vars.space[20]} 0 ${vars.space[10]}`,
})

export const title = style({
  fontSize: vars.fontSize.h1,
  fontWeight: vars.fontWeight.extrabold,
  letterSpacing: '-0.02em',
  color: vars.color.textPrimary,
})

export const subtitle = style({
  marginTop: vars.space[3],
  fontSize: vars.fontSize.bodyLg,
  color: vars.color.textSecondary,
})

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.space[6],
  paddingBottom: vars.space[24],

  '@media': {
    'screen and (max-width: 900px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    'screen and (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
})

export const empty = style({
  padding: `${vars.space[24]} 0`,
  textAlign: 'center',
  color: vars.color.textTertiary,
  fontSize: vars.fontSize.bodyLg,
})
