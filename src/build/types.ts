export type TargetKind = 'box' | 'text' | 'reveal' | 'custom'

/** 작업자 역할. 역할마다 색과 이름표가 다릅니다 */
export type Role = 'layout' | 'style' | 'copy' | 'place'

/**
 * [CSS 속성, 값]. 조립할 때 화면과 터미널에 이 모습 그대로 보이고, 보이는 순간
 * 요소에 실제로 적용됩니다. 속성 이름은 CSS 그대로(kebab-case) 씁니다.
 */
export type Decl = readonly [prop: string, value: string]

export interface RunContext {
  /** 빨리 스크롤해 지나가거나 페이지를 떠나서 서두르라는 신호가 왔는지 */
  readonly hurried: boolean
  /** 기본 빠르기가 반영된 대기. 서두르면 바로 끝납니다 */
  wait: (ms: number) => Promise<void>
}

export interface TargetSpec {
  id: string
  sectionId: string
  kind: TargetKind
  el: HTMLElement
  /** 터미널과 작업 로그에 보일 이름. 예: '.hero' */
  name?: string
  decls?: readonly Decl[]
  /** text 대상의 전체 글자 */
  text?: string
  /** custom 대상의 등장 연출 */
  run?: (ctx: RunContext) => Promise<void>
  /**
   * 이 대상을 맡을 수 있는 작업자 역할. 여럿이면 그중 먼저 손이 빈 작업자가 가져갑니다
   * (예: 본문 문단은 텍스트·배치 작업자가 나눠 놓기). 주지 않으면 종류별 기본 역할입니다.
   */
  workers?: readonly Role[]
}

export interface CommitInfo {
  message: string
  /** 사실인 날짜만 적습니다 */
  date?: string
}

export interface SectionSpec {
  id: string
  label: string
  guide?: string
  commit?: CommitInfo
  el: HTMLElement
}

export type SectionStatus = 'pending' | 'building' | 'done'

export interface TargetState {
  visible: boolean
  /** 지금까지 적용된 decl 수 */
  applied: number
  /** 지금까지 입력된 글자 수 */
  typed: number
}

export type LineKind = 'say' | 'work' | 'commit' | 'info'

export interface TerminalLine {
  id: number
  kind: LineKind
  text: string
  /** 지금까지 화면에 찍힌 글자 수 */
  typed: number
  /** commit 줄 옆의 날짜 */
  meta?: string
  /** work 줄을 남긴 작업자 역할 */
  role?: Role
}

export interface RailItem {
  sectionId: string
  label: string
  message: string
  date?: string
  status: SectionStatus
}

export interface BuildUi {
  /** live: 보이는 구역부터 조립, complete: 완성된 화면 */
  mode: 'live' | 'complete'
  /** 이 페이지의 모든 구역이 끝났는지 */
  finished: boolean
  /** 지금 조립 중인 구역이 있는지 */
  busy: boolean
  reducedMotion: boolean
  /** 지금 화면에서 가장 많이 보이는 구역(커밋 목록 강조용) */
  activeSection: string | null
  /** 다 그린 뒤 잠시 머문 구역. 커밋 기록의 그 줄이 한 번 은은하게 빛납니다 */
  highlighted: string | null
}
