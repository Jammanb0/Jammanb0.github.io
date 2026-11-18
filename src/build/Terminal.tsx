import { useEffect, useRef, useState, type ReactNode } from 'react'
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
  // 메인의 이름표. 머리글의 'Guhn Park'에서 따와 터미널 사용자 이름처럼 소문자로 씁니다
  if (line.kind === 'say') return <span className={styles.speaker}>guhn</span>
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

interface RowProps {
  line: TerminalLine
  meta?: ReactNode
  /** 한 줄로만 보이고 넘치면 말줄임표로 자릅니다(계속 바뀌는 '지금 하는 일' 줄이 칸 높이를 흔들지 않게) */
  single?: boolean
}

/** 한 줄. 메인의 말이 찍히는 동안에는 끝에 커서가 깜빡입니다 */
function Row({ line, meta, single = false }: RowProps) {
  const typing = line.kind === 'say' && line.typed < line.text.length
  return (
    <div className={`${styles.line} ${KIND_CLASS[line.kind]} ${single ? styles.single : ''}`}>
      <Mark line={line} />
      <span className={styles.content}>
        {renderTyped(line)}
        {typing && <span className={styles.cursor} />}
      </span>
      {meta}
    </div>
  )
}

/** 구역 하나의 줄들: 메인의 말 → 서브 에이전트의 일(접힘) → 완성 기록 */
interface Group {
  sectionId: string
  /** 이 구역의 첫 줄 id(목록 key) */
  first: number
  say: TerminalLine[]
  work: TerminalLine[]
  done?: TerminalLine
}

type Item = { type: 'line'; line: TerminalLine } | { type: 'group'; group: Group }

/** 줄을 구역별로 묶습니다. 구역은 그 구역의 첫 줄이 나온 자리에 놓이고, 구역 없는 줄은 그대로 둡니다 */
function arrange(lines: readonly TerminalLine[]): Item[] {
  const items: Item[] = []
  const groups = new Map<string, Group>()
  for (const line of lines) {
    if (!line.sectionId) {
      items.push({ type: 'line', line })
      continue
    }
    let group = groups.get(line.sectionId)
    if (!group) {
      group = { sectionId: line.sectionId, first: line.id, say: [], work: [] }
      groups.set(line.sectionId, group)
      items.push({ type: 'group', group })
    }
    if (line.kind === 'say') group.say.push(line)
    else if (line.kind === 'commit') group.done = line
    else group.work.push(line)
  }
  return items
}

/** 다 만든 구역의 한 줄 요약: 작업 수와 걸린 시간 */
function summaryOf(group: Group) {
  const parts: string[] = []
  if (group.work.length > 0) parts.push(`작업 ${group.work.length}개`)
  const took = group.done?.took
  if (took !== undefined && group.work.length > 0) {
    parts.push(`${Math.max(0.1, took / 1000).toFixed(1)}초`)
  }
  return parts.join(' · ')
}

interface GroupViewProps {
  group: Group
  open: boolean
  onToggle: () => void
}

/**
 * 구역 하나. 서브 에이전트의 일은 메인의 말 아래 들여쓴 칸에 접어 둡니다: 만드는 동안은 지금 하는 일
 * 한 줄만 바뀌고, 다 만들면 완성 기록 한 줄로 접힙니다(누르면 그 구역의 일을 모두 펼쳐 봅니다)
 */
function GroupView({ group, open, onToggle }: GroupViewProps) {
  const live = group.work[group.work.length - 1]
  const summary = summaryOf(group)
  return (
    <div className={styles.group}>
      {group.say.map((line) => (
        <Row key={line.id} line={line} />
      ))}
      {(live || group.done) && (
        <div className={styles.block}>
          {group.done ? (
            <>
              <button
                type="button"
                tabIndex={-1}
                className={styles.summary}
                onClick={onToggle}
                disabled={group.work.length === 0}
              >
                <Mark line={group.done} />
                <span className={styles.content}>
                  {renderTyped(group.done)}
                  {summary && <span className={styles.stats}>{`  ${summary}`}</span>}
                </span>
                {group.done.meta && <span className={styles.meta}>{group.done.meta}</span>}
                {group.work.length > 0 && (
                  <span className={styles.fold} data-open={open}>
                    ›
                  </span>
                )}
              </button>
              {open && group.work.map((line) => <Row key={line.id} line={line} />)}
            </>
          ) : (
            live && (
              <Row
                line={live}
                single
                meta={<span className={styles.meta}>{`작업 ${group.work.length}개째`}</span>}
              />
            )
          )}
        </div>
      )}
    </div>
  )
}

function lastOf(lines: readonly TerminalLine[], match: (line: TerminalLine) => boolean) {
  for (let i = lines.length - 1; i >= 0; i -= 1) if (match(lines[i])) return lines[i]
  return undefined
}

interface TerminalPanelProps {
  /** dock: 옆 패널에 크게 붙은 모습, mini: 화면 구석의 작은 바 */
  variant: 'dock' | 'mini'
  /** mini일 때 로그를 펼쳤는지 */
  expanded: boolean
  onToggle: () => void
}

/**
 * 조립 과정을 안내하는 터미널. 메인('guhn' 이름표)이 말하면 그 구역을 만드는 서브 에이전트의 일은 그 아래에
 * 접혀 들어가서 메인의 말이 묻히지 않습니다. 로그는 장식이라 스크린리더에는 숨기고
 * 펼치기 버튼만 노출합니다. 작은 바일 때는 메인의 최근 말과(만드는 동안) 지금 하는 일을 한 줄씩 보여주고,
 * 펼치면 로그 전체가 나옵니다. 새로고침하거나 페이지를 옮기면 늘 새로 그립니다.
 */
export function TerminalPanel({ variant, expanded, onToggle }: TerminalPanelProps) {
  const director = useDirector()
  const lines = useBuildLines()
  const ui = useBuildUi()
  const bodyRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef(true)
  // 펼쳐 본 구역들. 페이지(지휘자)가 바뀌면 처음부터 접힌 상태입니다
  const [opened, setOpened] = useState<{ owner: unknown; ids: ReadonlySet<string> }>({
    owner: null,
    ids: new Set(),
  })
  const building = ui.mode === 'live' && !ui.finished
  const compact = variant === 'mini' && !expanded
  const openIds = opened.owner === director ? opened.ids : null

  // 다른 페이지로 가서 새 로그가 시작되거나 로그 창이 다시 열리면, 전에 위로 올려 읽던 것과
  // 상관없이 다시 맨 아래(최신 줄)를 따라갑니다. 아래 효과보다 먼저 실행되도록 앞에 둡니다
  useEffect(() => {
    stickRef.current = true
  }, [director, compact])

  useEffect(() => {
    const body = bodyRef.current
    if (body && stickRef.current) body.scrollTop = body.scrollHeight
  }, [lines, compact])

  if (!director) return null

  const toggleGroup = (sectionId: string) => {
    setOpened((prev) => {
      const ids = new Set(prev.owner === director ? prev.ids : [])
      if (ids.has(sectionId)) ids.delete(sectionId)
      else ids.add(sectionId)
      return { owner: director, ids }
    })
  }

  const main =
    lastOf(lines, (line) => line.kind === 'say' || line.kind === 'info') ?? lines[lines.length - 1]
  const live = building ? lastOf(lines, (line) => line.kind === 'work') : undefined

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
          {compact
            ? main && (
                <span className={styles.mini} aria-hidden="true">
                  <span className={`${styles.lastLine} ${KIND_CLASS[main.kind]}`}>
                    <Mark line={main} />
                    <span className={styles.content}>{renderTyped(main)}</span>
                  </span>
                  {live && (
                    <span className={`${styles.lastLine} ${styles.miniLive}`}>
                      <Mark line={live} />
                      <span className={styles.content}>{renderTyped(live)}</span>
                    </span>
                  )}
                </span>
              )
            : '안내'}
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
          {arrange(lines).map((item) =>
            item.type === 'line' ? (
              <Row key={item.line.id} line={item.line} />
            ) : (
              <GroupView
                key={`g${item.group.first}`}
                group={item.group}
                open={openIds?.has(item.group.sectionId) ?? false}
                onToggle={() => toggleGroup(item.group.sectionId)}
              />
            ),
          )}
        </div>
      )}
    </section>
  )
}
