import { profile } from '@/data/profile'
import { footer, inner, copyright, socialRow, socialLink } from './Footer.css'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className={footer}>
      <div className={inner}>
        <p className={copyright}>
          © {year} {profile.name}. All rights reserved.
        </p>
        <div className={socialRow}>
          {profile.social.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className={socialLink}>
              {s.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
