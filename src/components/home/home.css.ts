import { globalStyle, style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

const mobile = 'screen and (max-width: 760px)'

/**
 * 첫 화면이 한 줄로 쌓이는 폭. 이때는 소개 문구가 먼저 나오고 사원증은 그 아래 칸에 걸립니다.
 * HeroSection도 이 값으로 사원증 걸 자리를 정합니다
 */
export const HERO_STACKED = 'screen and (max-width: 860px)'

// ── 묶음(내 이야기, 만든 것들) ───────────────────────────

export const group = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[8],
})

export const groupHead = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'baseline',
  gap: `${vars.space[2]} ${vars.space[3]}`,
  padding: `0 ${vars.space[1]}`,
})

export const groupTitle = style({
  fontSize: vars.fontSize.h3,
  fontWeight: vars.fontWeight.extrabold,
  letterSpacing: '-0.02em',
  color: vars.color.textPrimary,
})

export const groupNote = style({
  fontSize: vars.fontSize.small,
  color: vars.color.textTertiary,
})

// ── 첫 화면 ─────────────────────────────────────────────

export const heroFrame = style({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) 260px',
  gap: vars.space[6],
  minHeight: '500px',
  padding: '44px 44px 40px',
  '@media': {
    [HERO_STACKED]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gap: vars.space[2],
      padding: '28px 22px 32px',
    },
  },
})

export const heroText = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: vars.space[5],
  minWidth: 0,
})

export const chip = style({
  alignSelf: 'flex-start',
  display: 'inline-flex',
  alignItems: 'center',
  height: '30px',
  padding: '0 14px',
  fontSize: '13px',
  fontWeight: vars.fontWeight.bold,
})

export const heroTitle = style({
  fontSize: 'clamp(2.25rem, 5vw, 3.5rem)',
  fontWeight: vars.fontWeight.extrabold,
  lineHeight: 1.15,
  letterSpacing: '-0.03em',
  whiteSpace: 'pre-line',
  color: vars.color.textPrimary,
})

export const heroIntro = style({
  maxWidth: '30em',
  fontSize: vars.fontSize.bodyLg,
  color: vars.color.textSecondary,
})

export const heroActions = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[3],
  marginTop: vars.space[2],
})

export const badgeColumn = style({
  position: 'relative',
  // 사원증을 끌어당기면 옆 패널(터미널·커밋 기록)과 다른 구역, 조립 선택 상자(12)보다 위로
  // 올라오게 합니다. 헤더(100)와 화면 구석의 작은 바 터미널(30)보다는 아래입니다
  zIndex: 20,
  minHeight: '460px',
  '@media': {
    // 좁은 화면에서는 누구인지·무엇을 만들었는지가 먼저 보이도록 소개 문구 다음에 둡니다
    [HERO_STACKED]: {
      minHeight: '440px',
    },
  },
})

// ── 이야기 카드 ─────────────────────────────────────────

export const card = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[4],
  padding: '36px 40px',
  '@media': {
    [mobile]: {
      padding: '26px 22px',
    },
  },
})

export const eyebrow = style({
  fontFamily: vars.font.mono,
  fontSize: '12px',
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.blue600,
})

export const cardTitle = style({
  fontSize: vars.fontSize.h4,
  fontWeight: vars.fontWeight.extrabold,
  letterSpacing: '-0.01em',
  color: vars.color.textPrimary,
})

export const paragraph = style({
  fontSize: '1.0625rem',
  lineHeight: 1.8,
  color: vars.color.textSecondary,
})

export const timeline = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[6],
  marginTop: vars.space[1],
})

export const timelineItem = style({
  display: 'grid',
  gridTemplateColumns: '150px minmax(0, 1fr)',
  gap: vars.space[5],
  '@media': {
    [mobile]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gap: '6px',
    },
  },
})

export const period = style({
  paddingTop: '3px',
  fontFamily: vars.font.mono,
  fontSize: '13px',
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.blue600,
  whiteSpace: 'nowrap',
})

export const itemBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[3],
  minWidth: 0,
})

export const itemText = style({
  lineHeight: 1.8,
  color: vars.color.textSecondary,
})

export const chips = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[2],
  maxWidth: '100%',
})

globalStyle(`${chips} > li`, {
  maxWidth: '100%',
  minWidth: 0,
})

export const chipLink = style({
  display: 'inline-block',
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  height: '30px',
  lineHeight: '30px',
  padding: '0 12px',
  borderRadius: vars.radius.full,
  backgroundColor: vars.color.gray100,
  color: vars.color.textPrimary,
  fontSize: '13px',
  fontWeight: vars.fontWeight.semibold,
  transition: `background-color ${vars.transition.fast}, color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.blue50,
      color: vars.color.blue600,
    },
  },
})

// ── 만든 것들 ───────────────────────────────────────────

export const introText = style({
  padding: `0 ${vars.space[1]}`,
  color: vars.color.textSecondary,
})

export const projectCard = style({
  position: 'relative',
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 1fr)',
  alignItems: 'center',
  gap: vars.space[8],
  padding: vars.space[5],
  selectors: {
    '&[data-bt-visible="true"]:not([data-bt-raw="true"]):hover': {
      transform: 'translateY(-4px)',
    },
  },
  '@media': {
    [mobile]: {
      gridTemplateColumns: 'minmax(0, 1fr)',
      gap: vars.space[4],
      padding: vars.space[3],
    },
  },
})

export const thumb = style({
  position: 'relative',
  aspectRatio: '16 / 10',
  overflow: 'hidden',
})

export const thumbInner = style({
  position: 'absolute',
  inset: 0,
})

export const thumbImage = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})

export const thumbFallback = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  fontSize: vars.fontSize.h2,
  fontWeight: vars.fontWeight.extrabold,
  color: vars.color.blue300,
})

export const projectBody = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[3],
  minWidth: 0,
  padding: `${vars.space[2]} ${vars.space[3]} ${vars.space[2]} 0`,
  '@media': {
    [mobile]: {
      padding: `0 ${vars.space[2]} ${vars.space[2]}`,
    },
  },
})

export const projectMeta = style({
  fontSize: vars.fontSize.caption,
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textTertiary,
})

export const projectTitle = style({
  fontSize: vars.fontSize.h4,
  fontWeight: vars.fontWeight.extrabold,
  lineHeight: 1.35,
  letterSpacing: '-0.01em',
  color: vars.color.textPrimary,
})

/** 카드 전체를 덮는 링크. 카드 어디를 눌러도 상세 페이지로 갑니다 */
export const stretchedLink = style({
  outline: 'none',
  '::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: '24px',
  },
})

globalStyle(`${projectCard}:has(${stretchedLink}:focus-visible)`, {
  outline: `3px solid ${vars.color.blue300}`,
  outlineOffset: '4px',
})

export const summary = style({
  fontSize: '0.9375rem',
  lineHeight: 1.7,
  color: vars.color.textSecondary,
})

export const tags = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
})

export const more = style({
  fontSize: vars.fontSize.small,
  fontWeight: vars.fontWeight.bold,
  color: vars.color.blue600,
})

// ── 마무리 ──────────────────────────────────────────────

export const outroCard = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space[3],
  padding: '40px 44px',
  '@media': {
    [mobile]: {
      padding: '28px 22px',
    },
  },
})

export const outroTitle = style({
  fontSize: vars.fontSize.h3,
  fontWeight: vars.fontWeight.extrabold,
  letterSpacing: '-0.02em',
})

export const outroText = style({
  fontSize: vars.fontSize.bodyLg,
  opacity: 0.75,
})

export const outroLinks = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: vars.space[3],
  marginTop: vars.space[2],
})

export const outroLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  height: '44px',
  padding: '0 18px',
  borderRadius: vars.radius.full,
  border: '1px solid rgba(255, 255, 255, 0.24)',
  fontWeight: vars.fontWeight.semibold,
  transition: `background-color ${vars.transition.fast}`,
  selectors: {
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
  },
})
