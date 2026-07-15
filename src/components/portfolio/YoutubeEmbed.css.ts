import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const wrapper = style({
  position: 'relative',
  width: '100%',
  aspectRatio: '16 / 9',
  borderRadius: vars.radius.lg,
  overflow: 'hidden',
  backgroundColor: vars.color.gray900,
})

export const iframe = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  border: 'none',
})
