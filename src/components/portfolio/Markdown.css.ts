import { style, globalStyle } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const wrapper = style({
  fontSize: vars.fontSize.bodyLg,
  lineHeight: vars.lineHeight.body,
  color: vars.color.textSecondary,
})

globalStyle(`${wrapper} > * + *`, {
  marginTop: vars.space[5],
})

globalStyle(`${wrapper} h1, ${wrapper} h2, ${wrapper} h3, ${wrapper} h4`, {
  color: vars.color.textPrimary,
  fontWeight: vars.fontWeight.extrabold,
  letterSpacing: '-0.01em',
  lineHeight: vars.lineHeight.heading,
})

globalStyle(`${wrapper} h1`, { fontSize: vars.fontSize.h3, marginTop: vars.space[10] })
globalStyle(`${wrapper} h2`, { fontSize: vars.fontSize.h4, marginTop: vars.space[10] })
globalStyle(`${wrapper} h3`, { fontSize: vars.fontSize.bodyLg, marginTop: vars.space[8] })

globalStyle(`${wrapper} p`, {
  whiteSpace: 'pre-line',
})

globalStyle(`${wrapper} strong`, {
  color: vars.color.textPrimary,
  fontWeight: vars.fontWeight.bold,
})

globalStyle(`${wrapper} a`, {
  color: vars.color.blue500,
  textDecoration: 'underline',
  textUnderlineOffset: '3px',
})

globalStyle(`${wrapper} ul, ${wrapper} ol`, {
  paddingLeft: vars.space[6],
})

globalStyle(`${wrapper} ul`, { listStyle: 'disc' })
globalStyle(`${wrapper} ol`, { listStyle: 'decimal' })

globalStyle(`${wrapper} li + li`, {
  marginTop: vars.space[2],
})

globalStyle(`${wrapper} blockquote`, {
  borderLeft: `3px solid ${vars.color.blue300}`,
  paddingLeft: vars.space[5],
  color: vars.color.textTertiary,
})

globalStyle(`${wrapper} hr`, {
  border: 'none',
  borderTop: `1px solid ${vars.color.border}`,
})

globalStyle(`${wrapper} code`, {
  backgroundColor: vars.color.gray100,
  color: vars.color.blue700,
  padding: '2px 6px',
  borderRadius: vars.radius.sm,
  fontSize: '0.9em',
  fontFamily:
    "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
})

globalStyle(`${wrapper} pre`, {
  backgroundColor: vars.color.gray900,
  color: vars.color.gray50,
  padding: vars.space[5],
  borderRadius: vars.radius.md,
  overflowX: 'auto',
})

globalStyle(`${wrapper} pre code`, {
  backgroundColor: 'transparent',
  color: 'inherit',
  padding: 0,
})

globalStyle(`${wrapper} table`, {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: vars.fontSize.small,
})

globalStyle(`${wrapper} th, ${wrapper} td`, {
  border: `1px solid ${vars.color.border}`,
  padding: `${vars.space[2]} ${vars.space[3]}`,
  textAlign: 'left',
})

globalStyle(`${wrapper} th`, {
  backgroundColor: vars.color.gray50,
  color: vars.color.textPrimary,
  fontWeight: vars.fontWeight.semibold,
})

globalStyle(`${wrapper} img`, {
  borderRadius: vars.radius.md,
})
