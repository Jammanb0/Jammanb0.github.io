import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const container = style({
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  padding: `0 ${vars.space[6]}`,
})
