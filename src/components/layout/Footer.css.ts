import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const footer = style({
  borderTop: `1px solid ${vars.color.border}`,
  marginTop: vars.space[24],
})

export const inner = style({
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  padding: `${vars.space[10]} ${vars.space[6]}`,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[4],
})

export const copyright = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.textTertiary,
})

export const socialRow = style({
  display: 'flex',
  gap: vars.space[5],
})

export const socialLink = style({
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.textSecondary,
  transition: `color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      color: vars.color.blue500,
    },
  },
})
