import { createVar, style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

/** 0~1. 카드가 흔들릴 때 광택이 지나가는 위치 */
export const gloss = createVar()

const STRAP = '#1E2430'

export const area = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  minHeight: '460px',
  perspective: '1100px',
  pointerEvents: 'none',
  '@media': {
    'screen and (max-width: 720px)': {
      minHeight: '440px',
    },
  },
})

export const strap = style({
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
  overflow: 'visible',
  pointerEvents: 'none',
  zIndex: 1,
  selectors: {
    '&[data-visible="false"]': {
      visibility: 'hidden',
    },
  },
})

export const bandShadow = style({
  fill: 'none',
  stroke: 'rgba(15, 23, 42, 0.16)',
  strokeWidth: 15,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  transform: 'translate(4px, 6px)',
})

export const band = style({
  fill: 'none',
  stroke: STRAP,
  strokeWidth: 14,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
})

export const bandText = style({
  fill: 'rgba(255, 255, 255, 0.8)',
  fontFamily: vars.font.mono,
  fontSize: '7.5px',
  fontWeight: vars.fontWeight.bold,
  letterSpacing: '0.2em',
  dominantBaseline: 'central',
})

export const peg = style({
  position: 'absolute',
  left: '50%',
  width: '34px',
  height: '12px',
  borderRadius: '6px',
  transform: 'translate(-50%, -50%)',
  background: `linear-gradient(180deg, #4B5563, ${STRAP})`,
  boxShadow: '0 2px 4px rgba(15, 23, 42, 0.25)',
  zIndex: 2,
  selectors: {
    '&[data-visible="false"]': {
      visibility: 'hidden',
    },
  },
})

export const card = style({
  vars: { [gloss]: '0.5' },
  position: 'absolute',
  top: 0,
  left: 0,
  width: '200px',
  transformOrigin: '50% 0',
  transformStyle: 'preserve-3d',
  willChange: 'transform',
  pointerEvents: 'auto',
  cursor: 'grab',
  touchAction: 'none',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  zIndex: 3,
  selectors: {
    '&[data-visible="false"]': {
      visibility: 'hidden',
    },
    '&[data-dragging="true"]': {
      cursor: 'grabbing',
    },
  },
  '@media': {
    'screen and (max-width: 720px)': {
      width: '172px',
    },
  },
})

/** 줄 끝 금속 고리와 집게. 요소 맨 위 가운데가 줄이 걸리는 지점입니다 */
export const clip = style({
  position: 'relative',
  height: '24px',
  margin: '0 auto',
  width: '30px',
  transform: 'translateZ(1px)',
  '::before': {
    content: '""',
    position: 'absolute',
    left: '50%',
    top: '-7px',
    width: '16px',
    height: '16px',
    marginLeft: '-8px',
    borderRadius: '50%',
    border: '3px solid #9AA4B2',
    boxSizing: 'border-box',
  },
  '::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    right: 0,
    top: '6px',
    height: '22px',
    borderRadius: '5px',
    background: 'linear-gradient(180deg, #D7DCE3, #9AA4B2)',
    boxShadow: 'inset 0 -2px 0 rgba(0, 0, 0, 0.12)',
  },
})

const face = style({
  borderRadius: '16px',
  overflow: 'hidden',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
})

export const faces = style({
  position: 'relative',
  transformStyle: 'preserve-3d',
})

export const front = style([
  face,
  {
    position: 'relative',
    backgroundColor: vars.color.white,
    boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08), 0 22px 44px rgba(15, 23, 42, 0.18)',
    '::after': {
      content: '""',
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background:
        'linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.55) 45%, transparent 60%)',
      backgroundSize: '260% 100%',
      backgroundPosition: `calc(${gloss} * 100%) 0`,
      mixBlendMode: 'soft-light',
    },
  },
])

export const back = style([
  face,
  {
    position: 'absolute',
    inset: 0,
    transform: 'rotateY(180deg)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '28px 22px 22px',
    background: `linear-gradient(160deg, #1B2333, ${STRAP})`,
    color: vars.color.white,
  },
])

export const topBand = style({
  position: 'relative',
  height: '46px',
  padding: '22px 16px 0',
  background: `linear-gradient(135deg, ${vars.color.blue500}, ${vars.color.blue700})`,
  color: vars.color.white,
  fontFamily: vars.font.mono,
  fontSize: '9px',
  fontWeight: vars.fontWeight.bold,
  letterSpacing: '0.22em',
  textAlign: 'center',
})

/** 카드 위쪽 끈 구멍 */
export const slot = style({
  position: 'absolute',
  top: '8px',
  left: '50%',
  width: '40px',
  height: '7px',
  marginLeft: '-20px',
  borderRadius: '4px',
  backgroundColor: 'rgba(16, 18, 22, 0.45)',
})

export const photoWrap = style({
  width: '62%',
  // 파란 띠 아래에서 떨어져 시작합니다(띠가 사진 영역까지 내려오지 않게)
  margin: '14px auto 0',
  aspectRatio: '413 / 531',
  borderRadius: '10px',
  overflow: 'hidden',
  border: `3px solid ${vars.color.white}`,
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.16)',
  backgroundColor: vars.color.gray100,
})

export const photo = style({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  pointerEvents: 'none',
})

export const info = style({
  padding: '12px 16px 16px',
  textAlign: 'center',
})

export const nameKo = style({
  fontSize: '21px',
  fontWeight: vars.fontWeight.extrabold,
  letterSpacing: '0.08em',
  color: vars.color.textPrimary,
  lineHeight: 1.3,
})

export const nameEn = style({
  marginTop: '2px',
  fontSize: '12px',
  fontWeight: vars.fontWeight.semibold,
  color: vars.color.textTertiary,
})

export const role = style({
  marginTop: '8px',
  fontFamily: vars.font.mono,
  fontSize: '9.5px',
  fontWeight: vars.fontWeight.bold,
  letterSpacing: '0.16em',
  color: vars.color.blue600,
})

export const foot = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '5px',
  marginTop: '12px',
  paddingTop: '10px',
  borderTop: `1px dashed ${vars.color.gray200}`,
})

export const barcode = style({
  display: 'flex',
  alignItems: 'stretch',
  gap: '1.5px',
  height: '16px',
})

export const bar = style({
  backgroundColor: vars.color.gray800,
})

export const site = style({
  fontFamily: vars.font.mono,
  fontSize: '8.5px',
  color: vars.color.textTertiary,
})

export const backTagline = style({
  fontSize: '18px',
  fontWeight: vars.fontWeight.extrabold,
  lineHeight: 1.45,
  whiteSpace: 'pre-line',
})

export const backFoot = style({
  fontFamily: vars.font.mono,
  fontSize: '9px',
  letterSpacing: '0.12em',
  color: 'rgba(255, 255, 255, 0.6)',
})
