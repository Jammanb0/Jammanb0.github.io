import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

const narrow = 'screen and (max-width: 1079px)'

export const page = style({
  display: 'grid',
  gridTemplateColumns: `minmax(0, 1fr) ${vars.layout.aside}`,
  alignItems: 'start',
  gap: vars.space[8],
  width: '100%',
  maxWidth: vars.layout.wide,
  margin: '0 auto',
  padding: `${vars.space[8]} ${vars.space[6]} ${vars.space[24]}`,
  '@media': {
    [narrow]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
      padding: `${vars.space[6]} ${vars.space[4]} 120px`,
    },
  },
})

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[16],
  minWidth: 0,
})

export const aside = style({
  position: 'sticky',
  top: `calc(${vars.layout.header} + ${vars.space[6]})`,
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[4],
  height: `calc(100vh - ${vars.layout.header} - ${vars.space[12]})`,
  minHeight: '420px',
  '@media': {
    [narrow]: {
      display: 'none',
    },
  },
})

export const terminal = style({
  flex: '1 1 58%',
})

export const rail = style({
  flex: '1 1 42%',
})
