import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const frame = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: vars.space[4],
  padding: '56px 32px',
  textAlign: 'center',
})

export const code = style({
  fontFamily: vars.font.mono,
  fontSize: 'clamp(3rem, 8vw, 4.5rem)',
  fontWeight: vars.fontWeight.bold,
  lineHeight: 1,
  color: vars.color.blue500,
})

export const message = style({
  fontSize: vars.fontSize.h4,
  fontWeight: vars.fontWeight.extrabold,
  color: vars.color.textPrimary,
})

export const actions = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: vars.space[3],
  marginTop: vars.space[2],
})
