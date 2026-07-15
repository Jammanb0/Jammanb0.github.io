import { recipe, type RecipeVariants } from '@vanilla-extract/recipes'
import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

export const button = recipe({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: vars.space[2],
    fontWeight: vars.fontWeight.semibold,
    borderRadius: vars.radius.full,
    whiteSpace: 'nowrap',
    transition: `transform ${vars.transition.fast}, box-shadow ${vars.transition.fast}, background-color ${vars.transition.fast}, color ${vars.transition.fast}`,
    selectors: {
      '&:active': {
        transform: 'scale(0.97)',
      },
    },
  },
  variants: {
    tone: {
      primary: {
        backgroundColor: vars.color.blue500,
        color: vars.color.white,
        selectors: {
          '&:hover': {
            backgroundColor: vars.color.blue600,
          },
        },
      },
      secondary: {
        backgroundColor: vars.color.gray100,
        color: vars.color.textPrimary,
        selectors: {
          '&:hover': {
            backgroundColor: vars.color.gray200,
          },
        },
      },
      ghost: {
        backgroundColor: 'transparent',
        color: vars.color.textSecondary,
        selectors: {
          '&:hover': {
            backgroundColor: vars.color.gray100,
            color: vars.color.textPrimary,
          },
        },
      },
    },
    size: {
      sm: {
        height: '36px',
        padding: `0 ${vars.space[4]}`,
        fontSize: vars.fontSize.small,
      },
      md: {
        height: '48px',
        padding: `0 ${vars.space[6]}`,
        fontSize: vars.fontSize.body,
      },
      lg: {
        height: '56px',
        padding: `0 ${vars.space[8]}`,
        fontSize: vars.fontSize.bodyLg,
      },
    },
  },
  defaultVariants: {
    tone: 'primary',
    size: 'md',
  },
})

export const iconSlot = style({
  display: 'inline-flex',
  fontSize: '1.1em',
  lineHeight: 1,
})

export type ButtonVariants = RecipeVariants<typeof button>
