import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const wrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[5],
  marginBottom: vars.space[10],
})

export const searchRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[4],
  flexWrap: 'wrap',
})

export const searchInputWrap = style({
  position: 'relative',
  flex: '1 1 280px',
  minWidth: '220px',
})

export const searchIcon = style({
  position: 'absolute',
  left: vars.space[4],
  top: '50%',
  transform: 'translateY(-50%)',
  color: vars.color.textTertiary,
  display: 'inline-flex',
  pointerEvents: 'none',
})

export const searchInput = style({
  width: '100%',
  height: '48px',
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.backgroundAlt,
  padding: `0 ${vars.space[5]} 0 ${vars.space[10]}`,
  fontSize: vars.fontSize.small,
  color: vars.color.textPrimary,
  transition: `border-color ${vars.transition.fast}, background-color ${vars.transition.fast}`,
  selectors: {
    '&::placeholder': {
      color: vars.color.textTertiary,
    },
    '&:focus': {
      outline: 'none',
      borderColor: vars.color.blue300,
      backgroundColor: vars.color.white,
    },
  },
})

export const yearDropdown = style({
  position: 'relative',
  flexShrink: 0,
})

export const yearTrigger = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space[2],
  height: '48px',
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.backgroundAlt,
  padding: `0 ${vars.space[4]} 0 ${vars.space[5]}`,
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textPrimary,
  cursor: 'pointer',
  transition: `border-color ${vars.transition.fast}, background-color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      borderColor: vars.color.blue300,
    },
  },
})

export const yearTriggerOpen = style({
  borderColor: vars.color.blue300,
  backgroundColor: vars.color.white,
})

export const yearChevron = style({
  display: 'inline-flex',
  color: vars.color.textTertiary,
  transition: `transform ${vars.transition.fast}`,
})

export const yearChevronOpen = style({
  transform: 'rotate(180deg)',
})

export const yearMenu = style({
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  minWidth: '160px',
  backgroundColor: vars.color.white,
  border: `1px solid ${vars.color.border}`,
  borderRadius: vars.radius.md,
  boxShadow: vars.shadow.floating,
  padding: vars.space[2],
  zIndex: 10,
})

export const yearOption = style({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  padding: `${vars.space[3]} ${vars.space[4]}`,
  borderRadius: vars.radius.sm,
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.medium,
  color: vars.color.textSecondary,
  transition: `background-color ${vars.transition.fast}, color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray50,
    },
  },
})

export const yearOptionActive = style({
  color: vars.color.blue600,
  fontWeight: vars.fontWeight.bold,
  backgroundColor: vars.color.blue50,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.blue50,
    },
  },
})

export const tagModeRow = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space[2],
})

export const tagModeLabel = style({
  fontSize: vars.fontSize.caption,
  color: vars.color.textTertiary,
  marginRight: vars.space[1],
})

export const tagModeButton = style({
  height: '26px',
  padding: `0 ${vars.space[3]}`,
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.white,
  color: vars.color.textTertiary,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  transition: `background-color ${vars.transition.fast}, border-color ${vars.transition.fast}, color ${vars.transition.fast}`,
})

export const tagModeButtonActive = style({
  backgroundColor: vars.color.gray900,
  borderColor: vars.color.gray900,
  color: vars.color.white,
})

export const tagRow = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[2],
})

export const tagButton = style({
  height: '32px',
  padding: `0 ${vars.space[4]}`,
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.white,
  color: vars.color.textSecondary,
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  transition: `background-color ${vars.transition.fast}, border-color ${vars.transition.fast}, color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      borderColor: vars.color.blue300,
      color: vars.color.blue600,
    },
  },
})

export const tagButtonActive = style({
  backgroundColor: vars.color.blue500,
  borderColor: vars.color.blue500,
  color: vars.color.white,
  selectors: {
    '&:hover': {
      color: vars.color.white,
    },
  },
})

export const resultRow = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  fontSize: vars.fontSize.caption,
  color: vars.color.textTertiary,
})

export const clearButton = style({
  color: vars.color.blue500,
  fontWeight: vars.fontWeight.semibold,
})
