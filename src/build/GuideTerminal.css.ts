import { style } from '@vanilla-extract/css'
import { vars } from '@/styles/theme.css'

/**
 * 페이지를 넘겨도 남아 있는 안내 터미널의 껍데기.
 * dock: 소개 페이지 옆 패널 자리에 크게(위치·크기는 스크립트가 자리에 맞춰 넣습니다)
 * mini: 다른 페이지나 좁은 화면에서 오른쪽 아래 작은 바
 */
export const shell = style({
  position: 'fixed',
  // 사원증(20)보다는 아래, 일반 내용보다는 위
  zIndex: 15,
  selectors: {
    '&[data-mode="mini"]': {
      right: vars.space[5],
      bottom: vars.space[5],
      width: 'min(400px, calc(100vw - 24px))',
      height: '46px',
    },
    '&[data-mode="mini"][data-panel="log"]': {
      height: 'min(320px, 60vh)',
    },
    // 로그나 커밋 목록을 펼쳐서 읽는 동안에는 사원증(20)보다 위로 올라옵니다
    '&[data-raised="true"]': {
      zIndex: 30,
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
