import { BuildBox, BuildProvider, BuildReveal, BuildSection, BuildText } from '@/build/components'
import { DARK, FRAME, PANEL } from '@/components/frame/decls'
import { FrameLabel } from '@/components/frame/FrameLabel'
import { page, section } from '@/components/frame/frame.css'
import { profile } from '@/data/profile'
import * as styles from './Contact.css'

const SWARM_URL = 'https://califa.github.io/swarm-site/'

/** 'https://github.com/Jammanb0' → 'github.com/Jammanb0' */
function displayUrl(url: string) {
  return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
}

interface Channel {
  key: string
  label: string
  description: string
  href: string
  display: string
  /** 새 탭으로 여는 바깥 링크인지(메일은 아님) */
  external: boolean
}

/** 이메일을 맨 앞에, 그다음 profile.ts의 소셜 링크를 순서대로 */
const CHANNELS: Channel[] = [
  {
    key: 'email',
    label: '이메일',
    description: '메일 보내기',
    href: `mailto:${profile.email}`,
    display: profile.email,
    external: false,
  },
  ...profile.social.map((link) => ({
    key: link.label.toLowerCase(),
    label: link.label,
    description: link.description,
    href: link.url,
    display: displayUrl(link.url),
    external: true,
  })),
]

export default function Contact() {
  return (
    <BuildProvider>
      <div className={page}>
        <BuildSection
          id="contact"
          label="연락처"
          guide="연락할 수 있는 곳을 정리해 둘게요."
          className={section}
        >
          <FrameLabel text="연락처" />
          <BuildBox id="contact-frame" name=".contact" decls={FRAME} className={styles.frame}>
            <BuildText id="contact-title" as="h1" text="연락처" className={styles.title} />
            <BuildText
              id="contact-lead"
              text="아래 채널에서 작업을 더 보거나 연락할 수 있어요."
              className={styles.lead}
            />
            <ul className={styles.channels}>
              {CHANNELS.map((channel) => (
                <BuildBox
                  key={channel.key}
                  as="li"
                  id={`channel-${channel.key}`}
                  name={`.channel-${channel.key}`}
                  decls={PANEL}
                  className={styles.channel}
                  data-primary={channel.key === 'email'}
                >
                  <a
                    className={styles.channelLink}
                    href={channel.href}
                    {...(channel.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  >
                    <BuildText
                      id={`channel-${channel.key}-label`}
                      as="span"
                      text={channel.label}
                      className={styles.channelLabel}
                    />
                    <BuildText
                      id={`channel-${channel.key}-desc`}
                      as="span"
                      text={channel.description}
                      className={styles.channelDesc}
                    />
                    <BuildText
                      id={`channel-${channel.key}-url`}
                      as="span"
                      text={channel.display}
                      className={styles.channelUrl}
                    />
                    <span className={styles.arrow} aria-hidden="true">
                      {channel.external ? '↗' : '→'}
                    </span>
                  </a>
                </BuildBox>
              ))}
            </ul>
          </BuildBox>
        </BuildSection>

        <BuildSection
          id="colophon"
          label="이 사이트"
          guide="이 사이트를 어떻게 만들었는지도 적어 둘게요."
          className={section}
        >
          <FrameLabel text="이 사이트" />
          <BuildBox id="colophon-card" name=".colophon" decls={DARK} className={styles.colophon}>
            <BuildText
              id="colophon-title"
              as="h2"
              text="이 사이트는"
              className={styles.colophonTitle}
            />
            <BuildText
              id="colophon-stack"
              text="React · TypeScript · Vite · vanilla-extract로 만들었습니다."
              className={styles.colophonText}
            />
            <BuildText
              id="colophon-motion"
              text="화면이 스스로 조립되는 연출은 Joel Califa의 Swarm에서 아이디어를 얻어 새로 구현했고, 사원증의 물리 효과도 외부 라이브러리 없이 작성했습니다."
              className={styles.colophonText}
            />
            <BuildReveal id="colophon-links" className={styles.colophonLinks}>
              <a className={styles.colophonLink} href={SWARM_URL} target="_blank" rel="noreferrer">
                Swarm 원작 <span aria-hidden="true">↗</span>
              </a>
            </BuildReveal>
          </BuildBox>
        </BuildSection>
      </div>
    </BuildProvider>
  )
}
