import { isValidElement, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { YoutubeEmbed } from './YoutubeEmbed'
import { wrapper } from './Markdown.css'

/**
 * Writing ```youtube\nVIDEO_ID\n``` anywhere in a project's description
 * embeds a responsive YouTube player at that spot — no HTML needed.
 */
function isYoutubeBlock(node: ReactNode) {
  if (!isValidElement<{ className?: string }>(node)) return false
  return /language-youtube/.test(node.props.className ?? '')
}

export function Markdown({ children }: { children: string }) {
  return (
    <div className={wrapper}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre({ children: preChildren }) {
            if (isYoutubeBlock(preChildren)) return <>{preChildren}</>
            return <pre>{preChildren}</pre>
          },
          code({ className, children: codeChildren }) {
            const lang = /language-(\w+)/.exec(className ?? '')?.[1]
            if (lang === 'youtube') {
              return <YoutubeEmbed youtubeId={String(codeChildren).trim()} />
            }
            return <code className={className}>{codeChildren}</code>
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}
