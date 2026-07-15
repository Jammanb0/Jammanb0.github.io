import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const header = style({
  position: 'sticky',
  top: 0,
  zIndex: vars.zIndex.header,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${vars.color.border}`,
})

export const inner = style({
  maxWidth: vars.layout.maxWidth,
  margin: '0 auto',
  height: '72px',
  padding: `0 ${vars.space[6]}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
})

export const logo = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[3],
  fontSize: vars.fontSize.h4,
  fontWeight: vars.fontWeight.extrabold,
  color: vars.color.textPrimary,
  letterSpacing: '-0.02em',
})

export const avatar = style({
  width: '32px',
  height: '32px',
  borderRadius: vars.radius.full,
  objectFit: 'cover',
  border: `1px solid ${vars.color.border}`,
})

export const nav = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[8],

  '@media': {
    'screen and (max-width: 640px)': {
      gap: vars.space[4],
    },
  },
})

export const navLink = style({
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textSecondary,
  transition: `color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      color: vars.color.textPrimary,
    },
  },
})

export const navLinkActive = style({
  color: vars.color.blue500,
})
