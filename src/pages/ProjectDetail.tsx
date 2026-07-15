import { Link, Navigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Tag } from '@/components/ui/Tag'
import { YoutubeEmbed } from '@/components/portfolio/YoutubeEmbed'
import { LinkList } from '@/components/portfolio/LinkList'
import { Markdown } from '@/components/portfolio/Markdown'
import { getProjectById } from '@/data/projects'
import { formatPeriod } from '@/lib/date'
import {
  wrapper,
  back,
  header,
  metaRow,
  metaDivider,
  title,
  tagRow,
  media,
  bannerImage,
  description,
  highlights,
  highlightItem,
  highlightMark,
} from './ProjectDetail.css'

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const project = id ? getProjectById(id) : undefined

  if (!project) {
    return <Navigate to="/projects" replace />
  }

  return (
    <Container>
      <motion.div
        className={wrapper}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link className={back} to="/projects">
          ← 프로젝트 목록으로
        </Link>

        <header className={header}>
          <p className={metaRow}>
            <span>{formatPeriod(project.date, project.endDate)}</span>
            {project.role && (
              <>
                <span className={metaDivider}>·</span>
                <span>{project.role}</span>
              </>
            )}
          </p>
          <h1 className={title}>{project.title}</h1>
          <div className={tagRow}>
            {project.tags.map((t) => (
              <Tag key={t}>{t}</Tag>
            ))}
          </div>
        </header>

        {(project.thumbnail || project.youtubeId) && (
          <div className={media}>
            {project.thumbnail && (
              <img className={bannerImage} src={project.thumbnail} alt={project.title} />
            )}
            {project.youtubeId && (
              <YoutubeEmbed youtubeId={project.youtubeId} title={project.title} />
            )}
          </div>
        )}

        {project.highlights && project.highlights.length > 0 && (
          <ul className={highlights}>
            {project.highlights.map((h) => (
              <li key={h} className={highlightItem}>
                <span className={highlightMark}>→</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}

        <div className={description}>
          <Markdown>{project.description}</Markdown>
        </div>

        {project.links && <LinkList links={project.links} />}
      </motion.div>
    </Container>
  )
}
