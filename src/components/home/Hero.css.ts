import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const section = style({
  position: 'relative',
  overflow: 'hidden',
  padding: `${vars.space[32]} 0 ${vars.space[24]}`,

  '@media': {
    'screen and (max-width: 640px)': {
      padding: `${vars.space[20]} 0 ${vars.space[16]}`,
    },
  },
})

export const blob = style({
  position: 'absolute',
  width: '640px',
  height: '640px',
  borderRadius: '50%',
  background: `radial-gradient(circle at 30% 30%, ${vars.color.blue100}, transparent 70%)`,
  top: '-220px',
  right: '-160px',
  filter: 'blur(20px)',
  pointerEvents: 'none',
  zIndex: 0,
})

export const blobSecondary = style({
  position: 'absolute',
  width: '420px',
  height: '420px',
  borderRadius: '50%',
  background: `radial-gradient(circle at 60% 40%, ${vars.color.blue50}, transparent 70%)`,
  bottom: '-160px',
  left: '-120px',
  filter: 'blur(24px)',
  pointerEvents: 'none',
  zIndex: 0,
})

export const content = style({
  position: 'relative',
  zIndex: 1,
})

export const eyebrow = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: '32px',
  padding: `0 ${vars.space[4]}`,
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.blue50,
  color: vars.color.blue600,
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  marginBottom: vars.space[6],
})

export const headline = style({
  fontSize: vars.fontSize.display,
  fontWeight: vars.fontWeight.extrabold,
  lineHeight: vars.lineHeight.display,
  letterSpacing: '-0.03em',
  color: vars.color.textPrimary,
  maxWidth: '18ch',
  whiteSpace: 'pre-line',

  '@media': {
    'screen and (max-width: 640px)': {
      fontSize: vars.fontSize.h1,
    },
  },
})

export const headlineLine = style({
  overflow: 'hidden',
  display: 'block',
})

export const bio = style({
  marginTop: vars.space[6],
  fontSize: vars.fontSize.bodyLg,
  color: vars.color.textSecondary,
  maxWidth: '52ch',
  lineHeight: vars.lineHeight.body,
})

export const actions = style({
  display: 'flex',
  gap: vars.space[3],
  marginTop: vars.space[10],
})
