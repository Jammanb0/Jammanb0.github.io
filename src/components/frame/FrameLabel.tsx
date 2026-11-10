import { useId } from 'react'
import { BuildReveal, BuildText } from '@/build/components'
import * as styles from './frame.css'

/**
 * 프레임 왼쪽 위 이름표. 구역을 조립할 때 함께 입력됩니다.
 * 장식이라 스크린리더에는 숨깁니다(제목은 프레임 안에 따로 있습니다).
 */
export function FrameLabel({ text, draft }: { text: string; draft?: boolean }) {
  const id = useId()
  return (
    <p className={styles.frameLabel} aria-hidden="true">
      <BuildText id={`frame-label${id}`} as="span" text={`# ${text}`} />
      {draft && (
        <BuildReveal id={`frame-draft${id}`} as="span" className={styles.draftBadge}>
          작성 중 · 배포 화면엔 안 나옴
        </BuildReveal>
      )}
    </p>
  )
}
