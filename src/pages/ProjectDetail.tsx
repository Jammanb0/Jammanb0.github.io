import { Link, Navigate, useParams } from 'react-router-dom'
import { BuildBox, BuildProvider, BuildReveal, BuildSection, BuildText } from '@/build/components'
import { FRAME, PANEL } from '@/components/frame/decls'
import { FrameLabel } from '@/components/frame/FrameLabel'
import { page, section } from '@/components/frame/frame.css'
import { LinkList } from '@/components/portfolio/LinkList'
import { Markdown } from '@/components/portfolio/Markdown'
import { YoutubeEmbed } from '@/components/portfolio/YoutubeEmbed'
import { Tag } from '@/components/ui/Tag'
import { getProjectById, sortedProjects } from '@/data/projects'
import { formatPeriod } from '@/lib/date'
import { shortTitle } from '@/lib/project'
import type { Project } from '@/types/project'
import * as styles from './ProjectDetail.css'

function Detail({ project }: { project: Project }) {
  const name = shortTitle(project)
  const meta = [formatPeriod(project.date, project.endDate), project.role]
    .filter(Boolean)
    .join(' · ')
  const index = sortedProjects.findIndex((p) => p.id === project.id)
  const newer = index > 0 ? sortedProjects[index - 1] : undefined
  const older = sortedProjects[index + 1]
  const hasMedia = Boolean(project.thumbnail || project.youtubeId)

  return (
    <div className={page}>
      <BuildSection
        id="detail-head"
        label={name}
        guide="프로젝트를 자세히 보여드릴게요."
        className={section}
      >
        <FrameLabel text={`프로젝트 / ${name}`} />
        <BuildBox id="detail-head-frame" name=".detail" decls={FRAME} className={styles.head}>
          <BuildReveal id="detail-back">
            <Link className={styles.back} to="/projects">
              ← 프로젝트 목록
            </Link>
          </BuildReveal>
          <BuildText id="detail-meta" text={meta} className={styles.meta} />
          <BuildText id="detail-title" as="h1" text={project.title} className={styles.title} />
          <BuildReveal id="detail-tags" as="ul" className={styles.tags} aria-label="기술">
            {project.tags.map((tag) => (
              <li key={tag}>
                <Tag>{tag}</Tag>
              </li>
            ))}
          </BuildReveal>
          {project.links && project.links.length > 0 && (
            <BuildReveal id="detail-links">
              <LinkList links={project.links} />
            </BuildReveal>
          )}
        </BuildBox>
      </BuildSection>

      {hasMedia && (
        <BuildSection id="detail-media" label="미디어" className={section}>
          <BuildBox id="detail-media-frame" name=".media" decls={FRAME} className={styles.media}>
            {project.thumbnail && (
              <BuildReveal id="detail-banner">
                <img className={styles.banner} src={project.thumbnail} alt={project.title} />
              </BuildReveal>
            )}
            {project.youtubeId && (
              <BuildReveal id="detail-video">
                <YoutubeEmbed youtubeId={project.youtubeId} title={project.title} />
              </BuildReveal>
            )}
          </BuildBox>
        </BuildSection>
      )}

      {project.highlights && project.highlights.length > 0 && (
        <BuildSection id="detail-highlights" label="핵심" className={section}>
          <BuildBox
            id="detail-highlights-frame"
            name=".highlights"
            decls={PANEL}
            as="div"
            className={styles.highlights}
          >
            {project.highlights.map((highlight, i) => (
              <p key={highlight} className={styles.highlightItem}>
                <span className={styles.highlightMark} aria-hidden="true">
                  →
                </span>
                <BuildText id={`detail-highlight-${i}`} as="span" text={highlight} />
              </p>
            ))}
          </BuildBox>
        </BuildSection>
      )}

      <BuildSection id="detail-body" label="본문" className={section}>
        <BuildBox id="detail-body-frame" name=".description" decls={FRAME} className={styles.body}>
          <Markdown build>{project.description}</Markdown>
        </BuildBox>
      </BuildSection>

      {(newer || older) && (
        <BuildSection id="detail-pager" label="다른 프로젝트" as="div">
          <nav className={styles.pager} aria-label="다른 프로젝트">
            {newer && (
              <BuildReveal id="detail-newer">
                <Link className={styles.pagerLink} to={`/projects/${newer.id}`}>
                  <span className={styles.pagerHint}>← 더 최근 작업</span>
                  <span className={styles.pagerTitle}>{shortTitle(newer)}</span>
                </Link>
              </BuildReveal>
            )}
            {older && (
              <BuildReveal id="detail-older" className={styles.pagerNext}>
                <Link className={styles.pagerLink} to={`/projects/${older.id}`}>
                  <span className={styles.pagerHint}>이전 작업 →</span>
                  <span className={styles.pagerTitle}>{shortTitle(older)}</span>
                </Link>
              </BuildReveal>
            )}
          </nav>
        </BuildSection>
      )}
    </div>
  )
}

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const project = id ? getProjectById(id) : undefined

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  return (
    // 다른 프로젝트로 넘어가면 처음부터 다시 조립하도록 key를 프로젝트 id로 둡니다
    <BuildProvider key={project.id}>
      <Detail project={project} />
    </BuildProvider>
  )
}
