import { Link } from 'react-router-dom'
import { BuildBox, BuildReveal, BuildSection, BuildText } from '@/build/components'
import { DARK } from '@/components/frame/decls'
import { FrameLabel } from '@/components/frame/FrameLabel'
import { section } from '@/components/frame/frame.css'
import * as styles from './home.css'

const OUTRO_COMMIT = { message: 'feat: 마무리' }

/** 홈의 끝. 다음에 갈 곳(전체 프로젝트, 연락처)을 알려줍니다 */
export function OutroSection() {
  return (
    <BuildSection
      id="outro"
      label="마무리"
      guide="더 보고 싶은 곳이 있다면 여기서 이어 가세요."
      commit={OUTRO_COMMIT}
      className={section}
    >
      <FrameLabel text="마무리" />
      <BuildBox id="outro-card" name=".outro" decls={DARK} className={styles.outroCard}>
        <BuildText id="outro-title" as="h2" text="더 궁금하다면" className={styles.outroTitle} />
        <BuildText
          id="outro-text"
          text="모든 작업은 프로젝트 목록에, 연락할 곳은 연락처 페이지에 모아 두었어요."
          className={styles.outroText}
        />
        <BuildReveal id="outro-links" className={styles.outroLinks}>
          <Link className={styles.outroLink} to="/projects">
            프로젝트 목록 <span aria-hidden="true">→</span>
          </Link>
          <Link className={styles.outroLink} to="/contact">
            연락처 <span aria-hidden="true">→</span>
          </Link>
        </BuildReveal>
      </BuildBox>
    </BuildSection>
  )
}
