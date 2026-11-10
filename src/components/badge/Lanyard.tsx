import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { setElementVars } from '@vanilla-extract/dynamic'
import { useBuildTarget } from '@/build/hooks'
import type { RunContext } from '@/build/types'
import { profile } from '@/data/profile'
import { LanyardSim } from './physics'
import * as styles from './Lanyard.css'

const STEP = 1 / 120
const BAND_ID = 'lanyard-band'
const STRAP_TEXT = `${profile.name} · ${profile.role} · `.toUpperCase().repeat(8)

/** 이름으로 만든 장식용 바코드 막대 굵기 */
const BARCODE = Array.from(profile.name + profile.role, (ch, i) => 1 + ((ch.charCodeAt(0) + i) % 3))

/**
 * 물리 계산과 DOM 갱신을 맡습니다. 매 프레임 transform과 path만 바꾸고
 * React 렌더링은 거치지 않습니다.
 */
class LanyardController {
  readonly sim = new LanyardSim()
  area: HTMLDivElement | null = null
  card: HTMLDivElement | null = null
  band: SVGPathElement | null = null
  shadow: SVGPathElement | null = null
  strap: SVGSVGElement | null = null
  peg: HTMLSpanElement | null = null
  /** 걸이를 맞출 프레임 선택자. 없으면 영역 위쪽 경계에 겁니다 */
  hookSelector: string | null = null
  private hookOffset = 0
  reduced = false
  started = false
  private cardWidth = 200
  private raf = 0
  private last = 0
  private acc = 0
  private quiet = 0
  private pointerId: number | null = null
  private resizeObserver: ResizeObserver | null = null
  private breezeTimer: ReturnType<typeof setTimeout> | undefined

  mount() {
    if (!this.area || typeof ResizeObserver === 'undefined') return
    this.resizeObserver = new ResizeObserver(() => {
      this.measure()
      this.render()
      if (this.started) this.wake()
    })
    this.resizeObserver.observe(this.area)
    this.measure()
  }

  dispose() {
    this.resizeObserver?.disconnect()
    this.resizeObserver = null
    clearTimeout(this.breezeTimer)
    this.stop()
  }

  /** 걸이 위치, 줄 길이, 카드 크기를 다시 잽니다 */
  measure() {
    if (!this.area || !this.card) return
    const frame = this.hookSelector ? this.area.closest(this.hookSelector) : null
    if (frame) {
      // 걸이를 프레임 위 테두리에 맞춥니다
      this.hookOffset = Math.max(
        0,
        this.area.getBoundingClientRect().top - frame.getBoundingClientRect().top,
      )
    }
    this.cardWidth = this.card.offsetWidth || this.cardWidth
    const cardLength = Math.max(120, this.card.offsetHeight - 8)
    this.sim.setCardLength(cardLength)
    // 카드 아래가 영역 안에 들어오도록 줄 길이를 맞춥니다
    const rope = this.area.clientHeight + this.hookOffset - cardLength - 28
    this.sim.setRopeLength(Math.max(56, Math.min(210, rope)))
    this.sim.setAnchor(this.area.clientWidth / 2, -this.hookOffset)
    if (this.peg) this.peg.style.top = `${-this.hookOffset}px`
  }

  drop() {
    this.measure()
    const top = this.area?.getBoundingClientRect().top ?? 0
    const { ropeLength, cardLength } = this.sim.options
    // 카드가 화면 위쪽 바깥에서 출발하도록 높이를 잡습니다
    const height = Math.max(420, top + this.hookOffset + ropeLength + cardLength + 60)
    this.sim.drop(height)
    this.started = true
    this.setVisible(true)
    this.render()
    this.wake()
    this.scheduleBreeze()
  }

  rest() {
    this.measure()
    this.sim.rest(this.reduced ? 0 : 0.18)
    this.started = true
    this.setVisible(true)
    this.render()
    if (!this.reduced) this.wake()
    this.scheduleBreeze()
  }

  hide() {
    this.started = false
    clearTimeout(this.breezeTimer)
    this.sim.release()
    this.stop()
    this.setVisible(false)
  }

  /**
   * 다 멈춰 있으면 4.5~7.5초마다 바람이 스친 듯 살짝 흔듭니다. 아직 흔들리는 중이거나
   * 잡고 있거나, 화면 밖이거나 탭이 숨어 있으면 이번 차례는 건너뜁니다.
   */
  private scheduleBreeze() {
    clearTimeout(this.breezeTimer)
    if (this.reduced) return
    this.breezeTimer = setTimeout(
      () => {
        if (
          this.started &&
          !this.raf &&
          !this.sim.dragging &&
          !document.hidden &&
          this.onScreen()
        ) {
          this.sim.breeze(Math.random() < 0.5 ? -1 : 1, 0.7 + Math.random() * 0.5)
          this.wake()
        }
        this.scheduleBreeze()
      },
      4500 + Math.random() * 3000,
    )
  }

  private onScreen() {
    const rect = this.card?.getBoundingClientRect()
    return !!rect && rect.bottom > 0 && rect.top < window.innerHeight
  }

  onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (this.reduced || !this.started || !this.card) return
    event.preventDefault()
    try {
      this.card.setPointerCapture(event.pointerId)
    } catch {
      // 포인터를 붙잡지 못해도(이미 끝난 터치 등) 끌기는 계속합니다
    }
    this.pointerId = event.pointerId
    const { x, y } = this.toLocal(event)
    this.sim.grabAt(x, y)
    this.card.dataset.dragging = 'true'
    this.wake()
  }

  onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerId !== this.pointerId) return
    const { x, y } = this.toLocal(event)
    this.sim.dragTo(x, y)
  }

  onPointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerId !== this.pointerId) return
    this.pointerId = null
    this.sim.release()
    if (this.card) {
      this.card.dataset.dragging = 'false'
      if (this.card.hasPointerCapture(event.pointerId))
        this.card.releasePointerCapture(event.pointerId)
    }
    this.wake()
  }

  onPointerEnter() {
    if (this.reduced || !this.started || this.sim.dragging) return
    this.sim.nudge(1.6)
    this.wake()
  }

  private toLocal(event: { clientX: number; clientY: number }) {
    const rect = this.area?.getBoundingClientRect()
    return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) }
  }

  private setVisible(visible: boolean) {
    const value = String(visible)
    if (this.card) this.card.dataset.visible = value
    if (this.strap) this.strap.dataset.visible = value
    if (this.peg) this.peg.dataset.visible = value
  }

  private wake() {
    this.quiet = 0
    if (this.raf) return
    this.last = 0
    this.raf = requestAnimationFrame(this.tick)
  }

  private stop() {
    cancelAnimationFrame(this.raf)
    this.raf = 0
    this.last = 0
    this.acc = 0
  }

  private tick = (now: number) => {
    const elapsed = this.last ? Math.min(0.05, (now - this.last) / 1000) : STEP
    this.last = now
    this.acc += elapsed
    while (this.acc >= STEP) {
      this.sim.step(STEP)
      this.acc -= STEP
    }
    this.render()
    this.quiet = this.sim.motion() < 0.04 ? this.quiet + 1 : 0
    if (this.quiet > 40) {
      // 충분히 멈췄으면 계산을 쉽니다. 만지거나 크기가 바뀌면 다시 깨어납니다
      this.raf = 0
      this.last = 0
      return
    }
    this.raf = requestAnimationFrame(this.tick)
  }

  private render() {
    const { card, band, shadow, sim } = this
    if (!card || !band || !shadow) return
    const ring = sim.ring
    const angle = sim.angle
    card.style.transform = `translate3d(${ring.x - this.cardWidth / 2}px, ${ring.y}px, 0) rotate(${-angle}rad) rotateY(${sim.twist}rad)`
    setElementVars(card, {
      [styles.gloss]: (0.5 + Math.sin(angle * 2.2 + sim.twist) * 0.5).toFixed(3),
    })

    const pts = sim.points
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
    for (let i = 1; i < pts.length - 1; i += 1) {
      const mx = (pts[i].x + pts[i + 1].x) / 2
      const my = (pts[i].y + pts[i + 1].y) / 2
      d += ` Q ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`
    }
    d += ` L ${ring.x.toFixed(1)} ${ring.y.toFixed(1)}`
    band.setAttribute('d', d)
    shadow.setAttribute('d', d)
  }
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true,
  )
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if (!query) return
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

interface LanyardProps {
  /** 걸이를 이 선택자에 맞는 조상 요소의 위 테두리에 겁니다. 예: '[data-hook-frame]' */
  hookSelector?: string
  className?: string
}

/**
 * 사원증 목걸이. 조립 순서가 오면 위에서 떨어져 걸리고, 잡아당기면 흔들립니다.
 * 처음부터 완성된 화면이면 살짝 흔들리며 매달린 채로 나타납니다.
 */
export function Lanyard({ hookSelector, className }: LanyardProps) {
  const [ctl] = useState(() => new LanyardController())
  const reduced = usePrefersReducedMotion()
  const cardRef = useRef<HTMLDivElement>(null)
  const bandRef = useRef<SVGPathElement>(null)
  const shadowRef = useRef<SVGPathElement>(null)
  const strapRef = useRef<SVGSVGElement>(null)
  const pegRef = useRef<HTMLSpanElement>(null)

  ctl.hookSelector = hookSelector ?? null
  ctl.reduced = reduced

  const run = useCallback(
    async (ctx: RunContext) => {
      ctl.drop()
      // 떨어지는 모습은 물리 계산이 알아서 이어가니, 걸릴 때까지만 기다리고 다음 일로 넘어갑니다
      await ctx.wait(650)
    },
    [ctl],
  )
  const [targetRef, state] = useBuildTarget({
    id: 'badge-card',
    kind: 'custom',
    name: '사원증',
    run,
  })

  const areaRef = useCallback(
    (el: HTMLDivElement | null) => {
      if (!el) return
      ctl.area = el
      return targetRef(el)
    },
    [ctl, targetRef],
  )

  useEffect(() => {
    ctl.card = cardRef.current
    ctl.band = bandRef.current
    ctl.shadow = shadowRef.current
    ctl.strap = strapRef.current
    ctl.peg = pegRef.current
    ctl.mount()
    return () => ctl.dispose()
  }, [ctl])

  useEffect(() => {
    if (!state.visible) {
      ctl.hide()
      return
    }
    if (!ctl.started) ctl.rest()
  }, [ctl, state.visible])

  return (
    <div ref={areaRef} className={className ? `${styles.area} ${className}` : styles.area}>
      <span ref={pegRef} className={styles.peg} data-visible="false" />
      <svg ref={strapRef} className={styles.strap} data-visible="false" aria-hidden="true">
        <path ref={shadowRef} className={styles.bandShadow} />
        <path ref={bandRef} id={BAND_ID} className={styles.band} />
        <text className={styles.bandText}>
          <textPath href={`#${BAND_ID}`} startOffset="10">
            {STRAP_TEXT}
          </textPath>
        </text>
      </svg>
      <div
        ref={cardRef}
        className={styles.card}
        data-visible="false"
        data-dragging="false"
        role="img"
        aria-label={`사원증: ${profile.nameKo}, ${profile.role}`}
        onPointerDown={(event) => ctl.onPointerDown(event)}
        onPointerMove={(event) => ctl.onPointerMove(event)}
        onPointerUp={(event) => ctl.onPointerUp(event)}
        onPointerCancel={(event) => ctl.onPointerUp(event)}
        onPointerEnter={() => ctl.onPointerEnter()}
      >
        <div className={styles.clip} />
        <div className={styles.faces}>
          <div className={styles.front}>
            <div className={styles.topBand}>
              <span className={styles.slot} />
              PORTFOLIO
            </div>
            <div className={styles.photoWrap}>
              <img className={styles.photo} src={profile.badgePhoto} alt="" draggable={false} />
            </div>
            <div className={styles.info}>
              <p className={styles.nameKo}>{profile.nameKo}</p>
              <p className={styles.nameEn}>{profile.name}</p>
              <p className={styles.role}>{profile.role.toUpperCase()}</p>
              <div className={styles.foot}>
                <span className={styles.barcode} aria-hidden="true">
                  {BARCODE.map((w, i) => (
                    <span key={i} className={styles.bar} style={{ width: w }} />
                  ))}
                </span>
                <span className={styles.site}>{profile.site}</span>
              </div>
            </div>
          </div>
          <div className={styles.back}>
            <p className={styles.backTagline}>{profile.tagline}</p>
            <p className={styles.backFoot}>{profile.site.toUpperCase()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
