import { OverlayLayer, type WorkerOverlay } from './overlay'
import { WORKER_ROLES } from './roles'
import type {
  BuildUi,
  LineKind,
  RailItem,
  Role,
  SectionSpec,
  SectionStatus,
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
const SCREEN_TARGET = 1200
/** 이만큼 지나도 보이는 일이 남아 있으면 더 서둘러 끝냅니다 */
const SCREEN_LIMIT = 1500
/** 평소 올릴 수 있는 가장 큰 배속과, 늦었을 때의 배속 */
const MAX_SPEED = 4
const LATE_SPEED = 8
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

/** 작업 하나가 원래 빠르기(PACE 적용 전)로 걸리는 대략의 시간(ms). 다음 일을 잡기 전 쉬는 틈 포함 */
function estimate(task: Task) {
  const gap = 45
  switch (task.action) {
    case 'draw':
      return 480 + gap
    case 'style':
      return (task.target.decls?.length ?? 0) * 160 + gap
    case 'type': {
      const length = task.target.text?.length ?? 0
      return Math.min(24 * length, Math.max(400, 1.2 * length)) + gap
    }
    case 'reveal':
      return 420 + gap
    case 'custom':
      return 700 + gap
  }
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

  /** 맨 아래까지 내려와서 더 올라올 수 없는 구역은 화면 중간에 못 와도 조립합니다 */
  private onScroll = () => {
    if (this.scrollFrame) return
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = 0
      if (this.atBottom()) this.requestVisible()
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

  private updateActive() {
    let best: string | null = null
    let bestRatio = 0
    for (const spec of this.orderedSections()) {
      if (!spec.commit) continue
      const ratio = this.visibleRatio.get(spec.id) ?? 0
      if (ratio > bestRatio + 0.01) {
        best = spec.id
        bestRatio = ratio
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

  private requestVisible() {
    if (this.ui.mode !== 'live' || this.attached === 0) return
    const ordered = this.orderedSections()
    const bottom = this.atBottom()
    let furthest = -1
    ordered.forEach((spec, i) => {
      const status = this.status.get(spec.id)
      const ready = this.triggered.has(spec.id) || (bottom && this.isOnScreen(spec.id))
      if (status === 'pending' && ready) this.requested.add(spec.id)
      if (status !== 'pending' || this.requested.has(spec.id)) furthest = i
    })
    this.batch(() => {
      ordered.forEach((spec, i) => {
        const status = this.status.get(spec.id)
        if (this.isOnScreen(spec.id)) return
        // 화면을 벗어난 구역은 마저 그리지 않고 완성해 둡니다
        if (status === 'building') this.finishSection(spec.id)
        // 빨리 지나쳐서 한 번도 제대로 안 보인 위쪽 구역도 바로 완성합니다
        else if (status === 'pending' && !this.requested.has(spec.id) && i < furthest) {
          this.finishSection(spec.id)
        }
      })
    })
    for (const spec of ordered) {
      if (this.status.get(spec.id) === 'pending' && this.requested.has(spec.id)) {
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
    const seen = this.survey()
    for (const worker of this.workers) {
      if (worker.busy) continue
      const task = this.nextTask(worker.role, seen)
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
   * 이 역할이 지금 할 수 있는 일 가운데 하나를 고릅니다. 화면에 보이는 대상을 먼저 맡고,
   * 문서 순서상 앞쪽 몇 개 중에서 골라서 위에서부터 한 줄로 차례차례 그려지지 않게 합니다.
   */
  private nextTask(role: Role, seen: Map<Task, boolean>) {
    const ready: Task[] = []
    for (const task of this.tasks) {
      if (!task.roles.includes(role) || task.active || task.done || task.cancelled) continue
      if (this.status.get(task.sectionId) !== 'building') continue
      if (!task.deps.every((key) => this.isDone(key))) continue
      ready.push(task)
    }
    if (ready.length === 0) return undefined
    const onScreen = (task: Task) => seen.get(task) ?? false
    ready.sort((a, b) => Number(onScreen(b)) - Number(onScreen(a)) || a.order - b.order)
    const pool = ready.filter((task) => onScreen(task) === onScreen(ready[0])).slice(0, 3)
    return pool[Math.floor(Math.random() * pool.length)]
  }

  /**
   * 지금 화면에 보이는 남은 일을 훑어 배속을 정하고, 일마다 화면에 보이는지 돌려줍니다.
   * 보이는 일에는 처음 보인 순간 기한(SCREEN_TARGET 뒤)이 붙습니다. 가장 바쁜 역할이 맡을 양과
   * 가장 긴 선후 관계(틀 → 안쪽) 가운데 큰 쪽을 남은 시간 안에 끝낼 수 있게 배속을 올립니다.
   */
  private survey() {
    const now = performance.now()
    const vh = window.innerHeight
    const seen = new Map<Task, boolean>()
    const byKey = new Map<string, Task>()
    for (const task of this.tasks) byKey.set(task.key, task)
    const left = (task: Task) => estimate(task) * (task.active ? 0.5 : 1)
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
      seen.set(task, visible)
      if (!visible) continue
      task.due ??= now + SCREEN_TARGET
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
    const late = now > due + (SCREEN_LIMIT - SCREEN_TARGET)
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
          const source = this.duplicateSource(target)
          if (source) {
            // 같은 모양의 틀이 이미 화면에 있으면, 그 틀을 복제해서 제자리로 끌어다 놓습니다
            overlay.select(source.el, this.ms(160))
            overlay.note('⌥ 복제')
            await sleep(this.ms(200))
            if (!alive()) return
            const from = source.el.getBoundingClientRect()
            const to = target.el.getBoundingClientRect()
            this.setTarget(target.id, { visible: true, applied: 0, typed: 0 })
            overlay.select(target.el, 0)
            const duration = this.ms(520)
            const drag = target.el.animate(
              [
                {
                  transformOrigin: '0 0',
                  transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / Math.max(1, to.width)}, ${from.height / Math.max(1, to.height)})`,
                },
                { transformOrigin: '0 0', transform: 'none' },
              ],
              { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
            )
            await sleep(duration)
            drag.finish()
            overlay.note(null)
            this.work('layout', `${label}  복제 → 옮기고 크기 맞춤`)
            break
          }
          await overlay.draw(target.el, this.ms(130), this.ms(260), sleep)
          if (!alive()) return
          const rect = target.el.getBoundingClientRect()
          this.setTarget(target.id, { visible: true, applied: 0, typed: 0 })
          this.work('layout', `${label}  ${Math.round(rect.width)} × ${Math.round(rect.height)}`)
          break
        }
        case 'style': {
          overlay.select(target.el, this.ms(160))
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
          overlay.select(target.el, this.ms(160))
          const text = target.text ?? ''
          this.work('copy', `${label}  ${snippet(text)}`)
          // 긴 문장도 0.4초 남짓에 끝나도록 글자당 시간을 맞춥니다. 작업자마다 손 빠르기가 조금 다릅니다
          const perChar = Math.min(24, Math.max(1.2, 400 / Math.max(1, text.length)))
          await this.typeInto(
            target.id,
            text.length,
            perChar * (0.85 + Math.random() * 0.3),
            token,
            alive,
          )
          break
        }
        case 'reveal': {
          // 작업자가 있던 쪽에서 들고 와 제자리에 내려놓습니다. 사진은 작게 끌어와 크기를 맞춥니다
          const from = overlay.current
          overlay.select(target.el, this.ms(140))
          await sleep(this.ms(60))
          if (!alive()) return
          this.setTarget(target.id, DONE)
          const to = target.el.getBoundingClientRect()
          let dx = -18
          let dy = 26
          if (from) {
            const vx = from.x + from.w / 2 - (to.left + to.width / 2)
            const vy = from.y + from.h / 2 - (to.top + to.height / 2)
            const scale = Math.min(1, 120 / (Math.hypot(vx, vy) || 1)) * 0.8
            dx = vx * scale
            dy = vy * scale
          }
          const photo = target.el.querySelector('img') !== null
          const duration = this.ms(photo ? 460 : 340)
          const carry = target.el.animate(
            [
              {
                transform: `translate(${dx}px, ${dy}px)${photo ? ' scale(0.82)' : ''}`,
                opacity: 0.4,
              },
              { transform: 'none', opacity: 1 },
            ],
            { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
          )
          this.work(worker.role, `${label}  ${photo ? '끌어와 크기 맞춤' : '옮겨 놓기'}`)
          await sleep(duration)
          carry.finish()
          break
        }
        case 'custom': {
          overlay.select(target.el, this.ms(140))
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

  private async typeInto(
    id: string,
    length: number,
    charMs: number,
    token: RunToken,
    alive: () => boolean,
  ) {
    const perChar = this.ms(charMs)
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
    if (this.ui.busy || this.ui.reducedMotion || this.attached === 0) return
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
