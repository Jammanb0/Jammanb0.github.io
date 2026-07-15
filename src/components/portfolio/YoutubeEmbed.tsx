import { wrapper, iframe } from './YoutubeEmbed.css'

interface YoutubeEmbedProps {
  /** The video ID — the part after `v=` in a YouTube URL */
  youtubeId: string
  title?: string
}

export function YoutubeEmbed({ youtubeId, title = 'YouTube video' }: YoutubeEmbedProps) {
  return (
    <div className={wrapper}>
      <iframe
        className={iframe}
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
