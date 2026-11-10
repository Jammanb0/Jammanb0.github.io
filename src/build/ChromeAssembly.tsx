import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { BuildSection } from './components'
import { DirectorContext } from './context'
import { useCurrentDirector } from './current'
import { useSectionStatus } from './hooks'
import * as styles from './build.css'

type ChromeTag = 'header' | 'footer'

/**
 * 이번 페이지 로드에서 이미 조립한 틀. 새로고침하면 비워져서 다시 조립하고,
 * 페이지만 옮길 때는 그대로라 헤더·푸터를 또 그리지 않습니다.
 */
const assembledThisLoad = new Set<string>()

function DoneWatcher({ id, onDone }: { id: string; onDone: () => void }) {
  const status = useSectionStatus(id)
  useEffect(() => {
    if (status === 'done') onDone()
  }, [status, onDone])
  return null
}

interface ChromeAssemblyProps {
  id: string
  label: string
  as: ChromeTag
  className?: string
  children: ReactNode
}

/**
 * 헤더·푸터처럼 모든 페이지에 걸친 틀. 페이지를 처음 불러올 때만 지금 페이지의 작업자들이
 * 함께 조립하고, 그 뒤 다른 페이지로 옮겨 다닐 때는 완성된 모습 그대로 둡니다.
 */
export function ChromeAssembly({ id, label, as: Tag, className, children }: ChromeAssemblyProps) {
  const director = useCurrentDirector()
  const [assembled, setAssembled] = useState(() => assembledThisLoad.has(id))
  const onDone = useCallback(() => {
    assembledThisLoad.add(id)
    setAssembled(true)
  }, [id])

  if (assembled) return <Tag className={className}>{children}</Tag>

  // 페이지의 지휘자가 준비되기 전 한순간은 내용을 감춰서 완성된 모습이 먼저 비치지 않게 합니다
  if (!director) {
    return (
      <Tag className={className ? `${className} ${styles.chromePending}` : styles.chromePending}>
        {children}
      </Tag>
    )
  }

  return (
    <DirectorContext.Provider value={director}>
      <BuildSection id={id} label={label} as={Tag} className={className}>
        <DoneWatcher id={id} onDone={onDone} />
        {children}
      </BuildSection>
    </DirectorContext.Provider>
  )
}
