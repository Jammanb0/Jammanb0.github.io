import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { srOnly } from '@/styles/global.css'
import { DirectorContext, SectionContext } from './context'
import { setCurrentDirector } from './current'
import { BuildDirector } from './director'
import { useBuildTarget, useDirector, useSectionStatus } from './hooks'
import type { CommitInfo, Decl, Role } from './types'
import * as styles from './build.css'

const NO_DECLS: readonly Decl[] = []

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(' ')
}

function toStyle(decls: readonly Decl[]): CSSProperties {
  const result: Record<string, string> = {}
  for (const [prop, value] of decls) {
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
    result[key] = value
  }
  return result as CSSProperties
}

/**
 * 페이지 하나를 감쌉니다. 그 페이지의 조립 지휘자를 만들어 연결하고, 떠날 때 정리합니다.
 * 페이지에 들어올 때마다 새 지휘자가 만들어지므로 늘 처음부터 조립합니다.
 */
export function BuildProvider({ children }: { children: ReactNode }) {
  const [director] = useState(() => new BuildDirector())
  useEffect(() => {
    director.attach()
    // 페이지를 넘겨도 남아 있는 안내 터미널이 이 페이지를 보게 합니다
    setCurrentDirector(director)
    return () => director.detach()
  }, [director])
  return <DirectorContext.Provider value={director}>{children}</DirectorContext.Provider>
}

/**
 * value가 처음과 달라지면(검색어·태그·연도를 바꾸면) 남은 조립을 모두 끝냅니다.
 * 아직 안 그려진 아래쪽 내용이 결과로 올라와 빈 틀로 보이지 않게 합니다.
 * 화면에 그려지기 전에(레이아웃 단계) 끝내서 빈 틀이 한 번도 비치지 않습니다.
 */
export function FinishOnChange({ value }: { value: string }) {
  const director = useDirector()
  const [initial] = useState(value)
  useLayoutEffect(() => {
    if (director && value !== initial) director.finishAll()
  }, [director, value, initial])
  return null
}

type SectionTag = 'section' | 'div' | 'article' | 'header' | 'footer'

interface BuildSectionProps extends HTMLAttributes<HTMLElement> {
  id: string
  /** 커밋 목록과 프레임 이름표에 보일 이름 */
  label: string
  /** 조립을 시작할 때 안내 터미널에 찍을 문장 */
  guide?: string
  commit?: CommitInfo
  as?: SectionTag
}

/**
 * 조립 단위. 화면에 보이면 안내 문장 → 안쪽 대상 조립 → 커밋 순으로 진행합니다.
 * 요소의 id로도 쓰여서 `#id` 앵커로 이동할 수 있습니다.
 */
export function BuildSection({
  id,
  label,
  guide,
  commit,
  as: Tag = 'section',
  children,
  ...rest
}: BuildSectionProps) {
  const director = useDirector()
  const status = useSectionStatus(id)
  const message = commit?.message
  const date = commit?.date

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (!el || !director) return
      return director.registerSection({
        id,
        label,
        guide,
        commit: message ? { message, date } : undefined,
        el,
      })
    },
    [director, id, label, guide, message, date],
  )

  return (
    <SectionContext.Provider value={id}>
      <Tag ref={ref} id={id} data-bt-status={status} {...rest}>
        {children}
      </Tag>
    </SectionContext.Provider>
  )
}

type BoxTag = 'div' | 'section' | 'article' | 'header' | 'figure' | 'span' | 'li'

interface BuildBoxProps extends HTMLAttributes<HTMLElement> {
  id: string
  /** 터미널에 보일 이름. 예: '.hero' */
  name?: string
  /** 그린 뒤 한 줄씩 적용할 CSS. 바뀌지 않게 모듈 상수로 넘겨주세요 */
  decls?: readonly Decl[]
  as?: BoxTag
}

/** 선택 상자로 그려진 뒤 CSS가 한 줄씩 붙는 상자 */
export function BuildBox({
  id,
  name,
  decls = NO_DECLS,
  as: Tag = 'div',
  className,
  style,
  children,
  ...rest
}: BuildBoxProps) {
  const [ref, state] = useBuildTarget({ id, kind: 'box', name, decls })
  const applied = Math.min(state.applied, decls.length)
  const declStyle = useMemo(() => toStyle(decls.slice(0, applied)), [decls, applied])

  return (
    <Tag
      ref={ref}
      className={cx(styles.box, className)}
      style={{ ...declStyle, ...style }}
      data-bt-visible={state.visible}
      data-bt-raw={state.visible && applied < decls.length}
      {...rest}
    >
      {children}
    </Tag>
  )
}

type TextTag = 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'strong' | 'li' | 'div'

interface BuildTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  id: string
  text: string
  as?: TextTag
}

/** 글자가 한 자씩 입력되는 텍스트. 스크린리더는 처음부터 전체 문장을 읽습니다 */
export function BuildText({ id, text, as: Tag = 'p', className, ...rest }: BuildTextProps) {
  const [ref, state] = useBuildTarget({ id, kind: 'text', text })
  const typed = Math.min(state.typed, text.length)
  const done = typed >= text.length

  return (
    <Tag ref={ref} className={cx(styles.text, className)} data-bt-visible={state.visible} {...rest}>
      {done ? (
        text
      ) : (
        <>
          <span className={srOnly}>{text}</span>
          <span aria-hidden="true">
            {text.slice(0, typed)}
            {state.visible && <span className={styles.caret} />}
            <span className={styles.ghost}>{text.slice(typed)}</span>
          </span>
        </>
      )}
    </Tag>
  )
}

type RevealTag =
  'div' | 'span' | 'li' | 'ul' | 'ol' | 'p' | 'figure' | 'h2' | 'h3' | 'h4' | 'blockquote' | 'nav'

interface BuildRevealProps extends HTMLAttributes<HTMLElement> {
  id: string
  as?: RevealTag
  /** 이 대상을 옮겨 놓을 수 있는 작업자들. 기본은 배치 작업자. 바뀌지 않게 모듈 상수로 넘겨주세요 */
  workers?: readonly Role[]
}

/** 조립 순서가 오면 작업자가 들고 와서 제자리에 내려놓습니다 */
export function BuildReveal({
  id,
  as: Tag = 'div',
  workers,
  className,
  children,
  ...rest
}: BuildRevealProps) {
  const [ref, state] = useBuildTarget({ id, kind: 'reveal', workers })
  return (
    <Tag
      ref={ref}
      className={cx(styles.reveal, className)}
      data-bt-visible={state.visible}
      {...rest}
    >
      {children}
    </Tag>
  )
}
