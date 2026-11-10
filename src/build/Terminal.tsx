import { useEffect, useRef, type ReactNode } from 'react'
import { useBuildLines, useBuildUi, useDirector } from './hooks'
import { ROLES } from './roles'
import type { TerminalLine } from './types'
import * as styles from './Terminal.css'

interface Segment {
  text: string
  className?: string
}

/** 줄 종류에 맞게 색을 나눕니다. 아직 덜 찍힌 줄도 같은 색 그대로 잘라 씁니다 */
function segmentsOf(line: TerminalLine): Segment[] {
  if (line.kind === 'work') {
    // '대상 이름  내용' 꼴. 스타일 작업이면 내용이 'prop: value'입니다
    const [name, ...rest] = line.text.split('  ')
    const detail = rest.join('  ')
    const decl = line.role === 'style' ? /^([\w-]+)(:\s*)(.*)$/.exec(detail) : null
    const tail: Segment[] = decl
      ? [
          { text: decl[1], className: styles.property },
          { text: decl[2], className: styles.punct },
          { text: decl[3], className: styles.value },
        ]
      : [{ text: detail, className: styles.detail }]
    return [{ text: name, className: styles.selector }, { text: detail ? '  ' : '' }, ...tail]
  }
  if (line.kind === 'commit') {
    const typed = /^(\w+(?:\([^)]*\))?:)(.*)$/.exec(line.text)
    if (typed) return [{ text: typed[1], className: styles.commitType }, { text: typed[2] }]
  }
  return [{ text: line.text }]
}

function renderTyped(line: TerminalLine) {
  let remaining = line.typed
  const out: ReactNode[] = []
  segmentsOf(line).forEach((segment, i) => {
    if (remaining <= 0) return
    const shown = segment.text.slice(0, remaining)
    remaining -= shown.length
    out.push(
      <span key={i} className={segment.className}>
        {shown}
      </span>,
    )
  })
  return out
}

const KIND_CLASS = {
  say: styles.say,
  work: styles.work,
  commit: styles.commit,
  info: styles.info,
} as const

function Mark({ line }: { line: TerminalLine }) {
  if (line.kind === 'say') return <span className={`${styles.mark} ${styles.markSay}`}>==&gt;</span>
  if (line.kind === 'commit') {
    return <span className={`${styles.mark} ${styles.markCommit}`}>✓</span>
  }
  if (line.kind === 'work' && line.role) {
    const role = ROLES[line.role]
    return (
      <span className={styles.roleTag} style={{ color: role.color }}>
        {role.label}
      </span>
    )
  }
  return <span className={styles.mark}>·</span>
}

interface TerminalPanelProps {
  /** dock: 옆 패널에 크게 붙은 모습, mini: 화면 구석의 작은 바 */
  variant: 'dock' | 'mini'
  /** mini일 때 로그를 펼쳤는지 */
  expanded: boolean
  onToggle: () => void
}

/**
 * 조립 과정을 안내하는 터미널. 로그는 장식이라 스크린리더에는 숨기고 펼치기 버튼만 노출합니다.
 * 작은 바일 때는 마지막 한 줄만 보여주고, 펼치면 로그 전체가 나옵니다.
 * 속도 조절·건너뛰기·다시 보기는 두지 않습니다. 새로고침하거나 페이지를 옮기면 늘 새로 그립니다.
 */
export function TerminalPanel({ variant, expanded, onToggle }: TerminalPanelProps) {
  const director = useDirector()
  const lines = useBuildLines()
  const ui = useBuildUi()
  const bodyRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef(true)
  const building = ui.mode === 'live' && !ui.finished
  const compact = variant === 'mini' && !expanded
  const last = lines[lines.length - 1]

  useEffect(() => {
    const body = bodyRef.current
    if (body && stickRef.current) body.scrollTop = body.scrollHeight
  }, [lines, compact])

  if (!director) return null

  return (
    <section
      className={styles.terminal}
      data-terminal=""
      data-compact={compact}
      aria-label="안내 터미널"
    >
      <div className={styles.bar}>
        {!compact && (
          <span className={styles.dots} aria-hidden="true">
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </span>
        )}
        <span className={styles.title}>
          <span className={styles.live} data-live={building} aria-hidden="true" />
          {compact && last ? (
            <span className={`${styles.lastLine} ${KIND_CLASS[last.kind]}`} aria-hidden="true">
              <Mark line={last} />
              <span className={styles.content}>{renderTyped(last)}</span>
            </span>
          ) : (
            '안내'
          )}
        </span>
        {variant === 'mini' && (
          <button
            type="button"
            className={styles.toggle}
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? '안내 터미널 접기' : '안내 터미널 펼치기'}
          >
            <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 10l4-4 4 4" />
            </svg>
          </button>
        )}
      </div>
      {!compact && (
        <div
          ref={bodyRef}
          className={styles.body}
          aria-hidden="true"
          onScroll={(event) => {
            const el = event.currentTarget
            stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32
          }}
        >
          {lines.map((line) => (
            <div key={line.id} className={`${styles.line} ${KIND_CLASS[line.kind]}`}>
              <Mark line={line} />
              <span className={styles.content}>
                {renderTyped(line)}
                {building && line === last && <span className={styles.cursor} />}
              </span>
              {line.meta && line.typed >= line.text.length && (
                <span className={styles.meta}>{line.meta}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
