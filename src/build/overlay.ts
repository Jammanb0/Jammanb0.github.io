import { setElementVars } from '@vanilla-extract/dynamic'
import { ROLES } from './roles'
import type { Role } from './types'
import * as styles from './overlay.css'

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * 작업자들의 선택 상자를 담는 층. 화면에 고정된 한 장의 층 위에 작업자마다
 * 상자를 하나씩 두고, 프레임 하나로 모두 그립니다. React 바깥에서 직접 그려서
 * 매 프레임 위치를 맞춰도 페이지가 다시 렌더링되지 않습니다.
 */
export class OverlayLayer {
  private root: HTMLDivElement | null = null
  private overlays: WorkerOverlay[] = []
  private raf = 0

  mount() {
    if (this.root || typeof document === 'undefined') return
    const root = document.createElement('div')
    root.className = styles.root
    root.setAttribute('aria-hidden', 'true')
    document.body.appendChild(root)
    this.root = root
    for (const overlay of this.overlays) root.appendChild(overlay.el)
  }

  unmount() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    for (const overlay of this.overlays) overlay.reset()
    this.root?.remove()
    this.root = null
  }

  create(role: Role) {
    const overlay = new WorkerOverlay(role, this.wake)
    this.overlays.push(overlay)
    this.root?.appendChild(overlay.el)
    return overlay
  }

  private wake = () => {
    if (!this.raf && this.root) this.raf = requestAnimationFrame(this.loop)
  }

  private loop = (now: number) => {
    let active = false
    for (const overlay of this.overlays) active = overlay.render(now) || active
    this.raf = active ? requestAnimationFrame(this.loop) : 0
  }
}

/**
 * 작업자 한 명의 선택 상자. 다음 대상으로 날아가듯 옮겨 가고, 틀을 그릴 때는
 * 왼쪽 위 모서리에서 끌어 늘리며 크기를 표시하고, CSS를 붙일 때는 말풍선에
 * 그 한 줄을 띄웁니다.
 */
export class WorkerOverlay {
  readonly el: HTMLDivElement
  private badge: HTMLSpanElement
  private bubble: HTMLSpanElement
  private target: HTMLElement | null = null
  private shown = false
  private rect: Rect | null = null
  private from: Rect | null = null
  private flyStart = 0
  private flyDur = 0
  private drawing = false
  private drawStart = 0
  private drawDur = 0
  private hideTimer: ReturnType<typeof setTimeout> | undefined
  private wake: () => void

  constructor(role: Role, wake: () => void) {
    this.wake = wake
    const box = document.createElement('div')
    box.className = styles.box
    setElementVars(box, { [styles.roleColor]: ROLES[role].color })

    const tag = document.createElement('span')
    tag.className = styles.tag
    tag.textContent = ROLES[role].label
    box.appendChild(tag)

    for (const corner of [styles.tl, styles.tr, styles.bl, styles.br]) {
      const handle = document.createElement('span')
      handle.className = `${styles.handle} ${corner}`
      box.appendChild(handle)
    }

    this.badge = document.createElement('span')
    this.badge.className = styles.badge
    this.badge.dataset.visible = 'false'
    box.appendChild(this.badge)

    this.bubble = document.createElement('span')
    this.bubble.className = styles.bubble
    this.bubble.dataset.visible = 'false'
    box.appendChild(this.bubble)

    this.el = box
  }

  /** 대상의 왼쪽 위로 날아가 모서리에서부터 틀을 끌어 그립니다 */
  async draw(el: HTMLElement, fly: number, grow: number, sleep: (ms: number) => Promise<void>) {
    this.take(el)
    const now = performance.now()
    this.from = this.shown && this.rect ? this.rect : null
    this.flyStart = now
    this.flyDur = this.from ? fly : 0
    this.drawing = true
    this.drawStart = now + this.flyDur
    this.drawDur = grow
    this.badge.dataset.visible = 'true'
    this.bubble.dataset.visible = 'false'
    this.show()
    await sleep(this.flyDur + grow)
    this.drawing = false
    this.from = null
    this.badge.dataset.visible = 'false'
  }

  /** 대상을 선택합니다. 이전 대상에서 날아가듯 옮겨 갑니다. badge를 켜면 크기도 보여줍니다 */
  select(el: HTMLElement, fly: number, options: { badge?: boolean } = {}) {
    this.badge.dataset.visible = String(Boolean(options.badge))
    if (this.target === el && this.shown) return
    this.take(el)
    this.from = this.shown && this.rect ? this.rect : null
    this.flyStart = performance.now()
    this.flyDur = this.from ? fly : 0
    this.drawing = false
    this.show()
  }

  /** 말풍선에 CSS 한 줄을 띄웁니다. null이면 숨깁니다 */
  code(prop: string | null, value = '') {
    if (prop === null) {
      this.bubble.dataset.visible = 'false'
      return
    }
    const propEl = document.createElement('span')
    propEl.className = styles.bubbleProp
    propEl.textContent = prop
    const valueEl = document.createElement('span')
    valueEl.className = styles.bubbleValue
    valueEl.textContent = value
    this.bubble.replaceChildren(propEl, ': ', valueEl, ';')
    this.bubble.dataset.visible = 'true'
  }

  /** 말풍선에 짧은 메모를 띄웁니다(예: '⌥ 복제'). null이면 숨깁니다 */
  note(text: string | null) {
    if (text === null) {
      this.bubble.dataset.visible = 'false'
      return
    }
    this.bubble.replaceChildren(text)
    this.bubble.dataset.visible = 'true'
  }

  /** 지금 상자가 있는 자리(화면 좌표). 보이지 않으면 null */
  get current(): Rect | null {
    return this.shown ? this.rect : null
  }

  /** 일을 마쳤을 때. 곧바로 다음 일을 받지 않으면 잠시 뒤 사라집니다 */
  release() {
    this.bubble.dataset.visible = 'false'
    clearTimeout(this.hideTimer)
    this.hideTimer = setTimeout(() => this.reset(), 260)
  }

  reset() {
    clearTimeout(this.hideTimer)
    this.shown = false
    this.target = null
    this.rect = null
    this.drawing = false
    this.el.dataset.visible = 'false'
  }

  /** 한 프레임 그립니다. 계속 그려야 하면 true */
  render(now: number) {
    if (!this.shown || !this.target) return false
    const r = this.target.getBoundingClientRect()
    let rect: Rect = { x: r.left, y: r.top, w: r.width, h: r.height }

    const flying = this.from !== null && now < this.flyStart + this.flyDur
    if (this.drawing) {
      if (flying && this.from) {
        // 이전 상자에서 대상의 왼쪽 위 한 점으로 모여듭니다
        const t = easeOut(clamp01((now - this.flyStart) / this.flyDur))
        rect = {
          x: lerp(this.from.x, rect.x, t),
          y: lerp(this.from.y, rect.y, t),
          w: lerp(this.from.w, 0, t),
          h: lerp(this.from.h, 0, t),
        }
      } else {
        const p = easeOut(clamp01((now - this.drawStart) / Math.max(1, this.drawDur)))
        rect = { ...rect, w: rect.w * p, h: rect.h * p }
      }
    } else if (flying && this.from) {
      const t = easeOut(clamp01((now - this.flyStart) / this.flyDur))
      rect = {
        x: lerp(this.from.x, rect.x, t),
        y: lerp(this.from.y, rect.y, t),
        w: lerp(this.from.w, rect.w, t),
        h: lerp(this.from.h, rect.h, t),
      }
    }

    this.el.style.transform = `translate(${rect.x}px, ${rect.y}px)`
    this.el.style.width = `${rect.w}px`
    this.el.style.height = `${rect.h}px`
    if (this.badge.dataset.visible === 'true') {
      this.badge.textContent = `${Math.round(rect.w)} × ${Math.round(rect.h)}`
    }
    this.rect = rect
    return true
  }

  private take(el: HTMLElement) {
    clearTimeout(this.hideTimer)
    this.target = el
  }

  private show() {
    this.shown = true
    this.el.dataset.visible = 'true'
    this.wake()
  }
}
