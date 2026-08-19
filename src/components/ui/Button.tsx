import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { button, type ButtonVariants } from './Button.css'

type BaseProps = ButtonVariants & {
  children: ReactNode
  icon?: ReactNode
}

type ButtonAsButton = BaseProps & {
  href?: undefined
  to?: undefined
  onClick?: () => void
  type?: 'button' | 'submit'
}

type ButtonAsAnchor = BaseProps & {
  href: string
  to?: undefined
  target?: string
  rel?: string
}

type ButtonAsLink = BaseProps & {
  to: string
  href?: undefined
}

type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink

const MotionLink = motion.create(Link)

export function Button(props: ButtonProps) {
  const shouldReduceMotion = useReducedMotion()
  const { children, icon, tone, size } = props
  const className = button({ tone, size })

  if ('to' in props && props.to) {
    return (
      <MotionLink
        to={props.to}
        className={className}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      >
        {icon}
        {children}
      </MotionLink>
    )
  }

  if ('href' in props && props.href) {
    return (
      <motion.a
        href={props.href}
        target={props.target}
        rel={props.rel}
        className={className}
        whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
      >
        {icon}
        {children}
      </motion.a>
    )
  }

  const { onClick, type = 'button' } = props as ButtonAsButton
  return (
    <motion.button
      type={type}
      onClick={onClick}
      className={className}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
    >
      {icon}
      {children}
    </motion.button>
  )
}
