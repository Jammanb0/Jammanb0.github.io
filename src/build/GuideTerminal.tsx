import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { CommitPeek } from './CommitRail'
import { DirectorContext } from './context'
import { useCurrentDirector } from './current'
import { useDockSlot } from './dock'
import { TerminalPanel } from './Terminal'
import * as styles from './GuideTerminal.css'

type Mode = 'dock' | 'mini'
/** 작은 바 위로 펼친 것: 없음, 로그 전체, 커밋 목록 */
type Panel = 'none' | 'log' | 'commits'

/** 모양이 바뀌는 데 걸리는 시간과, 그중 '동그래지는' 첫 단계가 끝나는 지점(비율) */
const MORPH_MS = 780
const ROUND_AT = 0.26
/** 옆 패널에 붙어 있을 때의 모서리(theme radius.lg와 같음) */
const DOCK_RADIUS = 20

interface Box {
  left: number
  top: number
  width: number
  height: number
}

/**
 * 자리가 멈춘 뒤의 위치. 들어오는 페이지가 아직 아래에서 올라오는 중(조상 요소의 transform)이면
 * 그 이동만큼 빼서, 터미널이 처음부터 최종 자리로 가게 합니다. 이게 없으면 끝에 툭 맞춰집니다.
 */
function settledRect(slot: HTMLElement) {
  const rect = slot.getBoundingClientRect()
  let dx = 0
  let dy = 0
  for (let node = slot.parentElement; node && node !== document.body; node = node.parentElement) {
    const transform = getComputedStyle(node).transform
    if (!transform || transform === 'none') continue
    const matrix = new DOMMatrixReadOnly(transform)
    dx += matrix.m41
    dy += matrix.m42
  }
  return { left: rect.left - dx, top: rect.top - dy, width: rect.width, height: rect.height }
}

/**
 * 터미널을 자리 위에 겹쳐 놓습니다. 페이지가 사라지는 중이라 자리가 문서에서 빠졌거나
 * 크기가 0이면 아무것도 하지 않고 false를 돌려줍니다(마지막 위치를 그대로 둡니다).
 */
function placeOver(el: HTMLElement, slot: HTMLElement) {
  if (!slot.isConnected) return false
  const rect = settledRect(slot)
  if (rect.width === 0 || rect.height === 0) return false
  el.style.top = `${rect.top}px`
  el.style.left = `${rect.left}px`
  el.style.width = `${rect.width}px`
  el.style.height = `${rect.height}px`
  return true
}

function usable(rect: DOMRect | null): rect is DOMRect {
  return rect !== null && rect.width > 0 && rect.height > 0
}

function clearPlacement(el: HTMLElement) {
  el.style.top = ''
  el.style.left = ''
  el.style.width = ''
  el.style.height = ''
}

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

function shrinkAround(rect: Box, k: number): Box {
  return {
    left: rect.left + (rect.width * (1 - k)) / 2,
    top: rect.top + (rect.height * (1 - k)) / 2,
    width: rect.width * k,
    height: rect.height * k,
  }
}

function lerpBox(a: Box, b: Box, t: number): Box {
  return {
    left: a.left + (b.left - a.left) * t,
    top: a.top + (b.top - a.top) * t,
    width: a.width + (b.width - a.width) * t,
    height: a.height + (b.height - a.height) * t,
  }
}

function px(box: Box) {
  return {
    left: `${box.left}px`,
    top: `${box.top}px`,
    width: `${box.width}px`,
    height: `${box.height}px`,
  }
}

function radiusOf(box: Box, mode: Mode) {
  return mode === 'mini' ? Math.min(box.width, box.height) / 2 : DOCK_RADIUS
}

/**
 * 모양 바꾸기. ① 지금 모습에서 조금 더 둥글게 뭉쳤다가 ② 새 자리·크기로 줄어들거나 늘어나며
 * 옮겨 갑니다. 크기를 직접 바꾸므로 글자가 찌그러지지 않고 틀 안에서 잘립니다.
 */
function morph(shell: HTMLElement, from: Box, to: Box, toMode: Mode) {
  const fromMode: Mode = toMode === 'mini' ? 'dock' : 'mini'
  // 큰 패널에서 떠날 때는 제자리에서 조금 작아지고, 작은 바에서 떠날 때는 가려는 쪽으로 조금 커집니다
  const mid = toMode === 'mini' ? shrinkAround(from, 0.92) : lerpBox(from, to, 0.22)
  const gather = 'cubic-bezier(0.4, 0, 0.2, 1)'
  const settle = 'cubic-bezier(0.16, 1, 0.3, 1)'
  const animation = shell.animate(
    [
      { ...px(from), offset: 0, easing: gather },
      { ...px(mid), offset: ROUND_AT, easing: settle },
      { ...px(to), offset: 1 },
    ],
    { duration: MORPH_MS },
  )
  // 안쪽 터미널은 모서리가 둥글어졌다가 새 모양의 모서리로, 내용은 잠깐 흐려졌다가 또렷해집니다
  shell.querySelector<HTMLElement>('[data-terminal]')?.animate(
    [
      { borderRadius: `${radiusOf(from, fromMode)}px`, opacity: 1, offset: 0, easing: gather },
      { borderRadius: '44px', opacity: 0.4, offset: ROUND_AT, easing: settle },
      { borderRadius: `${radiusOf(to, toMode)}px`, opacity: 1, offset: 1 },
    ],
    { duration: MORPH_MS },
  )
  return animation
}

/**
 * 페이지를 넘겨도 사라지지 않는 안내 터미널.
 *
 * 소개 페이지의 옆 패널이 자리(TerminalSlot)를 내어 주면 그 자리에 크게 붙고, 자리가
 * 없으면 오른쪽 아래 작은 바가 됩니다. 다른 페이지로 넘어가는 순간 조금 둥글게 뭉쳤다가
 * 오른쪽 아래로 줄어들며 작은 바가 되고, 소개 페이지로 돌아오면 거꾸로 펼쳐집니다.
 * 작은 바일 때 소개 페이지라면 바로 위에 커밋 알약이 붙습니다.
 */
export function GuideTerminal() {
  const director = useCurrentDirector()
  const slot = useDockSlot()
  const { pathname } = useLocation()
  // 자리를 내어 준 페이지를 떠나는 순간부터는 그 자리를 쓰지 않습니다
  const dockEl = slot && slot.path === pathname ? slot.el : null
  const [slotShown, setSlotShown] = useState(false)
  const [panel, setPanel] = useState<Panel>('none')
  const mode: Mode = dockEl && slotShown ? 'dock' : 'mini'
  // 안쪽 내용(큰 로그 / 한 줄 바)은 모양 바꾸기의 첫 단계가 끝난 뒤에 바뀝니다
  const [variant, setVariant] = useState<Mode>(mode)
  const shellRef = useRef<HTMLDivElement>(null)
  const lastRect = useRef<DOMRect | null>(null)
  const lastMode = useRef<Mode | null>(null)
  const lastPanel = useRef<Panel | null>(null)
  const morphing = useRef(false)

  // 모양이 바뀌거나 페이지가 바뀌면 펼쳐 둔 로그·커밋 목록을 접습니다
  const [scope, setScope] = useState({ mode, director })
  if (scope.mode !== mode || scope.director !== director) {
    setScope({ mode, director })
    setPanel('none')
  }

  // 자리가 실제로 보이는지 확인합니다(좁은 화면에서는 옆 패널이 숨습니다)
  useEffect(() => {
    if (!dockEl) {
      setSlotShown(false)
      return
    }
    const check = () => setSlotShown(dockEl.offsetWidth > 0 && dockEl.offsetHeight > 0)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(dockEl)
    return () => observer.disconnect()
  }, [dockEl])

  // 크게 붙어 있을 때는 스크롤·크기 변화에 맞춰 자리를 따라갑니다
  useEffect(() => {
    const el = shellRef.current
    if (!el) return
    let frame = 0
    const sync = () => {
      frame = 0
      if (mode === 'dock' && dockEl && !placeOver(el, dockEl)) return
      lastRect.current = el.getBoundingClientRect()
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(sync)
    }
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    const observer = dockEl && mode === 'dock' ? new ResizeObserver(schedule) : null
    if (dockEl && observer) observer.observe(dockEl)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      observer?.disconnect()
    }
  }, [mode, dockEl, director])

  // 모양이 바뀌면 이전 모습에서 새 모습으로 이어지게 움직입니다
  useLayoutEffect(() => {
    const el = shellRef.current
    if (!el) return
    if (mode === 'dock' && dockEl) placeOver(el, dockEl)
    else clearPlacement(el)

    const next = el.getBoundingClientRect()
    const prev = lastRect.current
    const modeChanged = lastMode.current !== null && lastMode.current !== mode
    const panelChanged = lastPanel.current !== null && lastPanel.current !== panel
    morphing.current = false
    if (usable(prev) && usable(next) && !prefersReducedMotion()) {
      if (modeChanged) {
        morphing.current = true
        const animation = morph(el, prev, next, mode)
        // 들어오는 페이지가 아직 움직이는 중이었다면 자리가 조금 달라졌을 수 있어 끝나고 다시 맞춥니다
        animation.finished
          .then(() => {
            if (mode === 'dock' && dockEl) placeOver(el, dockEl)
            lastRect.current = el.getBoundingClientRect()
          })
          .catch(() => {})
      } else if (panelChanged && prev.height !== next.height) {
        // 작은 바를 펼치고 접을 때는 아래쪽을 붙인 채 높이만 바뀝니다
        el.animate([{ height: `${prev.height}px` }, { height: `${next.height}px` }], {
          duration: 320,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
        })
      }
    }
    lastMode.current = mode
    lastPanel.current = panel
    if (usable(next)) lastRect.current = next
  }, [mode, dockEl, panel, director])

  // 모양을 바꾸는 중이면 둥글게 뭉치는 첫 단계가 끝날 때 안쪽 내용을 바꿉니다
  useLayoutEffect(() => {
    if (variant === mode) return
    if (!morphing.current) {
      setVariant(mode)
      return
    }
    const timer = setTimeout(() => setVariant(mode), MORPH_MS * ROUND_AT)
    return () => clearTimeout(timer)
  }, [mode, variant])

  // 펼친 것은 Esc로 닫고, 커밋 목록은 바깥을 누르면 닫습니다
  useEffect(() => {
    if (panel === 'none') return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPanel('none')
    }
    const onDown = (event: PointerEvent) => {
      if (panel !== 'commits') return
      if (shellRef.current?.contains(event.target as Node)) return
      setPanel('none')
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
    }
  }, [panel])

  if (!director) return null

  return (
    <div
      ref={shellRef}
      className={styles.shell}
      data-mode={mode}
      data-panel={panel}
      data-raised={panel !== 'none'}
    >
      <DirectorContext.Provider value={director}>
        {mode === 'mini' && variant === 'mini' && (
          <CommitPeek
            open={panel === 'commits'}
            onToggle={() => setPanel((value) => (value === 'commits' ? 'none' : 'commits'))}
            onClose={() => setPanel('none')}
          />
        )}
        <TerminalPanel
          variant={variant}
          expanded={panel === 'log'}
          onToggle={() => setPanel((value) => (value === 'log' ? 'none' : 'log'))}
        />
      </DirectorContext.Provider>
    </div>
  )
}
