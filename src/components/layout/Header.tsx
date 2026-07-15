import { NavLink } from 'react-router-dom'
import { profile } from '@/data/profile'
import { header, inner, logo, avatar, nav, navLink, navLinkActive } from './Header.css'

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
]

export function Header() {
  return (
    <header className={header}>
      <div className={inner}>
        <NavLink to="/" className={logo}>
          {profile.avatar && <img className={avatar} src={profile.avatar} alt={profile.name} />}
          {profile.name}
        </NavLink>
        <nav className={nav}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `${navLink} ${isActive ? navLinkActive : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
