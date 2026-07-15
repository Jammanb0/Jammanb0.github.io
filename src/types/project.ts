export interface ProjectLink {
  label: string
  url: string
  icon?: 'github' | 'external' | 'demo'
}

export interface Project {
  /** Used in the URL: /projects/:id — keep it short and URL-safe */
  id: string
  title: string
  /** One or two lines shown on the project card */
  summary: string
  /**
   * Full write-up shown on the project detail page. Supports GitHub-flavored
   * Markdown — headings, tables, bold/italic, lists, links, code blocks.
   * Write as much or as little structure as the project needs.
   */
  description: string
  /** e.g. 'Solo Developer', 'Team Lead, Frontend' — shown next to the date range */
  role?: string
  /** Bullet points shown below the description — achievements, key facts, whatever's freeform */
  highlights?: string[]
  /**
   * Path under /public or an external image URL. Doubles as the card's
   * thumbnail and the detail page's banner image. If youtubeId is also set,
   * this image is shown above the video on the detail page. If neither
   * thumbnail nor youtubeId is set, the detail page shows no media block at
   * all (no empty placeholder).
   */
  thumbnail?: string
  /** YouTube video ID (the part after v= in the URL), embeds a responsive player */
  youtubeId?: string
  tags: string[]
  links?: ProjectLink[]
  /** ISO date string, e.g. '2026-05-01'. Start date — also used for sorting, newest first. */
  date: string
  /** ISO date string. Omit if the project is still ongoing ("진행 중" is shown instead). */
  endDate?: string
  /** Featured projects are highlighted on the home page */
  featured?: boolean
}
