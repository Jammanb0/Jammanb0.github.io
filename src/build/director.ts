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
} from './types'

const MAX_LINES = 240
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
 * 기다리고, 화면 밖으로 나간 일은 멈췄다가 다시 보이면 이어서 합니다. 그래서 스크롤을 따라 그려집니다
 */
const VIEW_LINE = 0.88
/** '지금 보고 있는 구역'을 고르는 시선 선. 화면 위에서 40% 높이 */
const FOCUS_LINE = 0.4
/** 복제할 때 원본과 목적지의 높이 차이가 이 비율 안이면 내용까지, 넘으면 틀만 복사합니다 */
const SAME_SIZE = 0.25
/** 손으로 끄는 움직임: 천천히 출발해 빨라졌다가 부드럽게 내려놓습니다 */
const DRAG_EASING = 'cubic-bezier(0.45, 0, 0.2, 1)'
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
      // 짧은 제목은 열에 여섯쯤 옆에서 쓰고 끌어다 놓습니다
      const heading = /^H[1-4]$/.test(task.target.el.tagName) && length <= 40
      return typing + (heading ? 470 : 0) + gap
    }
    case 'reveal':
      return (task.target.el.querySelector('img') ? 920 : 540) + gap
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
      if (this.ui.busy) this.pump()
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
      if (distance < bestDistance) {
        best = spec.id
        bestDistance = distance
      }
    }
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
   * 화면 중간(TRIGGER_LINE)까지 올라온 구역의 조립을 시작합니다. 화면 밖으로 나간 구역도 완성해
   * 버리지 않고 하던 데서 멈춰 두었다가, 다시 보이면 이어서 그립니다(빨리 지나친 구역도 마찬가지).
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
    // 안내 문장은 한 줄씩 차례로 찍지만, 조립은 기다리지 않고 바로 시작합니다
    if (spec.guide) {
      const text = spec.guide
      this.narrator = this.narrator.then(() => (token.hurried ? undefined : this.say(text, token)))
    }
    this.enqueueTasks(spec)
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

  /** 쉬고 있는 작업자에게 할 수 있는 일을 나눠 줍니다 */
  private pump = () => {
    if (this.attached === 0) return
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
        const k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        ghost.style.left = `${a.left + (b.left - a.left) * k}px`
        ghost.style.top = `${a.top + (b.top - a.top) * k}px`
        ghost.style.width = `${a.width + (b.width - a.width) * k}px`
        ghost.style.height = `${a.height + (b.height - a.height) * k}px`
      })
      if (!alive()) return
      this.adoptCopy(target, source, withContent)
      overlay.select(target.el, 0)
      overlay.note(null)
      this.work(
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

  /**
   * 제목처럼 짧은 글자는 옆 빈자리에 글상자를 만들어 쓴 뒤 제자리로 끌어다 놓습니다.
   * 절반 남짓의 제목에서만, 화면 안에 옮겨 둘 자리가 있을 때 합니다.
   */
  private asideOffset(target: TargetSpec) {
    const text = target.text ?? ''
    if (!/^H[1-4]$/.test(target.el.tagName) || text.length > 40 || Math.random() < 0.4) return null
    const rect = target.el.getBoundingClientRect()
    const vw = document.documentElement.clientWidth
    const reach = 70 + Math.random() * 60
    const dy = 16 + Math.random() * 24
    if (rect.right + reach < vw - 12) return { dx: reach, dy }
    if (rect.left - reach > 12) return { dx: -reach, dy }
    return { dx: 0, dy: 36 + Math.random() * 20 }
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
          this.work('layout', `${label}  ${Math.round(rect.width)} × ${Math.round(rect.height)}`)
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
            this.work('style', `${label}  ${prop}: ${value}`)
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
            this.work('copy', `${label}  ${snippet(copied.prior, 10)} → ${snippet(text, 10)}`)
            await sleep(this.show(340))
            if (!alive()) return
            await this.typeInto(target.id, text.length, perChar, token, alive, true)
            break
          }
          const aside = this.asideOffset(target)
          overlay.select(target.el, this.ms(240))
          this.work('copy', `${label}  ${snippet(text)}`)
          if (!aside) {
            await this.typeInto(target.id, text.length, perChar, token, alive)
            break
          }
          // 옆 빈자리에 글상자를 만들어 쓴 뒤, 제자리로 끌어다 놓습니다
          const offset = `translate(${aside.dx}px, ${aside.dy}px)`
          target.el.style.transform = offset
          try {
            await sleep(this.ms(120))
            if (!alive()) return
            await this.typeInto(target.id, text.length, perChar, token, alive)
            if (!alive()) return
            await sleep(this.ms(140))
            const duration = this.show(520)
            target.el.style.transform = ''
            const drag = target.el.animate([{ transform: offset }, { transform: 'none' }], {
              duration,
              easing: DRAG_EASING,
            })
            this.work('copy', `${label}  끌어서 제자리에 놓기`)
            await sleep(duration)
            drag.finish()
          } finally {
            target.el.style.transform = ''
          }
          break
        }
        case 'reveal': {
          // 작업자가 있던 쪽(처음이면 왼쪽 아래)에서 집어 와 제자리에 내려놓습니다
          const from = overlay.current
          overlay.select(target.el, this.ms(220))
          await sleep(this.ms(100))
          if (!alive()) return
          const photo = target.el.querySelector('img') !== null
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
            // 사진: 작게 집어 와 틀 왼쪽 위에 맞춘 뒤, 오른쪽 아래 모서리를 끌어 틀에 맞게 키웁니다
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
            this.work(worker.role, `${label}  끌어와 모서리로 크기 맞춤`)
            await sleep(duration)
            carry.finish()
          } else {
            const duration = this.ms(440)
            const carry = target.el.animate(
              [
                { transform: `translate(${dx}px, ${dy}px)`, opacity: 0.35 },
                { transform: 'none', opacity: 1 },
              ],
              { duration, easing: DRAG_EASING },
            )
            this.work(worker.role, `${label}  옮겨 놓기`)
            await sleep(duration)
            carry.finish()
          }
          break
        }
        case 'custom': {
          overlay.select(target.el, this.ms(240))
          if (!alive()) return
          this.setTarget(target.id, DONE)
          this.work(worker.role, label)
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

  private async say(text: string, token: RunToken) {
    await this.typeLine('say', text, token, 16)
    await token.sleep(this.ms(80))
  }

  /** 한 줄을 글자 단위로 찍습니다. 서두르면 남은 글자를 한 번에 채웁니다 */
  private async typeLine(kind: LineKind, text: string, token: RunToken, charMs: number) {
    const id = this.pushLine(kind, text)
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
      if (spec?.commit && !this.committed.has(id)) {
        this.committed.add(id)
        this.pushLine('commit', spec.commit.message, { meta: spec.commit.date, complete: true })
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
          this.pushLine('commit', spec.commit.message, { meta: spec.commit.date, complete: true })
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

  private work(role: Role, text: string) {
    this.pushLine('work', text, { role, complete: true })
  }

  private pushLine(
    kind: LineKind,
    text: string,
    options: { meta?: string; role?: Role; complete?: boolean } = {},
  ) {
    this.lineSeq += 1
    const line: TerminalLine = {
      id: this.lineSeq,
      kind,
      text,
      typed: options.complete ? text.length : 0,
      meta: options.meta,
      role: options.role,
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
