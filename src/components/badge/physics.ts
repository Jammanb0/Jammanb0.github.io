/**
 * 사원증 목걸이 물리. 화면과 상관없는 순수 계산이라 DOM을 모릅니다.
 *
 * - 줄: 점 여러 개를 거리 제약으로 이은 Verlet 로프. 늘어날 때만 당기고
 *   짧아질 때는 느슨해집니다.
 * - 카드: 고리(줄 끝)와 카드 아래 중심 두 점을 잇는 단단한 막대로 보고,
 *   두 점의 방향으로 기울기를 정합니다.
 * - 비틀림(rotateY): 따로 둔 스프링. 카드가 옆으로 움직이면 돌아갑니다.
 *
 * 좌표는 모두 px, 시간은 초입니다.
 */

export interface LanyardOptions {
  /** 줄을 나누는 마디 수 */
  segments: number
  ropeLength: number
  /** 고리에서 카드 아래 중심까지의 거리 */
  cardLength: number
  gravity: number
  /** 한 스텝마다 속도를 얼마나 남길지(1이면 마찰 없음) */
  damping: number
  iterations: number
  /** 줄이 늘어난 만큼을 한 번에 얼마나 되돌릴지. 1보다 작으면 살짝 탄력이 생깁니다 */
  ropeStiffness: number
}

interface Particle {
  x: number
  y: number
  px: number
  py: number
  /** 질량의 역수. 0이면 고정 */
  inv: number
}

interface Grab {
  /** 카드 축을 따라 고리에서 잡은 곳까지의 거리 */
  along: number
  /** 카드 축에서 옆으로 떨어진 거리 */
  side: number
  x: number
  y: number
}

const DEFAULTS: LanyardOptions = {
  segments: 10,
  ropeLength: 190,
  cardLength: 330,
  gravity: 2600,
  damping: 0.996,
  iterations: 14,
  // 1이면 거의 늘어나지 않아서, 떨어지다 걸릴 때 튀어 오르지 않고 '툭' 멈춥니다
  ropeStiffness: 1,
}

/** 한 스텝에 이보다 빨리 움직이면 잘라냅니다(던졌을 때 튀는 것 방지) */
const MAX_STEP = 48

function particle(x: number, y: number, inv: number): Particle {
  return { x, y, px: x, py: y, inv }
}

export class LanyardSim {
  readonly options: LanyardOptions
  readonly anchor = { x: 0, y: 0 }
  readonly points: Particle[]
  readonly bottom: Particle
  twist = 0
  private twistVel = 0
  private grab: Grab | null = null
  /** 떨어지는 중이면 고리가 걸릴 높이 */
  private catchY: number | null = null
  private anchorVel = 0
  /** 걸린 직후 몇 스텝 동안 반동을 흡수합니다. 이게 없으면 카드가 위로 크게 튕깁니다 */
  private settleSteps = 0

  constructor(options: Partial<LanyardOptions> = {}) {
    this.options = { ...DEFAULTS, ...options }
    const { segments } = this.options
    this.points = Array.from({ length: segments + 1 }, (_, i) =>
      // 줄은 가볍고, 끝(고리)은 카드 윗부분이라 무겁게 둡니다
      particle(0, 0, i === 0 ? 0 : i === segments ? 1 : 6),
    )
    this.bottom = particle(0, 0, 0.7)
    this.rest()
  }

  get ring() {
    return this.points[this.points.length - 1]
  }

  /** 카드 기울기(라디안). 0이면 똑바로 매달린 상태, 양수면 아래가 오른쪽으로 */
  get angle() {
    return Math.atan2(this.bottom.x - this.ring.x, this.bottom.y - this.ring.y)
  }

  get dragging() {
    return this.grab !== null
  }

  get dropping() {
    return this.catchY !== null
  }

  setCardLength(length: number) {
    this.options.cardLength = length
  }

  setRopeLength(length: number) {
    this.options.ropeLength = length
  }

  /** 걸이 위치를 옮깁니다. 매달린 모양은 그대로 따라갑니다 */
  setAnchor(x: number, y: number) {
    const dx = x - this.anchor.x
    let dy: number
    if (this.catchY !== null) {
      // 떨어지는 중이면 걸릴 높이를 기준으로 옮겨서 낙하는 그대로 이어갑니다
      dy = y - this.catchY
      this.catchY = y
    } else {
      dy = y - this.anchor.y
    }
    if (dx === 0 && dy === 0) return
    for (const p of [...this.points, this.bottom]) {
      p.x += dx
      p.px += dx
      p.y += dy
      p.py += dy
    }
    this.anchor.x = x
    this.anchor.y += dy
  }

  /** 멈춘 채 매달린 모습. angle을 주면 그만큼 기운 채 놓여서 살짝 흔들립니다 */
  rest(angle = 0) {
    const { segments, ropeLength, cardLength } = this.options
    const seg = ropeLength / segments
    const ropeAngle = angle * 0.35
    this.points.forEach((p, i) => {
      const x = this.anchor.x + Math.sin(ropeAngle) * seg * i
      const y = this.anchor.y + Math.cos(ropeAngle) * seg * i
      p.x = p.px = x
      p.y = p.py = y
    })
    const ring = this.ring
    this.bottom.x = this.bottom.px = ring.x + Math.sin(angle) * cardLength
    this.bottom.y = this.bottom.py = ring.y + Math.cos(angle) * cardLength
    this.twist = 0
    this.twistVel = 0
    this.catchY = null
    this.anchorVel = 0
    this.settleSteps = 0
  }

  /**
   * 위에서 떨어뜨립니다. 목걸이 전체가 height만큼 위에서 자유낙하하다가
   * 줄 끝 고리가 걸이에 걸리면 멈추고, 관성으로 카드가 툭 내려가며 흔들립니다.
   */
  drop(height: number, angle = 0.4) {
    const target = this.anchor.y
    this.rest(angle)
    for (const p of [...this.points, this.bottom]) {
      p.y -= height
      p.py -= height
    }
    this.anchor.y = target - height
    this.catchY = target
    this.anchorVel = 0
    this.twistVel = 2.4
  }

  grabAt(x: number, y: number) {
    const { ux, uy } = this.axis()
    const dx = x - this.ring.x
    const dy = y - this.ring.y
    this.grab = {
      along: dx * ux + dy * uy,
      side: dx * -uy + dy * ux,
      x,
      y,
    }
  }

  dragTo(x: number, y: number) {
    if (!this.grab) return
    // 너무 멀리 끌어서 줄이 비정상적으로 늘어나지 않게 걸이 기준 반경을 제한합니다
    const limit = (this.options.ropeLength + this.options.cardLength) * 1.25
    const dx = x - this.anchor.x
    const dy = y - this.anchor.y
    const d = Math.hypot(dx, dy)
    const k = d > limit ? limit / d : 1
    this.grab.x = this.anchor.x + dx * k
    this.grab.y = this.anchor.y + dy * k
  }

  release() {
    this.grab = null
  }

  /** 살짝 비틀어 반응을 줍니다(마우스를 올렸을 때 등) */
  nudge(amount: number) {
    this.twistVel += amount
  }

  /**
   * 바람이 스친 듯 옆으로 살짝 밀고 비틉니다. direction은 -1(왼쪽) 또는 1(오른쪽).
   * 붙잡고 있거나 떨어지는 중에는 아무것도 하지 않습니다.
   */
  breeze(direction: number, strength = 1) {
    if (this.grab || this.catchY !== null) return
    // Verlet에서는 이전 위치를 반대쪽으로 옮기면 그만큼 속도가 생깁니다
    this.bottom.px -= direction * 0.75 * strength
    this.ring.px -= direction * 0.2 * strength
    this.twistVel += direction * 0.6 * strength
  }

  step(dt: number) {
    const { gravity, damping, iterations, segments, ropeLength, cardLength, ropeStiffness } =
      this.options

    if (this.catchY !== null) {
      this.anchorVel += gravity * dt
      this.anchor.y += this.anchorVel * dt
      if (this.anchor.y >= this.catchY) {
        this.anchor.y = this.catchY
        this.catchY = null
        this.anchorVel = 0
        this.settleSteps = 50
      }
    }
    const fixed = this.points[0]
    fixed.x = fixed.px = this.anchor.x
    fixed.y = fixed.py = this.anchor.y

    const g = gravity * dt * dt
    const drag = this.settleSteps > 0 ? Math.min(damping, 0.95) : damping
    if (this.settleSteps > 0) this.settleSteps -= 1
    for (let i = 1; i < this.points.length; i += 1) this.integrate(this.points[i], drag, g)
    this.integrate(this.bottom, drag, g)

    const seg = ropeLength / segments
    for (let k = 0; k < iterations; k += 1) {
      for (let i = 0; i < segments; i += 1) {
        this.solve(this.points[i], this.points[i + 1], seg, ropeStiffness, true)
      }
      this.solve(this.ring, this.bottom, cardLength, 1, false)
      if (this.grab) this.applyGrab(this.grab)
    }

    // 카드가 옆으로 움직이면 비틀리고, 스프링이 다시 정면으로 돌려놓습니다
    const ringVx = (this.ring.x - this.ring.px) / dt
    const accel = -this.twist * 22 - this.twistVel * 2.6 - ringVx * 0.0042
    this.twistVel += accel * dt
    this.twist += this.twistVel * dt
  }

  /** 지금 얼마나 움직이고 있는지. 충분히 작으면 계산을 쉬어도 됩니다 */
  motion() {
    let max = Math.abs(this.twistVel) * 4
    for (const p of [...this.points, this.bottom]) {
      max = Math.max(max, Math.hypot(p.x - p.px, p.y - p.py))
    }
    return this.catchY !== null || this.grab ? Number.POSITIVE_INFINITY : max
  }

  private axis() {
    const dx = this.bottom.x - this.ring.x
    const dy = this.bottom.y - this.ring.y
    const len = Math.hypot(dx, dy) || 1
    return { ux: dx / len, uy: dy / len }
  }

  private integrate(p: Particle, damping: number, g: number) {
    let vx = (p.x - p.px) * damping
    let vy = (p.y - p.py) * damping
    const speed = Math.hypot(vx, vy)
    if (speed > MAX_STEP) {
      vx *= MAX_STEP / speed
      vy *= MAX_STEP / speed
    }
    p.px = p.x
    p.py = p.y
    p.x += vx
    p.y += vy + g
  }

  private solve(a: Particle, b: Particle, length: number, stiffness: number, ropeOnly: boolean) {
    const dx = b.x - a.x
    const dy = b.y - a.y
    const d = Math.hypot(dx, dy) || 1e-6
    if (ropeOnly && d <= length) return
    const w = a.inv + b.inv
    if (w === 0) return
    const diff = ((d - length) / d) * stiffness
    const wa = a.inv / w
    const wb = b.inv / w
    a.x += dx * diff * wa
    a.y += dy * diff * wa
    b.x -= dx * diff * wb
    b.y -= dy * diff * wb
  }

  private applyGrab(grab: Grab) {
    const { ux, uy } = this.axis()
    const gx = this.ring.x + ux * grab.along - uy * grab.side
    const gy = this.ring.y + uy * grab.along + ux * grab.side
    const dx = grab.x - gx
    const dy = grab.y - gy
    this.ring.x += dx
    this.ring.y += dy
    this.bottom.x += dx
    this.bottom.y += dy
  }
}
