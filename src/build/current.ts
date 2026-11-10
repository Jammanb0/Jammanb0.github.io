import { useSyncExternalStore } from 'react'
import type { BuildDirector } from './director'

/**
 * 지금 화면에 있는 페이지의 조립 지휘자. 페이지가 바뀌어도 사라지지 않는 안내 터미널이
 * 여기서 현재 페이지를 찾습니다. 다음 페이지가 등록될 때까지는 이전 값을 그대로 둬서
 * 페이지 전환 중에 터미널이 깜빡이지 않게 합니다.
 */
let current: BuildDirector | null = null
const listeners = new Set<() => void>()

export function setCurrentDirector(director: BuildDirector) {
  if (current === director) return
  current = director
  for (const listener of [...listeners]) listener()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useCurrentDirector() {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  )
}
