import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const list = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[3],
})

export const linkItem = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[2],
  height: '44px',
  padding: `0 ${vars.space[5]}`,
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border}`,
  color: vars.color.textPrimary,
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  transition: `background-color ${vars.transition.fast}, border-color ${vars.transition.fast}, transform ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray50,
      borderColor: vars.color.gray300,
    },
    '&:active': {
      transform: 'scale(0.97)',
    },
  },
})

export const iconWrap = style({
  display: 'inline-flex',
  width: '16px',
  height: '16px',
})
