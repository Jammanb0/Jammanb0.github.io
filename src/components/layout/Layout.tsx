import { useEffect, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { GuideTerminal } from '@/build/GuideTerminal'
import { Header } from './Header'
import { Footer } from './Footer'
import { main } from './Layout.css'

/**
 * 처음 그려질 때의 페이지를 붙잡아 둡니다. 페이지가 바뀌면 나가는 쪽은 사라지는 동안
 * 원래 페이지를 계속 보여주고, 들어오는 페이지는 한 번만 그려집니다.
 * (그냥 <Outlet />을 쓰면 나가는 틀 안에 들어오는 페이지가 먼저 한 번 그려져서
 * 조립이 두 번 시작되는 것처럼 보였습니다.)
 */
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState(outlet)
  return frozen
}

/** '/#story'처럼 해시가 있으면 그 구역으로 가는 일은 페이지가 맡습니다 */
function scrollToTop() {
  if (window.location.hash) return
  window.scrollTo(0, 0)
}

export function Layout() {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  // 움직임 줄이기 설정이면 바로 올립니다. 그 밖에는 나가는 페이지가 다 사라진 뒤에 올려서
  // (onExitComplete) 사라지는 도중에 화면이 맨 위로 튀지 않게 합니다
  useEffect(() => {
    if (shouldReduceMotion) scrollToTop()
  }, [location.pathname, location.hash, shouldReduceMotion])

  return (
    <>
      <Header />
      <AnimatePresence mode="wait" onExitComplete={shouldReduceMotion ? undefined : scrollToTop}>
        <motion.main
          key={location.pathname}
          className={main}
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={
            shouldReduceMotion
              ? undefined
              : { opacity: 1, y: 0, transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] } }
          }
          exit={
            shouldReduceMotion
              ? undefined
              : { opacity: 0, y: -8, transition: { duration: 0.2, ease: [0.4, 0, 1, 1] } }
          }
          transition={shouldReduceMotion ? { duration: 0 } : undefined}
        >
          <FrozenOutlet />
        </motion.main>
      </AnimatePresence>
      <Footer />
      <GuideTerminal />
    </>
  )
}
