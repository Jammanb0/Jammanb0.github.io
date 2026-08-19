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

  '@media': {
    'screen and (max-width: 600px)': {
      flexDirection: 'column',
      alignItems: 'stretch',
    },
  },
})

export const searchInputWrap = style({
  position: 'relative',
  flex: '1 1 280px',
  minWidth: '220px',

  '@media': {
    'screen and (max-width: 600px)': {
      // `searchRow` switches to flex-direction: column here, which would
      // otherwise reinterpret the 280px flex-basis above as a height.
      flex: 'none',
      minWidth: 0,
    },
  },
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
      borderColor: vars.color.blue300,
      backgroundColor: vars.color.white,
    },
  },
})

export const yearDropdown = style({
  position: 'relative',
  flexShrink: 0,

  '@media': {
    'screen and (max-width: 600px)': {
      width: '100%',
    },
  },
})

export const yearTrigger = style({
  display: 'block',
  height: '48px',
  // Fixed so switching between "전체 연도" and e.g. "2026년" never changes
  // this button's own width — otherwise the search input next to it (which
  // grows to fill the row) visibly resizes every time the year changes.
  minWidth: '124px',
  borderRadius: vars.radius.full,
  border: `1px solid ${vars.color.border}`,
  backgroundColor: vars.color.backgroundAlt,
  padding: `0 ${vars.space[10]} 0 ${vars.space[5]}`,
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textPrimary,
  cursor: 'pointer',
  appearance: 'none',
  WebkitAppearance: 'none',
  transition: `border-color ${vars.transition.fast}, background-color ${vars.transition.fast}`,
  '@media': {
    '(hover: hover)': {
      selectors: {
        '&:hover': {
          borderColor: vars.color.blue300,
        },
      },
    },
    'screen and (max-width: 600px)': {
      width: '100%',
    },
  },
})

export const yearChevron = style({
  display: 'inline-flex',
  position: 'absolute',
  right: vars.space[4],
  top: '50%',
  transform: 'translateY(-50%)',
  color: vars.color.textTertiary,
  pointerEvents: 'none',
})

export const visuallyHidden = style({
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
  '@media': {
    '(hover: hover)': {
      selectors: {
        '&:hover': {
          borderColor: vars.color.blue300,
          color: vars.color.blue600,
        },
      },
    },
  },
})

export const tagButtonActive = style({
  backgroundColor: vars.color.blue500,
  borderColor: vars.color.blue500,
  color: vars.color.white,
  '@media': {
    '(hover: hover)': {
      selectors: {
        '&:hover': {
          color: vars.color.white,
        },
      },
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
