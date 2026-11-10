import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const root = style({
  position: 'relative',
  flex: '1 1 320px',
  minWidth: 0,
})

/** 고른 태그 칩과 입력칸이 한 줄에 들어가는 검색창 */
export const field = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '6px',
  minHeight: '46px',
  padding: '6px 14px 6px 42px',
  borderRadius: '23px',
  border: `1px solid ${vars.color.gray200}`,
  backgroundColor: vars.color.gray50,
  cursor: 'text',
  transition: `border-color ${vars.transition.fast}, background-color ${vars.transition.fast}`,
  selectors: {
    '&:focus-within': {
      borderColor: vars.color.blue300,
      backgroundColor: vars.color.white,
    },
  },
})

export const icon = style({
  position: 'absolute',
  top: '23px',
  left: '16px',
  transform: 'translateY(-50%)',
  display: 'inline-flex',
  color: vars.color.textTertiary,
  pointerEvents: 'none',
})

export const chips = style({
  display: 'contents',
})

export const chip = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  height: '30px',
  padding: '0 4px 0 10px',
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.blue50,
  color: vars.color.blue700,
  fontSize: '13px',
  fontWeight: vars.fontWeight.semibold,
  whiteSpace: 'nowrap',
})

export const chipRemove = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '22px',
  height: '22px',
  borderRadius: '50%',
  color: vars.color.blue600,
  fontSize: '15px',
  lineHeight: 1,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.blue100,
    },
  },
})

export const input = style({
  flex: '1 1 120px',
  minWidth: '120px',
  height: '32px',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  fontFamily: 'inherit',
  fontSize: vars.fontSize.small,
  color: vars.color.textPrimary,
  selectors: {
    '&::placeholder': {
      color: vars.color.textTertiary,
    },
  },
})

export const menu = style({
  position: 'absolute',
  top: 'calc(100% + 6px)',
  left: 0,
  right: 0,
  zIndex: 10,
  padding: vars.space[2],
  borderRadius: '16px',
  backgroundColor: vars.color.white,
  boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06), 0 18px 40px -12px rgba(15, 23, 42, 0.25)',
})

export const menuTitle = style({
  padding: `${vars.space[1]} ${vars.space[2]} ${vars.space[2]}`,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textTertiary,
})

export const options = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
})

export const option = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  height: '32px',
  padding: '0 12px',
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.gray100,
  color: vars.color.textPrimary,
  fontSize: '13px',
  fontWeight: vars.fontWeight.semibold,
  cursor: 'pointer',
  userSelect: 'none',
  selectors: {
    '&[aria-selected="true"]': {
      backgroundColor: vars.color.blue500,
      color: vars.color.white,
    },
  },
})

export const optionCount = style({
  fontFamily: vars.font.mono,
  fontSize: '11px',
  opacity: 0.7,
})

export const hint = style({
  padding: `${vars.space[2]} ${vars.space[2]} ${vars.space[1]}`,
  fontSize: vars.fontSize.caption,
  color: vars.color.textTertiary,
})
