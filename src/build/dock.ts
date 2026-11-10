import { useSyncExternalStore } from 'react'

/**
 * 안내 터미널이 크게 붙을 자리. 소개 페이지의 옆 패널이 이 자리를 내어 주고,
 * 자리가 없거나(다른 페이지) 숨어 있으면(좁은 화면) 터미널은 작은 바가 됩니다.
 * path는 자리를 내어 준 페이지의 주소입니다. 다른 페이지로 넘어가는 순간 주소가 달라지므로,
 * 소개 페이지가 사라지는 애니메이션을 기다리지 않고 터미널이 바로 작은 바로 옮겨 갑니다.
 */
export interface DockSlot {
  el: HTMLElement
  path: string
}

let slot: DockSlot | null = null
const listeners = new Set<() => void>()

function notify() {
  for (const listener of [...listeners]) listener()
}

export function setDockSlot(el: HTMLElement, path: string) {
  if (slot?.el === el && slot.path === path) return
  slot = { el, path }
  notify()
}

export function clearDockSlot(el: HTMLElement) {
  if (slot?.el !== el) return
  slot = null
  notify()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useDockSlot() {
  return useSyncExternalStore(
    subscribe,
    () => slot,
    () => null,
  )
}
