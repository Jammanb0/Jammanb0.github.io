import { BuildBox, BuildReveal, BuildSection, BuildText } from '@/build/components'
import { Lanyard } from '@/components/badge/Lanyard'
import { CHIP, FRAME } from '@/components/frame/decls'
import { FrameLabel } from '@/components/frame/FrameLabel'
import { section } from '@/components/frame/frame.css'
import { Button } from '@/components/ui/Button'
import { profile } from '@/data/profile'
import * as styles from './home.css'

const HERO_COMMIT = { message: 'feat: 첫 화면' }

function scrollToProjects() {
  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/**
 * 첫 화면. 틀이 그려지면 사원증이 떨어지는 동안 옆에서 제목과 소개가 함께 입력됩니다.
 */
export function HeroSection() {
  return (
    <BuildSection
      id="hero"
      label="첫 화면"
      guide={`안녕하세요! ${profile.nameKo}의 포트폴리오를 안내해 드릴게요.`}
      commit={HERO_COMMIT}
      className={section}
    >
      <FrameLabel text="첫 화면" />
      <BuildBox
        id="hero-frame"
        name=".hero"
        decls={FRAME}
        className={styles.heroFrame}
        data-hook-frame=""
      >
        <div className={styles.heroText}>
          <BuildBox id="hero-chip" name=".role-chip" decls={CHIP} as="span" className={styles.chip}>
            <BuildText id="hero-role" as="span" text={profile.role} />
          </BuildBox>
          <BuildText id="hero-title" as="h1" text={profile.tagline} className={styles.heroTitle} />
          <BuildText id="hero-intro" text={profile.intro} className={styles.heroIntro} />
          <BuildReveal id="hero-actions" className={styles.heroActions}>
            <Button onClick={scrollToProjects}>프로젝트 보기</Button>
            <Button href={profile.heroCta.href} target="_blank" rel="noreferrer" tone="secondary">
              {profile.heroCta.label}
            </Button>
          </BuildReveal>
        </div>
        <div className={styles.badgeColumn}>
          <Lanyard hookSelector="[data-hook-frame]" />
        </div>
      </BuildBox>
    </BuildSection>
  )
}
