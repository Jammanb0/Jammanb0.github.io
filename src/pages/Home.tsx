import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CommitRail } from '@/build/CommitRail'
import { BuildProvider } from '@/build/components'
import { TerminalSlot } from '@/build/TerminalSlot'
import { HeroSection } from '@/components/home/HeroSection'
import { OutroSection } from '@/components/home/OutroSection'
import { ProjectsSection } from '@/components/home/ProjectsSection'
import { StorySection } from '@/components/home/StorySection'
import * as styles from './Home.css'

/** '/#story'처럼 해시가 붙어 들어오면 그 구역으로 이동합니다 */
function useHashScroll() {
  const location = useLocation()
  useEffect(() => {
    if (!location.hash) return
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)))
    if (!target) return
    const frame = requestAnimationFrame(() =>
      target.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
    return () => cancelAnimationFrame(frame)
  }, [location.hash, location.key])
}

export default function Home() {
  useHashScroll()

  return (
    <BuildProvider>
      <div className={styles.page}>
        <div className={styles.content}>
          <HeroSection />
          <StorySection />
          <ProjectsSection />
          <OutroSection />
        </div>
        <aside className={styles.aside} aria-label="안내 패널">
          <TerminalSlot className={styles.terminal} />
          <CommitRail className={styles.rail} />
        </aside>
      </div>
    </BuildProvider>
  )
}
