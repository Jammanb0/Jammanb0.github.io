import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const tag = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: '28px',
  padding: `0 ${vars.space[3]}`,
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.blue50,
  color: vars.color.blue600,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
})
