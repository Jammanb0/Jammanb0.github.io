import { useEffect, useId, useRef } from 'react'
import { srOnly } from '@/styles/global.css'
import { useBuildRail, useBuildUi, useDirector } from './hooks'
import type { RailItem } from './types'
import * as styles from './CommitRail.css'

const STATUS_TEXT = {
  pending: '아직 안 만든 구역',
  building: '만드는 중',
  done: '완성',
} as const

interface CommitListProps {
  rail: RailItem[]
  activeSection: string | null
  /** 다 그린 뒤 잠시 머문 구역. 그 줄이 한 번 은은하게 빛납니다 */
  highlighted: string | null
  onPick: (sectionId: string) => void
}

/**
 * 커밋 목록. 지금 보고 있는 구역의 줄을 강조하고, 목록이 길어 넘치면 그 줄이 목록 가운데에 오도록
 * 위아래로 부드럽게 따라 스크롤합니다. 마우스를 올려 목록을 직접 보는 동안에는 끼어들지 않습니다.
 */
function CommitList({ rail, activeSection, highlighted, onPick }: CommitListProps) {
  const listRef = useRef<HTMLOListElement>(null)
  const hovering = useRef(false)
  const placed = useRef(false)

  useEffect(() => {
    const list = listRef.current
    if (!list || !activeSection || hovering.current) return
    const item = list.querySelector<HTMLElement>(`[data-section="${CSS.escape(activeSection)}"]`)
    if (!item) return
    const listRect = list.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()
    const delta = itemRect.top + itemRect.height / 2 - (listRect.top + listRect.height / 2)
    if (Math.abs(delta) < 2) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    // 처음 열릴 때는 바로 그 자리로, 그 뒤로는 부드럽게 따라갑니다
    list.scrollBy({ top: delta, behavior: placed.current && !reduced ? 'smooth' : 'auto' })
    placed.current = true
  }, [activeSection])

  return (
    <ol
      ref={listRef}
      className={styles.list}
      onPointerEnter={() => {
        hovering.current = true
      }}
      onPointerLeave={() => {
        hovering.current = false
      }}
    >
      {rail.map((item) => (
        <li key={item.sectionId}>
          <button
            type="button"
            className={styles.item}
            data-section={item.sectionId}
            data-status={item.status}
            data-highlighted={highlighted === item.sectionId}
            aria-current={activeSection === item.sectionId ? 'true' : undefined}
            onClick={() => onPick(item.sectionId)}
          >
            <span className={styles.node} data-status={item.status} aria-hidden="true" />
            <span className={styles.text}>
              <span className={styles.message}>{item.message}</span>
              {item.date && <span className={styles.date}>{item.date}</span>}
            </span>
            <span className={srOnly}>{`, ${item.label} 구역, ${STATUS_TEXT[item.status]}`}</span>
          </button>
        </li>
      ))}
    </ol>
  )
}

function Head({ rail }: { rail: RailItem[] }) {
  const doneCount = rail.filter((item) => item.status === 'done').length
  return (
    <p className={styles.head}>
      커밋 기록
      <span className={styles.count}>
        {doneCount}/{rail.length}
      </span>
    </p>
  )
}

/** 구역별 커밋 목록. 진행 상태를 보여주면서, 누르면 그 구역으로 이동하는 목차 역할도 합니다 */
export function CommitRail({ className }: { className?: string }) {
  const director = useDirector()
  const rail = useBuildRail()
  const ui = useBuildUi()
  if (!director || rail.length === 0) return null

  return (
    <nav className={className ? `${styles.rail} ${className}` : styles.rail} aria-label="구역 목록">
      <Head rail={rail} />
      <CommitList
        rail={rail}
        activeSection={ui.activeSection}
        highlighted={ui.highlighted}
        onPick={director.scrollToSection}
      />
    </nav>
  )
}

interface CommitPeekProps {
  open: boolean
  onToggle: () => void
  onClose: () => void
}

/**
 * 옆 패널이 없을 때(좁은 화면) 작은 터미널 바 바로 위에 붙는 커밋 알약.
 * 구역마다 점 하나로 진행 상황과 지금 보는 곳을 보여주고, 누르면 커밋 목록이 위로 펼쳐집니다.
 */
export function CommitPeek({ open, onToggle, onClose }: CommitPeekProps) {
  const director = useDirector()
  const rail = useBuildRail()
  const ui = useBuildUi()
  const listId = useId()
  if (!director || rail.length === 0) return null
  const doneCount = rail.filter((item) => item.status === 'done').length

  return (
    <div className={styles.peek}>
      {open && (
        <nav id={listId} className={styles.peekPanel} aria-label="구역 목록">
          <Head rail={rail} />
          <CommitList
            rail={rail}
            activeSection={ui.activeSection}
            highlighted={ui.highlighted}
            onPick={(sectionId) => {
              onClose()
              director.scrollToSection(sectionId)
            }}
          />
        </nav>
      )}
      <button
        type="button"
        className={styles.peekButton}
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={onToggle}
      >
        <span className={styles.peekDots} aria-hidden="true">
          {rail.map((item) => (
            <span
              key={item.sectionId}
              className={styles.peekDot}
              data-status={item.status}
              data-current={ui.activeSection === item.sectionId}
              data-highlighted={ui.highlighted === item.sectionId}
            />
          ))}
        </span>
        <span>
          커밋 {doneCount}/{rail.length}
        </span>
        <span className={srOnly}>{open ? ', 목록 닫기' : ', 목록 열기'}</span>
      </button>
    </div>
  )
}
