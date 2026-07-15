import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const section = style({
  padding: `${vars.space[16]} 0`,
})

export const sectionHead = style({
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'space-between',
  marginBottom: vars.space[10],
  gap: vars.space[4],
})

export const sectionTitle = style({
  fontSize: vars.fontSize.h2,
  fontWeight: vars.fontWeight.extrabold,
  color: vars.color.textPrimary,
  letterSpacing: '-0.02em',
})

export const sectionLink = style({
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.blue500,
  whiteSpace: 'nowrap',
})

export const grid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: vars.space[6],

  '@media': {
    'screen and (max-width: 900px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    'screen and (max-width: 600px)': {
      gridTemplateColumns: '1fr',
    },
  },
})

export const ctaSection = style({
  padding: `${vars.space[24]} 0`,
  textAlign: 'center',
})

export const ctaTitle = style({
  fontSize: vars.fontSize.h2,
  fontWeight: vars.fontWeight.extrabold,
  color: vars.color.textPrimary,
  marginBottom: vars.space[8],
})
