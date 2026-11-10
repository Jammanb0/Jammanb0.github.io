import { BuildBox, BuildProvider, BuildReveal, BuildSection, BuildText } from '@/build/components'
import { FRAME } from '@/components/frame/decls'
import { FrameLabel } from '@/components/frame/FrameLabel'
import { page, section } from '@/components/frame/frame.css'
import { Button } from '@/components/ui/Button'
import * as styles from './NotFound.css'

export default function NotFound() {
  return (
    <BuildProvider>
      <div className={page}>
        <BuildSection id="not-found" label="404" guide="찾는 페이지가 없네요." className={section}>
          <FrameLabel text="404" />
          <BuildBox id="not-found-frame" name=".not-found" decls={FRAME} className={styles.frame}>
            <BuildText id="not-found-code" text="404" className={styles.code} />
            <BuildText
              id="not-found-message"
              as="h1"
              text="페이지를 찾을 수 없어요."
              className={styles.message}
            />
            <BuildReveal id="not-found-actions" className={styles.actions}>
              <Button to="/" tone="primary">
                소개로 가기
              </Button>
              <Button to="/projects" tone="surface">
                프로젝트 보기
              </Button>
            </BuildReveal>
          </BuildBox>
        </BuildSection>
      </div>
    </BuildProvider>
  )
}
