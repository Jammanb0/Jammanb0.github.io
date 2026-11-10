import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from './theme.css'

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
})

globalStyle('html', {
  // 고정 헤더 아래로 앵커가 가려지지 않게
  scrollPaddingTop: `calc(${vars.layout.header} + 24px)`,
})

globalStyle('html, body', {
  margin: 0,
  padding: 0,
})

globalStyle('body', {
  // 사원증을 끌어 화면 밖으로 내보내도 가로 스크롤이 생기지 않게 화면 가장자리에서만 자릅니다
  overflowX: 'clip',
  backgroundColor: vars.color.canvas,
  // 디자인 도구 캔버스의 점 격자
  backgroundImage: `radial-gradient(${vars.color.canvasDot} 1px, transparent 1.2px)`,
  backgroundSize: '22px 22px',
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
  color: 'inherit',
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

/** 화면에는 안 보이고 스크린리더만 읽는 텍스트 */
export const srOnly = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: 0,
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
})
