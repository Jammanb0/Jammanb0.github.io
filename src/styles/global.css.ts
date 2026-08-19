import { globalStyle } from '@vanilla-extract/css'
import { vars } from './theme.css'

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
})

globalStyle('html, body', {
  margin: 0,
  padding: 0,
})

globalStyle('body', {
  backgroundColor: vars.color.background,
  color: vars.color.textPrimary,
  fontFamily: vars.font.family,
  fontSize: vars.fontSize.body,
  lineHeight: vars.lineHeight.body,
  WebkitFontSmoothing: 'antialiased',
  MozOsxFontSmoothing: 'grayscale',
  wordBreak: 'keep-all',
})

globalStyle('#root', {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
})

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
})

globalStyle('button', {
  fontFamily: 'inherit',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  padding: 0,
})

globalStyle('a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible', {
  outline: `3px solid ${vars.color.blue300}`,
  outlineOffset: '3px',
})

globalStyle('ul, ol', {
  margin: 0,
  padding: 0,
  listStyle: 'none',
})

globalStyle('h1, h2, h3, h4, p', {
  margin: 0,
})

globalStyle('img', {
  display: 'block',
  maxWidth: '100%',
})

globalStyle('::selection', {
  backgroundColor: vars.color.blue100,
  color: vars.color.blue700,
})

globalStyle('*, *::before, *::after', {
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      animationDuration: '0.01ms',
      animationIterationCount: '1',
      scrollBehavior: 'auto',
      transitionDuration: '0.01ms',
    },
  },
})
