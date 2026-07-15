import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const card = style({
  display: 'block',
  borderRadius: vars.radius.xl,
  backgroundColor: vars.color.white,
  boxShadow: vars.shadow.card,
  overflow: 'hidden',
  height: '100%',
})

export const thumb = style({
  width: '100%',
  aspectRatio: '16 / 10',
  backgroundColor: vars.color.gray100,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
})

export const thumbFallback = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: vars.fontSize.h2,
  fontWeight: vars.fontWeight.extrabold,
  color: vars.color.blue300,
  background: `linear-gradient(135deg, ${vars.color.blue50}, ${vars.color.gray100})`,
})

export const body = style({
  padding: vars.space[6],
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[3],
})

export const meta = style({
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textTertiary,
})

export const title = style({
  fontSize: vars.fontSize.h4,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.textPrimary,
})

export const summary = style({
  fontSize: vars.fontSize.small,
  color: vars.color.textSecondary,
  lineHeight: vars.lineHeight.body,
})

export const tagRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[2],
  marginTop: vars.space[1],
})

export const moreTag = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: '28px',
  padding: `0 ${vars.space[3]}`,
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.gray100,
  color: vars.color.textTertiary,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
})
