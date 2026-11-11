import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

/**
 * 페이지를 넘겨도 남아 있는 안내 터미널의 껍데기.
 * dock: 소개 페이지 옆 패널 자리에 크게(위치·크기는 스크립트가 자리에 맞춰 넣습니다)
 * mini: 다른 페이지나 좁은 화면에서 오른쪽 아래 작은 바
 */
export const shell = style({
  position: 'fixed',
  // 옆 패널에 크게 붙어 있을 때는 사원증(20)보다 아래: 사원증을 끌어 패널 위로 올릴 수 있게 합니다
  zIndex: 15,
  selectors: {
    '&[data-mode="mini"]': {
      right: vars.space[5],
      bottom: vars.space[5],
      width: 'min(400px, calc(100vw - 24px))',
      height: '46px',
      // 작은 바는 화면 구석에 떠 있는 도구라 사원증(20)에 가려지지 않게 위에 둡니다.
      // 펼친 로그·커밋 목록도 이 껍데기 안에 있어서 함께 위에 옵니다
      zIndex: 30,
    },
    '&[data-mode="mini"][data-panel="log"]': {
      height: 'min(320px, 60vh)',
    },
  },
  '@media': {
    'screen and (max-width: 640px)': {
      selectors: {
        '&[data-mode="mini"]': {
          right: vars.space[3],
          left: vars.space[3],
          bottom: `calc(${vars.space[3]} + env(safe-area-inset-bottom, 0px))`,
          width: 'auto',
        },
      },
    },
  },
})
