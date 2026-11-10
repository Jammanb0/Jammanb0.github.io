import { useCallback, useContext, useSyncExternalStore } from 'react'
import { DirectorContext, SectionContext } from './context'
import { DONE } from './director'
import type { BuildUi, Decl, RailItem, Role, RunContext, SectionStatus, TargetKind } from './types'

const noopSubscribe = () => () => {}
const EMPTY: never[] = []
const STATIC_UI: BuildUi = {
  mode: 'complete',
  finished: true,
  busy: false,
  reducedMotion: false,
  activeSection: null,
  highlighted: null,
}

/** BuildProvider 바깥에서는 null — 그때 대상들은 처음부터 완성된 모습으로 그려집니다 */
export function useDirector() {
  return useContext(DirectorContext)
}

export function useSectionStatus(id: string): SectionStatus {
  const director = useDirector()
  return useSyncExternalStore(director?.subscribe ?? noopSubscribe, () =>
    director ? director.getSectionStatus(id) : 'done',
  )
}

interface TargetOptions {
  id: string
  kind: TargetKind
  name?: string
  decls?: readonly Decl[]
  text?: string
  run?: (ctx: RunContext) => Promise<void>
  /** 바뀌지 않게 모듈 상수로 넘겨주세요 */
  workers?: readonly Role[]
}

export function useBuildTarget({ id, kind, name, decls, text, run, workers }: TargetOptions) {
  const director = useDirector()
  const sectionId = useContext(SectionContext)

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el || !director || !sectionId) return
      return director.registerTarget({ id, kind, name, decls, text, run, workers, el, sectionId })
    },
    [director, sectionId, id, kind, name, decls, text, run, workers],
  )

  const state = useSyncExternalStore(director?.subscribe ?? noopSubscribe, () =>
    director ? director.getTargetState(id, sectionId) : DONE,
  )

  return [ref, state] as const
}

export function useBuildLines() {
  const director = useDirector()
  return useSyncExternalStore(
    director?.subscribe ?? noopSubscribe,
    director?.getLines ?? (() => EMPTY),
  )
}

export function useBuildUi(): BuildUi {
  const director = useDirector()
  return useSyncExternalStore(
    director?.subscribe ?? noopSubscribe,
    director?.getUi ?? (() => STATIC_UI),
  )
}

export function useBuildRail(): RailItem[] {
  const director = useDirector()
  return useSyncExternalStore(
    director?.subscribe ?? noopSubscribe,
    director?.getRail ?? (() => EMPTY),
  )
}
