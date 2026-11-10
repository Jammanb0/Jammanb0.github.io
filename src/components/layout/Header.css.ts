import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const header = style({
  position: 'sticky',
  top: 0,
  zIndex: vars.zIndex.header,
  backgroundColor: 'rgba(242, 243, 245, 0.82)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  borderBottom: `1px solid ${vars.color.border}`,
})

export const inner = style({
  maxWidth: vars.layout.wide,
  margin: '0 auto',
  height: vars.layout.header,
  padding: `0 ${vars.space[6]}`,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[4],
  '@media': {
    'screen and (max-width: 640px)': {
      padding: `0 ${vars.space[4]}`,
    },
  },
})

export const logo = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[3],
  flexShrink: 0,
  fontSize: vars.fontSize.bodyLg,
  fontWeight: vars.fontWeight.extrabold,
  color: vars.color.textPrimary,
  letterSpacing: '-0.02em',
  whiteSpace: 'nowrap',
  '@media': {
    'screen and (max-width: 480px)': {
      gap: vars.space[2],
      fontSize: vars.fontSize.body,
    },
  },
})

/** 사진 틀. 동그란 모양(border-radius)은 조립할 때 붙는 CSS가 맡습니다 */
export const avatarBox = style({
  display: 'inline-flex',
  flexShrink: 0,
  width: '30px',
  height: '30px',
  overflow: 'hidden',
  boxShadow: `inset 0 0 0 1px ${vars.color.border}`,
})

export const avatar = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

/** GitHub 아이콘을 감싸는 칸. 옮겨 놓는 움직임이 먹도록 인라인 블록으로 둡니다 */
export const iconWrap = style({
  display: 'inline-flex',
})

export const nav = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[6],
  '@media': {
    'screen and (max-width: 640px)': {
      gap: vars.space[4],
    },
    'screen and (max-width: 400px)': {
      gap: vars.space[3],
    },
  },
})

export const navLink = style({
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textSecondary,
  whiteSpace: 'nowrap',
  transition: `color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      color: vars.color.textPrimary,
    },
  },
  '@media': {
    'screen and (max-width: 400px)': {
      fontSize: '13px',
    },
  },
})

export const navLinkActive = style({
  color: vars.color.blue500,
})

export const iconLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '32px',
  height: '32px',
  borderRadius: vars.radius.full,
  color: vars.color.textSecondary,
  transition: `color ${vars.transition.fast}, background-color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      color: vars.color.textPrimary,
      backgroundColor: vars.color.gray200,
    },
  },
})
