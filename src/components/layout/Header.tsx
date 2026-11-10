import { Link, NavLink } from 'react-router-dom'
import { ChromeAssembly } from '@/build/ChromeAssembly'
import { BuildBox, BuildReveal, BuildText } from '@/build/components'
import type { Decl } from '@/build/types'
import { GithubIcon } from '@/components/portfolio/icons'
import { profile } from '@/data/profile'
import {
  header,
  inner,
  logo,
  avatarBox,
  avatar,
  nav,
  navLink,
  navLinkActive,
  iconWrap,
  iconLink,
} from './Header.css'

/** 메뉴는 모두 페이지입니다. 같은 페이지 안으로 스크롤하는 항목은 두지 않습니다 */
const links = [
  { to: '/', label: '소개', end: true },
  { to: '/projects', label: '프로젝트', end: false },
  { to: '/contact', label: '연락처', end: false },
]

/** 네모로 그려진 사진 틀이 이 한 줄로 동그래집니다 */
const AVATAR: readonly Decl[] = [['border-radius', '999px']]

export function Header() {
  const github = profile.social.find((s) => s.label === 'GitHub')

  return (
    <ChromeAssembly id="site-header" label="머리글" as="header" className={header}>
      <div className={inner}>
        <Link to="/" className={logo}>
          {profile.avatar && (
            <BuildBox
              id="header-avatar"
              name=".avatar"
              decls={AVATAR}
              as="span"
              className={avatarBox}
            >
              <img className={avatar} src={profile.avatar} alt="" />
            </BuildBox>
          )}
          <BuildText id="header-name" as="span" text={profile.name} />
        </Link>
        <nav className={nav} aria-label="주요 메뉴">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `${navLink} ${isActive ? navLinkActive : ''}`}
            >
              <BuildText id={`header-nav-${l.label}`} as="span" text={l.label} />
            </NavLink>
          ))}
          {github && (
            <BuildReveal id="header-github" as="span" className={iconWrap}>
              <a
                className={iconLink}
                href={github.url}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub (새 탭)"
              >
                <GithubIcon />
              </a>
            </BuildReveal>
          )}
        </nav>
      </div>
    </ChromeAssembly>
  )
}
