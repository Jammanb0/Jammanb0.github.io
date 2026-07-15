import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const wrapper = style({
  minHeight: '60vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  gap: vars.space[6],
  padding: `${vars.space[24]} ${vars.space[6]}`,
})

export const code = style({
  fontSize: vars.fontSize.display,
  fontWeight: vars.fontWeight.extrabold,
  color: vars.color.blue500,
})

export const message = style({
  fontSize: vars.fontSize.bodyLg,
  color: vars.color.textSecondary,
})
