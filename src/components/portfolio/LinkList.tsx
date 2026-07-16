import type { ProjectLink } from '@/types/project'
import { list, linkItem, iconWrap } from './LinkList.css'
import { GithubIcon, ExternalIcon, DemoIcon, FigmaIcon, NotionIcon, YoutubeIcon } from './icons'

const iconMap = {
  github: GithubIcon,
  external: ExternalIcon,
  demo: DemoIcon,
  figma: FigmaIcon,
  notion: NotionIcon,
  youtube: YoutubeIcon,
}

export function LinkList({ links }: { links: ProjectLink[] }) {
  if (!links.length) return null

  return (
    <ul className={list}>
      {links.map((link) => {
        const Icon = link.icon ? iconMap[link.icon] : ExternalIcon
        return (
          <li key={link.url}>
            <a href={link.url} target="_blank" rel="noreferrer" className={linkItem}>
              <span className={iconWrap}>
                <Icon />
              </span>
              {link.label}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
