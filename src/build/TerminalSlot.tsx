import { useCallback, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { clearDockSlot, setDockSlot } from './dock'

/** 안내 터미널이 크게 붙을 빈 자리. 크기만 차지하고 내용은 터미널이 위에 겹쳐 그립니다 */
export function TerminalSlot({ className }: { className?: string }) {
  const { pathname } = useLocation()
  // 이 자리를 내어 준 페이지의 주소. 페이지가 사라지는 동안 주소가 바뀌어도 처음 값을 지킵니다
  const [owner] = useState(pathname)
  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return
      setDockSlot(el, owner)
      return () => clearDockSlot(el)
    },
    [owner],
  )
  return <div ref={ref} className={className} aria-hidden="true" />
}
