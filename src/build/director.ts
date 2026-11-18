import { OverlayLayer, type WorkerOverlay } from './overlay'
import { WORKER_ROLES } from './roles'
import type {
  BuildUi,
  LineKind,
  RailItem,
  Role,
  SectionSpec,
  SectionStatus,
  TargetKind,
  TargetSpec,
  TargetState,
  TerminalLine,
  TextCompose,
} from './types'

/** 터미널에 남겨 두는 줄 수. 서브 에이전트의 일은 구역마다 접혀 보이니 넉넉히 둡니다 */
const MAX_LINES = 600
/** 구역 윗부분이 화면 위에서 이 비율(55%)까지 올라오면 조립을 시작합니다 */
const TRIGGER_LINE = 0.55
/** 기본 빠르기. 1보다 크면 모든 동작이 그만큼 느려집니다 */
const PACE = 1.6
/**
 * 한 화면에서 기다리는 시간(ms). 화면에 보이는 일은 처음 보인 때부터 이 안에 끝나도록
 * 그때그때 배속을 올립니다. 일이 적으면 원래 빠르기 그대로입니다.
 */
const SCREEN_TARGET = 1300
/** 이만큼 지나도 보이는 일이 남아 있으면 더 서둘러 끝냅니다 */
const SCREEN_LIMIT = 1900
/** 평소 올릴 수 있는 가장 큰 배속과, 늦었을 때의 배속 */
const MAX_SPEED = 3
const LATE_SPEED = 5
/**
 * 복제해 끌어오기, 복사된 글자를 선택해 고쳐 쓰기, 사진 바꿔 끼우기처럼 눈으로 따라가야 하는
 * 움직임은 화면이 아무리 바빠도 이 배속까지만 빨라집니다(지나치게 빨라 안 보이지 않게)
 */
const SHOW_SPEED = 1.5
/**
 * 한 화면 기한의 기준이 되는 화면 높이(CSS px, 100% 배율의 데스크톱쯤). 브라우저 배율을 줄이면(80·90%)
 * CSS 기준 화면이 커져 한 번에 보이는 일이 많아지므로, 기한을 화면 높이에 비례해 늘려
 * 배율과 상관없이 같은 빠르기로 움직이게 합니다
 */
const REFERENCE_HEIGHT = 900
/**
 * 구역 안에서도 화면 위에서 이 높이(88%)까지 들어온 대상만 작업합니다. 아직 안 보이는 아래쪽은
 * 기다리고(위로 되돌아가 아래로 벗어난 일은 멈췄다가 다시 보이면 이어서 합니다), 위로 지나간 일은
 * 보이지 않는 자리에서 바로 완성합니다(settlePassed). 그래서 스크롤을 따라 그려집니다
 */
const VIEW_LINE = 0.88
/** '지금 보고 있는 구역'을 고르는 시선 선. 화면 위에서 40% 높이 */
const FOCUS_LINE = 0.4
/** 보고 있는 구역을 바꾸려면 새 구역이 이만큼(px) 더 가까워야 합니다. 경계에서 강조가 오가지 않게 */
const ACTIVE_MARGIN = 24
/** 복제할 때 원본과 목적지의 높이 차이가 이 비율 안이면 내용까지, 넘으면 틀만 복사합니다 */
const SAME_SIZE = 0.25
/** 손으로 끄는 움직임: 천천히 출발해 빨라졌다가 부드럽게 내려놓습니다 */
const DRAG_EASING = 'cubic-bezier(0.45, 0, 0.2, 1)'
/** 틀을 끌어 그릴 때(선택 상자의 easeOut과 같은 곡선) */
const DRAW_EASING = 'cubic-bezier(0.33, 1, 0.68, 1)'
/** 같은 연출이 연달아 나오지 않게 기억해 두는 최근 연출 수 */
const RECENT_EFFECTS = 2
/** 역할별 작업자 수 */
const CREW = new Map<Role, number>()
for (const role of WORKER_ROLES) CREW.set(role, (CREW.get(role) ?? 0) + 1)

export const HIDDEN: TargetState = Object.freeze({ visible: false, applied: 0, typed: 0 })
export const DONE: TargetState = Object.freeze({
  visible: true,
  applied: Number.POSITIVE_INFINITY,
  typed: Number.POSITIVE_INFINITY,
})

const MESSAGES = {
  reducedMotion: '움직임 줄이기 설정에 맞춰 완성된 화면을 바로 보여드려요.',
  finished: '여기까지예요. 천천히 둘러보세요!',
}

/** 이만큼 마우스를 올려 두면 그 요소를 살펴봅니다(인스펙터) */
const INSPECT_DELAY = 3000

function byDomOrder(a: { el: HTMLElement }, b: { el: HTMLElement }) {
  if (a.el === b.el) return 0
  return a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1
}

/** 작업 로그에 쓸 짧은 이름. name을 주지 않았으면 태그 이름을 씁니다 */
function labelOf(target: TargetSpec) {
  return target.name ?? target.el.tagName.toLowerCase()
}

function snippet(text: string, max = 16) {
  const flat = text.replace(/\s+/g, ' ').trim()
  return `"${flat.length > max ? `${flat.slice(0, max)}…` : flat}"`
}

/** 서두르기 신호를 받으면 걸려 있던 대기를 모두 즉시 끝냅니다 */
class RunToken {
  hurried = false
  private wakers = new Set<() => void>()

  hurry() {
    if (this.hurried) return
    this.hurried = true
    const wakers = [...this.wakers]
    this.wakers.clear()
    for (const wake of wakers) wake()
  }

  sleep(ms: number): Promise<void> {
    if (this.hurried || ms <= 0) return Promise.resolve()
    return new Promise((resolve) => {
      const wake = () => {
        clearTimeout(timer)
        this.wakers.delete(wake)
        resolve()
      }
      const timer = setTimeout(wake, ms)
      this.wakers.add(wake)
    })
  }
}

const SETTLED = new RunToken()
SETTLED.hurry()

type Action = 'draw' | 'style' | 'type' | 'reveal' | 'custom'

/**
 * 블록을 놓는 방법. carry: 작업자 쪽에서 들고 와 내려놓기 / unroll: 틀을 끌어 그리면 그 안에서 내용이
 * 드러나기 / paste: 붙여넣기 / stack: 목록 항목을 하나씩 차례로 놓기 / photo: 사진을 작게 집어 와
 * 모서리로 키우기 / duplicate: 위 블록을 복제해 끌어온 뒤 내용 바꾸기
 */
type RevealEffect = 'carry' | 'unroll' | 'paste' | 'stack' | 'photo' | 'duplicate'

/** 연출을 고를 때 서로 견주는 갈래. 제목은 제목끼리, 블록은 블록끼리 되풀이를 피합니다 */
type EffectFamily = 'heading' | 'block'

/** 천천히 출발해 빨라졌다가 부드럽게 멈춥니다 */
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

interface Task {
  key: string
  target: TargetSpec
  sectionId: string
  /** 이 일을 가져갈 수 있는 작업자 역할 */
  roles: readonly Role[]
  action: Action
  deps: string[]
  order: number
  active: boolean
  done: boolean
  /** 구역이 먼저 끝나서 더는 화면을 건드리면 안 되는 작업 */
  cancelled: boolean
  /** 화면에 처음 보였을 때 정한 기한(performance.now 기준) */
  due?: number
}

/**
 * 작업 하나가 원래 빠르기(PACE 적용 전)로 걸리는 대략의 시간(ms). 다음 일을 잡기 전 쉬는 틈 포함.
 * copies: 같은 꼴의 틀이 또 있어 복제해 끌어올 가능성이 큰지, edits: 복사된 글자를 고쳐 쓰는지
 */
function estimate(task: Task, hint: { copies: boolean; edits: boolean }) {
  const gap = 45
  switch (task.action) {
    case 'draw':
      // 새로 그리기(날아가기·끌어 그리기) 또는 복제해 끌어오기(잡기·끌기·내려놓기)
      return (hint.copies ? 1020 : 520) + gap
    case 'style':
      return (task.target.decls?.length ?? 0) * 160 + gap
    case 'type': {
      const length = task.target.text?.length ?? 0
      const typing = Math.min(24 * length, Math.max(400, 1.2 * length))
      if (hint.edits) return 580 + typing + gap
      // 짧은 제목은 옆에서 써서 끌어 놓기·글상자·키우기처럼 손이 더 가는 방법으로 만드는 일이 많습니다
      const heading = /^H[1-4]$/.test(task.target.el.tagName) && length <= 40
      return typing + (heading ? 520 : 0) + gap
    }
    case 'reveal':
      // 사진은 끌어와 키우기, 그 밖은 옮겨 놓기·틀째로 펼치기·붙여넣기·차례로 놓기·복제 가운데 하나
      return (task.target.el.querySelector('img') ? 920 : 620) + gap
    case 'custom':
      return 700 + gap
  }
}

/** 작업 대상이 지금 화면에서 어디에 있는지 */
interface View {
  /** 조금이라도 보이는지 */
  visible: boolean
  /** 작업을 시작해도 될 만큼 들어왔는지(VIEW_LINE) */
  inView: boolean
  cx: number
  cy: number
}

interface Worker {
  role: Role
  overlay: WorkerOverlay
  busy: boolean
  /** 마우스를 오래 올린 요소를 살펴보는 중인지 */
  inspecting: boolean
  inspectTimer?: ReturnType<typeof setInterval>
}

/**
 * 한 페이지의 조립을 지휘합니다.
 *
 * 화면에 보이는 구역마다 대상(target)을 작업으로 쪼개고, 역할이 다른 작업자
 * 여럿이 동시에 가져가 처리합니다. 틀(box)이 그려져야 그 안의 글자·CSS·배치가
 * 시작되고, 그 밖에는 서로 기다리지 않습니다. 구역의 작업이 모두 끝나면 커밋을
 * 남깁니다. 상태는 여기 한곳에 두고 React 쪽은 useSyncExternalStore로 구독만 합니다.
 */
export class BuildDirector {
  private sections = new Map<string, SectionSpec>()
  private targets = new Map<string, TargetSpec>()
  private status = new Map<string, SectionStatus>()
  private targetState = new Map<string, TargetState>()
  private requested = new Set<string>()
  private visibleRatio = new Map<string, number>()
  private committed = new Set<string>()
  /** 조립을 시작한(할 일이 있었던) 구역과 그 시각. 다 만든 기록에 걸린 시간을 적을 때 씁니다 */
  private startedAt = new Map<string, number>()
  private tokens = new Map<string, RunToken>()
  private tasks: Task[] = []
  private taskSeq = 0
  private layer = new OverlayLayer()
  private workers: Worker[]
  private narrator: Promise<void> = Promise.resolve()
  private lines: TerminalLine[] = []
  private lineSeq = 0
  private ui: BuildUi
  private rail: RailItem[] = []
  private listeners = new Set<() => void>()
  private observer: IntersectionObserver | null = null
  /** 화면 위쪽 55% 띠에 걸친 구역을 알려주는 관찰자. 조립 시작 신호입니다 */
  private triggerObserver: IntersectionObserver | null = null
  private triggered = new Set<string>()
  private scrollFrame = 0
  /** 요소 → 대상. 마우스를 올린 요소가 어떤 대상인지 찾을 때 씁니다 */
  private byEl = new WeakMap<Element, TargetSpec>()
  private hoverTarget: TargetSpec | null = null
  private hoverTimer: ReturnType<typeof setTimeout> | undefined
  private highlightTimer: ReturnType<typeof setTimeout> | undefined
  /** 지금 배속. 화면에 보이는 남은 일과 기한으로 정합니다(survey) */
  private speed = 1
  private attached = 0
  private muted = 0
  private dirty = false
  private commitsQueued = false
  /** 복제해 끌어오는 동안 띄운 사본들. 페이지를 떠나면 모두 지웁니다 */
  private ghosts = new Set<HTMLElement>()
  /** 갈래별로 최근에 쓴 연출. 바로 앞과 같은 움직임이 되풀이되지 않게 고를 때 피합니다 */
  private recentEffects: Record<EffectFamily, string[]> = { heading: [], block: [] }
  /** 긴 글을 마지막으로 만든 방법 */
  private lastProse: TextCompose = 'type'
  /** 옆에 써서 끌어 놓을 때 마지막으로 쓴 방향 */
  private lastAside = ''

  constructor() {
    const reducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    // 새로고침하거나 페이지를 옮길 때마다 늘 새로 그립니다. 움직임 줄이기 설정만 완성된 화면으로 보여줍니다
    this.ui = {
      mode: reducedMotion ? 'complete' : 'live',
      finished: false,
      busy: false,
      reducedMotion,
      activeSection: null,
      highlighted: null,
    }
    if (reducedMotion) this.pushLine('info', MESSAGES.reducedMotion, { complete: true })
    this.workers = WORKER_ROLES.map((role) => ({
      role,
      overlay: this.layer.create(role),
      busy: false,
      inspecting: false,
    }))
  }

  // ── 구독 ───────────────────────────────────────────────

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => {
      this.listeners.delete(listener)
    }
  }

  getLines = () => this.lines
  getUi = () => this.ui
  getRail = () => this.rail

  getSectionStatus(id: string): SectionStatus {
    if (this.ui.mode === 'complete') return 'done'
    return this.status.get(id) ?? 'pending'
  }

  getTargetState(id: string, sectionId: string | null): TargetState {
    if (!sectionId || this.getSectionStatus(sectionId) === 'done') return DONE
    return this.targetState.get(id) ?? HIDDEN
  }

  // ── 등록 ───────────────────────────────────────────────

  registerSection(spec: SectionSpec): () => void {
    this.sections.set(spec.id, spec)
    if (!this.status.has(spec.id)) this.status.set(spec.id, 'pending')
    if (this.ui.mode === 'complete' && this.status.get(spec.id) !== 'done') {
      // 안쪽 구역이 바깥 구역보다 먼저 등록되므로, 커밋 줄은 등록이 다 끝난 뒤 문서 순서대로 찍습니다
      this.status.set(spec.id, 'done')
      this.queueCompletedCommits()
    }
    this.observer?.observe(spec.el)
    this.triggerObserver?.observe(spec.el)
    spec.el.addEventListener('focusin', this.onFocusIn)
    this.emit()

    return () => {
      spec.el.removeEventListener('focusin', this.onFocusIn)
      this.observer?.unobserve(spec.el)
      this.triggerObserver?.unobserve(spec.el)
      if (this.sections.get(spec.id) !== spec) return
      this.sections.delete(spec.id)
      this.visibleRatio.delete(spec.id)
      this.triggered.delete(spec.id)
      this.emit()
    }
  }

  registerTarget(spec: TargetSpec): () => void {
    this.targets.set(spec.id, spec)
    this.byEl.set(spec.el, spec)
    return () => {
      if (this.byEl.get(spec.el) === spec) this.byEl.delete(spec.el)
      if (this.targets.get(spec.id) === spec) this.targets.delete(spec.id)
    }
  }

  /** 페이지가 열릴 때 */
  attach() {
    this.attached += 1
    if (this.attached > 1) return
    this.layer.mount()
    this.observer = new IntersectionObserver(this.onIntersect, {
      threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
    })
    // 화면 아래쪽 45%를 잘라낸 띠: 구역이 화면 중간쯤까지 올라와야 걸립니다
    this.triggerObserver = new IntersectionObserver(this.onTrigger, {
      rootMargin: `0px 0px -${Math.round((1 - TRIGGER_LINE) * 100)}% 0px`,
    })
    for (const spec of this.sections.values()) {
      this.observer.observe(spec.el)
      this.triggerObserver.observe(spec.el)
    }
    window.addEventListener('scroll', this.onScroll, { passive: true })
    document.addEventListener('pointerover', this.onPointerOver, { passive: true })
    document.documentElement.addEventListener('pointerleave', this.clearHover)
  }

  /** 페이지를 떠날 때. 진행 중이던 구역은 완성해 둡니다 */
  detach() {
    this.attached = Math.max(0, this.attached - 1)
    if (this.attached > 0) return
    for (const [id, status] of this.status) if (status === 'building') this.finishSection(id)
    this.observer?.disconnect()
    this.observer = null
    this.triggerObserver?.disconnect()
    this.triggerObserver = null
    window.removeEventListener('scroll', this.onScroll)
    document.removeEventListener('pointerover', this.onPointerOver)
    document.documentElement.removeEventListener('pointerleave', this.clearHover)
    cancelAnimationFrame(this.scrollFrame)
    this.clearHover()
    clearTimeout(this.highlightTimer)
    for (const ghost of this.ghosts) ghost.remove()
    this.ghosts.clear()
    this.layer.unmount()
    this.requested.clear()
    this.visibleRatio.clear()
    this.triggered.clear()
  }

  // ── 사용자 조작 ─────────────────────────────────────────

  scrollToSection = (id: string) => {
    const spec = this.sections.get(id)
    if (!spec) return
    spec.el.scrollIntoView({ behavior: this.ui.reducedMotion ? 'auto' : 'smooth', block: 'start' })
  }

  /**
   * 남은 조립을 모두 끝내고 완성된 화면으로 둡니다. 검색·필터로 내용이 바뀔 때 씁니다.
   * 결과가 비어서 끝낼 구역이 하나도 없어도 페이지를 '완성'으로 돌려 두어서,
   * 조건을 지워 다시 나타나는 카드도 완성된 모습으로 보이게 합니다.
   */
  finishAll = () => {
    this.batch(() => {
      for (const spec of this.orderedSections()) this.finishSection(spec.id)
      this.checkFinished()
    })
  }

  // ── 보이는 구역 추적 ────────────────────────────────────

  private onIntersect = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      const spec = this.findSection(entry.target)
      if (!spec) continue
      this.visibleRatio.set(spec.id, this.ratioOf(entry.boundingClientRect, entry.isIntersecting))
    }
    this.updateActive()
    this.requestVisible()
  }

  private onTrigger = (entries: IntersectionObserverEntry[]) => {
    for (const entry of entries) {
      const spec = this.findSection(entry.target)
      if (!spec) continue
      if (entry.isIntersecting) this.triggered.add(spec.id)
      else this.triggered.delete(spec.id)
    }
    this.requestVisible()
  }

  /**
   * 스크롤할 때마다: 맨 아래까지 내려와 더 올라올 수 없는 구역은 화면 중간에 못 와도 조립하고,
   * 조립 중인 구역에서 새로 화면에 들어온 대상이 있으면 쉬던 작업자에게 맡깁니다
   */
  private onScroll = () => {
    if (this.scrollFrame) return
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = 0
      this.updateActive()
      if (this.atBottom()) this.requestVisible()
      // pump도 처음에 지나간 것을 완성하니, 조립 중이 아닐 때만 따로 부릅니다
      if (this.ui.busy) this.pump()
      else this.settlePassed()
    })
  }

  private atBottom() {
    return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4
  }

  private ratioOf(rect: DOMRectReadOnly, intersecting: boolean) {
    if (!intersecting) return 0
    const vh = window.innerHeight
    const visible = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0))
    if (visible <= 0) return 0
    return Math.max(visible / Math.max(1, rect.height), visible / vh)
  }

  /** 조금이라도 화면에 보이는지 */
  private isOnScreen(id: string) {
    return (this.visibleRatio.get(id) ?? 0) > 0
  }

  /**
   * 지금 보고 있는 구역(커밋 기록에서 강조하고 따라가는 줄). 화면 위에서 FOCUS_LINE 높이의 '시선 선'에
   * 걸친 구역을 고르고, 걸친 게 없으면 그 선에 가장 가까운 구역을 고릅니다. 맨 아래까지 내려와
   * 더 올라올 수 없으면 화면에 보이는 마지막 구역입니다. 스크롤할 때마다 다시 판단합니다.
   */
  private updateActive() {
    const vh = window.innerHeight
    const focus = vh * FOCUS_LINE
    const bottom = this.atBottom()
    let best: string | null = null
    let bestDistance = Number.POSITIVE_INFINITY
    let currentDistance = Number.POSITIVE_INFINITY
    for (const spec of this.orderedSections()) {
      if (!spec.commit) continue
      const rect = spec.el.getBoundingClientRect()
      if (rect.bottom <= 0 || rect.top >= vh) continue
      if (bottom) {
        best = spec.id
        continue
      }
      const distance =
        rect.top <= focus && rect.bottom >= focus
          ? 0
          : Math.min(Math.abs(rect.top - focus), Math.abs(rect.bottom - focus))
      if (spec.id === this.ui.activeSection) currentDistance = distance
      if (distance < bestDistance) {
        best = spec.id
        bestDistance = distance
      }
    }
    // 두 구역 사이 경계에서 스크롤이 조금씩 흔들려도 강조가 오가지 않도록, 새 구역이 지금 구역보다
    // 확실히(ACTIVE_MARGIN 넘게) 가까워졌을 때만 바꿉니다
    if (!bottom && currentDistance <= bestDistance + ACTIVE_MARGIN) best = this.ui.activeSection
    if (best !== this.ui.activeSection) {
      this.setUi({ activeSection: best })
      this.scheduleHighlight()
    }
  }

  /**
   * 다 그린 뒤 스크롤이 멈추고 한 구역에 잠시 머물면 커밋 기록의 그 줄을 한 번 은은하게 빛냅니다.
   * 터미널에는 아무 말도 남기지 않습니다.
   */
  private scheduleHighlight() {
    clearTimeout(this.highlightTimer)
    if (!this.ui.finished || this.ui.mode !== 'complete' || this.ui.reducedMotion) return
    this.highlightTimer = setTimeout(() => {
      const id = this.ui.activeSection
      if (id && id !== this.ui.highlighted) this.setUi({ highlighted: id })
    }, 900)
  }

  /**
   * 화면 중간(TRIGGER_LINE)까지 올라온 구역의 조립을 시작합니다. 위로 되돌아가 아래로 벗어난 구역은
   * 완성해 버리지 않고 하던 데서 멈춰 두었다가, 다시 보이면 이어서 그립니다. 위로 지나간 구역은
   * settlePassed가 완성합니다.
   */
  private requestVisible() {
    if (this.ui.mode !== 'live' || this.attached === 0) return
    const bottom = this.atBottom()
    for (const spec of this.orderedSections()) {
      if (this.status.get(spec.id) !== 'pending') continue
      if (this.triggered.has(spec.id) || (bottom && this.isOnScreen(spec.id))) {
        this.requested.add(spec.id)
        this.startSection(spec)
      }
    }
  }

  private onFocusIn = (event: FocusEvent) => {
    // 키보드로 아직 안 보이는 내용에 들어오면 그 구역을 바로 완성합니다
    const spec = this.findSection(event.currentTarget as Element)
    if (spec && this.getSectionStatus(spec.id) !== 'done') this.finishSection(spec.id)
  }

  // ── 조립 ───────────────────────────────────────────────

  private startSection(spec: SectionSpec) {
    const token = new RunToken()
    this.tokens.set(spec.id, token)
    this.setStatus(spec.id, 'building')
    // 안내 문장은 한 줄씩 차례로 찍지만, 조립은 기다리지 않고 바로 시작합니다. 터미널은 구역마다
    // 메인의 말 → 서브 에이전트의 일 순서로 묶어 보여주므로 말이 늦게 찍혀도 제자리에 들어갑니다
    if (spec.guide) {
      const text = spec.guide
      this.narrator = this.narrator.then(() =>
        token.hurried ? undefined : this.say(text, token, spec.id),
      )
    }
    this.enqueueTasks(spec)
    if (this.status.get(spec.id) === 'building') this.startedAt.set(spec.id, performance.now())
    this.pump()
  }

  /** 구역 안의 대상들을 작업으로 쪼갭니다. 안쪽 대상은 바깥 틀이 그려진 뒤에 시작합니다 */
  private enqueueTasks(spec: SectionSpec) {
    const targets = this.orderedTargets(spec.id)
    const boxes = new Map<Element, TargetSpec>()
    for (const target of targets) if (target.kind === 'box') boxes.set(target.el, target)
    const parentBox = (target: TargetSpec) => {
      let el = target.el.parentElement
      while (el && el !== spec.el) {
        const box = boxes.get(el)
        if (box) return box
        el = el.parentElement
      }
      return undefined
    }

    const created: Task[] = []
    const add = (target: TargetSpec, action: Action, role: Role, deps: string[]) => {
      created.push({
        key: `${target.id}:${action}`,
        target,
        sectionId: spec.id,
        roles: target.workers?.length ? target.workers : [role],
        action,
        deps,
        order: (this.taskSeq += 1),
        active: false,
        done: false,
        cancelled: false,
      })
    }
    for (const target of targets) {
      const parent = parentBox(target)
      const deps = parent ? [`${parent.id}:draw`] : []
      if (target.kind === 'box') {
        add(target, 'draw', 'layout', deps)
        if (target.decls?.length) add(target, 'style', 'style', [`${target.id}:draw`])
      } else if (target.kind === 'text') {
        add(target, 'type', 'copy', deps)
      } else if (target.kind === 'reveal') {
        add(target, 'reveal', 'place', deps)
      } else {
        add(target, 'custom', 'place', deps)
      }
    }

    if (created.length === 0) {
      this.finishSection(spec.id)
      return
    }
    this.tasks.push(...created)
  }

  /**
   * 화면 위로 지나간 것은 그 자리에서 완성합니다. 빨리 내리느라 작업자가 손대기 전에 지나친 부분이
   * 빈 채로 남아 그 구역이 커밋 기록에서 계속 '조립 중'으로 남거나, 끝으로 바로 건너뛰어 한 번도 시작하지
   * 못한 구역이 '안 만든 곳'으로 남지 않게 합니다. 화면 위쪽 바깥(bottom ≤ 0)이라 뚝 나타나는 모습은
   * 보이지 않습니다. 안쪽 대상은 바깥 틀이 끝난 뒤에만 완성해서 빈 틀 안에 글자만 뜨지 않게 합니다.
   */
  private settlePassed() {
    if (this.ui.mode !== 'live' || this.attached === 0) return
    const touched = new Set<string>()
    this.batch(() => {
      for (const spec of this.orderedSections()) {
        if (this.status.get(spec.id) !== 'pending') continue
        if (spec.el.getBoundingClientRect().bottom <= 0) this.finishSection(spec.id)
      }
      // 일 목록은 문서 순서(바깥 틀이 먼저)라, 앞에서 완성한 틀 덕분에 안쪽 대상도 같은 차례에 완성됩니다
      for (const task of this.tasks) {
        if (task.active || task.done || task.cancelled) continue
        if (this.status.get(task.sectionId) !== 'building') continue
        if (task.target.el.getBoundingClientRect().bottom > 0) continue
        if (!task.deps.every((key) => this.isDone(key))) continue
        task.done = true
        this.setTarget(task.target.id, DONE)
        touched.add(task.sectionId)
      }
      for (const id of touched) {
        if (!this.tasks.some((task) => task.sectionId === id && !task.done)) this.finishSection(id)
      }
    })
  }

  /** 쉬고 있는 작업자에게 할 수 있는 일을 나눠 줍니다. 그 전에 위로 지나간 것부터 완성합니다 */
  private pump = () => {
    if (this.attached === 0) return
    this.settlePassed()
    const view = this.survey()
    for (const worker of this.workers) {
      if (worker.busy) continue
      const task = this.nextTask(worker, view)
      if (!task) continue
      this.stopInspect(worker)
      task.active = true
      worker.busy = true
      void this.runTask(worker, task).finally(() => {
        task.active = false
        task.done = true
        worker.busy = false
        if (!task.cancelled) this.afterTask(task)
        const hurried = task.cancelled || (this.tokens.get(task.sectionId)?.hurried ?? true)
        // 다음 일을 잡기 전 잠깐 쉬는 틈. 작업자마다 조금씩 달라서 움직임이 자연스럽습니다
        setTimeout(this.pump, hurried ? 0 : this.ms(20 + Math.random() * 50))
      })
    }
  }

  /**
   * 이 작업자가 지금 할 수 있는 일 가운데 하나를 고릅니다. 화면에 들어온(VIEW_LINE) 대상만 맡고,
   * 그중 작업자가 지금 있는 자리에서 가장 가까운 일을 골라 짧게 옮겨 다니며 이어서 일합니다.
   * 처음 출발하는 작업자는 문서 순서상 앞쪽 일부터 맡습니다.
   */
  private nextTask(worker: Worker, view: Map<Task, View>) {
    const ready: Task[] = []
    for (const task of this.tasks) {
      if (!task.roles.includes(worker.role) || task.active || task.done || task.cancelled) continue
      if (this.status.get(task.sectionId) !== 'building') continue
      if (!view.get(task)?.inView) continue
      if (!task.deps.every((key) => this.isDone(key))) continue
      ready.push(task)
    }
    if (ready.length === 0) return undefined
    const here = worker.overlay.current
    if (!here) return ready.reduce((a, b) => (b.order < a.order ? b : a))
    const hx = here.x + here.w / 2
    const hy = here.y + here.h / 2
    let best = ready[0]
    let bestDistance = Number.POSITIVE_INFINITY
    for (const task of ready) {
      const at = view.get(task)
      if (!at) continue
      const distance = Math.hypot(at.cx - hx, at.cy - hy)
      if (distance < bestDistance) {
        best = task
        bestDistance = distance
      }
    }
    return best
  }

  /**
   * 남은 일이 화면 어디에 있는지 훑어 배속을 정하고, 일마다 위치(View)를 돌려줍니다.
   * 화면에 들어온 일에는 그 순간 기한(SCREEN_TARGET 뒤)이 붙고, 다시 화면 밖으로 나가면 기한을
   * 지웁니다(돌아왔을 때 늦었다고 서두르지 않게). 가장 바쁜 역할이 맡을 양과 가장 긴 선후 관계
   * (틀 → 안쪽) 가운데 큰 쪽을 남은 시간 안에 끝낼 수 있게 배속을 올립니다.
   */
  private survey() {
    const now = performance.now()
    const vh = window.innerHeight
    const line = this.atBottom() ? vh : vh * VIEW_LINE
    // 화면이 클수록(배율을 줄였을수록) 한 화면에 담기는 일이 많으니 기한도 그만큼 깁니다
    const screen = Math.min(1.8, Math.max(0.85, vh / REFERENCE_HEIGHT))
    const target = SCREEN_TARGET * screen
    const limit = SCREEN_LIMIT * screen
    const seen = new Map<Task, View>()
    const byKey = new Map<string, Task>()
    for (const task of this.tasks) byKey.set(task.key, task)
    // 같은 꼴(className)의 틀이 둘 이상이면 뒤의 것은 복제해 끌어올 가능성이 큽니다
    const boxClasses = new Map<string, number>()
    for (const t of this.targets.values()) {
      if (t.kind === 'box')
        boxClasses.set(t.el.className, (boxClasses.get(t.el.className) ?? 0) + 1)
    }
    const left = (task: Task) =>
      estimate(task, {
        copies: (boxClasses.get(task.target.el.className) ?? 0) > 1,
        edits: this.targetState.get(task.target.id)?.prior !== undefined,
      }) * (task.active ? 0.5 : 1)
    const chains = new Map<Task, number>()
    const chain = (task: Task): number => {
      const known = chains.get(task)
      if (known !== undefined) return known
      let before = 0
      for (const key of task.deps) {
        const dep = byKey.get(key)
        if (dep && !dep.done && !dep.cancelled) before = Math.max(before, chain(dep))
      }
      const total = before + left(task)
      chains.set(task, total)
      return total
    }

    const load = new Map<Role, number>()
    let longest = 0
    let due = Number.POSITIVE_INFINITY
    for (const task of this.tasks) {
      if (task.done || task.cancelled) continue
      if (this.status.get(task.sectionId) !== 'building') continue
      const rect = task.target.el.getBoundingClientRect()
      const visible = rect.bottom > 0 && rect.top < vh
      const inView = rect.bottom > 0 && rect.top < line
      seen.set(task, {
        visible,
        inView,
        cx: rect.left + rect.width / 2,
        cy: rect.top + rect.height / 2,
      })
      if (!inView) {
        if (!task.active) task.due = undefined
        continue
      }
      task.due ??= now + target
      due = Math.min(due, task.due)
      const share = left(task) / task.roles.length
      for (const role of task.roles) load.set(role, (load.get(role) ?? 0) + share)
      longest = Math.max(longest, chain(task))
    }

    let busiest = longest
    for (const [role, amount] of load) busiest = Math.max(busiest, amount / (CREW.get(role) ?? 1))
    if (busiest === 0) {
      this.speed = 1
      return seen
    }
    const late = now > due + (limit - target)
    const wanted = (busiest * PACE * 1.15) / Math.max(200, due - now)
    this.speed = Math.min(late ? LATE_SPEED : MAX_SPEED, Math.max(1, wanted))
    return seen
  }

  private isDone(key: string) {
    const task = this.tasks.find((t) => t.key === key)
    return !task || task.done
  }

  /**
   * 복제 원본 찾기: 이 틀보다 앞에 있고, 같은 꼴(className)이며, 이미 그려져 있고,
   * 지금 화면에 보이고, 크기가 비슷하고, 너무 멀지 않은 틀 가운데 가장 가까운 것.
   */
  private duplicateSource(target: TargetSpec) {
    const className = target.el.className
    if (!className) return undefined
    const rect = target.el.getBoundingClientRect()
    let best: TargetSpec | undefined
    for (const other of this.targets.values()) {
      if (other === target || other.kind !== 'box' || other.el.className !== className) continue
      if (!(other.el.compareDocumentPosition(target.el) & Node.DOCUMENT_POSITION_FOLLOWING))
        continue
      if (!this.getTargetState(other.id, other.sectionId).visible) continue
      // 통째로 본떠 오므로 안쪽까지 다 그려진 원본만 씁니다
      if (other.el.contains(target.el) || !this.subtreeDone(other.el)) continue
      const r = other.el.getBoundingClientRect()
      if (r.bottom < 60 || r.top > window.innerHeight) continue
      // 폭이 비슷하면 높이가 달라도 복제한 뒤 늘려 맞춥니다
      if (Math.abs(r.width - rect.width) > rect.width * 0.4) continue
      const distance = Math.hypot(r.left - rect.left, r.top - rect.top)
      if (distance < 4 || distance > 720) continue
      if (!best || best.el.compareDocumentPosition(other.el) & Node.DOCUMENT_POSITION_FOLLOWING) {
        best = other
      }
    }
    return best
  }

  /** 이 요소와 그 안의 대상이 모두 다 그려졌는지 */
  private subtreeDone(el: HTMLElement) {
    for (const task of this.tasks) {
      if (task.done || task.cancelled) continue
      if (el === task.target.el || el.contains(task.target.el)) return false
    }
    return true
  }

  /** 이 요소 안(자신 제외)에 있는 한 종류의 대상들, 문서 순서대로 */
  private targetsInside(el: HTMLElement, kind: TargetKind) {
    return [...this.targets.values()]
      .filter((t) => t.kind === kind && t.el !== el && el.contains(t.el))
      .sort(byDomOrder)
  }

  /**
   * 복제본을 내려놓은 뒤의 상태. 디자인은 그대로 복사했으니 틀과 안쪽 틀은 CSS까지 붙은 채로 보이고,
   * 안쪽 글자는 원본 카드의 글자가 딸려 온 상태가 됩니다(텍스트 작업자가 곧 선택해서 고쳐 씁니다).
   * 사진·태그처럼 바꿔 끼울 것은 비워 두었다가 배치 작업자가 들고 옵니다.
   * withContent가 false(틀만 복제)면 바깥 틀만 CSS까지 붙은 채로 두고, 안쪽은 평소처럼 새로 만듭니다.
   */
  private adoptCopy(target: TargetSpec, source: TargetSpec, withContent: boolean) {
    this.batch(() => {
      if (!withContent) {
        this.setTarget(target.id, { visible: true, applied: target.decls?.length ?? 0, typed: 0 })
        for (const t of this.tasks) if (t.target === target && !t.active) t.done = true
        return
      }
      for (const box of [target, ...this.targetsInside(target.el, 'box')]) {
        this.setTarget(box.id, { visible: true, applied: box.decls?.length ?? 0, typed: 0 })
        for (const t of this.tasks) if (t.target === box && !t.active) t.done = true
      }
      // 글자는 같은 꼴(태그·className)끼리 순서대로 짝지어 원본 글자를 딸려 보냅니다
      const pool = new Map<string, string[]>()
      const keyOf = (t: TargetSpec) => `${t.el.tagName}.${t.el.className}`
      for (const t of this.targetsInside(source.el, 'text')) {
        pool.set(keyOf(t), [...(pool.get(keyOf(t)) ?? []), t.text ?? ''])
      }
      for (const text of this.targetsInside(target.el, 'text')) {
        const prior = pool.get(keyOf(text))?.shift()
        if (prior === undefined) continue
        if (prior === text.text) {
          // 글자까지 같으면 고칠 것이 없습니다
          this.setTarget(text.id, DONE)
          for (const t of this.tasks) if (t.target === text && !t.active) t.done = true
        } else {
          this.setTarget(text.id, { visible: true, applied: 0, typed: 0, prior })
        }
      }
    })
  }

  /** duration 동안 매 프레임 onFrame(0~1)을 부릅니다. 서두르라는 신호가 오면 바로 끝(1)으로 갑니다 */
  private tween(duration: number, token: RunToken, onFrame: (t: number) => void) {
    return new Promise<void>((resolve) => {
      const start = performance.now()
      const frame = (now: number) => {
        const t = token.hurried || duration <= 0 ? 1 : Math.min(1, (now - start) / duration)
        onFrame(t)
        if (t >= 1) resolve()
        else requestAnimationFrame(frame)
      }
      requestAnimationFrame(frame)
    })
  }

  /**
   * 복제해 끌어오기(⌥ 드래그). 다 그려진 같은 모양의 틀을 통째로 본떠 새 자리로 끌어다 놓고,
   * 내려놓으면 진짜 틀로 바꿔 끼웁니다. 사본은 매 프레임 원본과 목적지의 실제 위치 사이를
   * 이어서, 끄는 도중에 스크롤해도 어긋나지 않습니다.
   */
  private async cloneInto(
    worker: Worker,
    task: Task,
    source: TargetSpec,
    token: RunToken,
    alive: () => boolean,
  ) {
    const target = task.target
    const overlay = worker.overlay
    // 크기가 비슷하면 내용까지 통째로 복사해 와서 글자를 고쳐 쓰고, 많이 다르면 틀(디자인)만 복사해
    // 끌어오면서 크기를 맞춥니다. 글자가 많은 카드를 작은 자리로 줄이면 안에서 글자가 잘려 보이기 때문입니다
    const from = source.el.getBoundingClientRect()
    const to = target.el.getBoundingClientRect()
    const withContent =
      Math.abs(from.height - to.height) <= Math.max(from.height, to.height) * SAME_SIZE
    overlay.select(source.el, this.ms(240))
    overlay.note(withContent ? '⌥ 복제' : '⌥ 틀만 복제')
    await token.sleep(this.show(260))
    if (!alive()) return
    const ghost = this.layer.ghost(source.el, withContent)
    if (!ghost) return
    this.ghosts.add(ghost)
    try {
      overlay.select(ghost, 0)
      await this.tween(this.show(680), token, (t) => {
        const a = source.el.getBoundingClientRect()
        const b = target.el.getBoundingClientRect()
        const k = easeInOut(t)
        ghost.style.left = `${a.left + (b.left - a.left) * k}px`
        ghost.style.top = `${a.top + (b.top - a.top) * k}px`
        ghost.style.width = `${a.width + (b.width - a.width) * k}px`
        ghost.style.height = `${a.height + (b.height - a.height) * k}px`
        // 사본을 옮긴 바로 그 프레임에 선택 상자도 맞춰서, 빠르게 끌 때 상자가 한 프레임 뒤처지지 않게 합니다
        overlay.render(performance.now())
      })
      if (!alive()) return
      this.adoptCopy(target, source, withContent)
      overlay.select(target.el, 0)
      overlay.note(null)
      this.work(
        target,
        'layout',
        `${labelOf(target)}  ${withContent ? '⌥ 복제 → 끌어와 놓기' : '⌥ 틀만 복제 → 끌어와 크기 맞춤'}`,
      )
      await token.sleep(this.show(80))
    } finally {
      // 사본을 지우기 전에 상자를 진짜 틀로 옮겨 두어, 중간에 끊겨도 상자가 빈자리로 튀지 않게 합니다
      overlay.select(target.el, 0)
      ghost.remove()
      this.ghosts.delete(ghost)
    }
  }

  // ── 연출 고르기 ─────────────────────────────────────────

  /**
   * 여러 방법 가운데 무게대로 하나를 고르되, 같은 갈래(제목끼리, 블록끼리)에서 최근에 쓴 방법은 되도록
   * 피합니다. 같은 움직임이 되풀이되면 사람이 도구를 바꿔 가며 디자인하는 느낌이 떨어지기 때문입니다
   */
  private pickEffect<T extends string>(
    family: EffectFamily,
    options: ReadonlyArray<readonly [T, number]>,
  ): T {
    const recent = this.recentEffects[family]
    const fresh = options.filter(([name]) => !recent.includes(name))
    const pool = fresh.length > 0 ? fresh : options
    let roll = Math.random() * pool.reduce((sum, [, weight]) => sum + weight, 0)
    for (const [name, weight] of pool) {
      roll -= weight
      if (roll <= 0) return this.noteEffect(family, name)
    }
    return this.noteEffect(family, pool[pool.length - 1][0])
  }

  private noteEffect<T extends string>(family: EffectFamily, name: T): T {
    this.recentEffects[family] = [name, ...this.recentEffects[family]].slice(0, RECENT_EFFECTS)
    return name
  }

  /**
   * 글자를 만드는 방법. 정해 둔 방법(페이지의 큰 제목)이 있으면 그대로, 없으면 제목은 여러 방법 가운데
   * 앞의 제목들과 다르게 고릅니다. 긴 글은 대부분 제자리에서 입력하고 가끔 글상자·붙여넣기를 섞으며,
   * 이름표·날짜 같은 짧은 글자는 늘 제자리에서 입력합니다
   */
  private textEffect(target: TargetSpec): TextCompose {
    const length = target.text?.length ?? 0
    if (target.compose === 'menu') {
      return this.noteEffect('heading', this.menuSource(target) ? 'menu' : 'grow')
    }
    if (target.compose === 'rewrite') {
      return this.noteEffect('heading', target.draft ? 'rewrite' : 'type')
    }
    if (target.compose) return this.noteEffect('heading', target.compose)
    if (/^H[1-4]$/.test(target.el.tagName) && length <= 40) {
      return this.pickEffect<TextCompose>('heading', [
        ['aside', 3],
        ['box', 2],
        ['type', 2],
        ['grow', 1.5],
        ['paste', 1],
      ])
    }
    if (length > 40) {
      const roll = Math.random()
      const pick: TextCompose = roll < 0.18 ? 'box' : roll < 0.3 ? 'paste' : 'type'
      // 글상자·붙여넣기는 연달아 나오지 않게 합니다(입력은 기본이라 이어져도 괜찮습니다)
      this.lastProse = pick !== 'type' && pick === this.lastProse ? 'type' : pick
      return this.lastProse
    }
    return 'type'
  }

  /** 블록을 놓는 방법. 사진·목록·코드나 표·그 밖의 블록마다 어울리는 방법들 가운데 고릅니다 */
  private revealEffect(target: TargetSpec): RevealEffect {
    const el = target.el
    if (el.querySelector('img')) {
      return this.pickEffect<RevealEffect>('block', [
        ['photo', 3],
        ['unroll', 1.5],
      ])
    }
    if (el.matches('ul, ol') && this.listItems(el).length >= 2) {
      return this.pickEffect<RevealEffect>('block', [
        ['stack', 3],
        ['carry', 1.5],
        ['unroll', 1],
        ['paste', 1],
      ])
    }
    if (el.matches('pre, table') || el.querySelector('pre, table, iframe')) {
      return this.pickEffect<RevealEffect>('block', [
        ['unroll', 2.5],
        ['carry', 1.5],
        ['paste', 1],
      ])
    }
    const options: Array<readonly [RevealEffect, number]> = [
      ['carry', 2.5],
      ['unroll', 2],
      ['paste', 1.5],
    ]
    if (this.duplicateBlock(target)) options.push(['duplicate', 2.5])
    return this.pickEffect('block', options)
  }

  private listItems(el: HTMLElement) {
    return [...el.children].filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.tagName === 'LI',
    )
  }

  /**
   * 위에서 복제해 올 블록. 몇 칸 위까지(제목 하나쯤 건너서도) 가장 가까운 같은 종류의 블록을 찾고,
   * 그 블록이 다 놓여 있고 화면에 보이고 폭이 같을 때만 씁니다(본문 문단처럼 같은 꼴이 되풀이되는 곳)
   */
  private duplicateBlock(target: TargetSpec) {
    let prev = target.el.previousElementSibling
    for (let hops = 0; prev && hops < 4; hops += 1, prev = prev.previousElementSibling) {
      if (!(prev instanceof HTMLElement) || prev.tagName !== target.el.tagName) continue
      const spec = this.byEl.get(prev)
      if (!spec || spec.kind !== 'reveal') return undefined
      if (!this.getTargetState(spec.id, spec.sectionId).visible || !this.subtreeDone(prev)) {
        return undefined
      }
      const a = prev.getBoundingClientRect()
      const b = target.el.getBoundingClientRect()
      if (a.bottom < 60 || a.top > window.innerHeight) return undefined
      return Math.abs(a.width - b.width) <= 2 ? spec : undefined
    }
    return undefined
  }

  /**
   * 머리글 메뉴에서 이 제목과 같은 글자. 메뉴가 안 보이거나 아직 조립 중이면(글자가 덜 쓰였으면) 없습니다
   */
  private menuSource(target: TargetSpec) {
    const text = (target.text ?? '').trim()
    if (!text) return null
    for (const link of document.querySelectorAll<HTMLElement>('header nav a')) {
      if (link.textContent?.trim() !== text) continue
      if (link.querySelector('[data-bt-visible="false"]')) return null
      if (getComputedStyle(link).visibility === 'hidden') return null
      const rect = link.getBoundingClientRect()
      return rect.width > 0 && rect.bottom > 0 ? link : null
    }
    return null
  }

  /** 글자가 실제로 차지하는 자리. 아직 안 쓴 글자도 투명하게 자리를 잡고 있어 미리 잴 수 있습니다 */
  private glyphRect(el: HTMLElement) {
    const shown = el.querySelector<HTMLElement>(':scope > [aria-hidden="true"]')
    const range = document.createRange()
    range.selectNodeContents(shown ?? el)
    const rect = range.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0 ? rect : el.getBoundingClientRect()
  }

  /**
   * 옆에 써 둘 자리. 글자가 실제로 차지하는 폭을 기준으로 화면 안에 들어오는 방향(오른쪽·왼쪽·아래·위)
   * 가운데 고르고, 거리와 비껴 가는 정도도 그때그때 달리합니다. 바로 앞과 같은 방향은 피합니다
   */
  private asideOffset(target: TargetSpec) {
    const rect = this.glyphRect(target.el)
    const vw = document.documentElement.clientWidth
    const vh = window.innerHeight
    const reach = 60 + Math.random() * 90
    const drift = (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 20)
    const rise = 28 + Math.random() * 26
    const options: Array<readonly [string, number, { dx: number; dy: number }]> = []
    if (rect.right + reach < vw - 12) options.push(['right', 3, { dx: reach, dy: drift }])
    if (rect.left - reach > 12) options.push(['left', 2, { dx: -reach, dy: drift }])
    if (rect.bottom + rise < vh - 16) options.push(['below', 2, { dx: drift * 2, dy: rise }])
    if (rect.top - rise > 72) options.push(['above', 1.5, { dx: drift * 2, dy: -rise }])
    if (options.length === 0) return { dx: 0, dy: rise }
    const fresh = options.filter(([name]) => name !== this.lastAside)
    const pool = fresh.length > 0 ? fresh : options
    let roll = Math.random() * pool.reduce((sum, [, weight]) => sum + weight, 0)
    let picked = pool[pool.length - 1]
    for (const option of pool) {
      roll -= option[1]
      if (roll <= 0) {
        picked = option
        break
      }
    }
    this.lastAside = picked[0]
    return picked[2]
  }

  // ── 글자 만들기 ─────────────────────────────────────────

  /** 글자 하나를 고른 방법대로 만듭니다 */
  private async composeText(
    worker: Worker,
    target: TargetSpec,
    effect: TextCompose,
    perChar: number,
    token: RunToken,
    alive: () => boolean,
  ) {
    const overlay = worker.overlay
    const label = labelOf(target)
    const text = target.text ?? ''
    switch (effect) {
      case 'aside':
        return this.writeAside(worker, target, perChar, token, alive)
      case 'grow':
        return this.growText(worker, target, perChar, token, alive)
      case 'menu':
        return this.copyFromMenu(worker, target, perChar, token, alive)
      case 'rewrite':
        return this.rewriteText(worker, target, token, alive)
      case 'box': {
        // 글상자 도구로 자리를 끌어 그린 뒤 그 안에 입력합니다
        await overlay.draw(target.el, this.ms(220), this.show(380), (ms) => token.sleep(ms))
        if (!alive()) return
        this.work(target, 'copy', `${label}  글상자 → ${snippet(text)}`)
        await this.typeInto(target.id, text.length, perChar, token, alive)
        return
      }
      case 'paste': {
        overlay.select(target.el, this.ms(240))
        await token.sleep(this.ms(160))
        if (!alive()) return
        // 붙여넣은 직후처럼 글자 전체가 잠깐 선택된 채로 보였다가 풀립니다
        this.setTarget(target.id, {
          visible: true,
          applied: 0,
          typed: 0,
          prior: text,
          selected: true,
        })
        this.work(target, 'copy', `${label}  ⌘V ${snippet(text)}`)
        await token.sleep(this.show(420))
        if (alive()) this.setTarget(target.id, DONE)
        return
      }
      default:
        overlay.select(target.el, this.ms(240))
        this.work(target, 'copy', `${label}  ${snippet(text)}`)
        await this.typeInto(target.id, text.length, perChar, token, alive)
    }
  }

  /** 옆 빈자리에 글상자를 만들어 쓴 뒤, 제자리로 끌어다 놓습니다. 끄는 빠르기도 조금씩 다릅니다 */
  /**
   * 초안을 먼저 썼다가 한 글자씩 지우고 진짜 글자로 다시 씁니다(예: 'Project'라고 썼다가 '프로젝트'로).
   * 사람이 문구를 고민하며 바꾸는 모습입니다. 글자 하나하나가 보이도록 배속 상한(SHOW_SPEED)을 둡니다
   */
  private async rewriteText(
    worker: Worker,
    target: TargetSpec,
    token: RunToken,
    alive: () => boolean,
  ) {
    const draft = target.draft ?? ''
    const text = target.text ?? ''
    const label = labelOf(target)
    const showDraft = (length: number) =>
      this.setTarget(target.id, {
        visible: true,
        applied: 0,
        typed: 0,
        prior: draft.slice(0, length),
      })
    worker.overlay.select(target.el, this.ms(240))
    this.work(target, 'copy', `${label}  ${snippet(draft)}`)
    await token.sleep(this.ms(100))
    for (let length = 1; length <= draft.length; length += 1) {
      if (!alive()) return
      showDraft(length)
      await token.sleep(this.show(44))
    }
    // 잠깐 멈칫했다가 지웁니다(지우는 손은 쓰는 손보다 빠릅니다)
    await token.sleep(this.show(300))
    this.work(target, 'copy', `${label}  ${snippet(draft)} → ${snippet(text)}`)
    for (let length = draft.length - 1; length >= 0; length -= 1) {
      if (!alive()) return
      showDraft(length)
      await token.sleep(this.show(24))
    }
    await token.sleep(this.show(140))
    if (!alive()) return
    await this.typeInto(target.id, text.length, 64, token, alive, true)
  }

  private async writeAside(
    worker: Worker,
    target: TargetSpec,
    perChar: number,
    token: RunToken,
    alive: () => boolean,
  ) {
    const el = target.el
    const text = target.text ?? ''
    const label = labelOf(target)
    const aside = this.asideOffset(target)
    const offset = `translate(${aside.dx}px, ${aside.dy}px)`
    worker.overlay.select(el, this.ms(240))
    this.work(target, 'copy', `${label}  ${snippet(text)}`)
    el.style.transform = offset
    try {
      await token.sleep(this.ms(120))
      if (!alive()) return
      await this.typeInto(target.id, text.length, perChar, token, alive)
      if (!alive()) return
      await token.sleep(this.ms(110 + Math.random() * 120))
      const duration = this.show(440 + Math.random() * 200)
      el.style.transform = ''
      const drag = el.animate([{ transform: offset }, { transform: 'none' }], {
        duration,
        easing: DRAG_EASING,
      })
      this.work(target, 'copy', `${label}  끌어서 제자리에 놓기`)
      await token.sleep(duration)
      drag.finish()
    } finally {
      el.style.transform = ''
    }
  }

  /**
   * 작게 써 두고 오른쪽 아래 모서리를 끌어 키웁니다(디자인 도구에서 글자 층의 크기를 바꾸듯).
   * 키우는 동안 크기(W × H)가 함께 바뀌고, transform으로만 키워서 둘레의 배치는 움직이지 않습니다
   */
  private async growText(
    worker: Worker,
    target: TargetSpec,
    perChar: number,
    token: RunToken,
    alive: () => boolean,
  ) {
    const el = target.el
    const overlay = worker.overlay
    const label = labelOf(target)
    const text = target.text ?? ''
    const style = getComputedStyle(el)
    const small = Math.min(0.6, Math.max(0.3, 15 / (parseFloat(style.fontSize) || 16)))
    const align = style.textAlign
    const origin =
      align === 'center' ? '50% 0' : align === 'right' || align === 'end' ? '100% 0' : '0 0'
    el.style.transformOrigin = origin
    el.style.transform = `scale(${small})`
    try {
      overlay.select(el, this.ms(240))
      this.work(target, 'copy', `${label}  ${snippet(text)}`)
      await token.sleep(this.ms(120))
      if (!alive()) return
      await this.typeInto(target.id, text.length, perChar, token, alive)
      if (!alive()) return
      await token.sleep(this.ms(180))
      overlay.select(el, 0, { badge: true })
      this.work(target, 'copy', `${label}  모서리를 끌어 키우기`)
      const duration = this.show(640)
      el.style.transform = ''
      const resize = el.animate(
        [
          { transformOrigin: origin, transform: `scale(${small})` },
          { transformOrigin: origin, transform: 'none' },
        ],
        { duration, easing: DRAG_EASING },
      )
      await token.sleep(duration)
      resize.finish()
    } finally {
      el.style.transform = ''
      el.style.transformOrigin = ''
      overlay.select(el, 0)
    }
  }

  /**
   * 머리글 메뉴의 같은 글자를 복사해(⌘C) 제목 자리로 끌어오며 제목 크기로 키우고, 내려놓으면 진짜
   * 제목으로 바꿔 끼웁니다(굵기·색이 제목 모양으로 바뀜). 그동안 선택 상자 층을 머리글 위로 올려 둡니다.
   * 사본은 매 프레임 두 자리의 실제 위치 사이를 이어서, 끄는 도중에 스크롤해도 어긋나지 않습니다
   */
  private async copyFromMenu(
    worker: Worker,
    target: TargetSpec,
    perChar: number,
    token: RunToken,
    alive: () => boolean,
  ) {
    const source = this.menuSource(target)
    if (!source) return this.growText(worker, target, perChar, token, alive)
    const el = target.el
    const overlay = worker.overlay
    const label = labelOf(target)
    const text = target.text ?? ''
    let ghost: HTMLElement | null = null
    this.layer.lift(true)
    try {
      // 사용자 의견(너무 느림)으로 잡기·끌기·바꿔 끼우기를 모두 짧게 했습니다(전체 약 0.9~1.3초)
      overlay.select(source, this.ms(200))
      overlay.note('⌘C')
      this.work(target, 'copy', `${label}  메뉴의 ${snippet(text)} 복사`)
      await token.sleep(this.show(220))
      if (!alive()) return
      ghost = this.layer.ghostText(source, text)
      if (!ghost) {
        this.setTarget(target.id, DONE)
        return
      }
      this.ghosts.add(ghost)
      const copy = ghost
      const start = copy.getBoundingClientRect()
      const scale =
        (parseFloat(getComputedStyle(el).fontSize) || 16) / (parseFloat(copy.style.fontSize) || 16)
      overlay.note(null)
      overlay.select(copy, 0, { badge: true })
      await this.tween(this.show(440), token, (t) => {
        const a = this.glyphRect(source)
        const b = this.glyphRect(el)
        const k = easeInOut(t)
        const s = 1 + (scale - 1) * k
        const middle = a.top + a.height / 2 + (b.top + b.height / 2 - (a.top + a.height / 2)) * k
        copy.style.left = `${a.left + (b.left - a.left) * k}px`
        copy.style.top = `${middle - (start.height * s) / 2}px`
        copy.style.transform = `scale(${s})`
        overlay.render(performance.now())
      })
      if (!alive()) return
      this.setTarget(target.id, DONE)
      overlay.select(el, 0)
      this.work(target, 'copy', `${label}  ⌘V 붙여넣고 제목 크기로 키우기`)
      const duration = this.show(160)
      copy.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: 'forwards' })
      const swap = el.animate([{ opacity: 0 }, { opacity: 1 }], { duration })
      await token.sleep(duration)
      swap.finish()
    } finally {
      overlay.note(null)
      overlay.select(el, 0)
      this.layer.lift(false)
      if (ghost) {
        ghost.remove()
        this.ghosts.delete(ghost)
      }
    }
  }

  // ── 블록 놓기 ───────────────────────────────────────────

  /** 블록 하나를 고른 방법대로 놓습니다 */
  private async placeBlock(
    worker: Worker,
    target: TargetSpec,
    effect: RevealEffect,
    token: RunToken,
    alive: () => boolean,
  ) {
    const overlay = worker.overlay
    const label = labelOf(target)
    const el = target.el
    switch (effect) {
      case 'unroll': {
        // 틀을 끌어 그리면 그 안에서 내용이 드러납니다(틀째로 펼치기)
        const fly = overlay.current ? this.ms(220) : 0
        const grow = this.show(560)
        this.setTarget(target.id, DONE)
        const clip = el.animate(
          [{ clipPath: 'inset(0 100% 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
          { duration: grow, delay: fly, easing: DRAW_EASING, fill: 'backwards' },
        )
        this.work(target, worker.role, `${label}  틀째로 끌어 펼치기`)
        await overlay.draw(el, fly, grow, (ms) => token.sleep(ms))
        clip.finish()
        return
      }
      case 'paste': {
        overlay.select(el, this.ms(220))
        await token.sleep(this.ms(150))
        if (!alive()) return
        overlay.note('⌘V')
        overlay.flash()
        this.setTarget(target.id, DONE)
        const pop = el.animate(
          [
            { opacity: 0, transform: 'scale(0.985)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: this.show(240), easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        )
        this.work(target, worker.role, `${label}  ⌘V 붙여넣기`)
        await token.sleep(this.show(460))
        pop.finish()
        overlay.note(null)
        return
      }
      case 'stack': {
        // 목록 항목을 하나씩 집어 차례로 놓습니다. 선택 상자도 항목을 따라 한 칸씩 내려갑니다
        const items = this.listItems(el)
        overlay.select(el, this.ms(220))
        await token.sleep(this.ms(120))
        if (!alive()) return
        this.setTarget(target.id, DONE)
        const step = Math.min(this.show(120), this.show(760) / Math.max(1, items.length))
        const motions = items.map((item, i) =>
          item.animate(
            [
              { opacity: 0, transform: 'translateX(-14px)' },
              { opacity: 1, transform: 'none' },
            ],
            { duration: this.show(300), delay: i * step, easing: DRAG_EASING, fill: 'backwards' },
          ),
        )
        this.work(target, worker.role, `${label}  항목 ${items.length}개 차례로 놓기`)
        for (const item of items) {
          overlay.select(item, this.ms(90))
          await token.sleep(step)
          if (!alive()) break
        }
        overlay.select(el, this.ms(160))
        await token.sleep(this.show(240))
        for (const motion of motions) motion.finish()
        return
      }
      case 'duplicate': {
        const source = this.duplicateBlock(target)
        if (source) return this.duplicateInto(worker, target, source, token, alive)
        return this.carryBlock(worker, target, false, token, alive)
      }
      case 'photo':
        return this.carryBlock(worker, target, true, token, alive)
      default:
        return this.carryBlock(worker, target, false, token, alive)
    }
  }

  /**
   * 작업자가 있던 쪽(처음이면 왼쪽 아래)에서 집어 와 제자리에 내려놓습니다. 사진은 작게 집어 와
   * 틀 왼쪽 위에 맞춘 뒤, 오른쪽 아래 모서리를 끌어 틀에 맞게 키웁니다
   */
  private async carryBlock(
    worker: Worker,
    target: TargetSpec,
    photo: boolean,
    token: RunToken,
    alive: () => boolean,
  ) {
    const overlay = worker.overlay
    const label = labelOf(target)
    const from = overlay.current
    overlay.select(target.el, this.ms(220))
    await token.sleep(this.ms(100))
    if (!alive()) return
    const to = target.el.getBoundingClientRect()
    let vx = -40
    let vy = 60
    if (from) {
      vx = from.x + from.w / 2 - (to.left + to.width / 2)
      vy = from.y + from.h / 2 - (to.top + to.height / 2)
    }
    const reach = Math.min(1, (photo ? 160 : 120) / (Math.hypot(vx, vy) || 1)) * 0.85
    const dx = vx * reach
    const dy = vy * reach
    this.setTarget(target.id, DONE)
    if (photo) {
      const duration = this.show(820)
      const carry = target.el.animate(
        [
          {
            transformOrigin: '0 0',
            transform: `translate(${dx}px, ${dy}px) scale(0.42)`,
            opacity: 0.6,
            offset: 0,
            easing: DRAG_EASING,
          },
          {
            transformOrigin: '0 0',
            transform: 'translate(0px, 0px) scale(0.42)',
            opacity: 1,
            offset: 0.5,
            easing: DRAG_EASING,
          },
          { transformOrigin: '0 0', transform: 'none', opacity: 1, offset: 1 },
        ],
        { duration },
      )
      this.work(target, worker.role, `${label}  끌어와 모서리로 크기 맞춤`)
      await token.sleep(duration)
      carry.finish()
      return
    }
    const duration = this.ms(440)
    const carry = target.el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px)`, opacity: 0.35 },
        { transform: 'none', opacity: 1 },
      ],
      { duration, easing: DRAG_EASING },
    )
    this.work(target, worker.role, `${label}  옮겨 놓기`)
    await token.sleep(duration)
    carry.finish()
  }

  /**
   * 바로 위 블록을 복제해(⌥ 드래그) 이 자리로 끌어온 뒤, 내려놓은 사본의 내용을 통째로 새 내용으로
   * 바꿔 끼웁니다. 사본은 매 프레임 두 자리의 실제 위치 사이를 이어서, 스크롤해도 어긋나지 않습니다
   */
  private async duplicateInto(
    worker: Worker,
    target: TargetSpec,
    source: TargetSpec,
    token: RunToken,
    alive: () => boolean,
  ) {
    const overlay = worker.overlay
    overlay.select(source.el, this.ms(240))
    overlay.note('⌥ 복제')
    await token.sleep(this.show(260))
    if (!alive()) return
    const ghost = this.layer.ghost(source.el, true)
    if (!ghost) {
      this.setTarget(target.id, DONE)
      return
    }
    this.ghosts.add(ghost)
    // 본문 글자 모양은 감싸는 틀에서 물려받으므로, 사본에도 같은 글꼴·크기·색을 그대로 붙여 둡니다
    const style = getComputedStyle(source.el)
    Object.assign(ghost.style, {
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontWeight: style.fontWeight,
      lineHeight: style.lineHeight,
      letterSpacing: style.letterSpacing,
      color: style.color,
    })
    try {
      overlay.select(ghost, 0)
      await this.tween(this.show(620), token, (t) => {
        const a = source.el.getBoundingClientRect()
        const b = target.el.getBoundingClientRect()
        const k = easeInOut(t)
        ghost.style.left = `${a.left + (b.left - a.left) * k}px`
        ghost.style.top = `${a.top + (b.top - a.top) * k}px`
        ghost.style.width = `${a.width + (b.width - a.width) * k}px`
        ghost.style.height = `${a.height + (b.height - a.height) * k}px`
        overlay.render(performance.now())
      })
      if (!alive()) return
      overlay.select(target.el, 0)
      overlay.note('⌘A → ⌘V')
      overlay.flash()
      this.setTarget(target.id, DONE)
      this.work(target, worker.role, `${labelOf(target)}  ⌥ 위 블록 복제 → 내용 바꾸기`)
      const duration = this.show(320)
      ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration, fill: 'forwards' })
      const swap = target.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration })
      await token.sleep(duration)
      swap.finish()
    } finally {
      overlay.note(null)
      overlay.select(target.el, 0)
      ghost.remove()
      this.ghosts.delete(ghost)
    }
  }

  private afterTask(task: Task) {
    const remaining = this.tasks.some((t) => t.sectionId === task.sectionId && !t.done)
    if (!remaining) this.finishSection(task.sectionId)
  }

  private async runTask(worker: Worker, task: Task) {
    const token = this.tokens.get(task.sectionId) ?? SETTLED
    const target = task.target
    const overlay = worker.overlay
    const label = labelOf(target)
    const alive = () => !task.cancelled && this.status.get(task.sectionId) === 'building'
    const sleep = (ms: number) => token.sleep(ms)
    try {
      switch (task.action) {
        case 'draw': {
          // 같은 모양의 완성된 틀이 화면에 있으면 통째로 복제해서 끌어다 놓고, 없으면 새로 그립니다
          const source = this.duplicateSource(target)
          if (source) {
            await this.cloneInto(worker, task, source, token, alive)
            break
          }
          await overlay.draw(target.el, this.ms(220), this.ms(300), sleep)
          if (!alive()) return
          const rect = target.el.getBoundingClientRect()
          this.setTarget(target.id, { visible: true, applied: 0, typed: 0 })
          this.work(
            target,
            'layout',
            `${label}  ${Math.round(rect.width)} × ${Math.round(rect.height)}`,
          )
          break
        }
        case 'style': {
          overlay.select(target.el, this.ms(240))
          const decls = target.decls ?? []
          for (let i = 0; i < decls.length; i += 1) {
            const [prop, value] = decls[i]
            overlay.code(prop, value)
            await sleep(this.ms(110))
            if (!alive()) return
            this.setTarget(target.id, { visible: true, applied: i + 1, typed: 0 })
            this.work(target, 'style', `${label}  ${prop}: ${value}`)
            await sleep(this.ms(50))
          }
          overlay.code(null)
          break
        }
        case 'type': {
          const text = target.text ?? ''
          // 긴 문장도 0.4초 남짓에 끝나도록 글자당 시간을 맞춥니다. 작업자마다 손 빠르기가 조금 다릅니다
          const perChar =
            Math.min(24, Math.max(1.2, 400 / Math.max(1, text.length))) *
            (0.85 + Math.random() * 0.3)
          const copied = this.targetState.get(target.id)
          if (copied?.prior !== undefined) {
            // 복제해 온 카드의 글자: 선택해서 지우고 새 글자로 고쳐 씁니다
            overlay.select(target.el, this.ms(240))
            await sleep(this.show(240))
            if (!alive()) return
            this.setTarget(target.id, { ...copied, selected: true })
            this.work(
              target,
              'copy',
              `${label}  ${snippet(copied.prior, 10)} → ${snippet(text, 10)}`,
            )
            await sleep(this.show(340))
            if (!alive()) return
            await this.typeInto(target.id, text.length, perChar, token, alive, true)
            break
          }
          // 제목·긴 글은 여러 방법 가운데 바로 앞과 다른 방법으로 만듭니다
          await this.composeText(worker, target, this.textEffect(target), perChar, token, alive)
          break
        }
        case 'reveal': {
          await this.placeBlock(worker, target, this.revealEffect(target), token, alive)
          break
        }
        case 'custom': {
          overlay.select(target.el, this.ms(240))
          if (!alive()) return
          this.setTarget(target.id, DONE)
          this.work(target, worker.role, label)
          if (target.run) {
            await target.run({
              get hurried() {
                return token.hurried
              },
              wait: (ms) => token.sleep(this.ms(ms)),
            })
          }
          break
        }
      }
    } catch (error) {
      console.error('[build]', error)
    } finally {
      overlay.release()
    }
  }

  private async say(text: string, token: RunToken, sectionId?: string) {
    await this.typeLine('say', text, token, 16, sectionId)
    await token.sleep(this.ms(80))
  }

  /** 한 줄을 글자 단위로 찍습니다. 서두르면 남은 글자를 한 번에 채웁니다 */
  private async typeLine(
    kind: LineKind,
    text: string,
    token: RunToken,
    charMs: number,
    sectionId?: string,
  ) {
    const id = this.pushLine(kind, text, { sectionId })
    const perChar = this.ms(charMs)
    const step = Math.max(1, Math.ceil(16 / Math.max(0.5, perChar)))
    let typed = 0
    while (typed < text.length && !token.hurried) {
      typed = Math.min(text.length, typed + step)
      this.updateLine(id, typed)
      await token.sleep(perChar * step)
    }
    this.updateLine(id, text.length)
  }

  /** showcase: 복사된 글자를 고쳐 쓸 때처럼 눈으로 따라가야 하면 SHOW_SPEED보다 빨라지지 않습니다 */
  private async typeInto(
    id: string,
    length: number,
    charMs: number,
    token: RunToken,
    alive: () => boolean,
    showcase = false,
  ) {
    const perChar = showcase ? this.show(charMs) : this.ms(charMs)
    const step = Math.max(1, Math.ceil(16 / Math.max(0.5, perChar)))
    let typed = 0
    if (!alive()) return
    this.setTarget(id, { visible: true, applied: 0, typed: 0 })
    while (typed < length && !token.hurried) {
      typed = Math.min(length, typed + step)
      if (!alive()) return
      this.setTarget(id, { visible: true, applied: 0, typed })
      await token.sleep(perChar * step)
    }
    if (alive()) this.setTarget(id, DONE)
  }

  private finishSection(id: string) {
    if (this.status.get(id) === 'done') return
    const spec = this.sections.get(id)
    this.tokens.get(id)?.hurry()
    this.batch(() => {
      this.status.set(id, 'done')
      this.updateBusy()
      for (const task of this.tasks) if (task.sectionId === id) task.cancelled = true
      this.tasks = this.tasks.filter((task) => task.sectionId !== id)
      for (const target of this.targets.values()) {
        if (target.sectionId === id) this.targetState.delete(target.id)
      }
      // 다 만든 기록. 커밋이 있는 구역은 커밋 메시지로, 없는 구역도 조립을 했으면 '완성'으로 남겨
      // 터미널이 그 구역의 서브 에이전트 일을 이 한 줄로 접습니다(걸린 시간과 함께)
      const started = this.startedAt.get(id)
      if (spec && !this.committed.has(id) && (spec.commit || started !== undefined)) {
        this.committed.add(id)
        this.pushLine('commit', spec.commit?.message ?? `'${spec.label}' 완성`, {
          meta: spec.commit?.date,
          complete: true,
          sectionId: id,
          took: started === undefined ? undefined : performance.now() - started,
        })
      }
      this.emit()
    })
    this.checkFinished()
  }

  private queueCompletedCommits() {
    if (this.commitsQueued) return
    this.commitsQueued = true
    queueMicrotask(() => {
      this.commitsQueued = false
      this.batch(() => {
        for (const spec of this.orderedSections()) {
          if (!spec.commit || this.committed.has(spec.id)) continue
          if (this.status.get(spec.id) !== 'done') continue
          this.committed.add(spec.id)
          this.pushLine('commit', spec.commit.message, {
            meta: spec.commit.date,
            complete: true,
            sectionId: spec.id,
          })
        }
      })
      this.checkFinished()
    })
  }

  private checkFinished() {
    if (this.ui.finished || this.sections.size === 0) return
    for (const id of this.sections.keys()) {
      if (this.status.get(id) !== 'done') return
    }
    this.batch(() => {
      if (this.ui.mode === 'live') this.pushLine('info', MESSAGES.finished, { complete: true })
      // 끝난 뒤에 새로 나타나는 구역(목록 필터 결과 등)은 바로 완성된 모습으로 보입니다
      this.setUi({ finished: true, mode: 'complete' })
    })
  }

  // ── 상태 갱신 ───────────────────────────────────────────

  private ms(value: number) {
    return (value * PACE) / this.speed
  }

  /** 눈으로 따라가야 하는 움직임의 시간. 화면이 바빠도 SHOW_SPEED 배속까지만 줄어듭니다 */
  private show(value: number) {
    return (value * PACE) / Math.min(this.speed, SHOW_SPEED)
  }

  // ── 살펴보기(인스펙터) ─────────────────────────────────

  /**
   * 다 그려진 요소에 마우스를 3초 넘게 올려 두면, 그 요소를 맡았던 작업자가
   * 다시 와서 선택 상자와 크기, 실제로 적용된 CSS를 보여줍니다. 마우스를 떼면 사라집니다.
   */
  private onPointerOver = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    const target = this.targetFor(event.target as Element | null)
    if (target === this.hoverTarget) return
    this.clearHover()
    if (!target) return
    this.hoverTarget = target
    this.hoverTimer = setTimeout(() => this.inspect(target), INSPECT_DELAY)
  }

  private clearHover = () => {
    clearTimeout(this.hoverTimer)
    this.hoverTarget = null
    for (const worker of this.workers) {
      if (worker.inspecting) {
        this.stopInspect(worker)
        worker.overlay.release()
      }
    }
  }

  /** 마우스가 올라간 요소에서 가장 안쪽의 다 그려진 대상을 찾습니다 */
  private targetFor(el: Element | null) {
    for (let node = el; node && node !== document.body; node = node.parentElement) {
      const target = this.byEl.get(node)
      if (target && this.getSectionStatus(target.sectionId) === 'done') return target
    }
    return null
  }

  private inspect(target: TargetSpec) {
    // 아래쪽이 아직 조립을 기다리는 중이어도, 손이 빈 작업자가 있으면 살펴봅니다
    if (this.ui.reducedMotion || this.attached === 0) return
    const role: Role =
      target.kind === 'box'
        ? target.decls?.length
          ? 'style'
          : 'layout'
        : target.kind === 'text'
          ? 'copy'
          : 'place'
    const worker = this.workers.find((w) => w.role === role && !w.busy)
    if (!worker) return
    const overlay = worker.overlay
    worker.inspecting = true
    overlay.select(target.el, 260, { badge: role !== 'copy' })

    // 보여줄 CSS: 틀은 조립 때 붙인 줄들을, 글자는 실제 계산된 글꼴 크기·굵기를 돌아가며 보여줍니다
    const style = getComputedStyle(target.el)
    const lines: Array<readonly [string, string]> =
      target.decls && target.decls.length > 0
        ? [...target.decls]
        : target.kind === 'text'
          ? [
              ['font-size', style.fontSize],
              ['font-weight', style.fontWeight],
            ]
          : []
    if (lines.length === 0) return
    let index = 0
    overlay.code(lines[0][0], lines[0][1])
    worker.inspectTimer = setInterval(() => {
      index = (index + 1) % lines.length
      overlay.code(lines[index][0], lines[index][1])
    }, 1400)
  }

  private stopInspect(worker: Worker) {
    if (!worker.inspecting) return
    clearInterval(worker.inspectTimer)
    worker.inspecting = false
    worker.overlay.code(null)
  }

  private setStatus(id: string, status: SectionStatus) {
    this.status.set(id, status)
    this.updateBusy()
    this.emit()
  }

  private updateBusy() {
    let busy = false
    for (const status of this.status.values()) if (status === 'building') busy = true
    if (busy !== this.ui.busy) this.setUi({ busy })
  }

  private setTarget(id: string, state: TargetState) {
    this.targetState.set(id, state === DONE ? DONE : Object.freeze({ ...state }))
    this.emit()
  }

  private setUi(patch: Partial<BuildUi>) {
    this.ui = { ...this.ui, ...patch }
    this.emit()
  }

  /** 서브 에이전트가 한 일 한 줄. 그 대상이 속한 구역 아래에 접혀 들어갑니다 */
  private work(target: TargetSpec, role: Role, text: string) {
    this.pushLine('work', text, { role, complete: true, sectionId: target.sectionId })
  }

  private pushLine(
    kind: LineKind,
    text: string,
    options: {
      meta?: string
      role?: Role
      complete?: boolean
      sectionId?: string
      took?: number
    } = {},
  ) {
    this.lineSeq += 1
    const line: TerminalLine = {
      id: this.lineSeq,
      kind,
      text,
      typed: options.complete ? text.length : 0,
      meta: options.meta,
      role: options.role,
      sectionId: options.sectionId,
      took: options.took,
    }
    const next = [...this.lines, line]
    this.lines = next.length > MAX_LINES ? next.slice(-MAX_LINES) : next
    this.emit()
    return line.id
  }

  private updateLine(id: number, typed: number) {
    const index = this.lines.findIndex((line) => line.id === id)
    if (index < 0 || this.lines[index].typed === typed) return
    const next = [...this.lines]
    next[index] = { ...next[index], typed }
    this.lines = next
    this.emit()
  }

  private batch(fn: () => void) {
    this.muted += 1
    try {
      fn()
    } finally {
      this.muted -= 1
      if (this.muted === 0 && this.dirty) {
        this.dirty = false
        this.emit()
      }
    }
  }

  private emit() {
    if (this.muted > 0) {
      this.dirty = true
      return
    }
    this.refreshRail()
    for (const listener of [...this.listeners]) listener()
  }

  /** 커밋 목록은 내용이 바뀔 때만 새 배열로 바꿔서 불필요한 렌더링을 막습니다 */
  private refreshRail() {
    const next: RailItem[] = []
    for (const spec of this.orderedSections()) {
      if (!spec.commit) continue
      next.push({
        sectionId: spec.id,
        label: spec.label,
        message: spec.commit.message,
        date: spec.commit.date,
        status: this.getSectionStatus(spec.id),
      })
    }
    const same =
      next.length === this.rail.length &&
      next.every((item, i) => {
        const prev = this.rail[i]
        return (
          prev.sectionId === item.sectionId &&
          prev.status === item.status &&
          prev.message === item.message &&
          prev.date === item.date &&
          prev.label === item.label
        )
      })
    if (!same) this.rail = next
  }

  private findSection(el: Element) {
    for (const spec of this.sections.values()) if (spec.el === el) return spec
    return undefined
  }

  private orderedSections() {
    return [...this.sections.values()].sort(byDomOrder)
  }

  private orderedTargets(sectionId: string) {
    return [...this.targets.values()].filter((t) => t.sectionId === sectionId).sort(byDomOrder)
  }
}
