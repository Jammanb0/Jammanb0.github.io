import { Children, isValidElement, type ReactNode } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { BuildReveal, BuildText } from '@/build/components'
import type { Role } from '@/build/types'
import { YoutubeEmbed } from './YoutubeEmbed'
import { wrapper, tableWrap } from './Markdown.css'

/**
 * Writing ```youtube\nVIDEO_ID\n``` anywhere in a project's description
 * embeds a responsive YouTube player at that spot — no HTML needed.
 */
function isYoutubeBlock(node: ReactNode) {
  if (!isValidElement<{ className?: string }>(node)) return false
  return /language-youtube/.test(node.props.className ?? '')
}

/** 본문 블록은 텍스트·배치 작업자 넷이 먼저 손이 빈 순서대로 나눠 놓습니다 */
const BODY_WORKERS: readonly Role[] = ['copy', 'place']

/** 마크다운 원문에서의 위치로 만든 고정 id. 다시 렌더링해도 같은 값입니다 */
function blockId(node: { position?: { start: { offset?: number } } } | undefined) {
  const offset = node?.position?.start.offset
  return offset === undefined ? undefined : `md-${offset}`
}

/** 자식이 글자뿐이면 그 글자를, 아니면 null */
function plainText(children: ReactNode) {
  const parts = Children.toArray(children)
  return parts.every((part) => typeof part === 'string' || typeof part === 'number')
    ? parts.join('')
    : null
}

const baseComponents: Components = {
  pre({ children }) {
    if (isYoutubeBlock(children)) return <>{children}</>
    return <pre>{children}</pre>
  },
  code({ className, children }) {
    const lang = /language-(\w+)/.exec(className ?? '')?.[1]
    if (lang === 'youtube') {
      return <YoutubeEmbed youtubeId={String(children).trim()} />
    }
    return <code className={className}>{children}</code>
  },
  table({ children }) {
    return (
      <div className={tableWrap}>
        <table>{children}</table>
      </div>
    )
  },
}

/**
 * 조립 모드. 제목은 한 글자씩 입력되고, 문단·목록·표·영상은 여러 작업자가 동시에 나눠 놓습니다.
 * 원문 위치로 id를 만들어서 같은 글이면 몇 번을 그려도 같은 대상으로 인식됩니다.
 */
const buildComponents: Components = {
  ...baseComponents,
  h2: ({ node, children }) => heading('h2', blockId(node), children),
  h3: ({ node, children }) => heading('h3', blockId(node), children),
  h4: ({ node, children }) => heading('h4', blockId(node), children),
  p: ({ node, children }) => reveal('p', blockId(node), children),
  ul: ({ node, children }) => reveal('ul', blockId(node), children),
  ol: ({ node, children }) => reveal('ol', blockId(node), children),
  blockquote: ({ node, children }) => reveal('blockquote', blockId(node), children),
  pre({ node, children }) {
    const id = blockId(node)
    const inner = isYoutubeBlock(children) ? <>{children}</> : <pre>{children}</pre>
    return id ? (
      <BuildReveal id={id} workers={BODY_WORKERS}>
        {inner}
      </BuildReveal>
    ) : (
      inner
    )
  },
  table({ node, children }) {
    const id = blockId(node)
    const table = <table>{children}</table>
    return id ? (
      <BuildReveal id={id} workers={BODY_WORKERS} className={tableWrap}>
        {table}
      </BuildReveal>
    ) : (
      <div className={tableWrap}>{table}</div>
    )
  },
}

function heading(tag: 'h2' | 'h3' | 'h4', id: string | undefined, children: ReactNode) {
  const Tag = tag
  if (!id) return <Tag>{children}</Tag>
  const text = plainText(children)
  if (text !== null) return <BuildText id={id} as={tag} text={text} />
  return (
    <BuildReveal id={id} as={tag} workers={BODY_WORKERS}>
      {children}
    </BuildReveal>
  )
}

function reveal(
  tag: 'p' | 'ul' | 'ol' | 'blockquote',
  id: string | undefined,
  children: ReactNode,
) {
  const Tag = tag
  if (!id) return <Tag>{children}</Tag>
  return (
    <BuildReveal id={id} as={tag} workers={BODY_WORKERS}>
      {children}
    </BuildReveal>
  )
}

export function Markdown({ children, build = false }: { children: string; build?: boolean }) {
  return (
    <div className={wrapper}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={build ? buildComponents : baseComponents}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
