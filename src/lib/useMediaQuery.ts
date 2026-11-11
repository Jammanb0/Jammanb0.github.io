import { useCallback, useSyncExternalStore } from 'react'

/** CSS 미디어 쿼리가 지금 맞는지. 화면 크기가 바뀌어 결과가 달라지면 다시 그립니다 */
export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query)
      list.addEventListener('change', onChange)
      return () => list.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
