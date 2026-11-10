import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const footer = style({
  borderTop: `1px solid ${vars.color.border}`,
  backgroundColor: 'rgba(242, 243, 245, 0.9)',
})

export const inner = style({
  maxWidth: vars.layout.wide,
  margin: '0 auto',
  padding: `${vars.space[8]} ${vars.space[6]} ${vars.space[10]}`,
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space[4],
  '@media': {
    'screen and (max-width: 1079px)': {
      // 좁은 화면에서는 아래쪽 안내 줄에 가리지 않게 여백을 둡니다
      paddingBottom: '96px',
    },
  },
})

export const copyright = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.textTertiary,
})

export const credit = style({
  marginTop: vars.space[1],
  fontSize: vars.fontSize.caption,
  color: vars.color.textTertiary,
})

export const creditLink = style({
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
  selectors: {
    '&:hover': {
      color: vars.color.textPrimary,
    },
  },
})

export const socialRow = style({
  display: 'flex',
  gap: vars.space[5],
})

export const socialLink = style({
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.textSecondary,
  transition: `color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      color: vars.color.blue500,
    },
  },
})
