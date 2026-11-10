import { ChromeAssembly } from '@/build/ChromeAssembly'
import { BuildReveal, BuildText } from '@/build/components'
import { profile } from '@/data/profile'
import { footer, inner, copyright, credit, creditLink, socialRow, socialLink } from './Footer.css'

const SWARM_URL = 'https://califa.github.io/swarm-site/'

export function Footer() {
  const year = new Date().getFullYear()
  return (
    <ChromeAssembly id="site-footer" label="바닥글" as="footer" className={footer}>
      <div className={inner}>
        <div>
          <BuildText
            id="footer-copyright"
            text={`© ${year} ${profile.name}. All rights reserved.`}
            className={copyright}
          />
          <BuildReveal id="footer-credit" as="p" className={credit}>
            Inspired by{' '}
            <a className={creditLink} href={SWARM_URL} target="_blank" rel="noreferrer">
              Swarm
            </a>{' '}
            by Joel Califa
          </BuildReveal>
        </div>
        <BuildReveal id="footer-social" as="nav" className={socialRow} aria-label="소셜 링크">
          {profile.social.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className={socialLink}>
              {s.label}
            </a>
          ))}
        </BuildReveal>
      </div>
    </ChromeAssembly>
  )
}
